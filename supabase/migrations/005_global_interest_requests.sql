-- ============================================================
-- Kaziin - Global eligibility-interest requests
-- A saved request records candidate preferences for review. It is not a
-- financial application and must not be presented as an approval or offer.
-- ============================================================

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
  WITH CHECK (auth.uid() = candidate_id AND status = 'received');

DROP POLICY IF EXISTS "Candidates can update unreviewed global interest request" ON public.global_interest_requests;
CREATE POLICY "Candidates can update unreviewed global interest request"
  ON public.global_interest_requests FOR UPDATE
  USING (auth.uid() = candidate_id AND status = 'received')
  WITH CHECK (auth.uid() = candidate_id AND status = 'received');

DROP POLICY IF EXISTS "Admins can manage global interest requests" ON public.global_interest_requests;
CREATE POLICY "Admins can manage global interest requests"
  ON public.global_interest_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
