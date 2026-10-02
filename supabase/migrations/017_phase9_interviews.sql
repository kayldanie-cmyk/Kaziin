-- ============================================================
-- Kaziin — Phase 9: Interview & Assessment Engine
-- Blueprint §33
-- ============================================================

-- ── Interviews Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  recruiter_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_type    TEXT DEFAULT 'video', -- 'video' | 'phone' | 'in_person'
  meeting_link    TEXT,
  location        TEXT,
  notes           TEXT,
  scorecard       JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Assessments Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL, -- 'technical' | 'numerical' | 'language' | 'situational'
  job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
  questions       JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Assessment Results Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score           REAL,
  passed          BOOLEAN,
  answers         JSONB DEFAULT '{}'::jsonb,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, application_id)
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates read own interviews" ON interviews;
CREATE POLICY "Candidates read own interviews" ON interviews
  FOR SELECT USING (
    application_id IN (SELECT id FROM applications WHERE candidate_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters manage interviews" ON interviews;
CREATE POLICY "Recruiters manage interviews" ON interviews
  FOR ALL USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates read own assessments" ON assessments;
CREATE POLICY "Candidates read own assessments" ON assessments
  FOR SELECT USING (
    job_id IN (SELECT job_id FROM applications WHERE candidate_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters manage assessments" ON assessments;
CREATE POLICY "Recruiters manage assessments" ON assessments
  FOR ALL USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own results" ON assessment_results;
CREATE POLICY "Candidates manage own results" ON assessment_results
  FOR ALL USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Recruiters read assessment results" ON assessment_results;
CREATE POLICY "Recruiters read assessment results" ON assessment_results
  FOR SELECT USING (public.is_recruiter() OR public.is_admin());
