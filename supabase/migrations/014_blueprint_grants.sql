-- ============================================================
-- Grant permissions for blueprint tables
-- ============================================================

GRANT ALL ON public.skills TO anon, authenticated, service_role;
GRANT ALL ON public.candidate_skills TO anon, authenticated, service_role;
GRANT ALL ON public.job_skills TO anon, authenticated, service_role;
GRANT ALL ON public.matches TO anon, authenticated, service_role;
GRANT ALL ON public.verifications TO anon, authenticated, service_role;
GRANT ALL ON public.cases TO anon, authenticated, service_role;
GRANT ALL ON public.funding_programs TO anon, authenticated, service_role;
GRANT ALL ON public.funding_applications TO anon, authenticated, service_role;
GRANT ALL ON public.events TO anon, authenticated, service_role;
GRANT ALL ON public.notifications TO anon, authenticated, service_role;
GRANT ALL ON public.talent_pools TO anon, authenticated, service_role;
GRANT ALL ON public.talent_pool_members TO anon, authenticated, service_role;
GRANT ALL ON public.saved_jobs TO anon, authenticated, service_role;
GRANT ALL ON public.job_alerts TO anon, authenticated, service_role;
GRANT ALL ON public.feature_flags TO anon, authenticated, service_role;
