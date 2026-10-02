-- ============================================================
-- Fix RLS policies for career_assessments and career_plans
-- The FOR ALL + USING pattern does not cover INSERT (needs WITH CHECK).
-- This adds explicit INSERT policies so candidates can submit assessments.
-- ============================================================

-- career_assessments: drop and recreate with explicit INSERT policy
DROP POLICY IF EXISTS "Candidates manage own assessments" ON career_assessments;

CREATE POLICY "Candidates read own assessments"
  ON career_assessments FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates insert own assessments"
  ON career_assessments FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates update own assessments"
  ON career_assessments FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates delete own assessments"
  ON career_assessments FOR DELETE
  USING (auth.uid() = candidate_id);

-- career_plans: drop and recreate with explicit INSERT policy
DROP POLICY IF EXISTS "Candidates manage own career plan" ON career_plans;

CREATE POLICY "Candidates read own career plan"
  ON career_plans FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates insert own career plan"
  ON career_plans FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates update own career plan"
  ON career_plans FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates delete own career plan"
  ON career_plans FOR DELETE
  USING (auth.uid() = candidate_id);

-- career_plan_milestones: same fix
DROP POLICY IF EXISTS "Candidates manage own milestones" ON career_plan_milestones;

CREATE POLICY "Candidates read own milestones"
  ON career_plan_milestones FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates insert own milestones"
  ON career_plan_milestones FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates update own milestones"
  ON career_plan_milestones FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates delete own milestones"
  ON career_plan_milestones FOR DELETE
  USING (auth.uid() = candidate_id);

-- career_goals: same fix
DROP POLICY IF EXISTS "Candidates manage own career goals" ON career_goals;

CREATE POLICY "Candidates read own career goals"
  ON career_goals FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates insert own career goals"
  ON career_goals FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates update own career goals"
  ON career_goals FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates delete own career goals"
  ON career_goals FOR DELETE
  USING (auth.uid() = candidate_id);
