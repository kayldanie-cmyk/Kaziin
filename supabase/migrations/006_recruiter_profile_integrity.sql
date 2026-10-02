-- ============================================================
-- Kaziin - Recruiter profile integrity
-- Recruiter accounts must be tied to an employer so job,
-- application, and candidate access can be scoped correctly.
-- ============================================================

DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_recruiter_requires_employer
    CHECK (role <> 'recruiter' OR employer_id IS NOT NULL)
    NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
