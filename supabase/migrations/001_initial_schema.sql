-- ============================================================
-- Kaziin — Supabase Database Schema
-- Paste this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Employers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employers (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  industry             TEXT NOT NULL,
  location             TEXT NOT NULL,
  website              TEXT,
  logo_url             TEXT,
  verified             BOOLEAN DEFAULT FALSE,
  verification_status  TEXT DEFAULT 'not_started',
  size                 TEXT,
  description          TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Jobs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  employer_id      UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  location         TEXT NOT NULL,
  work_arrangement TEXT NOT NULL DEFAULT 'onsite', -- onsite | remote | hybrid
  employment_type  TEXT NOT NULL DEFAULT 'full-time',

  -- Salary (flattened)
  salary_min       INTEGER,
  salary_max       INTEGER,
  salary_currency  TEXT,
  salary_period    TEXT, -- annual | monthly

  description      TEXT NOT NULL,
  requirements     TEXT[] DEFAULT '{}',
  skills           TEXT[] DEFAULT '{}',
  benefits         TEXT[] DEFAULT '{}',
  experience_level TEXT NOT NULL DEFAULT 'Mid-level',

  status           TEXT DEFAULT 'published', -- draft | published | paused | filled | expired
  posted_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ,
  applicant_count  INTEGER DEFAULT 0,
  verified         BOOLEAN DEFAULT FALSE
);

-- ── Profiles (extends Supabase auth.users) ───────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT,
  role             TEXT DEFAULT 'candidate', -- candidate | recruiter | admin
  avatar_url       TEXT,
  headline         TEXT,
  summary          TEXT,
  location         TEXT,
  availability     TEXT DEFAULT 'open',
  readiness_score  INTEGER DEFAULT 0,
  cv_uploaded      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Applications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'submitted', -- submitted | screening | shortlisted | interview | offer | hired | rejected | withdrawn
  applied_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT,
  UNIQUE(job_id, candidate_id)
);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE employers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Employers: anyone can read
CREATE POLICY "Public read employers"
  ON employers FOR SELECT USING (TRUE);

-- Jobs: anyone can read published jobs
CREATE POLICY "Public read published jobs"
  ON jobs FOR SELECT USING (status = 'published');

-- Profiles: users can read/write their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Applications: candidates see own, recruiters see all for their jobs
CREATE POLICY "Candidates see own applications"
  ON applications FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can insert applications"
  ON applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- ── Auto-create profile on sign-up ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
