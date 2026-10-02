-- ============================================================
-- Kaziin — Matching Configuration (Blueprint §43)
-- Admin-configurable weights for the matching algorithm.
-- ============================================================

CREATE TABLE IF NOT EXISTS matching_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factor      TEXT UNIQUE NOT NULL,
  weight      REAL NOT NULL DEFAULT 0,
  description TEXT,
  category    TEXT, -- allows per-category overrides in future
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE matching_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read matching config" ON matching_config FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage matching config" ON matching_config FOR ALL USING (public.is_admin());

-- Seed initial weights (Blueprint §8)
INSERT INTO matching_config (factor, weight, description) VALUES
  ('relevant_skills', 0.30, 'Match on required and preferred skills'),
  ('experience', 0.20, 'Years of relevant experience'),
  ('semantic_similarity', 0.20, 'Embedding-based semantic similarity'),
  ('location_work_mode', 0.10, 'Location and remote/onsite compatibility'),
  ('salary_compatibility', 0.10, 'Salary expectations vs offered range'),
  ('availability', 0.05, 'Candidate availability timing'),
  ('education_certification', 0.05, 'Education level and required certifications')
ON CONFLICT (factor) DO NOTHING;
