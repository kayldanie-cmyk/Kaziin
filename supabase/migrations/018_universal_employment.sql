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
