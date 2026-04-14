-- Add crawling-related columns to ss_scholarships
-- These store additional info from 공공데이터포털 for AI recommendation

ALTER TABLE ss_scholarships
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS selection_method TEXT,
  ADD COLUMN IF NOT EXISTS selection_count TEXT,
  ADD COLUMN IF NOT EXISTS required_documents TEXT,
  ADD COLUMN IF NOT EXISTS application_method TEXT,
  ADD COLUMN IF NOT EXISTS eligibility_details TEXT,
  ADD COLUMN IF NOT EXISTS benefits_details TEXT,
  ADD COLUMN IF NOT EXISTS contact_info TEXT,
  ADD COLUMN IF NOT EXISTS crawl_source TEXT,
  ADD COLUMN IF NOT EXISTS crawled_at TIMESTAMPTZ;

-- Index for deduplication on crawl
CREATE INDEX IF NOT EXISTS idx_ss_scholarships_external_id ON ss_scholarships (external_id) WHERE external_id IS NOT NULL;
