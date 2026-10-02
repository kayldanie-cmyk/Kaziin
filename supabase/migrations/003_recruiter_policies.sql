-- ============================================================
-- Kaziin — Recruiter Policies
-- Paste this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Function to check if the current user is a recruiter
CREATE OR REPLACE FUNCTION public.is_recruiter()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'recruiter'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── Recruiter RLS Policies ────────────────────────────────────

-- Profiles
-- Recruiters need to read candidate profiles to review applications
CREATE POLICY "Recruiters can read all profiles"
  ON profiles FOR SELECT USING (public.is_recruiter());

-- Jobs
-- Recruiters can insert new jobs
CREATE POLICY "Recruiters can insert jobs"
  ON jobs FOR INSERT WITH CHECK (public.is_recruiter());

-- Recruiters can update any jobs (in this prototype phase)
CREATE POLICY "Recruiters can update jobs"
  ON jobs FOR UPDATE USING (public.is_recruiter());

-- Applications
-- Recruiters can read all applications
CREATE POLICY "Recruiters can read all applications"
  ON applications FOR SELECT USING (public.is_recruiter());

-- Recruiters can update application statuses
CREATE POLICY "Recruiters can update all applications"
  ON applications FOR UPDATE USING (public.is_recruiter());

-- Employers
-- Recruiters can insert new employer profiles
CREATE POLICY "Recruiters can insert employers"
  ON employers FOR INSERT WITH CHECK (public.is_recruiter());
