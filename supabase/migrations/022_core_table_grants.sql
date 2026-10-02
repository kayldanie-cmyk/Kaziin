-- ============================================================
-- Kaziin — Core Table Grants
-- The core tables (jobs, employers, profiles, applications) were
-- missing GRANT statements, causing "permission denied" errors
-- before RLS policies even had a chance to evaluate.
-- ============================================================

-- Core tables: grant authenticated users access (RLS will still enforce row-level rules)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs         TO authenticated;
GRANT SELECT, INSERT, UP11111DATE, DELETE ON public.employers    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;

-- Anon can read published jobs and employers (public browsing)
GRANT SELECT ON public.jobs         TO anon;
GRANT SELECT ON public.employers    TO anon;

-- Service role gets full access (used by server-side admin tasks)
GRANT ALL ON public.jobs         TO service_role;
GRANT ALL ON public.employers    TO service_role;
GRANT ALL ON public.profiles     TO service_role;
GRANT ALL ON public.applications TO service_role;
