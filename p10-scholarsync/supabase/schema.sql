-- ScholarSync KR (P10) — Supabase Schema
-- Prefix: ss_ (shared Supabase instance)

-- Profiles
CREATE TABLE IF NOT EXISTS ss_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  university TEXT,
  department TEXT,
  grade INT CHECK (grade BETWEEN 1 AND 6),
  gpa NUMERIC(3,2) CHECK (gpa >= 0 AND gpa <= 4.5),
  gpa_by_grade JSONB DEFAULT '{}',
  gpa_scale NUMERIC(3,1) DEFAULT 4.5,
  income_quintile INT CHECK (income_quintile BETWEEN 1 AND 10),
  region TEXT,
  degree_type TEXT DEFAULT 'undergraduate' CHECK (degree_type IN ('undergraduate','master','doctorate')),
  interests TEXT[],
  bio_keywords TEXT,
  experiences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scholarships
CREATE TABLE IF NOT EXISTS ss_scholarships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('government','foundation','local_gov','university')),
  target_degree TEXT[] NOT NULL DEFAULT '{all}',
  min_gpa NUMERIC(3,2),
  max_income_quintile INT CHECK (max_income_quintile BETWEEN 1 AND 10),
  target_regions TEXT[],
  target_majors TEXT[],
  amount_type TEXT NOT NULL CHECK (amount_type IN ('full_tuition','half_tuition','fixed','variable')),
  amount_value INT,
  deadline DATE NOT NULL,
  application_start DATE,
  essay_prompts JSONB,
  source_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  extra_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Essays (user-saved drafts)
CREATE TABLE IF NOT EXISTS ss_essays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES ss_scholarships(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- Essay generation tracking (for rate limiting)
CREATE TABLE IF NOT EXISTS ss_essay_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES ss_scholarships(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ss_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ss_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ss_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE ss_essay_generations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can CRUD own profile
CREATE POLICY "Users can view own profile" ON ss_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON ss_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON ss_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Scholarships: public read, admin write
CREATE POLICY "Anyone can view active scholarships" ON ss_scholarships FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage scholarships" ON ss_scholarships FOR ALL USING (true);

-- Essays: users can CRUD own essays
CREATE POLICY "Users can view own essays" ON ss_essays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own essays" ON ss_essays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own essays" ON ss_essays FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own essays" ON ss_essays FOR DELETE USING (auth.uid() = user_id);

-- Essay generations: users can view/insert own
CREATE POLICY "Users can view own generations" ON ss_essay_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations" ON ss_essay_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_ss_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ss_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_ss') THEN
    CREATE TRIGGER on_auth_user_created_ss
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_ss_new_user();
  END IF;
END
$$;

-- Index for scholarship matching
CREATE INDEX IF NOT EXISTS idx_ss_scholarships_active ON ss_scholarships (is_active, deadline);
CREATE INDEX IF NOT EXISTS idx_ss_scholarships_deadline ON ss_scholarships (deadline) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ss_essays_user ON ss_essays (user_id);
CREATE INDEX IF NOT EXISTS idx_ss_essay_generations_user ON ss_essay_generations (user_id, generated_at);
