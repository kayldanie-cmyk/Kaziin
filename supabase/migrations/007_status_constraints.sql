-- ============================================================
-- Kaziin - Status constraints
-- Keep job and application workflow states aligned with the app.
-- ============================================================

DO $$
BEGIN
  ALTER TABLE jobs
    ADD CONSTRAINT jobs_status_check
    CHECK (status IN ('draft', 'published', 'paused', 'filled', 'expired'))
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE applications
    ADD CONSTRAINT applications_status_check
    CHECK (status IN ('submitted', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'))
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
