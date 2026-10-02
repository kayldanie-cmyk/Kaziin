-- Combined New Migrations SQL (015 to 020)
-- Generated from supabase/migrations/

-- ============================================================================
-- MIGRATION: 015_phase5_skills_graph.sql
-- ============================================================================

-- ============================================================
-- Kaziin — Phase 5: Universal Skills Graph
-- Blueprint §10, §11 — Canonical Skills Database
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Core Skills Table ────────────────────────────────────────
-- The skills table may already exist (from the base Kaziin schema).
-- We ensure it exists and then extend it.

CREATE TABLE IF NOT EXISTS skills (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_name  TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  category        TEXT,                        -- broad grouping e.g. 'technical', 'soft', 'trade'
  skill_type      TEXT DEFAULT 'technical',    -- 'technical' | 'soft' | 'trade' | 'language' | 'tool'
  job_families    TEXT[] DEFAULT '{}',         -- legacy broad family associations
  related_skills  UUID[] DEFAULT '{}',         -- denormalised fast lookup
  verified        BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns if table already existed without them
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS canonical_name TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'technical',
  ADD COLUMN IF NOT EXISTS job_families TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_skills UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely ensure unique constraints exist in case the table was created previously without them
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skills_canonical_name_key') THEN
    ALTER TABLE skills ADD CONSTRAINT skills_canonical_name_key UNIQUE (canonical_name);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skills_slug_key') THEN
    ALTER TABLE skills ADD CONSTRAINT skills_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ── Skill Aliases ────────────────────────────────────────────
-- Normalises different names for the same skill.
-- e.g. "Excel" → "Microsoft Excel", "JS" → "JavaScript"

CREATE TABLE IF NOT EXISTS skill_aliases (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id   UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  alias      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill_id, alias)
);

CREATE INDEX IF NOT EXISTS idx_skill_aliases_alias ON skill_aliases (LOWER(alias));

-- ── Skill Relationships ──────────────────────────────────────
-- Maps parent → child skill relationships (skills graph).
-- e.g. parent="JavaScript", child="React", child="Vue", child="Next.js"

CREATE TABLE IF NOT EXISTS skill_relationships (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  child_skill_id  UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  relationship    TEXT DEFAULT 'specialization',  -- 'specialization' | 'related' | 'prerequisite'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_skill_id, child_skill_id)
);

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_relationships ENABLE ROW LEVEL SECURITY;

-- Skills: public read, admin full control
DROP POLICY IF EXISTS "Public read skills" ON skills;
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage skills" ON skills;
CREATE POLICY "Admins manage skills" ON skills FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read skill aliases" ON skill_aliases;
CREATE POLICY "Public read skill aliases" ON skill_aliases FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage skill aliases" ON skill_aliases;
CREATE POLICY "Admins manage skill aliases" ON skill_aliases FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read skill relationships" ON skill_relationships;
CREATE POLICY "Public read skill relationships" ON skill_relationships FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage skill relationships" ON skill_relationships;
CREATE POLICY "Admins manage skill relationships" ON skill_relationships FOR ALL USING (public.is_admin());

-- ── Seed: Foundation Skills ──────────────────────────────────
-- A representative set across all major job categories.
-- Admins can expand this via the Skills Manager.

DO $$
BEGIN

-- ── Technology Skills ────────────────────────────────────────
INSERT INTO skills (name, canonical_name, slug, category, skill_type)
SELECT canonical_name, canonical_name, slug, category, skill_type FROM (VALUES
  ('JavaScript',       'javascript',       'Technology & IT', 'technical'),
  ('TypeScript',       'typescript',       'Technology & IT', 'technical'),
  ('Python',           'python',           'Technology & IT', 'technical'),
  ('Java',             'java',             'Technology & IT', 'technical'),
  ('React',            'react',            'Technology & IT', 'technical'),
  ('Next.js',          'nextjs',           'Technology & IT', 'technical'),
  ('Vue.js',           'vuejs',            'Technology & IT', 'technical'),
  ('Node.js',          'nodejs',           'Technology & IT', 'technical'),
  ('SQL',              'sql',              'Technology & IT', 'technical'),
  ('PostgreSQL',       'postgresql',       'Technology & IT', 'technical'),
  ('Git',              'git',              'Technology & IT', 'tool'),
  ('Docker',           'docker',           'Technology & IT', 'tool'),
  ('AWS',              'aws',              'Technology & IT', 'tool'),
  ('Microsoft Excel',  'microsoft-excel',  'General',         'tool'),
  ('Microsoft Word',   'microsoft-word',   'General',         'tool'),
  ('Google Workspace', 'google-workspace', 'General',         'tool'),

-- ── Finance Skills ───────────────────────────────────────────
  ('Bookkeeping',      'bookkeeping',      'Finance, Accounting & Banking', 'technical'),
  ('Financial Analysis','financial-analysis','Finance, Accounting & Banking','technical'),
  ('QuickBooks',       'quickbooks',       'Finance, Accounting & Banking', 'tool'),
  ('SAP',              'sap',              'Finance, Accounting & Banking', 'tool'),
  ('Xero',             'xero',             'Finance, Accounting & Banking', 'tool'),
  ('Tax Preparation',  'tax-preparation',  'Finance, Accounting & Banking', 'technical'),
  ('Payroll Processing','payroll-processing','Finance, Accounting & Banking','technical'),
  ('Auditing',         'auditing',         'Finance, Accounting & Banking', 'technical'),

-- ── Customer Service & Sales Skills ──────────────────────────
  ('Customer Service', 'customer-service', 'General',   'soft'),
  ('Communication',    'communication',    'General',   'soft'),
  ('Problem Solving',  'problem-solving',  'General',   'soft'),
  ('Negotiation',      'negotiation',      'Sales, Marketing & Business Development', 'soft'),
  ('CRM Software',     'crm-software',     'Sales, Marketing & Business Development', 'tool'),
  ('Salesforce',       'salesforce',       'Sales, Marketing & Business Development', 'tool'),

-- ── Construction & Trades Skills ─────────────────────────────
  ('Welding',          'welding',          'Construction & Skilled Trades', 'trade'),
  ('Plumbing',         'plumbing',         'Construction & Skilled Trades', 'trade'),
  ('Electrical Wiring','electrical-wiring','Construction & Skilled Trades', 'trade'),
  ('Carpentry',        'carpentry',        'Construction & Skilled Trades', 'trade'),
  ('Masonry',          'masonry',          'Construction & Skilled Trades', 'trade'),
  ('HVAC',             'hvac',             'Construction & Skilled Trades', 'trade'),
  ('AutoCAD',          'autocad',          'Engineering', 'tool'),
  ('Blueprint Reading','blueprint-reading','Construction & Skilled Trades','technical'),

-- ── Transport Skills ─────────────────────────────────────────
  ('Commercial Driving','commercial-driving','Transport & Logistics','trade'),
  ('Defensive Driving', 'defensive-driving','Transport & Logistics','trade'),
  ('Forklift Operation','forklift-operation','Transport & Logistics','trade'),
  ('Route Planning',    'route-planning',   'Transport & Logistics','technical'),

-- ── Healthcare Skills ─────────────────────────────────────────
  ('Patient Care',     'patient-care',     'Healthcare & Medical', 'technical'),
  ('Wound Care',       'wound-care',       'Healthcare & Medical', 'technical'),
  ('Medication Administration','medication-administration','Healthcare & Medical','technical'),
  ('Medical Records',  'medical-records',  'Healthcare & Medical', 'tool'),

-- ── Soft Skills (General) ────────────────────────────────────
  ('Leadership',       'leadership',       'General', 'soft'),
  ('Teamwork',         'teamwork',         'General', 'soft'),
  ('Time Management',  'time-management',  'General', 'soft'),
  ('Critical Thinking','critical-thinking','General', 'soft'),
  ('Adaptability',     'adaptability',     'General', 'soft'),
  ('Attention to Detail','attention-to-detail','General','soft')
) AS t(canonical_name, slug, category, skill_type)
ON CONFLICT (canonical_name) DO NOTHING;

-- ── Seed: Aliases ────────────────────────────────────────────
-- Map common variants to their canonical skills

