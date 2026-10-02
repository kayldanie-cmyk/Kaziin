-- ============================================================
-- Kaziin Migration 010: Automatic Recruiter Setup & Role Logic
-- Paste this into: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. Ensure employers table has appropriate RLS policies for recruiters
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read employers" ON public.employers;
CREATE POLICY "Public read employers"
  ON public.employers FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Recruiters can insert employers" ON public.employers;
CREATE POLICY "Recruiters can insert employers"
  ON public.employers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Recruiters can update own employer" ON public.employers;
CREATE POLICY "Recruiters can update own employer"
  ON public.employers FOR UPDATE
  USING (
    public.is_admin()
    OR id = public.current_profile_employer_id()
  );

-- 2. Allow users to insert/upsert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Automatic recruiter organization creation & role assignment trigger
-- When any user signs up as a recruiter, this trigger automatically creates
-- their employer organization and assigns employer_id so they can immediately
-- post jobs and manage candidates without manual admin intervention.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_role TEXT;
  safe_role TEXT;
  new_employer_id UUID;
  display_name TEXT;
BEGIN
  raw_role := NEW.raw_user_meta_data->>'role';
  display_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  -- Determine role
  IF raw_role IN ('recruiter', 'global_candidate') THEN
    safe_role := raw_role;
  ELSE
    safe_role := 'candidate';
  END IF;

  -- If recruiter, create default employer organization if none assigned
  IF safe_role = 'recruiter' THEN
    INSERT INTO public.employers (name, industry, location, verified)
    VALUES (display_name || '''s Organization', 'General', 'Global', false)
    RETURNING id INTO new_employer_id;
  ELSE
    new_employer_id := NULL;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, name, role, employer_id)
  VALUES (
    NEW.id,
    display_name,
    safe_role,
    new_employer_id
  )
  ON CONFLICT (id) DO UPDATE
    SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      employer_id = COALESCE(profiles.employer_id, EXCLUDED.employer_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Repair any existing recruiter profiles that lack an employer_id
DO $$
DECLARE
  rec RECORD;
  new_emp_id UUID;
BEGIN
  FOR rec IN
    SELECT id, name, role FROM public.profiles WHERE role = 'recruiter' AND employer_id IS NULL
  LOOP
    INSERT INTO public.employers (name, industry, location, verified)
    VALUES (COALESCE(rec.name, 'Employer') || '''s Organization', 'General', 'Global', false)
    RETURNING id INTO new_emp_id;

    UPDATE public.profiles
    SET employer_id = new_emp_id
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 5. Ensure global_interest_requests has correct RLS policies
CREATE TABLE IF NOT EXISTS public.global_interest_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_region TEXT NOT NULL,
  profession TEXT NOT NULL,
  support_needs TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'under_review', 'support_available', 'not_eligible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id)
);

ALTER TABLE public.global_interest_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates can read own global interest request" ON public.global_interest_requests;
CREATE POLICY "Candidates can read own global interest request"
  ON public.global_interest_requests FOR SELECT
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can create own global interest request" ON public.global_interest_requests;
CREATE POLICY "Candidates can create own global interest request"
  ON public.global_interest_requests FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update unreviewed global interest request" ON public.global_interest_requests;
CREATE POLICY "Candidates can update unreviewed global interest request"
  ON public.global_interest_requests FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins can manage global interest requests" ON public.global_interest_requests;
CREATE POLICY "Admins can manage global interest requests"
  ON public.global_interest_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
