-- DevTalk P3 Schema
-- Run this in Supabase SQL Editor
--
-- NOTE: All tables use the "dt_" prefix to avoid collisions with other
-- projects (e.g. P2 TechVision) sharing the same Supabase instance.

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_until TIMESTAMPTZ,
  notify_comments BOOLEAN DEFAULT true,
  notify_votes BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Try multiple metadata fields for username (covers email, kakao, google, github, etc.)
  _username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_name',
    CASE WHEN NEW.email IS NOT NULL AND NEW.email != '' THEN split_part(NEW.email, '@', 1) ELSE NULL END,
    'user_' || substr(NEW.id::text, 1, 8)
  );

  -- Ensure uniqueness by appending random suffix if username already exists
  IF EXISTS (SELECT 1 FROM dt_profiles WHERE username = _username) THEN
    _username := _username || '_' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO dt_profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    _username,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'profile_image',
      NEW.raw_user_meta_data->>'profile_image_url'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES dt_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('qna', 'free', 'tech', 'career')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  view_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'B')
  ) STORED
);

-- ============================================================
-- COMMENTS (self-referencing for replies)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES dt_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES dt_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES dt_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvote_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES dt_profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES dt_profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES dt_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES dt_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'vote', 'mention')),
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES dt_profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS dt_posts_fts_idx ON dt_posts USING gin(fts);
CREATE INDEX IF NOT EXISTS dt_posts_category_idx ON dt_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS dt_posts_author_idx ON dt_posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS dt_comments_post_idx ON dt_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS dt_comments_author_idx ON dt_comments(author_id);
CREATE INDEX IF NOT EXISTS dt_notifications_user_idx ON dt_notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS dt_votes_target_idx ON dt_votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS dt_bookmarks_user_idx ON dt_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS dt_reports_status_idx ON dt_reports(status, created_at DESC);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE dt_posts SET view_count = view_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle vote + sync counts
CREATE OR REPLACE FUNCTION toggle_vote(
  p_user_id UUID,
  p_target_type TEXT,
  p_target_id UUID,
  p_value INT
)
RETURNS JSON AS $$
DECLARE
  existing_vote dt_votes%ROWTYPE;
  result JSON;
BEGIN
  SELECT * INTO existing_vote
  FROM dt_votes
  WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;

  IF existing_vote IS NOT NULL THEN
    IF existing_vote.value = p_value THEN
      -- Remove vote
      DELETE FROM dt_votes WHERE id = existing_vote.id;
      IF p_target_type = 'post' THEN
        IF p_value = 1 THEN
          UPDATE dt_posts SET upvote_count = upvote_count - 1 WHERE id = p_target_id;
        ELSE
          UPDATE dt_posts SET downvote_count = downvote_count - 1 WHERE id = p_target_id;
        END IF;
      ELSE
        IF p_value = 1 THEN
          UPDATE dt_comments SET upvote_count = upvote_count - 1 WHERE id = p_target_id;
        END IF;
      END IF;
      result := json_build_object('action', 'removed', 'value', 0);
    ELSE
      -- Change vote
      UPDATE dt_votes SET value = p_value WHERE id = existing_vote.id;
      IF p_target_type = 'post' THEN
        IF p_value = 1 THEN
          UPDATE dt_posts SET upvote_count = upvote_count + 1, downvote_count = downvote_count - 1 WHERE id = p_target_id;
        ELSE
          UPDATE dt_posts SET upvote_count = upvote_count - 1, downvote_count = downvote_count + 1 WHERE id = p_target_id;
        END IF;
      ELSE
        IF p_value = 1 THEN
          UPDATE dt_comments SET upvote_count = upvote_count + 1 WHERE id = p_target_id;
        ELSE
          UPDATE dt_comments SET upvote_count = upvote_count - 1 WHERE id = p_target_id;
        END IF;
      END IF;
      result := json_build_object('action', 'changed', 'value', p_value);
    END IF;
  ELSE
    -- New vote
    INSERT INTO dt_votes (user_id, target_type, target_id, value)
    VALUES (p_user_id, p_target_type, p_target_id, p_value);
    IF p_target_type = 'post' THEN
      IF p_value = 1 THEN
        UPDATE dt_posts SET upvote_count = upvote_count + 1 WHERE id = p_target_id;
      ELSE
        UPDATE dt_posts SET downvote_count = downvote_count + 1 WHERE id = p_target_id;
      END IF;
    ELSE
      IF p_value = 1 THEN
        UPDATE dt_comments SET upvote_count = upvote_count + 1 WHERE id = p_target_id;
      END IF;
    END IF;
    result := json_build_object('action', 'created', 'value', p_value);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add points + auto-level
CREATE OR REPLACE FUNCTION add_points(p_user_id UUID, p_amount INT)
RETURNS void AS $$
DECLARE
  new_points INT;
  new_level INT;
BEGIN
  UPDATE dt_profiles SET points = points + p_amount WHERE id = p_user_id
  RETURNING points INTO new_points;

  new_level := CASE
    WHEN new_points >= 5000 THEN 5
    WHEN new_points >= 1500 THEN 4
    WHEN new_points >= 500 THEN 3
    WHEN new_points >= 100 THEN 2
    ELSE 1
  END;

  UPDATE dt_profiles SET level = new_level WHERE id = p_user_id AND level != new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Full text search
CREATE OR REPLACE FUNCTION search_posts(
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  tags TEXT[],
  view_count INT,
  upvote_count INT,
  downvote_count INT,
  comment_count INT,
  is_pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.author_id, p.category, p.title, p.content, p.tags,
    p.view_count, p.upvote_count, p.downvote_count, p.comment_count,
    p.is_pinned, p.created_at, p.updated_at,
    ts_rank(p.fts, to_tsquery('simple', p_query)) AS rank
  FROM dt_posts p
  WHERE p.is_deleted = false
    AND p.fts @@ to_tsquery('simple', p_query)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE dt_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_tags ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self update
CREATE POLICY "dt_profiles_select" ON dt_profiles FOR SELECT USING (true);
CREATE POLICY "dt_profiles_update" ON dt_profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: public read (non-deleted), auth create, author update/delete
CREATE POLICY "dt_posts_select" ON dt_posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "dt_posts_insert" ON dt_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "dt_posts_update" ON dt_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "dt_posts_delete" ON dt_posts FOR DELETE USING (auth.uid() = author_id);

-- Comments: public read (non-deleted), auth create, author update/delete
CREATE POLICY "dt_comments_select" ON dt_comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "dt_comments_insert" ON dt_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "dt_comments_update" ON dt_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "dt_comments_delete" ON dt_comments FOR DELETE USING (auth.uid() = author_id);

-- Votes: self CRUD
CREATE POLICY "dt_votes_select" ON dt_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dt_votes_insert" ON dt_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dt_votes_delete" ON dt_votes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: self CRUD
CREATE POLICY "dt_bookmarks_select" ON dt_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dt_bookmarks_insert" ON dt_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dt_bookmarks_delete" ON dt_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Notifications: self read
CREATE POLICY "dt_notifications_select" ON dt_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dt_notifications_update" ON dt_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports: auth create, admin read/update
CREATE POLICY "dt_reports_insert" ON dt_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "dt_reports_select_admin" ON dt_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM dt_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "dt_reports_update_admin" ON dt_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM dt_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tags: public read
CREATE POLICY "dt_tags_select" ON dt_tags FOR SELECT USING (true);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE dt_notifications;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "avatar_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatar_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "avatar_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "post_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "post_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);
