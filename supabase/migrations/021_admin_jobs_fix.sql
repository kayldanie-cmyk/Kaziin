-- ============================================================
-- Fix: Allow Admins to insert jobs
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert all jobs" ON jobs;
CREATE POLICY "Admins can insert all jobs"
  ON jobs FOR INSERT 
  WITH CHECK (public.is_admin());
