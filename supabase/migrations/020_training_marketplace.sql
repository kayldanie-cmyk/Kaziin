-- ============================================================
-- Kaziin — Training Marketplace Schema (Phase 5)
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Implements Kaziin_Career_Support_Funding_Skill.md §10, §15, §35
--
-- SAFE MIGRATION:
--   - Purely additive (CREATE TABLE IF NOT EXISTS)
--   - No DROP, no modification of existing tables
--   - RLS on all new tables
--   - FKs to profiles, career_plans (from career_support migration)
-- ============================================================

-- ── Training Providers ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_providers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  website          TEXT,
  country          TEXT,
  city             TEXT,
  contact_email    TEXT,
  logo_url         TEXT,
  verified         BOOLEAN NOT NULL DEFAULT FALSE,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_providers IS
  'Organizations that deliver training programs listed on Kaziin.';

-- ── Training Programs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_programs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id         UUID REFERENCES training_providers(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  mode                TEXT NOT NULL DEFAULT 'in_person',
    -- in_person | online | hybrid | self_paced
  location            TEXT,
  country             TEXT,
  duration_weeks      INTEGER,
  cost_amount         INTEGER,           -- in minor units or whole currency
  cost_currency       TEXT DEFAULT 'USD',
  cost_subsidised     BOOLEAN DEFAULT FALSE,
  certification       TEXT,              -- name of cert awarded on completion
  -- Career targeting
  industry            TEXT,
  career_stage        TEXT,              -- entry | mid | senior | any
  -- Entry requirements
  min_education_level TEXT,
  prerequisites       TEXT,
  -- Availability
  next_start_date     DATE,
  available_spaces    INTEGER,
  -- Lifecycle
  verified            BOOLEAN NOT NULL DEFAULT FALSE,
  active              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_programs IS
  'Training programs listed on Kaziin. Linked to providers, skills and career outcomes.';

-- ── Training Program Skills ─────────────────────────────────
-- Links a training program to the skills it delivers.
-- Critical relationship: COURSE → SKILLS → CAREER PATH → JOBS

CREATE TABLE IF NOT EXISTS training_program_skills (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id   UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  skill_name   TEXT NOT NULL,
  skill_level  TEXT DEFAULT 'intermediate',  -- beginner | intermediate | advanced | expert
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_program_skills IS
  'Skills acquired upon completing a training program. Powers skills-gap recommendations.';

-- ── Training Enrollments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id      UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  career_plan_id  UUID REFERENCES career_plans(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'enrolled',
    -- enrolled | in_progress | completed | withdrawn | failed
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id, program_id)
);

COMMENT ON TABLE training_enrollments IS
  'Candidate enrollment in a training program. Status-tracked from enrolled → completed.';

-- ── Training Credentials ─────────────────────────────────────
-- Uploaded/verified certificates after training completion.
-- Triggers Phase 7: credential → skills update → job re-matching.

CREATE TABLE IF NOT EXISTS training_credentials (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id    UUID REFERENCES training_enrollments(id) ON DELETE SET NULL,
  program_id       UUID REFERENCES training_programs(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,              -- name of the credential
  issuer           TEXT,                       -- issuing body
  issued_date      DATE,
  expiry_date      DATE,
  credential_url   TEXT,                       -- external verification URL
  document_path    TEXT,                       -- storage path for uploaded file
  verification_status TEXT NOT NULL DEFAULT 'unverified',
    -- unverified | pending_review | verified | rejected
  verified_at      TIMESTAMPTZ,
  verified_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  skills_applied   BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE once credential triggers a skills/profile update
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_credentials IS
  'Credentials earned by candidates. Drives the Phase 7 loop: credential → skills update → matching recalculation.';

-- ── RLS ──────────────────────────────────────────────────────

ALTER TABLE training_providers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_program_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_credentials    ENABLE ROW LEVEL SECURITY;

-- training_providers: public read, admin manage
DROP POLICY IF EXISTS "Anyone can read active providers" ON training_providers;
CREATE POLICY "Anyone can read active providers"
  ON training_providers FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Admins manage providers" ON training_providers;
CREATE POLICY "Admins manage providers"
  ON training_providers FOR ALL
  USING (public.is_admin());

-- training_programs: public read, admin manage
DROP POLICY IF EXISTS "Anyone can read active programs" ON training_programs;
CREATE POLICY "Anyone can read active programs"
  ON training_programs FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Admins manage programs" ON training_programs;
CREATE POLICY "Admins manage programs"
  ON training_programs FOR ALL
  USING (public.is_admin());

-- training_program_skills: public read
DROP POLICY IF EXISTS "Anyone can read program skills" ON training_program_skills;
CREATE POLICY "Anyone can read program skills"
  ON training_program_skills FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins manage program skills" ON training_program_skills;
CREATE POLICY "Admins manage program skills"
  ON training_program_skills FOR ALL
  USING (public.is_admin());

-- training_enrollments: candidates own theirs, admins see all
DROP POLICY IF EXISTS "Candidates manage own enrollments" ON training_enrollments;
CREATE POLICY "Candidates manage own enrollments"
  ON training_enrollments FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins manage enrollments" ON training_enrollments;
CREATE POLICY "Admins manage enrollments"
  ON training_enrollments FOR ALL
  USING (public.is_admin());

-- training_credentials: candidates own theirs, admins can verify
DROP POLICY IF EXISTS "Candidates manage own credentials" ON training_credentials;
CREATE POLICY "Candidates manage own credentials"
  ON training_credentials FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins manage credentials" ON training_credentials;
CREATE POLICY "Admins manage credentials"
  ON training_credentials FOR ALL
  USING (public.is_admin());

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_training_programs_provider    ON training_programs (provider_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_active      ON training_programs (active);
CREATE INDEX IF NOT EXISTS idx_training_programs_industry    ON training_programs (industry);
CREATE INDEX IF NOT EXISTS idx_training_program_skills_prog  ON training_program_skills (program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_cand     ON training_enrollments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_prog     ON training_enrollments (program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_status   ON training_enrollments (status);
CREATE INDEX IF NOT EXISTS idx_training_credentials_cand     ON training_credentials (candidate_id);
CREATE INDEX IF NOT EXISTS idx_training_credentials_verified ON training_credentials (verification_status);

-- ============================================================
-- END OF MIGRATION
-- Tables created: training_providers, training_programs,
--                 training_program_skills, training_enrollments,
--                 training_credentials
-- Existing tables modified: NONE
-- ============================================================
