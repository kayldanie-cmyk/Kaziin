-- ============================================================
-- Kaziin - Security hardening
-- Roles are controlled through profiles, recruiter access is scoped by employer,
-- and candidates cannot self-promote by changing role-related profile fields.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES employers(id) ON DELETE SET NULL;

DO $$
BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('candidate', 'global_candidate', 'recruiter', 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_profile_employer_id()
RETURNS UUID AS $$
  SELECT employer_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.current_profile_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_recruiter()
RETURNS BOOLEAN AS $$
  SELECT public.current_profile_role() = 'recruiter';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'candidate'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = public.current_profile_role()
    AND employer_id IS NOT DISTINCT FROM public.current_profile_employer_id()
  );

DROP POLICY IF EXISTS "Recruiters can read all profiles" ON profiles;
CREATE POLICY "Recruiters can read applicant profiles"
  ON profiles FOR SELECT
  USING (
    public.is_recruiter()
    AND EXISTS (
      SELECT 1
      FROM applications
      JOIN jobs ON jobs.id = applications.job_id
      WHERE applications.candidate_id = profiles.id
        AND jobs.employer_id = public.current_profile_employer_id()
    )
  );

DROP POLICY IF EXISTS "Recruiters can insert jobs" ON jobs;
CREATE POLICY "Recruiters can insert own employer jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    public.is_recruiter()
    AND employer_id = public.current_profile_employer_id()
  );

DROP POLICY IF EXISTS "Recruiters can read own employer jobs" ON jobs;
CREATE POLICY "Recruiters can read own employer jobs"
  ON jobs FOR SELECT
  USING (
    public.is_recruiter()
    AND employer_id = public.current_profile_employer_id()
  );

DROP POLICY IF EXISTS "Recruiters can update jobs" ON jobs;
CREATE POLICY "Recruiters can update own employer jobs"
  ON jobs FOR UPDATE
  USING (
    public.is_recruiter()
    AND employer_id = public.current_profile_employer_id()
  )
  WITH CHECK (
    public.is_recruiter()
    AND employer_id = public.current_profile_employer_id()
  );

DROP POLICY IF EXISTS "Recruiters can read all applications" ON applications;
CREATE POLICY "Recruiters can read own employer applications"
  ON applications FOR SELECT
  USING (
    public.is_recruiter()
    AND EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = public.current_profile_employer_id()
    )
  );

DROP POLICY IF EXISTS "Recruiters can update all applications" ON applications;
CREATE POLICY "Recruiters can update own employer applications"
  ON applications FOR UPDATE
  USING (
    public.is_recruiter()
    AND EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = public.current_profile_employer_id()
    )
  )
  WITH CHECK (
    public.is_recruiter()
    AND EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = public.current_profile_employer_id()
    )
  );

DROP POLICY IF EXISTS "Recruiters can insert employers" ON employers;