INSERT INTO skill_aliases (skill_id, alias)
SELECT id, alias FROM (
  VALUES
    ('javascript',       'JS'),
    ('javascript',       'ECMAScript'),
    ('typescript',       'TS'),
    ('react',            'React.js'),
    ('react',            'ReactJS'),
    ('nextjs',           'Next'),
    ('vuejs',            'Vue'),
    ('vuejs',            'Vue JS'),
    ('nodejs',           'Node'),
    ('nodejs',           'NodeJS'),
    ('sql',              'Structured Query Language'),
    ('postgresql',       'Postgres'),
    ('microsoft-excel',  'Excel'),
    ('microsoft-excel',  'MS Excel'),
    ('microsoft-word',   'Word'),
    ('microsoft-word',   'MS Word'),
    ('google-workspace', 'G Suite'),
    ('google-workspace', 'Google Suite'),
    ('salesforce',       'SFDC'),
    ('hvac',             'Heating Ventilation and Air Conditioning'),
    ('autocad',          'Auto CAD'),
    ('commercial-driving','CDL'),
    ('commercial-driving','Professional Driving')
) AS t(slug, alias)
JOIN skills s ON s.slug = t.slug
ON CONFLICT (skill_id, alias) DO NOTHING;

-- ── Seed: Relationships ──────────────────────────────────────
-- JavaScript is a parent of React, Next.js, Vue.js, Node.js

INSERT INTO skill_relationships (parent_skill_id, child_skill_id, relationship)
SELECT p.id, c.id, 'specialization'
FROM (VALUES
  ('javascript', 'react'),
  ('javascript', 'nextjs'),
  ('javascript', 'vuejs'),
  ('javascript', 'nodejs'),
  ('javascript', 'typescript'),
  ('react',      'nextjs'),
  ('sql',        'postgresql'),
  ('customer-service', 'communication'),
  ('leadership', 'teamwork')
) AS t(parent_slug, child_slug)
JOIN skills p ON p.slug = t.parent_slug
JOIN skills c ON c.slug = t.child_slug
ON CONFLICT (parent_skill_id, child_skill_id) DO NOTHING;

END $$;


-- ============================================================================
-- MIGRATION: 016_phase6_verification.sql
-- ============================================================================

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


-- ============================================================================
-- MIGRATION: 017_phase9_interviews.sql
-- ============================================================================

-- ============================================================
-- Kaziin — Phase 9: Interview & Assessment Engine
-- Blueprint §33
-- ============================================================

