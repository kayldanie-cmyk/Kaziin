-- ============================================================
-- Kaziin — Demo Seed Data
-- Run AFTER 001_initial_schema.sql
-- Paste in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Employers ────────────────────────────────────────────────
INSERT INTO employers (id, name, industry, location, website, verified, verification_status, size, description)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Meridian Digital',    'Technology',        'London, UK',      'https://meridiandigital.io', TRUE,  'verified',    '201–500',  'A full-service digital product agency.'),
  ('a1000000-0000-0000-0000-000000000002', 'Fieldwork Analytics', 'Data & Analytics',  'Manchester, UK',  NULL,                         TRUE,  'verified',    '51–200',   'Specialising in data intelligence for retail.'),
  ('a1000000-0000-0000-0000-000000000003', 'Greenleaf Media',     'Marketing',         'Birmingham, UK',  NULL,                         FALSE, 'pending',     '11–50',    'Independent content and social media agency.'),
  ('a1000000-0000-0000-0000-000000000004', 'Cassius Finance',     'Financial Services','London, UK',      NULL,                         TRUE,  'verified',    '501–1000', 'Boutique investment and wealth management.'),
  ('a1000000-0000-0000-0000-000000000005', 'Broadmoor Health',    'Healthcare',        'Leeds, UK',       NULL,                         TRUE,  'verified',    '1001+',    'NHS-partnered healthcare technology provider.')
ON CONFLICT (id) DO NOTHING;

-- ── Jobs ─────────────────────────────────────────────────────
INSERT INTO jobs (
  id, slug, title, employer_id, location, work_arrangement, employment_type,
  salary_min, salary_max, salary_currency, salary_period,
  description, requirements, skills, experience_level, status, verified
)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'senior-frontend-engineer-meridian',
    'Senior Frontend Engineer',
    'a1000000-0000-0000-0000-000000000001',
    'London, UK', 'hybrid', 'full-time',
    65000, 85000, 'GBP', 'annual',
    'Build and own the component library for our flagship SaaS product. Work closely with design and product to ship high-quality, accessible UIs.',
    ARRAY['3+ years React experience', 'TypeScript', 'CSS architecture', 'Accessibility standards'],
    ARRAY['React', 'TypeScript', 'CSS', 'Next.js', 'Figma'],
    'Senior', 'published', TRUE
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'data-analyst-fieldwork',
    'Data Analyst',
    'a1000000-0000-0000-0000-000000000002',
    'Manchester, UK', 'remote', 'full-time',
    42000, 55000, 'GBP', 'annual',
    'Join our data intelligence team to build dashboards, run analysis, and turn raw retail data into strategic insights.',
    ARRAY['SQL proficiency', 'Python or R', 'Tableau or Power BI', '2+ years experience'],
    ARRAY['SQL', 'Python', 'Tableau', 'Excel', 'dbt'],
    'Mid-level', 'published', TRUE
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'social-media-manager-greenleaf',
    'Social Media Manager',
    'a1000000-0000-0000-0000-000000000003',
    'Birmingham, UK', 'onsite', 'full-time',
    28000, 36000, 'GBP', 'annual',
    'Own social channels for a portfolio of consumer brands. Create content calendars, manage communities, and report on performance.',
    ARRAY['2+ years social media management', 'Content creation', 'Analytics tools'],
    ARRAY['Instagram', 'TikTok', 'Canva', 'Meta Ads', 'Sprout Social'],
    'Junior', 'published', FALSE
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'compliance-associate-cassius',
    'Compliance Associate',
    'a1000000-0000-0000-0000-000000000004',
    'London, UK', 'hybrid', 'full-time',
    50000, 65000, 'GBP', 'annual',
    'Support the compliance function of a growing boutique investment firm. FCA regulatory knowledge essential.',
    ARRAY['FCA knowledge', 'AML/KYC experience', 'Strong written communication'],
    ARRAY['FCA Regulation', 'AML', 'KYC', 'Excel', 'CompliancePro'],
    'Mid-level', 'published', TRUE
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'clinical-data-coordinator-broadmoor',
    'Clinical Data Coordinator',
    'a1000000-0000-0000-0000-000000000005',
    'Leeds, UK', 'onsite', 'full-time',
    35000, 44000, 'GBP', 'annual',
    'Maintain and validate clinical datasets in support of our research and NHS partnership programmes.',
    ARRAY['Clinical data experience', 'GDPR compliance', 'Database management'],
    ARRAY['REDCap', 'SQL', 'Excel', 'GDPR', 'Clinical Coding'],
    'Mid-level', 'published', TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ── Users (Auth) ─────────────────────────────────────────────
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'candidate1@kaziin.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Alice Candidate", "role": "candidate"}', NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'candidate2@kaziin.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Bob Candidate", "role": "candidate"}', NOW(), NOW()),
  ('f1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'recruiter1@kaziin.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Rachel Recruiter", "role": "recruiter"}', NOW(), NOW()),
  ('a1000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin1@kaziin.com', crypt('password123', gen_salt('bf')), NOW(), '{"name": "Arthur Admin", "role": "admin"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Trigger creates profiles automatically. Update them with additional info.
UPDATE profiles SET 
  headline = 'Senior React Developer', 
  location = 'London, UK',
  skills = ARRAY['React', 'TypeScript', 'Node.js', 'Next.js'],
  readiness_score = 85,
  career_dna = '{"technical": 90, "leadership": 40, "communication": 75}'::jsonb
WHERE id = 'c1000000-0000-0000-0000-000000000001';

UPDATE profiles SET 
  headline = 'Data Analyst', 
  location = 'Manchester, UK',
  skills = ARRAY['SQL', 'Python', 'Tableau'],
  readiness_score = 65,
  career_dna = '{"technical": 80, "leadership": 30, "communication": 70}'::jsonb
WHERE id = 'c1000000-0000-0000-0000-000000000002';

UPDATE profiles SET
  employer_id = 'a1000000-0000-0000-0000-000000000001'
WHERE id = 'f1000000-0000-0000-0000-000000000001';

-- ── Applications ─────────────────────────────────────────────
INSERT INTO applications (id, job_id, candidate_id, status)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'interview'),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'screening')
ON CONFLICT (id) DO NOTHING;

