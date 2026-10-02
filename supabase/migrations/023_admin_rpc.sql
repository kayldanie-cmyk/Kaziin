-- ============================================================
-- Migration: Add RPC for elevating to admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.elevate_to_admin(secret text)
RETURNS boolean AS $$
BEGIN
  -- Validate against the environment's admin secret
  IF secret = 'DUFF@2026saka' THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
