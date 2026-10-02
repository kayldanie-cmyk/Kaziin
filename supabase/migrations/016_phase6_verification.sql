-- ============================================================
-- Kaziin — Phase 6: Trust & Verification Engine
-- Blueprint §29, §30
-- ============================================================

-- ── Verifications Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,  -- 'identity' | 'employment' | 'education' | 'certification' | 'license' | 'reference'
  status            TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'under_review' | 'verified' | 'failed' | 'expired'
  document_urls     TEXT[] DEFAULT '{}',
  notes             TEXT,
  verified_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  expiry_date       DATE,
  reference_id      UUID,  -- FK to specific cert/license/education record
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Documents Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,  -- 'cv' | 'certificate' | 'license' | 'id' | 'portfolio' | 'reference_letter' | 'other'
  storage_path  TEXT NOT NULL,
  mime_type     TEXT,
  size_bytes    INTEGER,
  verified      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Employer Verification Table ───────────────────────────────
CREATE TABLE IF NOT EXISTS employer_verifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id     UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'unverified',  -- 'unverified' | 'pending' | 'verified' | 'suspended'
  business_name   TEXT,
  registration_no TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  verified_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Job Safety Flags ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL,  -- 'scam' | 'duplicate' | 'inappropriate' | 'misleading' | 'other'
  details     TEXT,
  status      TEXT DEFAULT 'open',  -- 'open' | 'reviewed' | 'actioned' | 'dismissed'
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates manage own verifications" ON verifications;
CREATE POLICY "Candidates manage own verifications" ON verifications
  FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Admins manage all verifications" ON verifications;
CREATE POLICY "Admins manage all verifications" ON verifications
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own documents" ON documents;
CREATE POLICY "Candidates manage own documents" ON documents
  FOR ALL USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Admins read all documents" ON documents;
CREATE POLICY "Admins read all documents" ON documents
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Candidates submit reports" ON job_reports;
CREATE POLICY "Candidates submit reports" ON job_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "Admins manage reports" ON job_reports;
CREATE POLICY "Admins manage reports" ON job_reports
  FOR ALL USING (public.is_admin());