-- ── Funding Programs ─────────────────────────────────────────
INSERT INTO funding_programs (id, provider, name, max_support, currency, eligible_expenses, active)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Kaziin Mobility Fund', 'EU Relocation Grant', 5000, 'EUR', ARRAY['Flights', 'Visa Fees', 'First Month Rent'], TRUE),
  ('e1000000-0000-0000-0000-000000000002', 'Global Tech Support', 'Tech Talent Relocation', 3000, 'USD', ARRAY['Flights', 'Equipment'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── Funding Applications ─────────────────────────────────────
INSERT INTO funding_applications (id, candidate_id, program_id, requested_amount, status)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 4500, 'assessment')
ON CONFLICT (id) DO NOTHING;

-- ── Skills Taxonomy ──────────────────────────────────────────
INSERT INTO skills (id, name, category) VALUES
  ('00000000-0000-0001-0000-000000000001', 'React', 'Frontend'),
  ('00000000-0000-0001-0000-000000000002', 'TypeScript', 'Languages'),
  ('00000000-0000-0001-0000-000000000003', 'Node.js', 'Backend'),
  ('00000000-0000-0001-0000-000000000004', 'Next.js', 'Frontend'),
  ('00000000-0000-0001-0000-000000000005', 'SQL', 'Data'),
  ('00000000-0000-0001-0000-000000000006', 'Python', 'Languages'),
  ('00000000-0000-0001-0000-000000000007', 'Tableau', 'Data'),
  ('00000000-0000-0001-0000-000000000008', 'CSS', 'Frontend'),
  ('00000000-0000-0001-0000-000000000009', 'Figma', 'Design'),
  ('00000000-0000-0001-0000-00000000010', 'Excel', 'Productivity')
ON CONFLICT (id) DO NOTHING;

-- ── Candidate Skills ─────────────────────────────────────────
INSERT INTO candidate_skills (candidate_id, skill_id, proficiency, years_experience)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000001', 'expert', 5),
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000002', 'advanced', 4),
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000003', 'intermediate', 3),
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000004', 'advanced', 3),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0001-0000-000000000005', 'advanced', 4),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0001-0000-000000000006', 'intermediate', 2),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0001-0000-000000000007', 'advanced', 3)
ON CONFLICT (candidate_id, skill_id) DO NOTHING;

