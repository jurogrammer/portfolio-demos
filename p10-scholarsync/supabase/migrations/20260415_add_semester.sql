-- Add semester column to ss_profiles
ALTER TABLE ss_profiles ADD COLUMN IF NOT EXISTS semester smallint;
COMMENT ON COLUMN ss_profiles.semester IS '현재 학기 (1 또는 2)';
