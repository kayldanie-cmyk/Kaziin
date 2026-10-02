-- ============================================================
-- Kaziin - Admin policies
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update employers" ON employers;
CREATE POLICY "Admins can update employers"
  ON employers FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert employers" ON employers;
CREATE POLICY "Admins can insert employers"
  ON employers FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete employers" ON employers;
CREATE POLICY "Admins can delete employers"
  ON employers FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all jobs" ON jobs;
CREATE POLICY "Admins can read all jobs"
  ON jobs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all jobs" ON jobs;
CREATE POLICY "Admins can update all jobs"
  ON jobs FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all jobs" ON jobs;
CREATE POLICY "Admins can delete all jobs"
  ON jobs FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all applications" ON applications;
CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all applications" ON applications;
CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all applications" ON applications;
CREATE POLICY "Admins can delete all applications"
  ON applications FOR DELETE USING (public.is_admin());

-- Admin assignment should be handled through a controlled operational process.
