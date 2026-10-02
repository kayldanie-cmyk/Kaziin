-- ============================================================
-- Kaziin - Core workflows excluding billing
-- Adds employer access requests, messages, interviews, audit logs,
-- and richer candidate profile fields.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS education TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS work_preferences TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS employment_types TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS employer_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name   TEXT NOT NULL,
  website        TEXT,
  industry       TEXT,
  location       TEXT,
  contact_name   TEXT,
  contact_email  TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body           TEXT NOT NULL,
  read_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_type     TEXT NOT NULL DEFAULT 'video',
  location_or_link TEXT,
  status           TEXT NOT NULL DEFAULT 'scheduled',
  notes            TEXT,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE employer_requests
    ADD CONSTRAINT employer_requests_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'))
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE interviews
    ADD CONSTRAINT interviews_status_check
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show'))
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE interviews
    ADD CONSTRAINT interviews_meeting_type_check
    CHECK (meeting_type IN ('phone', 'video', 'onsite'))
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE employer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own employer requests" ON employer_requests;
CREATE POLICY "Users can create own employer requests"
  ON employer_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can read own employer requests" ON employer_requests;
CREATE POLICY "Users can read own employer requests"
  ON employer_requests FOR SELECT
  USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Admins can read all employer requests" ON employer_requests;
CREATE POLICY "Admins can read all employer requests"
  ON employer_requests FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update employer requests" ON employer_requests;
CREATE POLICY "Admins can update employer requests"
  ON employer_requests FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Participants can read messages" ON messages;
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM applications
      JOIN jobs ON jobs.id = applications.job_id
      WHERE applications.id = messages.application_id
        AND (
          applications.candidate_id = auth.uid()
          OR public.is_admin()
          OR (
            public.is_recruiter()
            AND jobs.employer_id = public.current_profile_employer_id()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM applications
      JOIN jobs ON jobs.id = applications.job_id
      WHERE applications.id = messages.application_id
        AND (
          applications.candidate_id = auth.uid()
          OR public.is_admin()
          OR (
            public.is_recruiter()
            AND jobs.employer_id = public.current_profile_employer_id()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Participants can read interviews" ON interviews;
CREATE POLICY "Participants can read interviews"
  ON interviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM applications
      JOIN jobs ON jobs.id = applications.job_id
      WHERE applications.id = interviews.application_id
        AND (
          applications.candidate_id = auth.uid()
          OR public.is_admin()
          OR (
            public.is_recruiter()
            AND jobs.employer_id = public.current_profile_employer_id()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Recruiters can create interviews" ON interviews;
CREATE POLICY "Recruiters can create interviews"
  ON interviews FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.is_admin()
      OR (
        public.is_recruiter()
        AND EXISTS (
          SELECT 1
          FROM applications
          JOIN jobs ON jobs.id = applications.job_id
          WHERE applications.id = interviews.application_id
            AND jobs.employer_id = public.current_profile_employer_id()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Recruiters can update interviews" ON interviews;
CREATE POLICY "Recruiters can update interviews"
  ON interviews FOR UPDATE
  USING (
    public.is_admin()
    OR (
      public.is_recruiter()
      AND EXISTS (
        SELECT 1
        FROM applications
        JOIN jobs ON jobs.id = applications.job_id
        WHERE applications.id = interviews.application_id
          AND jobs.employer_id = public.current_profile_employer_id()
      )
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      public.is_recruiter()
      AND EXISTS (
        SELECT 1
        FROM applications
        JOIN jobs ON jobs.id = applications.job_id
        WHERE applications.id = interviews.application_id
          AND jobs.employer_id = public.current_profile_employer_id()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Workspace users can write audit logs" ON audit_logs;
CREATE POLICY "Workspace users can write audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND (
      public.is_admin()
      OR public.is_recruiter()
      OR public.current_profile_role() IN ('candidate', 'global_candidate')
    )
  );