-- ── Interviews Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  recruiter_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_type    TEXT DEFAULT 'video', -- 'video' | 'phone' | 'in_person'
  meeting_link    TEXT,
  location        TEXT,
  notes           TEXT,
  scorecard       JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Assessments Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL, -- 'technical' | 'numerical' | 'language' | 'situational'
  job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
  questions       JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Assessment Results Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score           REAL,
  passed          BOOLEAN,
  answers         JSONB DEFAULT '{}'::jsonb,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, application_id)
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates read own interviews" ON interviews;
CREATE POLICY "Candidates read own interviews" ON interviews
  FOR SELECT USING (
    application_id IN (SELECT id FROM applications WHERE candidate_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters manage interviews" ON interviews;
CREATE POLICY "Recruiters manage interviews" ON interviews
  FOR ALL USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates read own assessments" ON assessments;
CREATE POLICY "Candidates read own assessments" ON assessments
  FOR SELECT USING (
    job_id IN (SELECT job_id FROM applications WHERE candidate_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters manage assessments" ON assessments;
CREATE POLICY "Recruiters manage assessments" ON assessments
  FOR ALL USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own results" ON assessment_results;
CREATE POLICY "Candidates manage own results" ON assessment_results
  FOR ALL USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Recruiters read assessment results" ON assessment_results;
CREATE POLICY "Recruiters read assessment results" ON assessment_results
  FOR SELECT USING (public.is_recruiter() OR public.is_admin());


-- ============================================================================
-- MIGRATION: 018_universal_employment.sql
-- ============================================================================

-- ============================================================
-- Kaziin — Universal Employment Schema Extension
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Implements SKILL.md §2-10, §46 (Phase 1 Foundation)
-- ============================================================

-- ── Job Taxonomy (§3) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_families (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES job_categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS job_roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id   UUID NOT NULL REFERENCES job_families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, slug)
);

CREATE TABLE IF NOT EXISTS industries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Extend Jobs with taxonomy FKs (§2) ─────────────────────
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS category_id    UUID REFERENCES job_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS family_id      UUID REFERENCES job_families(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role_id        UUID REFERENCES job_roles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS industry_id    UUID REFERENCES industries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hard_requirements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS soft_requirements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS career_level   TEXT DEFAULT 'mid-level',
  ADD COLUMN IF NOT EXISTS languages_required TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_authorization TEXT;

-- ── Extended Candidate Profile (§5, §7) ─────────────────────

CREATE TABLE IF NOT EXISTS candidate_work_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  company         TEXT NOT NULL,
  location        TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE,
  current         BOOLEAN DEFAULT FALSE,
  description     TEXT,
  employment_type TEXT DEFAULT 'full-time',
  verified        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_education (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution     TEXT NOT NULL,
  degree          TEXT NOT NULL,
  field           TEXT,
  start_date      DATE,
  end_date        DATE,
  verified        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_certifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  issuer              TEXT,
  date_obtained       DATE,
  expiry_date         DATE,
  license_number      TEXT,
  verified            BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'self_declared',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_licenses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  category            TEXT,
  issuing_authority   TEXT,
  license_number      TEXT,
  expiry_date         DATE,
  verified            BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'self_declared',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_languages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language      TEXT NOT NULL,
  proficiency   TEXT DEFAULT 'conversational',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, language)
);

CREATE TABLE IF NOT EXISTS candidate_portfolio (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  type          TEXT DEFAULT 'link',
  url           TEXT,
  description   TEXT,
  file_path     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_career_targets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES job_categories(id) ON DELETE CASCADE,
  family_id     UUID REFERENCES job_families(id) ON DELETE SET NULL,
  role_id       UUID REFERENCES job_roles(id) ON DELETE SET NULL,
  priority      INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, category_id, family_id, role_id)
);

-- ── Application Questions Engine (§8) ──────────────────────

CREATE TABLE IF NOT EXISTS application_questions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question         TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'text',
  required         BOOLEAN DEFAULT FALSE,
  category_id      UUID REFERENCES job_categories(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES job_families(id) ON DELETE SET NULL,
  role_id          UUID REFERENCES job_roles(id) ON DELETE SET NULL,
  validation       JSONB DEFAULT '{}'::jsonb,
  options          JSONB DEFAULT '[]'::jsonb,
  conditional_rule JSONB,
  evidence_required BOOLEAN DEFAULT FALSE,
  sort_order       INTEGER DEFAULT 0,
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES application_questions(id) ON DELETE CASCADE,
  answer          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id, question_id)
);

-- ── Extend Applications (§6, §22) ──────────────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS draft_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS match_score REAL,
  ADD COLUMN IF NOT EXISTS match_explanation JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS submitted_profile JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS documents TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS autosaved_at TIMESTAMPTZ;

-- ── Extend Skills table (§10) ──────────────────────────────
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS job_families TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_skills UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'technical';

-- ── Extend Profiles for progressive profiling (§9) ─────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_prompt_shown TEXT,
  ADD COLUMN IF NOT EXISTS career_level TEXT DEFAULT 'entry';

-- ── RLS Policies ────────────────────────────────────────────

ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_career_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;

-- Taxonomy: public read, admin manage
DROP POLICY IF EXISTS "Public read job categories" ON job_categories;
CREATE POLICY "Public read job categories" ON job_categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage job categories" ON job_categories;
CREATE POLICY "Admins manage job categories" ON job_categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read job families" ON job_families;
CREATE POLICY "Public read job families" ON job_families FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage job families" ON job_families;
CREATE POLICY "Admins manage job families" ON job_families FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read job roles" ON job_roles;
CREATE POLICY "Public read job roles" ON job_roles FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage job roles" ON job_roles;
CREATE POLICY "Admins manage job roles" ON job_roles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read industries" ON industries;
CREATE POLICY "Public read industries" ON industries FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage industries" ON industries;
CREATE POLICY "Admins manage industries" ON industries FOR ALL USING (public.is_admin());

-- Candidate data: own read/write
DROP POLICY IF EXISTS "Candidates manage own work history" ON candidate_work_history;
CREATE POLICY "Candidates manage own work history" ON candidate_work_history FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Recruiters read applicant work history" ON candidate_work_history;
CREATE POLICY "Recruiters read applicant work history" ON candidate_work_history FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own education" ON candidate_education;
CREATE POLICY "Candidates manage own education" ON candidate_education FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Recruiters read applicant education" ON candidate_education;
CREATE POLICY "Recruiters read applicant education" ON candidate_education FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own certifications" ON candidate_certifications;
CREATE POLICY "Candidates manage own certifications" ON candidate_certifications FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Recruiters read applicant certifications" ON candidate_certifications;
CREATE POLICY "Recruiters read applicant certifications" ON candidate_certifications FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own licenses" ON candidate_licenses;
CREATE POLICY "Candidates manage own licenses" ON candidate_licenses FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Recruiters read applicant licenses" ON candidate_licenses;
CREATE POLICY "Recruiters read applicant licenses" ON candidate_licenses FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own languages" ON candidate_languages;
CREATE POLICY "Candidates manage own languages" ON candidate_languages FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Recruiters read applicant languages" ON candidate_languages;
CREATE POLICY "Recruiters read applicant languages" ON candidate_languages FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own portfolio" ON candidate_portfolio;
CREATE POLICY "Candidates manage own portfolio" ON candidate_portfolio FOR ALL USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Recruiters read applicant portfolio" ON candidate_portfolio;
CREATE POLICY "Recruiters read applicant portfolio" ON candidate_portfolio FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

DROP POLICY IF EXISTS "Candidates manage own career targets" ON candidate_career_targets;
CREATE POLICY "Candidates manage own career targets" ON candidate_career_targets FOR ALL USING (auth.uid() = candidate_id);

-- Application questions: public read, admin manage
DROP POLICY IF EXISTS "Public read application questions" ON application_questions;
CREATE POLICY "Public read application questions" ON application_questions FOR SELECT USING (active = TRUE);
DROP POLICY IF EXISTS "Admins manage application questions" ON application_questions;
CREATE POLICY "Admins manage application questions" ON application_questions FOR ALL USING (public.is_admin());

-- Application answers: candidate own + recruiter for their jobs
DROP POLICY IF EXISTS "Candidates manage own answers" ON application_answers;
CREATE POLICY "Candidates manage own answers" ON application_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications WHERE applications.id = application_answers.application_id
        AND applications.candidate_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Recruiters read application answers" ON application_answers;
CREATE POLICY "Recruiters read application answers" ON application_answers FOR SELECT
  USING (public.is_recruiter() OR public.is_admin());

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_job_families_category ON job_families(category_id);
CREATE INDEX IF NOT EXISTS idx_job_roles_family ON job_roles(family_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_family ON jobs(family_id);
CREATE INDEX IF NOT EXISTS idx_jobs_role ON jobs(role_id);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry_id);
CREATE INDEX IF NOT EXISTS idx_candidate_work_history_candidate ON candidate_work_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_education_candidate ON candidate_education(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_certifications_candidate ON candidate_certifications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_career_targets_candidate ON candidate_career_targets(candidate_id);
CREATE INDEX IF NOT EXISTS idx_application_questions_category ON application_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_application_answers_application ON application_answers(application_id);

-- ============================================================
-- SEED DATA — Universal Job Taxonomy (§3)
-- ============================================================

-- ── Industries ──────────────────────────────────────────────
INSERT INTO industries (name, slug, sort_order) VALUES
  ('Technology', 'technology', 1),
  ('Finance & Banking', 'finance-banking', 2),
  ('Healthcare', 'healthcare', 3),
  ('Education', 'education', 4),
  ('Construction', 'construction', 5),
  ('Manufacturing', 'manufacturing', 6),
  ('Retail', 'retail', 7),
  ('Hospitality & Tourism', 'hospitality-tourism', 8),
  ('Transport & Logistics', 'transport-logistics', 9),
  ('Agriculture', 'agriculture', 10),
  ('Legal', 'legal', 11),
  ('Media & Entertainment', 'media-entertainment', 12),
  ('Real Estate', 'real-estate', 13),
  ('Energy & Utilities', 'energy-utilities', 14),
  ('Telecommunications', 'telecommunications', 15),
  ('Non-Profit & NGO', 'non-profit-ngo', 16),
  ('Government', 'government', 17),
  ('Security', 'security', 18),
  ('Beauty & Fashion', 'beauty-fashion', 19),
  ('Domestic Services', 'domestic-services', 20)
ON CONFLICT (slug) DO NOTHING;

-- ── 3.1 Technology & IT ─────────────────────────────────────
INSERT INTO job_categories (name, slug, description, icon, sort_order) VALUES
  ('Technology & IT', 'technology-it', 'Software development, IT support, data science, cybersecurity, and digital infrastructure roles', '💻', 1)
ON CONFLICT (slug) DO NOTHING;

DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'technology-it';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Software Development', 'software-development', 1),
    (cat_id, 'IT Infrastructure & Support', 'it-infrastructure-support', 2),
    (cat_id, 'Data & Analytics', 'data-analytics', 3),
    (cat_id, 'AI & Machine Learning', 'ai-machine-learning', 4),
    (cat_id, 'Cybersecurity', 'cybersecurity', 5),
    (cat_id, 'Design & UX', 'design-ux', 6),
    (cat_id, 'Product & Project Management', 'product-project-management', 7)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'software-development' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Software Developer', 'software-developer', 1),
    (fam_id, 'Frontend Developer', 'frontend-developer', 2),
    (fam_id, 'Backend Developer', 'backend-developer', 3),
    (fam_id, 'Full-Stack Developer', 'full-stack-developer', 4),
    (fam_id, 'Mobile Developer', 'mobile-developer', 5),
    (fam_id, 'Web Developer', 'web-developer', 6),
    (fam_id, 'QA/Test Engineer', 'qa-test-engineer', 7)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'it-infrastructure-support' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'DevOps Engineer', 'devops-engineer', 1),
    (fam_id, 'Cloud Engineer', 'cloud-engineer', 2),
    (fam_id, 'IT Support Technician', 'it-support-technician', 3),
    (fam_id, 'Network Administrator', 'network-administrator', 4),
    (fam_id, 'Database Administrator', 'database-administrator', 5),
    (fam_id, 'Systems Administrator', 'systems-administrator', 6),
    (fam_id, 'Computer Technician', 'computer-technician', 7),
    (fam_id, 'Technical Support Agent', 'technical-support-agent', 8),
    (fam_id, 'IT Project Manager', 'it-project-manager', 9)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'data-analytics' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Data Analyst', 'data-analyst', 1),
    (fam_id, 'Data Scientist', 'data-scientist', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'ai-machine-learning' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Machine Learning Engineer', 'machine-learning-engineer', 1),
    (fam_id, 'AI Engineer', 'ai-engineer', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'cybersecurity' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Cybersecurity Analyst', 'cybersecurity-analyst', 1)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'design-ux' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'UI/UX Designer', 'ui-ux-designer', 1)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'product-project-management' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Product Manager', 'product-manager', 1)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- ── 3.2 Finance, Accounting & Banking ───────────────────────
INSERT INTO job_categories (name, slug, description, icon, sort_order) VALUES
  ('Finance, Accounting & Banking', 'finance-accounting-banking', 'Accounting, auditing, banking, investment, insurance and financial analysis roles', '💰', 2)
ON CONFLICT (slug) DO NOTHING;

DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'finance-accounting-banking';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Accounting', 'accounting', 1),
    (cat_id, 'Banking', 'banking', 2),
    (cat_id, 'Finance & Investment', 'finance-investment', 3),
    (cat_id, 'Insurance & Risk', 'insurance-risk', 4)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'accounting' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Accountant', 'accountant', 1), (fam_id, 'Junior Accountant', 'junior-accountant', 2),
    (fam_id, 'Senior Accountant', 'senior-accountant', 3), (fam_id, 'Bookkeeper', 'bookkeeper', 4),
    (fam_id, 'Auditor', 'auditor', 5), (fam_id, 'Internal Auditor', 'internal-auditor', 6),
    (fam_id, 'Tax Accountant', 'tax-accountant', 7), (fam_id, 'Payroll Officer', 'payroll-officer', 8),
    (fam_id, 'Accounts Payable Officer', 'accounts-payable-officer', 9),
    (fam_id, 'Accounts Receivable Officer', 'accounts-receivable-officer', 10)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'banking' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Credit Officer', 'credit-officer', 1), (fam_id, 'Loan Officer', 'loan-officer', 2),
    (fam_id, 'Bank Teller', 'bank-teller', 3), (fam_id, 'Cashier', 'cashier', 4)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'finance-investment' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Financial Analyst', 'financial-analyst', 1), (fam_id, 'Finance Officer', 'finance-officer', 2),
    (fam_id, 'Finance Manager', 'finance-manager', 3), (fam_id, 'Investment Analyst', 'investment-analyst', 4)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'insurance-risk' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Risk Analyst', 'risk-analyst', 1), (fam_id, 'Insurance Officer', 'insurance-officer', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- ── 3.3–3.20 Remaining Categories ───────────────────────────
-- (Sales, Customer Service, Admin, Healthcare, Education, Engineering,
--  Construction, Transport, Hospitality, Retail, Security, Agriculture,
--  Manufacturing, Legal, HR, Creative, Beauty, Domestic)

INSERT INTO job_categories (name, slug, description, icon, sort_order) VALUES
  ('Sales, Marketing & Business Development', 'sales-marketing-bd', 'Sales, digital marketing, business development, branding and customer acquisition roles', '📊', 3),
  ('Customer Service & Call Centre', 'customer-service-call-centre', 'Customer support, call centre operations, client relations and help desk roles', '📞', 4),
  ('Administration & Office Operations', 'administration-office', 'Administrative support, office management, data entry and operations roles', '🏢', 5),
  ('Healthcare & Medical', 'healthcare-medical', 'Nursing, clinical, pharmacy, dental, caregiving and medical administration roles', '🏥', 6),
  ('Education & Training', 'education-training', 'Teaching, tutoring, training, academic administration and vocational instruction roles', '📚', 7),
  ('Engineering', 'engineering', 'Civil, mechanical, electrical, chemical, environmental and industrial engineering roles', '⚙️', 8),
  ('Construction & Skilled Trades', 'construction-skilled-trades', 'Masonry, carpentry, plumbing, electrical, welding, HVAC and construction management roles', '🔨', 9),
  ('Transport & Logistics', 'transport-logistics', 'Driving, logistics, warehousing, fleet management, supply chain and procurement roles', '🚛', 10),
  ('Hospitality, Food & Tourism', 'hospitality-food-tourism', 'Hotel, restaurant, catering, tourism, events and food service roles', '🍽️', 11),
  ('Retail & Merchandising', 'retail-merchandising', 'Store operations, cashier, merchandising, inventory and retail management roles', '🛒', 12),
  ('Security & Safety', 'security-safety', 'Security operations, occupational health & safety, loss prevention and fire safety roles', '🛡️', 13),
  ('Agriculture & Agribusiness', 'agriculture-agribusiness', 'Farming, livestock, agronomy, veterinary, greenhouse and agricultural sales roles', '🌾', 14),
  ('Manufacturing & Production', 'manufacturing-production', 'Factory operations, production, quality control, packaging and maintenance roles', '🏭', 15),
  ('Legal & Compliance', 'legal-compliance', 'Law, paralegal, compliance, contracts and corporate governance roles', '⚖️', 16),
  ('Human Resources', 'human-resources', 'HR administration, recruitment, talent management, payroll and employee relations roles', '👥', 17),
  ('Creative, Media & Design', 'creative-media-design', 'Graphic design, video, photography, content creation, journalism and creative direction roles', '🎨', 18),
  ('Beauty, Fashion & Personal Care', 'beauty-fashion-personal-care', 'Hairdressing, beauty therapy, makeup, nail technician, tailoring and spa roles', '💅', 19),
  ('Domestic, Care & Personal Services', 'domestic-care-personal', 'Nanny, housekeeper, caregiver, domestic worker, gardener and childcare roles', '🏠', 20)
ON CONFLICT (slug) DO NOTHING;

-- Sales, Marketing & BD
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'sales-marketing-bd';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Sales', 'sales', 1), (cat_id, 'Marketing', 'marketing', 2),
    (cat_id, 'Business Development', 'business-development', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'sales' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Sales Representative', 'sales-representative', 1), (fam_id, 'Sales Executive', 'sales-executive', 2),
    (fam_id, 'Account Manager', 'account-manager', 3), (fam_id, 'Sales Manager', 'sales-manager', 4),
    (fam_id, 'Retail Salesperson', 'retail-salesperson', 5), (fam_id, 'Telesales Agent', 'telesales-agent', 6),
    (fam_id, 'Field Sales Agent', 'field-sales-agent', 7), (fam_id, 'Merchandiser', 'merchandiser', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'marketing' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Marketing Officer', 'marketing-officer', 1), (fam_id, 'Digital Marketer', 'digital-marketer', 2),
    (fam_id, 'Social Media Manager', 'social-media-manager', 3), (fam_id, 'SEO Specialist', 'seo-specialist', 4),
    (fam_id, 'Content Marketer', 'content-marketer', 5), (fam_id, 'Brand Manager', 'brand-manager', 6),
    (fam_id, 'Customer Acquisition Officer', 'customer-acquisition-officer', 7)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'business-development' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Business Development Officer', 'business-development-officer', 1),
    (fam_id, 'Business Development Manager', 'business-development-manager', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Customer Service & Call Centre
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'customer-service-call-centre';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Customer Service', 'customer-service', 1),
    (cat_id, 'Call Centre Operations', 'call-centre-operations', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'customer-service' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Customer Service Representative', 'customer-service-representative', 1),
    (fam_id, 'Customer Support Agent', 'customer-support-agent', 2),
    (fam_id, 'Customer Success Officer', 'customer-success-officer', 3),
    (fam_id, 'Receptionist', 'receptionist', 4),
    (fam_id, 'Front Desk Officer', 'front-desk-officer', 5),
    (fam_id, 'Client Relations Officer', 'client-relations-officer', 6)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'call-centre-operations' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Call Centre Agent', 'call-centre-agent', 1),
    (fam_id, 'Contact Centre Agent', 'contact-centre-agent', 2),
    (fam_id, 'Help Desk Agent', 'help-desk-agent', 3),
    (fam_id, 'Technical Support Agent', 'technical-support-agent-cs', 4)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Administration & Office
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'administration-office';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Administrative Support', 'administrative-support', 1),
    (cat_id, 'Office Management', 'office-management', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'administrative-support' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Administrative Assistant', 'administrative-assistant', 1), (fam_id, 'Executive Assistant', 'executive-assistant', 2),
    (fam_id, 'Personal Assistant', 'personal-assistant', 3), (fam_id, 'Data Entry Clerk', 'data-entry-clerk', 4),
    (fam_id, 'Secretary', 'secretary', 5), (fam_id, 'Records Officer', 'records-officer', 6),
    (fam_id, 'Documentation Officer', 'documentation-officer', 7), (fam_id, 'Filing Clerk', 'filing-clerk', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'office-management' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Office Administrator', 'office-administrator', 1), (fam_id, 'Office Manager', 'office-manager', 2),
    (fam_id, 'Operations Assistant', 'operations-assistant', 3), (fam_id, 'Operations Manager', 'operations-manager', 4)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Healthcare & Medical
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'healthcare-medical';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Clinical & Medical', 'clinical-medical', 1), (cat_id, 'Nursing & Caregiving', 'nursing-caregiving', 2),
    (cat_id, 'Pharmacy & Laboratory', 'pharmacy-laboratory', 3), (cat_id, 'Medical Administration', 'medical-administration', 4)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'clinical-medical' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Clinical Officer', 'clinical-officer', 1), (fam_id, 'Medical Officer', 'medical-officer', 2),
    (fam_id, 'Doctor', 'doctor', 3), (fam_id, 'Dentist', 'dentist', 4),
    (fam_id, 'Dental Assistant', 'dental-assistant', 5), (fam_id, 'Radiographer', 'radiographer', 6),
    (fam_id, 'Physiotherapist', 'physiotherapist', 7), (fam_id, 'Nutritionist', 'nutritionist', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'nursing-caregiving' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Nurse', 'nurse', 1), (fam_id, 'Caregiver', 'caregiver', 2),
    (fam_id, 'Community Health Worker', 'community-health-worker', 3), (fam_id, 'Health Assistant', 'health-assistant', 4)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'pharmacy-laboratory' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Pharmacist', 'pharmacist', 1), (fam_id, 'Pharmacy Technician', 'pharmacy-technician', 2),
    (fam_id, 'Laboratory Technician', 'laboratory-technician', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'medical-administration' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Medical Records Officer', 'medical-records-officer', 1),
    (fam_id, 'Hospital Administrator', 'hospital-administrator', 2),
    (fam_id, 'Medical Receptionist', 'medical-receptionist', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Education & Training
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'education-training';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Teaching', 'teaching', 1), (cat_id, 'Training & Development', 'training-development', 2),
    (cat_id, 'Academic Administration', 'academic-administration', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'teaching' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Primary Teacher', 'primary-teacher', 1), (fam_id, 'Secondary Teacher', 'secondary-teacher', 2),
    (fam_id, 'Lecturer', 'lecturer', 3), (fam_id, 'University Professor', 'university-professor', 4),
    (fam_id, 'Tutor', 'tutor', 5), (fam_id, 'Online Tutor', 'online-tutor', 6),
    (fam_id, 'Teaching Assistant', 'teaching-assistant', 7), (fam_id, 'Special Needs Teacher', 'special-needs-teacher', 8),
    (fam_id, 'Early Childhood Teacher', 'early-childhood-teacher', 9)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'training-development' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Trainer', 'trainer', 1), (fam_id, 'Vocational Instructor', 'vocational-instructor', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'academic-administration' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'School Administrator', 'school-administrator', 1), (fam_id, 'Academic Counsellor', 'academic-counsellor', 2),
    (fam_id, 'Education Coordinator', 'education-coordinator', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Engineering
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'engineering';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Civil & Structural', 'civil-structural', 1), (cat_id, 'Mechanical & Industrial', 'mechanical-industrial', 2),
    (cat_id, 'Electrical & Electronics', 'electrical-electronics', 3), (cat_id, 'Other Engineering', 'other-engineering', 4)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'civil-structural' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Civil Engineer', 'civil-engineer', 1), (fam_id, 'Structural Engineer', 'structural-engineer', 2),
    (fam_id, 'Site Engineer', 'site-engineer', 3), (fam_id, 'Project Engineer', 'project-engineer', 4)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'mechanical-industrial' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Mechanical Engineer', 'mechanical-engineer', 1), (fam_id, 'Industrial Engineer', 'industrial-engineer', 2),
    (fam_id, 'Automotive Engineer', 'automotive-engineer', 3), (fam_id, 'Maintenance Engineer', 'maintenance-engineer', 4),
    (fam_id, 'Engineering Technician', 'engineering-technician', 5)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'electrical-electronics' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Electrical Engineer', 'electrical-engineer', 1), (fam_id, 'Electronics Engineer', 'electronics-engineer', 2),
    (fam_id, 'Telecommunications Engineer', 'telecommunications-engineer', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'other-engineering' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Chemical Engineer', 'chemical-engineer', 1), (fam_id, 'Environmental Engineer', 'environmental-engineer', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Construction & Skilled Trades
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'construction-skilled-trades';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Building Trades', 'building-trades', 1), (cat_id, 'Mechanical Trades', 'mechanical-trades', 2),
    (cat_id, 'Construction Management', 'construction-management', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'building-trades' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Mason', 'mason', 1), (fam_id, 'Carpenter', 'carpenter', 2), (fam_id, 'Plumber', 'plumber', 3),
    (fam_id, 'Electrician', 'electrician', 4), (fam_id, 'Welder', 'welder', 5), (fam_id, 'Painter', 'painter', 6),
    (fam_id, 'Tiler', 'tiler', 7), (fam_id, 'Roofer', 'roofer', 8), (fam_id, 'Steel Fixer', 'steel-fixer', 9),
    (fam_id, 'Bricklayer', 'bricklayer', 10), (fam_id, 'Construction Worker', 'construction-worker', 11)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'mechanical-trades' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'HVAC Technician', 'hvac-technician', 1), (fam_id, 'Refrigeration Technician', 'refrigeration-technician', 2),
    (fam_id, 'Auto Mechanic', 'auto-mechanic', 3), (fam_id, 'Machine Operator', 'machine-operator', 4),
    (fam_id, 'Heavy Equipment Operator', 'heavy-equipment-operator', 5)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'construction-management' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Site Supervisor', 'site-supervisor', 1), (fam_id, 'Foreman', 'foreman', 2),
    (fam_id, 'Quantity Surveyor', 'quantity-surveyor', 3), (fam_id, 'Surveyor', 'surveyor', 4),
    (fam_id, 'Construction Manager', 'construction-manager', 5)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Transport & Logistics
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'transport-logistics';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Driving & Delivery', 'driving-delivery', 1), (cat_id, 'Logistics & Warehousing', 'logistics-warehousing', 2),
    (cat_id, 'Supply Chain & Procurement', 'supply-chain-procurement', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'driving-delivery' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Driver', 'driver', 1), (fam_id, 'Truck Driver', 'truck-driver', 2),
    (fam_id, 'Bus Driver', 'bus-driver', 3), (fam_id, 'Delivery Driver', 'delivery-driver', 4),
    (fam_id, 'Motorcycle Rider', 'motorcycle-rider', 5), (fam_id, 'Courier', 'courier', 6)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'logistics-warehousing' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Logistics Officer', 'logistics-officer', 1), (fam_id, 'Logistics Manager', 'logistics-manager', 2),
    (fam_id, 'Fleet Manager', 'fleet-manager', 3), (fam_id, 'Warehouse Officer', 'warehouse-officer', 4),
    (fam_id, 'Warehouse Supervisor', 'warehouse-supervisor', 5), (fam_id, 'Forklift Operator', 'forklift-operator', 6),
    (fam_id, 'Dispatcher', 'dispatcher', 7), (fam_id, 'Inventory Clerk', 'inventory-clerk', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'supply-chain-procurement' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Supply Chain Officer', 'supply-chain-officer', 1), (fam_id, 'Procurement Officer', 'procurement-officer', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Hospitality, Food & Tourism
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'hospitality-food-tourism';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Food & Beverage', 'food-beverage', 1), (cat_id, 'Hotels & Accommodation', 'hotels-accommodation', 2),
    (cat_id, 'Tourism & Events', 'tourism-events', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'food-beverage' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Chef', 'chef', 1), (fam_id, 'Sous Chef', 'sous-chef', 2), (fam_id, 'Cook', 'cook', 3),
    (fam_id, 'Waiter/Waitress', 'waiter-waitress', 4), (fam_id, 'Bartender', 'bartender', 5),
    (fam_id, 'Kitchen Assistant', 'kitchen-assistant', 6), (fam_id, 'Baker', 'baker', 7),
    (fam_id, 'Pastry Chef', 'pastry-chef', 8), (fam_id, 'Restaurant Manager', 'restaurant-manager', 9),
    (fam_id, 'Catering Assistant', 'catering-assistant', 10)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'hotels-accommodation' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Hotel Receptionist', 'hotel-receptionist', 1), (fam_id, 'Housekeeper', 'housekeeper', 2),
    (fam_id, 'Hotel Manager', 'hotel-manager', 3), (fam_id, 'Concierge', 'concierge', 4), (fam_id, 'Steward', 'steward', 5)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'tourism-events' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Tour Guide', 'tour-guide', 1), (fam_id, 'Travel Consultant', 'travel-consultant', 2),
    (fam_id, 'Event Coordinator', 'event-coordinator', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Retail & Merchandising
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'retail-merchandising';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Store Operations', 'store-operations', 1), (cat_id, 'Retail Management', 'retail-management', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'store-operations' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Cashier', 'cashier-retail', 1), (fam_id, 'Shop Attendant', 'shop-attendant', 2),
    (fam_id, 'Storekeeper', 'storekeeper', 3), (fam_id, 'Retail Assistant', 'retail-assistant', 4),
    (fam_id, 'Sales Associate', 'sales-associate', 5), (fam_id, 'Merchandiser', 'merchandiser-retail', 6),
    (fam_id, 'Inventory Clerk', 'inventory-clerk-retail', 7), (fam_id, 'Stock Controller', 'stock-controller', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'retail-management' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Store Manager', 'store-manager', 1), (fam_id, 'Supermarket Supervisor', 'supermarket-supervisor', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Security & Safety
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'security-safety';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Security Operations', 'security-operations', 1), (cat_id, 'Occupational Safety', 'occupational-safety', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'security-operations' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Security Guard', 'security-guard', 1), (fam_id, 'Security Officer', 'security-officer', 2),
    (fam_id, 'CCTV Operator', 'cctv-operator', 3), (fam_id, 'Security Supervisor', 'security-supervisor', 4),
    (fam_id, 'Security Manager', 'security-manager', 5), (fam_id, 'Loss Prevention Officer', 'loss-prevention-officer', 6)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'occupational-safety' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Safety Officer', 'safety-officer', 1), (fam_id, 'Occupational Health & Safety Officer', 'ohs-officer', 2),
    (fam_id, 'Fire Safety Officer', 'fire-safety-officer', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Agriculture & Agribusiness
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'agriculture-agribusiness';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Farming & Field Work', 'farming-field-work', 1), (cat_id, 'Agricultural Services', 'agricultural-services', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'farming-field-work' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Farm Worker', 'farm-worker', 1), (fam_id, 'Farm Manager', 'farm-manager', 2),
    (fam_id, 'Dairy Worker', 'dairy-worker', 3), (fam_id, 'Poultry Worker', 'poultry-worker', 4),
    (fam_id, 'Greenhouse Worker', 'greenhouse-worker', 5), (fam_id, 'Animal Care Worker', 'animal-care-worker', 6),
    (fam_id, 'Agricultural Machine Operator', 'agricultural-machine-operator', 7)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'agricultural-services' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Agricultural Officer', 'agricultural-officer', 1), (fam_id, 'Agronomist', 'agronomist', 2),
    (fam_id, 'Veterinary Assistant', 'veterinary-assistant', 3), (fam_id, 'Irrigation Technician', 'irrigation-technician', 4),
    (fam_id, 'Agricultural Technician', 'agricultural-technician', 5),
    (fam_id, 'Agricultural Sales Representative', 'agricultural-sales-representative', 6),
    (fam_id, 'Agricultural Extension Officer', 'agricultural-extension-officer', 7)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Manufacturing & Production
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'manufacturing-production';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Production & Assembly', 'production-assembly', 1), (cat_id, 'Quality & Maintenance', 'quality-maintenance', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'production-assembly' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Production Worker', 'production-worker', 1), (fam_id, 'Machine Operator', 'machine-operator-mfg', 2),
    (fam_id, 'Production Supervisor', 'production-supervisor', 3), (fam_id, 'Factory Worker', 'factory-worker', 4),
    (fam_id, 'Packaging Operator', 'packaging-operator', 5), (fam_id, 'Assembly Worker', 'assembly-worker', 6),
    (fam_id, 'Warehouse Operator', 'warehouse-operator', 7), (fam_id, 'Production Manager', 'production-manager', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'quality-maintenance' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Quality Control Officer', 'quality-control-officer', 1),
    (fam_id, 'Quality Assurance Officer', 'quality-assurance-officer', 2),
    (fam_id, 'Maintenance Technician', 'maintenance-technician', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Legal & Compliance
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'legal-compliance';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Legal', 'legal', 1), (cat_id, 'Compliance & Risk', 'compliance-risk', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'legal' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Lawyer', 'lawyer', 1), (fam_id, 'Legal Assistant', 'legal-assistant', 2),
    (fam_id, 'Paralegal', 'paralegal', 3), (fam_id, 'Legal Secretary', 'legal-secretary', 4),
    (fam_id, 'Contract Administrator', 'contract-administrator', 5), (fam_id, 'Legal Researcher', 'legal-researcher', 6),
    (fam_id, 'Company Secretary', 'company-secretary', 7)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'compliance-risk' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Compliance Officer', 'compliance-officer', 1), (fam_id, 'Compliance Analyst', 'compliance-analyst', 2),
    (fam_id, 'Risk & Compliance Manager', 'risk-compliance-manager', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Human Resources
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'human-resources';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'HR Operations', 'hr-operations', 1), (cat_id, 'Talent Management', 'talent-management', 2)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'hr-operations' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'HR Assistant', 'hr-assistant', 1), (fam_id, 'HR Officer', 'hr-officer', 2),
    (fam_id, 'HR Manager', 'hr-manager', 3), (fam_id, 'Payroll Officer', 'payroll-officer-hr', 4),
    (fam_id, 'Training Officer', 'training-officer', 5), (fam_id, 'Employee Relations Officer', 'employee-relations-officer', 6),
    (fam_id, 'HR Business Partner', 'hr-business-partner', 7)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'talent-management' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Recruitment Officer', 'recruitment-officer', 1),
    (fam_id, 'Talent Acquisition Specialist', 'talent-acquisition-specialist', 2),
    (fam_id, 'Talent Manager', 'talent-manager', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Creative, Media & Design
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'creative-media-design';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Visual Design', 'visual-design', 1), (cat_id, 'Content & Media', 'content-media', 2),
    (cat_id, 'Creative Direction', 'creative-direction', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'visual-design' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Graphic Designer', 'graphic-designer', 1), (fam_id, 'UI/UX Designer', 'ui-ux-designer-creative', 2),
    (fam_id, 'Animator', 'animator', 3), (fam_id, 'Illustrator', 'illustrator', 4),
    (fam_id, 'Motion Graphics Designer', 'motion-graphics-designer', 5)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'content-media' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Video Editor', 'video-editor', 1), (fam_id, 'Photographer', 'photographer', 2),
    (fam_id, 'Videographer', 'videographer', 3), (fam_id, 'Copywriter', 'copywriter', 4),
    (fam_id, 'Content Creator', 'content-creator', 5), (fam_id, 'Social Media Creator', 'social-media-creator', 6),
    (fam_id, 'Journalist', 'journalist', 7), (fam_id, 'Music Producer', 'music-producer', 8)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'creative-direction' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Art Director', 'art-director', 1), (fam_id, 'Creative Director', 'creative-director', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Beauty, Fashion & Personal Care
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'beauty-fashion-personal-care';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Hair & Beauty', 'hair-beauty', 1), (cat_id, 'Fashion', 'fashion', 2),
    (cat_id, 'Wellness & Spa', 'wellness-spa', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'hair-beauty' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Barber', 'barber', 1), (fam_id, 'Hairdresser', 'hairdresser', 2),
    (fam_id, 'Hairstylist', 'hairstylist', 3), (fam_id, 'Makeup Artist', 'makeup-artist', 4),
    (fam_id, 'Nail Technician', 'nail-technician', 5), (fam_id, 'Beautician', 'beautician', 6)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'fashion' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Tailor', 'tailor', 1), (fam_id, 'Fashion Designer', 'fashion-designer', 2),
    (fam_id, 'Fashion Assistant', 'fashion-assistant', 3)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'wellness-spa' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Massage Therapist', 'massage-therapist', 1), (fam_id, 'Spa Therapist', 'spa-therapist', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- Domestic, Care & Personal Services
DO $$ DECLARE cat_id UUID; fam_id UUID;
BEGIN
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'domestic-care-personal';
  INSERT INTO job_families (category_id, name, slug, sort_order) VALUES
    (cat_id, 'Childcare', 'childcare', 1), (cat_id, 'Domestic Work', 'domestic-work', 2),
    (cat_id, 'Elderly & Care', 'elderly-care', 3)
  ON CONFLICT (category_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'childcare' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Nanny', 'nanny', 1), (fam_id, 'Childcare Worker', 'childcare-worker', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'domestic-work' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Housekeeper', 'housekeeper-domestic', 1), (fam_id, 'Cleaner', 'cleaner', 2),
    (fam_id, 'Domestic Worker', 'domestic-worker', 3), (fam_id, 'Gardener', 'gardener', 4),
    (fam_id, 'Personal Assistant', 'personal-assistant-domestic', 5)
  ON CONFLICT (family_id, slug) DO NOTHING;

  SELECT id INTO fam_id FROM job_families WHERE slug = 'elderly-care' AND category_id = cat_id;
  INSERT INTO job_roles (family_id, name, slug, sort_order) VALUES
    (fam_id, 'Caregiver', 'caregiver-domestic', 1), (fam_id, 'Elderly Care Worker', 'elderly-care-worker', 2)
  ON CONFLICT (family_id, slug) DO NOTHING;
END $$;

-- ============================================================
-- SEED — Sample Application Questions (§8)
-- ============================================================

DO $$ DECLARE cat_id UUID;
BEGIN
  -- Transport questions
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'transport-logistics';
  IF cat_id IS NOT NULL THEN
    INSERT INTO application_questions (question, type, required, category_id, options, sort_order) VALUES
      ('What driving license category do you hold?', 'single_select', TRUE, cat_id, '["A", "B", "C", "CE", "D", "DE"]'::jsonb, 1),
      ('How many years of driving experience do you have?', 'number', TRUE, cat_id, '[]'::jsonb, 2),
      ('What types of vehicles have you driven professionally?', 'multi_select', FALSE, cat_id, '["Car/Sedan", "Van", "Truck", "Bus", "Motorcycle", "Heavy Equipment"]'::jsonb, 3),
      ('Do you have commercial driving experience?', 'boolean', FALSE, cat_id, '[]'::jsonb, 4),
      ('Are you available for long-distance travel?', 'boolean', FALSE, cat_id, '[]'::jsonb, 5)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Construction questions
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'construction-skilled-trades';
  IF cat_id IS NOT NULL THEN
    INSERT INTO application_questions (question, type, required, category_id, sort_order) VALUES
      ('How many years of experience do you have in your trade?', 'number', TRUE, cat_id, 1),
      ('What is your primary trade specialization?', 'text', TRUE, cat_id, 2),
      ('Do you hold any relevant trade certifications?', 'boolean', FALSE, cat_id, 3),
      ('Do you have safety training certification?', 'boolean', FALSE, cat_id, 4),
      ('Are you willing to travel to project sites?', 'boolean', FALSE, cat_id, 5),
      ('What tools and equipment are you experienced with?', 'textarea', FALSE, cat_id, 6)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Healthcare questions
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'healthcare-medical';
  IF cat_id IS NOT NULL THEN
    INSERT INTO application_questions (question, type, required, category_id, sort_order) VALUES
      ('Do you have a valid professional registration?', 'boolean', TRUE, cat_id, 1),
      ('What is your registration/license number?', 'text', FALSE, cat_id, 2),
      ('What is your area of specialization?', 'text', FALSE, cat_id, 3),
      ('When does your professional license expire?', 'date', FALSE, cat_id, 4),
      ('How many years of clinical experience do you have?', 'number', TRUE, cat_id, 5)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Finance questions
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'finance-accounting-banking';
  IF cat_id IS NOT NULL THEN
    INSERT INTO application_questions (question, type, required, category_id, options, sort_order) VALUES
      ('How many years of accounting/finance experience do you have?', 'number', TRUE, cat_id, '[]'::jsonb, 1),
      ('What accounting software are you proficient in?', 'multi_select', FALSE, cat_id, '["QuickBooks", "Sage", "SAP", "Xero", "Tally", "Microsoft Dynamics", "Oracle Financials"]'::jsonb, 2),
      ('Do you hold CPA, ACCA, or equivalent certification?', 'boolean', FALSE, cat_id, '[]'::jsonb, 3),
      ('Do you have audit experience?', 'boolean', FALSE, cat_id, '[]'::jsonb, 4),
      ('What areas of finance/accounting have you worked in?', 'multi_select', FALSE, cat_id, '["General Accounting", "Tax", "Audit", "Payroll", "Accounts Payable", "Accounts Receivable", "Financial Analysis", "Budgeting"]'::jsonb, 5)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Technology questions
  SELECT id INTO cat_id FROM job_categories WHERE slug = 'technology-it';
  IF cat_id IS NOT NULL THEN
    INSERT INTO application_questions (question, type, required, category_id, options, sort_order) VALUES
      ('How many years of professional development experience do you have?', 'number', TRUE, cat_id, '[]'::jsonb, 1),
      ('What programming languages are you proficient in?', 'multi_select', FALSE, cat_id, '["JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "C++"]'::jsonb, 2),
      ('Do you have a portfolio or GitHub profile?', 'text', FALSE, cat_id, '[]'::jsonb, 3),
      ('Are you comfortable working in an agile environment?', 'boolean', FALSE, cat_id, '[]'::jsonb, 4),
      ('What is your preferred development area?', 'single_select', FALSE, cat_id, '["Frontend", "Backend", "Full-Stack", "Mobile", "DevOps", "Data Engineering", "Machine Learning", "Security"]'::jsonb, 5)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


-- ============================================================================
-- MIGRATION: 019_career_support.sql
-- ============================================================================

-- ============================================================
-- Kaziin — Career Support & Funding Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Implements Kaziin_Career_Support_Funding_Skill.md §20, §35
--
-- SAFE MIGRATION:
--   - Purely additive (CREATE TABLE IF NOT EXISTS)
--   - No DROP TABLE, no DROP COLUMN, no existing table changes
--   - All FKs reference existing tables (profiles)
--   - Full RLS on all new tables
-- ============================================================

-- ── Career Assessments (§35 MVP Phase 3) ─────────────────────
-- Stores each career assessment taken by a candidate.
-- Multiple assessments allowed; career_plans references the latest.

CREATE TABLE IF NOT EXISTS career_assessments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employment_status TEXT NOT NULL,
  education_level   TEXT NOT NULL,
  career_goal       TEXT NOT NULL,
  experience_area   TEXT NOT NULL,
  location          TEXT,
  work_preferences  TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE career_assessments IS
  'Stores candidate career assessments. One candidate may have many assessments over time.';

-- ── Career Plans (§9, §35) ────────────────────────────────────
-- One active plan per candidate. Upsert on candidate_id.
-- Linked to the latest assessment via latest_assessment_id.

CREATE TABLE IF NOT EXISTS career_plans (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  career_goal           TEXT,
  employment_status     TEXT,
  education_level       TEXT,
  experience_area       TEXT,
  location              TEXT,
  work_preferences      TEXT[] DEFAULT '{}',
  -- Optional enrichment fields (populated over time)
  target_role           TEXT,
  target_salary_min     INTEGER,
  target_salary_max     INTEGER,
  target_timeline_weeks INTEGER,
  notes                 TEXT,
  -- Lifecycle
  status                TEXT NOT NULL DEFAULT 'active',  -- active | archived | completed
  latest_assessment_id  UUID REFERENCES career_assessments(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id)  -- one active plan per candidate (upsert target)
);

COMMENT ON TABLE career_plans IS
  'Persistent career plan per candidate. Upserted on each new assessment.';

-- ── Career Plan Milestones (§9) ───────────────────────────────
-- Optional milestones within a career plan.

CREATE TABLE IF NOT EXISTS career_plan_milestones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id       UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  sort_order    INTEGER DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'upcoming',  -- upcoming | in_progress | complete | skipped
  due_date      DATE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE career_plan_milestones IS
  'Milestones within a candidate career plan. Status-tracked and ordered.';

-- ── Career Goals (§9, §20) ────────────────────────────────────
-- Structured, normalised goal record (optional richer layer on top of career_plans).
-- career_plans.career_goal stores the type key;
-- this table stores enriched goal detail when needed.

CREATE TABLE IF NOT EXISTS career_goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type      TEXT NOT NULL,  -- matches career_goal enum used in assessments
  target_role    TEXT,
  target_country TEXT,
  target_salary  INTEGER,
  timeline_weeks INTEGER,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'active',  -- active | achieved | abandoned
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE career_goals IS
  'Structured career goal detail. Optional enrichment on top of the career_plans goal_type.';

-- ── RLS ────────────────────────────────────────────────────────

ALTER TABLE career_assessments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals          ENABLE ROW LEVEL SECURITY;

-- career_assessments
DROP POLICY IF EXISTS "Candidates manage own assessments" ON career_assessments;
CREATE POLICY "Candidates manage own assessments"
  ON career_assessments FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read career assessments" ON career_assessments;
CREATE POLICY "Admins read career assessments"
  ON career_assessments FOR SELECT
  USING (public.is_admin());

-- career_plans
DROP POLICY IF EXISTS "Candidates manage own career plan" ON career_plans;
CREATE POLICY "Candidates manage own career plan"
  ON career_plans FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read career plans" ON career_plans;
CREATE POLICY "Admins read career plans"
  ON career_plans FOR SELECT
  USING (public.is_admin());

-- career_plan_milestones
DROP POLICY IF EXISTS "Candidates manage own milestones" ON career_plan_milestones;
CREATE POLICY "Candidates manage own milestones"
  ON career_plan_milestones FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read milestones" ON career_plan_milestones;
CREATE POLICY "Admins read milestones"
  ON career_plan_milestones FOR SELECT
  USING (public.is_admin());

-- career_goals
DROP POLICY IF EXISTS "Candidates manage own career goals" ON career_goals;
CREATE POLICY "Candidates manage own career goals"
  ON career_goals FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins read career goals" ON career_goals;
CREATE POLICY "Admins read career goals"
  ON career_goals FOR SELECT
  USING (public.is_admin());

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_career_assessments_candidate
  ON career_assessments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_career_assessments_created
  ON career_assessments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_plans_candidate
  ON career_plans (candidate_id);
CREATE INDEX IF NOT EXISTS idx_career_plans_status
  ON career_plans (status);

CREATE INDEX IF NOT EXISTS idx_career_plan_milestones_plan
  ON career_plan_milestones (plan_id);
CREATE INDEX IF NOT EXISTS idx_career_plan_milestones_candidate
  ON career_plan_milestones (candidate_id);

CREATE INDEX IF NOT EXISTS idx_career_goals_candidate
  ON career_goals (candidate_id);

-- ── Updated_at trigger ────────────────────────────────────────
-- Reuse the existing moddatetime extension if available.
-- If the trigger function does not exist, this is safe to skip.

DO $$
BEGIN
  -- career_plans
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_career_plans'
  ) THEN
    BEGIN
      CREATE TRIGGER set_updated_at_career_plans
        BEFORE UPDATE ON career_plans
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    EXCEPTION WHEN OTHERS THEN
      -- moddatetime not available; updated_at managed by application
      NULL;
    END;
  END IF;

  -- career_plan_milestones
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_career_plan_milestones'
  ) THEN
    BEGIN
      CREATE TRIGGER set_updated_at_career_plan_milestones
        BEFORE UPDATE ON career_plan_milestones
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- career_goals
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_career_goals'
  ) THEN
    BEGIN
      CREATE TRIGGER set_updated_at_career_goals
        BEFORE UPDATE ON career_goals
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================================
-- END OF MIGRATION
-- Tables created: career_assessments, career_plans,
--                 career_plan_milestones, career_goals
-- Existing tables modified: NONE
-- Data deleted: NONE
-- ============================================================


-- ============================================================================
-- MIGRATION: 020_training_marketplace.sql
-- ============================================================================

-- ============================================================
-- Kaziin — Training Marketplace Schema (Phase 5)
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Implements Kaziin_Career_Support_Funding_Skill.md §10, §15, §35
--
-- SAFE MIGRATION:
--   - Purely additive (CREATE TABLE IF NOT EXISTS)
--   - No DROP, no modification of existing tables
--   - RLS on all new tables
--   - FKs to profiles, career_plans (from career_support migration)
-- ============================================================

-- ── Training Providers ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_providers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  website          TEXT,
  country          TEXT,
  city             TEXT,
  contact_email    TEXT,
  logo_url         TEXT,
  verified         BOOLEAN NOT NULL DEFAULT FALSE,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_providers IS
  'Organizations that deliver training programs listed on Kaziin.';

-- ── Training Programs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_programs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id         UUID REFERENCES training_providers(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  mode                TEXT NOT NULL DEFAULT 'in_person',
    -- in_person | online | hybrid | self_paced
  location            TEXT,
  country             TEXT,
  duration_weeks      INTEGER,
  cost_amount         INTEGER,           -- in minor units or whole currency
  cost_currency       TEXT DEFAULT 'USD',
  cost_subsidised     BOOLEAN DEFAULT FALSE,
  certification       TEXT,              -- name of cert awarded on completion
  -- Career targeting
  industry            TEXT,
  career_stage        TEXT,              -- entry | mid | senior | any
  -- Entry requirements
  min_education_level TEXT,
  prerequisites       TEXT,
  -- Availability
  next_start_date     DATE,
  available_spaces    INTEGER,
  -- Lifecycle
  verified            BOOLEAN NOT NULL DEFAULT FALSE,
  active              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_programs IS
  'Training programs listed on Kaziin. Linked to providers, skills and career outcomes.';

-- ── Training Program Skills ─────────────────────────────────
-- Links a training program to the skills it delivers.
-- Critical relationship: COURSE → SKILLS → CAREER PATH → JOBS

CREATE TABLE IF NOT EXISTS training_program_skills (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id   UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  skill_name   TEXT NOT NULL,
  skill_level  TEXT DEFAULT 'intermediate',  -- beginner | intermediate | advanced | expert
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_program_skills IS
  'Skills acquired upon completing a training program. Powers skills-gap recommendations.';

-- ── Training Enrollments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id      UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  career_plan_id  UUID REFERENCES career_plans(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'enrolled',
    -- enrolled | in_progress | completed | withdrawn | failed
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id, program_id)
);

COMMENT ON TABLE training_enrollments IS
  'Candidate enrollment in a training program. Status-tracked from enrolled → completed.';

-- ── Training Credentials ─────────────────────────────────────
-- Uploaded/verified certificates after training completion.
-- Triggers Phase 7: credential → skills update → job re-matching.

CREATE TABLE IF NOT EXISTS training_credentials (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id    UUID REFERENCES training_enrollments(id) ON DELETE SET NULL,
  program_id       UUID REFERENCES training_programs(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,              -- name of the credential
  issuer           TEXT,                       -- issuing body
  issued_date      DATE,
  expiry_date      DATE,
  credential_url   TEXT,                       -- external verification URL
  document_path    TEXT,                       -- storage path for uploaded file
  verification_status TEXT NOT NULL DEFAULT 'unverified',
    -- unverified | pending_review | verified | rejected
  verified_at      TIMESTAMPTZ,
  verified_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  skills_applied   BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE once credential triggers a skills/profile update
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE training_credentials IS
  'Credentials earned by candidates. Drives the Phase 7 loop: credential → skills update → matching recalculation.';

-- ── RLS ──────────────────────────────────────────────────────

ALTER TABLE training_providers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_program_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_credentials    ENABLE ROW LEVEL SECURITY;

-- training_providers: public read, admin manage
DROP POLICY IF EXISTS "Anyone can read active providers" ON training_providers;
CREATE POLICY "Anyone can read active providers"
  ON training_providers FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Admins manage providers" ON training_providers;
CREATE POLICY "Admins manage providers"
  ON training_providers FOR ALL
  USING (public.is_admin());

-- training_programs: public read, admin manage
DROP POLICY IF EXISTS "Anyone can read active programs" ON training_programs;
CREATE POLICY "Anyone can read active programs"
  ON training_programs FOR SELECT
  USING (active = TRUE);

DROP POLICY IF EXISTS "Admins manage programs" ON training_programs;
CREATE POLICY "Admins manage programs"
  ON training_programs FOR ALL
  USING (public.is_admin());

-- training_program_skills: public read
DROP POLICY IF EXISTS "Anyone can read program skills" ON training_program_skills;
CREATE POLICY "Anyone can read program skills"
  ON training_program_skills FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins manage program skills" ON training_program_skills;
CREATE POLICY "Admins manage program skills"
  ON training_program_skills FOR ALL
  USING (public.is_admin());

-- training_enrollments: candidates own theirs, admins see all
DROP POLICY IF EXISTS "Candidates manage own enrollments" ON training_enrollments;
CREATE POLICY "Candidates manage own enrollments"
  ON training_enrollments FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins manage enrollments" ON training_enrollments;
CREATE POLICY "Admins manage enrollments"
  ON training_enrollments FOR ALL
  USING (public.is_admin());

-- training_credentials: candidates own theirs, admins can verify
DROP POLICY IF EXISTS "Candidates manage own credentials" ON training_credentials;
CREATE POLICY "Candidates manage own credentials"
  ON training_credentials FOR ALL
  USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Admins manage credentials" ON training_credentials;
CREATE POLICY "Admins manage credentials"
  ON training_credentials FOR ALL
  USING (public.is_admin());

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_training_programs_provider    ON training_programs (provider_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_active      ON training_programs (active);
CREATE INDEX IF NOT EXISTS idx_training_programs_industry    ON training_programs (industry);
CREATE INDEX IF NOT EXISTS idx_training_program_skills_prog  ON training_program_skills (program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_cand     ON training_enrollments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_prog     ON training_enrollments (program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_status   ON training_enrollments (status);
CREATE INDEX IF NOT EXISTS idx_training_credentials_cand     ON training_credentials (candidate_id);
CREATE INDEX IF NOT EXISTS idx_training_credentials_verified ON training_credentials (verification_status);

-- ============================================================
-- END OF MIGRATION
-- Tables created: training_providers, training_programs,
--                 training_program_skills, training_enrollments,
--                 training_credentials
-- Existing tables modified: NONE
-- ============================================================


