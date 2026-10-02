-- ============================================================
-- Kaziin — Career Support & Funding Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Implements Kaziin_Career_Support_Funding_Skill.md §20, §35
--
-- SAFE MIGRATION:
--   - Purely additive (CREATE TABLE IF NOT EXISTS)
--   - No DROP TABLE, no DROP COLUMN, no existing table changes
--   - All FKs reference existing tables (profiles)
--   - Full RLS on all new tables
-- ============================================================

-- ── Career Assessments (§35 MVP Phase 3) ─────────────────────
-- Stores each career assessment taken by a candidate.
-- Multiple assessments allowed; career_plans references the latest.

CREATE TABLE IF NOT EXISTS career_assessments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employment_status TEXT NOT NULL,
  education_level   TEXT NOT NULL,
  career_goal       TEXT NOT NULL,
  experience_area   TEXT NOT NULL,
  location          TEXT,
  work_preferences  TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE career_assessments IS
  'Stores candidate career assessments. One candidate may have many assessments over time.';

-- ── Career Plans (§9, §35) ────────────────────────────────────
-- One active plan per candidate. Upsert on candidate_id.
-- Linked to the latest assessment via latest_assessment_id.

CREATE TABLE IF NOT EXISTS career_plans (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  career_goal           TEXT,
  employment_status     TEXT,
  education_level       TEXT,
  experience_area       TEXT,
  location              TEXT,
  work_preferences      TEXT[] DEFAULT '{}',
  -- Optional enrichment fields (populated over time)
  target_role           TEXT,
  target_salary_min     INTEGER,
  target_salary_max     INTEGER,
  target_timeline_weeks INTEGER,
  notes                 TEXT,
  -- Lifecycle
  status                TEXT NOT NULL DEFAULT 'active',  -- active | archived | completed
  latest_assessment_id  UUID REFERENCES career_assessments(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id)  -- one active plan per candidate (upsert target)
);

COMMENT ON TABLE career_plans IS
  'Persistent career plan per candidate. Upserted on each new assessment.';

-- ── Career Plan Milestones (§9) ───────────────────────────────
-- Optional milestones within a career plan.

CREATE TABLE IF NOT EXISTS career_plan_milestones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id       UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  sort_order    INTEGER DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'upcoming',  -- upcoming | in_progress | complete | skipped
  due_date      DATE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE career_plan_milestones IS
  'Milestones within a candidate career plan. Status-tracked and ordered.';

-- ── Career Goals (§9, §20) ────────────────────────────────────
-- Structured, normalised goal record (optional richer layer on top of career_plans).
-- career_plans.career_goal stores the type key;
-- this table stores enriched goal detail when needed.

CREATE TABLE IF NOT EXISTS career_goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type      TEXT NOT NULL,  -- matches career_goal enum used in assessments
  target_role    TEXT,
  target_country TEXT,
  target_salary  INTEGER,
  timeline_weeks INTEGER,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'active',  -- active | achieved | abandoned
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE career_goals IS
  'Structured career goal detail. Optional enrichment on top of the career_plans goal_type.';

-- ── RLS ────────────────────────────────────────────────────────

ALTER TABLE career_assessments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals          ENABLE ROW LEVEL SECURITY;

-- career_assessments
DROP POLICY IF EXISTS "Candidates manage own assessments" ON career_assessments;
CREATE POLICY "Candidates manage own assessments"
  ON career_assessments FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read career assessments" ON career_assessments;
CREATE POLICY "Admins read career assessments"
  ON career_assessments FOR SELECT
  USING (public.is_admin());

-- career_plans
DROP POLICY IF EXISTS "Candidates manage own career plan" ON career_plans;
CREATE POLICY "Candidates manage own career plan"
  ON career_plans FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read career plans" ON career_plans;
CREATE POLICY "Admins read career plans"
  ON career_plans FOR SELECT
  USING (public.is_admin());

-- career_plan_milestones
DROP POLICY IF EXISTS "Candidates manage own milestones" ON career_plan_milestones;
CREATE POLICY "Candidates manage own milestones"
  ON career_plan_milestones FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read milestones" ON career_plan_milestones;
CREATE POLICY "Admins read milestones"
  ON career_plan_milestones FOR SELECT
  USING (public.is_admin());

-- career_goals
DROP POLICY IF EXISTS "Candidates manage own career goals" ON career_goals;
CREATE POLICY "Candidates manage own career goals"
  ON career_goals FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read career goals" ON career_goals;
CREATE POLICY "Admins read career goals"
  ON career_goals FOR SELECT
  USING (public.is_admin());

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_career_assessments_candidate
  ON career_assessments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_career_assessments_created
  ON career_assessments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_plans_candidate
  ON career_plans (candidate_id);
CREATE INDEX IF NOT EXISTS idx_career_plans_status
  ON career_plans (status);

CREATE INDEX IF NOT EXISTS idx_career_plan_milestones_plan
  ON career_plan_milestones (plan_id);
CREATE INDEX IF NOT EXISTS idx_career_plan_milestones_candidate
  ON career_plan_milestones (candidate_id);

CREATE INDEX IF NOT EXISTS idx_career_goals_candidate
  ON career_goals (candidate_id);

-- ── Updated_at trigger ────────────────────────────────────────
-- Reuse the existing moddatetime extension if available.
-- If the trigger function does not exist, this is safe to skip.

DO $$
BEGIN
  -- career_plans
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_career_plans'
  ) THEN
    BEGIN
      CREATE TRIGGER set_updated_at_career_plans
        BEFORE UPDATE ON career_plans
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    EXCEPTION WHEN OTHERS THEN
      -- moddatetime not available; updated_at managed by application
      NULL;
    END;
  END IF;

  -- career_plan_milestones
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_career_plan_milestones'
  ) THEN
    BEGIN
      CREATE TRIGGER set_updated_at_career_plan_milestones
        BEFORE UPDATE ON career_plan_milestones
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- career_goals
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_career_goals'
  ) THEN
    BEGIN
      CREATE TRIGGER set_updated_at_career_goals
        BEFORE UPDATE ON career_goals
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================================
-- END OF MIGRATION
-- Tables created: career_assessments, career_plans,
--                 career_plan_milestones, career_goals
-- Existing tables modified: NONE
-- Data deleted: NONE
-- ============================================================
