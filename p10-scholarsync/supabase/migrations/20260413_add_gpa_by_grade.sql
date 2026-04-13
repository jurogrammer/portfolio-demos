-- Add per-grade GPA storage
ALTER TABLE ss_profiles ADD COLUMN IF NOT EXISTS gpa_by_grade JSONB DEFAULT '{}';

-- Comment: gpa_by_grade stores {"1": 3.8, "2": 4.0, ...} keyed by grade number.
-- The existing gpa column is kept as computed average for backward-compatible scholarship matching.