-- ── Job Skills ───────────────────────────────────────────────
INSERT INTO job_skills (job_id, skill_id, importance, weight)
VALUES
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000001', 'required', 1.0),
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000002', 'required', 1.0),
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000008', 'required', 0.8),
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0001-0000-000000000004', 'preferred', 0.6),
  ('b1000000-0000-0000-0000-000000000002', '00000000-0000-0001-0000-000000000005', 'required', 1.0),
  ('b1000000-0000-0000-0000-000000000002', '00000000-0000-0001-0000-000000000006', 'required', 0.9),
  ('b1000000-0000-0000-0000-000000000002', '00000000-0000-0001-0000-000000000007', 'preferred', 0.7)
ON CONFLICT (job_id, skill_id) DO NOTHING;

-- ── Matches ──────────────────────────────────────────────────
INSERT INTO matches (id, candidate_id, job_id, eligible, score, match_label, score_components) VALUES
  ('00000000-0001-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', TRUE, 88.5, 'strong', '{"skills": 92, "experience": 85, "location": 90}'::jsonb),
  ('00000000-0001-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', TRUE, 76.2, 'good', '{"skills": 80, "experience": 72, "location": 78}'::jsonb)
ON CONFLICT (candidate_id, job_id) DO NOTHING;

-- ── Conversations ────────────────────────────────────────────
INSERT INTO conversations (id, subject, job_id, updated_at) VALUES
  ('00000000-0002-0000-0000-000000000001', 'Re: Senior Frontend Engineer application', 'b1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  ('00000000-0002-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001'),
  ('00000000-0002-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
  ('00000000-0002-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Hi Alice, thanks for applying to the Senior Frontend Engineer role at Meridian Digital. Your profile looks strong — I would love to schedule a quick intro call. Are you available this week?', NOW() - INTERVAL '2 hours'),
  ('00000000-0002-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Hi Rachel, thank you! Yes, I am available Wednesday or Thursday afternoon. Would either of those work?', NOW() - INTERVAL '1 hour 45 minutes'),
  ('00000000-0002-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'Wednesday at 2pm works perfectly. I will send a calendar invite shortly. Looking forward to it!', NOW() - INTERVAL '1 hour 30 minutes');

-- ── Notifications ────────────────────────────────────────────
INSERT INTO notifications (recipient_id, type, title, message, read, action_url, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'application_update', 'Application moved to Interview', 'Your application for Senior Frontend Engineer at Meridian Digital has been moved to the interview stage.', FALSE, '/dashboard/applications', NOW() - INTERVAL '3 hours'),
  ('c1000000-0000-0000-0000-000000000001', 'message_received', 'New message from Rachel Recruiter', 'Rachel sent you a message about the Senior Frontend Engineer role.', FALSE, '/dashboard/messages', NOW() - INTERVAL '2 hours'),
  ('c1000000-0000-0000-0000-000000000001', 'match_found', 'New match: Data Analyst at Fieldwork', 'You matched 76% with the Data Analyst role at Fieldwork Analytics.', TRUE, '/dashboard/jobs/data-analyst-fieldwork', NOW() - INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000001', 'application_update', 'New application received', 'Bob Candidate applied to the Senior Frontend Engineer role.', FALSE, '/hire/shortlists', NOW() - INTERVAL '5 hours'),
  ('f1000000-0000-0000-0000-000000000001', 'verification_update', 'Employer verification approved', 'Meridian Digital has been verified as a legitimate employer.', TRUE, '/hire', NOW() - INTERVAL '2 days');

-- ── Verifications ────────────────────────────────────────────
INSERT INTO verifications (entity_id, entity_type, verification_type, status) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'employer', 'company', 'verified'),
  ('a1000000-0000-0000-0000-000000000001', 'employer', 'recruiter', 'verified'),
  ('c1000000-0000-0000-0000-000000000001', 'candidate', 'email', 'verified'),
  ('c1000000-0000-0000-0000-000000000001', 'candidate', 'identity', 'pending')
ON CONFLICT (entity_id, verification_type) DO NOTHING;

-- ── Feature Flags ────────────────────────────────────────────
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('messaging', TRUE, 'Enable in-app messaging between candidates and recruiters'),
  ('ai_matching', TRUE, 'Enable AI-powered candidate-job matching'),
  ('global_careers', TRUE, 'Enable Global Careers funding application flow'),
  ('cv_generator', TRUE, 'Enable CV generation from profile data'),
  ('advanced_analytics', FALSE, 'Enable advanced hiring analytics dashboard')
ON CONFLICT (key) DO NOTHING;
