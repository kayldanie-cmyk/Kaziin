-- ============================================================
-- Kaziin — Blueprint Schema Extension
-- Adds all entities required by the Master Blueprint §49
-- ============================================================

-- ── Skills Taxonomy (§18–19) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  category      TEXT,
  aliases       TEXT[] DEFAULT '{}',
  parent_id     UUID REFERENCES skills(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id            UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency         TEXT DEFAULT 'intermediate', -- beginner | intermediate | advanced | expert
  years_experience    INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'not_started',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, skill_id)
);

CREATE TABLE IF NOT EXISTS job_skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id    UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance  TEXT DEFAULT 'required', -- required | preferred
  weight      REAL DEFAULT 1.0,
  UNIQUE(job_id, skill_id)
);

-- ── Matches (§7–9) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  eligible          BOOLEAN DEFAULT TRUE,
  score             REAL NOT NULL DEFAULT 0,
  score_components  JSONB DEFAULT '{}'::jsonb,
  explanation       JSONB DEFAULT '[]'::jsonb,
  match_label       TEXT DEFAULT 'potential', -- strong | good | potential | ineligible
  algorithm_version TEXT DEFAULT 'v1',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- ── Verifications (§32–33) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id           UUID NOT NULL,
  entity_type         TEXT NOT NULL, -- candidate | employer | job
  verification_type   TEXT NOT NULL, -- identity | phone | email | education | certification | employment | references | skills | work_authorization | company | recruiter | job_authenticity
  status              TEXT DEFAULT 'not_started',
  evidence            JSONB DEFAULT '{}'::jsonb,
  reviewer_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, verification_type)
);

-- ── Cases (§35) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number   TEXT UNIQUE NOT NULL,
  type          TEXT NOT NULL, -- fraud_report | verification | support | dispute | escalation
  priority      TEXT DEFAULT 'medium', -- low | medium | high | critical
  status        TEXT DEFAULT 'open', -- open | under_review | resolved | closed
  assignee_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type   TEXT,
  entity_id     UUID,
  evidence      JSONB DEFAULT '[]'::jsonb,
  notes         TEXT,
  resolution    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Funding Programs (§36) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS funding_programs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider            TEXT NOT NULL,
  name                TEXT NOT NULL,
  max_support         INTEGER NOT NULL,
  currency            TEXT DEFAULT 'KES',
  eligible_expenses   TEXT[] DEFAULT '{}',
  fees                TEXT,
  repayment_duration  TEXT,
  repayment_structure TEXT,
  terms               TEXT,
  active              BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funding_applications (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id            UUID REFERENCES funding_programs(id) ON DELETE SET NULL,
  opportunity_id        UUID,
  requested_amount      INTEGER,
  status                TEXT DEFAULT 'not_started', -- not_started | assessment | pending | approved | declined | disbursed | repaying | completed
  repayment_period      TEXT,
  estimated_instalment  INTEGER,
  total_repayment       INTEGER,
  fees_disclosed        TEXT,
  applied_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Events (§38) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL,
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications (§53) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  channel     TEXT DEFAULT 'in_app', -- in_app | email | sms | push
  title       TEXT NOT NULL,
  message     TEXT,
  read        BOOLEAN DEFAULT FALSE,
  action_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Talent Pools (§28) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS talent_pools (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talent_pool_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id     UUID NOT NULL REFERENCES talent_pools(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, candidate_id)
);

-- ── Saved Jobs (§3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- ── Job Alerts (§3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'My Alert',
  criteria      JSONB DEFAULT '{}'::jsonb,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Profile extensions ──────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS salary_min INTEGER,
  ADD COLUMN IF NOT EXISTS salary_max INTEGER,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS career_goals TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS remote_readiness INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS global_readiness INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS career_dna JSONB DEFAULT '{}'::jsonb;

-- ── Job extensions ──────────────────────────────────────────
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS hiring_process TEXT,
  ADD COLUMN IF NOT EXISTS company_culture TEXT;

-- ── Feature Flags (§6) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_flags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  enabled     BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS for all new tables ──────────────────────────────────
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Skills: public read
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage skills" ON skills FOR ALL USING (public.is_admin());

-- Candidate Skills: own read/write
CREATE POLICY "Candidates manage own skills" ON candidate_skills FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Public read candidate skills" ON candidate_skills FOR SELECT USING (TRUE);

-- Job Skills: public read, employer/admin write
CREATE POLICY "Public read job skills" ON job_skills FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage job skills" ON job_skills FOR ALL USING (public.is_admin());

-- Matches: candidates see own, recruiters see for their jobs
CREATE POLICY "Candidates see own matches" ON matches FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Admins manage matches" ON matches FOR ALL USING (public.is_admin());

-- Verifications: entity owner + admin
CREATE POLICY "Admins manage verifications" ON verifications FOR ALL USING (public.is_admin());
CREATE POLICY "Users see own verifications" ON verifications FOR SELECT USING (auth.uid() = entity_id);

-- Cases: admin only
CREATE POLICY "Admins manage cases" ON cases FOR ALL USING (public.is_admin());

-- Funding Programs: public read
CREATE POLICY "Public read funding programs" ON funding_programs FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage funding programs" ON funding_programs FOR ALL USING (public.is_admin());

-- Funding Applications: candidate own + admin
CREATE POLICY "Candidates see own funding" ON funding_applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates create funding" ON funding_applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Admins manage funding" ON funding_applications FOR ALL USING (public.is_admin());

-- Events: admin read, authenticated write
CREATE POLICY "Admins read events" ON events FOR SELECT USING (public.is_admin());
CREATE POLICY "Authenticated write events" ON events FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Notifications: own read
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL USING (public.is_admin());

-- Talent Pools: recruiter own
CREATE POLICY "Recruiters manage own pools" ON talent_pools FOR ALL USING (auth.uid() = recruiter_id);
CREATE POLICY "Admins manage pools" ON talent_pools FOR ALL USING (public.is_admin());

CREATE POLICY "Pool owners manage members" ON talent_pool_members FOR ALL
  USING (EXISTS (SELECT 1 FROM talent_pools WHERE talent_pools.id = pool_id AND talent_pools.recruiter_id = auth.uid()));
CREATE POLICY "Admins manage pool members" ON talent_pool_members FOR ALL USING (public.is_admin());

-- Saved Jobs: candidate own
CREATE POLICY "Candidates manage saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = candidate_id);

-- Job Alerts: candidate own
CREATE POLICY "Candidates manage alerts" ON job_alerts FOR ALL USING (auth.uid() = candidate_id);

-- Feature Flags: admin manage, public read
CREATE POLICY "Public read feature flags" ON feature_flags FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage feature flags" ON feature_flags FOR ALL USING (public.is_admin());

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_matches_candidate ON matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_matches_job ON matches(job_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(score DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate ON saved_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_verifications_entity ON verifications(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id);
