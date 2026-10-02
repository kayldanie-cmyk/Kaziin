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
