-- ============================================================
-- Kaziin - Fix: restore role from metadata on signup
-- The security hardening migration (004) inadvertently hardcoded
-- the profile role to 'candidate', ignoring user metadata.
-- This migration restores the correct behavior so that recruiters
-- and global candidates get the right role when signing up.
-- ============================================================

-- 1. Restore handle_new_user to read role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_role TEXT;
  safe_role TEXT;
BEGIN
  -- Read the intended role from metadata
  raw_role := NEW.raw_user_meta_data->>'role';

  -- Only allow valid, non-admin roles through the trigger.
  -- Admin role is only granted via the admin auth flow.
  IF raw_role IN ('recruiter', 'global_candidate') THEN
    safe_role := raw_role;
  ELSE
    safe_role := 'candidate';
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    safe_role
  )
  ON CONFLICT (id) DO UPDATE
    SET
      name = EXCLUDED.name,
      role = EXCLUDED.role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Allow users to insert their own profile row
-- (needed for the client-side upsert as a safety net against trigger delays)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND role IN ('candidate', 'global_candidate', 'recruiter')
  );
