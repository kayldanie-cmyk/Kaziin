-- ============================================================
-- Migration: Add career support applications table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.career_support_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.career_support_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications" ON public.career_support_applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Users can insert own applications" ON public.career_support_applications FOR INSERT WITH CHECK (auth.uid() = candidate_id OR candidate_id IS NULL);
CREATE POLICY "Admins manage applications" ON public.career_support_applications FOR ALL USING (public.is_admin());

GRANT ALL ON public.career_support_applications TO authenticated;
GRANT ALL ON public.career_support_applications TO service_role;
