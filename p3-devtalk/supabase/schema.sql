-- DevTalk P3 Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
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
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
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
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvote_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'vote', 'mention')),
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS posts_fts_idx ON posts USING gin(fts);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_idx ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS comments_author_idx ON comments(author_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS votes_target_idx ON votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status, created_at DESC);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = p_post_id;
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
  existing_vote votes%ROWTYPE;
  result JSON;
BEGIN
  SELECT * INTO existing_vote
  FROM votes
  WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;

  IF existing_vote IS NOT NULL THEN
    IF existing_vote.value = p_value THEN
      -- Remove vote
      DELETE FROM votes WHERE id = existing_vote.id;
      IF p_target_type = 'post' THEN
        IF p_value = 1 THEN
          UPDATE posts SET upvote_count = upvote_count - 1 WHERE id = p_target_id;
        ELSE
          UPDATE posts SET downvote_count = downvote_count - 1 WHERE id = p_target_id;
        END IF;
      ELSE
        IF p_value = 1 THEN
          UPDATE comments SET upvote_count = upvote_count - 1 WHERE id = p_target_id;
        END IF;
      END IF;
      result := json_build_object('action', 'removed', 'value', 0);
    ELSE
      -- Change vote
      UPDATE votes SET value = p_value WHERE id = existing_vote.id;
      IF p_target_type = 'post' THEN
        IF p_value = 1 THEN
          UPDATE posts SET upvote_count = upvote_count + 1, downvote_count = downvote_count - 1 WHERE id = p_target_id;
        ELSE
          UPDATE posts SET upvote_count = upvote_count - 1, downvote_count = downvote_count + 1 WHERE id = p_target_id;
        END IF;
      ELSE
        IF p_value = 1 THEN
          UPDATE comments SET upvote_count = upvote_count + 1 WHERE id = p_target_id;
        ELSE
          UPDATE comments SET upvote_count = upvote_count - 1 WHERE id = p_target_id;
        END IF;
      END IF;
      result := json_build_object('action', 'changed', 'value', p_value);
    END IF;
  ELSE
    -- New vote
    INSERT INTO votes (user_id, target_type, target_id, value)
    VALUES (p_user_id, p_target_type, p_target_id, p_value);
    IF p_target_type = 'post' THEN
      IF p_value = 1 THEN
        UPDATE posts SET upvote_count = upvote_count + 1 WHERE id = p_target_id;
      ELSE
        UPDATE posts SET downvote_count = downvote_count + 1 WHERE id = p_target_id;
      END IF;
    ELSE
      IF p_value = 1 THEN
        UPDATE comments SET upvote_count = upvote_count + 1 WHERE id = p_target_id;
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
  UPDATE profiles SET points = points + p_amount WHERE id = p_user_id
  RETURNING points INTO new_points;

  new_level := CASE
    WHEN new_points >= 5000 THEN 5
    WHEN new_points >= 1500 THEN 4
    WHEN new_points >= 500 THEN 3
    WHEN new_points >= 100 THEN 2
    ELSE 1
  END;

  UPDATE profiles SET level = new_level WHERE id = p_user_id AND level != new_level;
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
  FROM posts p
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self update
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: public read (non-deleted), auth create, author update/delete
CREATE POLICY "posts_select" ON posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Comments: public read (non-deleted), auth create, author update/delete
CREATE POLICY "comments_select" ON comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Votes: self CRUD
CREATE POLICY "votes_select" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: self CRUD
CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Notifications: self read
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports: auth create, admin read/update
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_admin" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tags: public read
CREATE POLICY "tags_select" ON tags FOR SELECT USING (true);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

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
