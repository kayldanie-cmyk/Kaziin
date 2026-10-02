import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   POST /api/career-support/assessment
   Saves a career assessment for the authenticated candidate
   and creates/updates their career plan record.
   ============================================================ */

const VALID_EMPLOYMENT_STATUSES = [
  "employed_full_time",
  "employed_part_time",
  "self_employed",
  "unemployed_seeking",
  "unemployed_not_seeking",
  "student",
  "returner",
] as const;

const VALID_EDUCATION_LEVELS = [
  "no_formal",
  "secondary",
  "higher_secondary",
  "vocational",
  "undergraduate",
  "postgraduate",
  "professional",
] as const;

const VALID_CAREER_GOALS = [
  "find_first_job",
  "change_career",
  "advance_career",
  "learn_new_skill",
  "get_certified",
  "start_skilled_trade",
  "work_internationally",
  "work_remotely",
  "become_self_employed",
] as const;

const VALID_WORK_PREFERENCES = [
  "full_time",
  "part_time",
  "contract",
  "remote",
  "hybrid",
  "on_site",
  "flexible",
] as const;

type ValidEmploymentStatus = typeof VALID_EMPLOYMENT_STATUSES[number];
type ValidEducationLevel = typeof VALID_EDUCATION_LEVELS[number];
type ValidCareerGoal = typeof VALID_CAREER_GOALS[number];
type ValidWorkPreference = typeof VALID_WORK_PREFERENCES[number];

function isValidEmploymentStatus(v: unknown): v is ValidEmploymentStatus {
  return VALID_EMPLOYMENT_STATUSES.includes(v as ValidEmploymentStatus);
}
function isValidEducationLevel(v: unknown): v is ValidEducationLevel {
  return VALID_EDUCATION_LEVELS.includes(v as ValidEducationLevel);
}
function isValidCareerGoal(v: unknown): v is ValidCareerGoal {
  return VALID_CAREER_GOALS.includes(v as ValidCareerGoal);
}
function isValidWorkPreference(v: unknown): v is ValidWorkPreference {
  return VALID_WORK_PREFERENCES.includes(v as ValidWorkPreference);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    employment_status,
    education_level,
    career_goal,
    experience_area,
    location,
    work_preferences,
  } = body as Record<string, unknown>;

  // Validate required fields
  if (!isValidEmploymentStatus(employment_status)) {
    return NextResponse.json({ error: "Invalid employment status." }, { status: 422 });
  }
  if (!isValidEducationLevel(education_level)) {
    return NextResponse.json({ error: "Invalid education level." }, { status: 422 });
  }
  if (!isValidCareerGoal(career_goal)) {
    return NextResponse.json({ error: "Invalid career goal." }, { status: 422 });
  }
  if (typeof experience_area !== "string" || !experience_area.trim()) {
    return NextResponse.json({ error: "Experience area is required." }, { status: 422 });
  }
  if (typeof location !== "string" || !location.trim()) {
    return NextResponse.json({ error: "Location is required." }, { status: 422 });
  }
  if (
    !Array.isArray(work_preferences) ||
    work_preferences.length === 0 ||
    !work_preferences.every(isValidWorkPreference)
  ) {
    return NextResponse.json({ error: "At least one valid work preference is required." }, { status: 422 });
  }

  // Insert assessment record
  const { data: assessment, error: assessmentError } = await supabase
    .from("career_assessments")
    .insert({
      candidate_id: user.id,
      employment_status,
      education_level,
      career_goal,
      experience_area: experience_area.trim(),
      location: location.trim(),
      work_preferences,
    })
    .select("id")
    .single();

  if (assessmentError) {
    console.error("[career-support/assessment] Insert error:", JSON.stringify(assessmentError));
    return NextResponse.json(
      {
        error: "Could not save your assessment. Please try again.",
        debug: {
          code: assessmentError.code,
          message: assessmentError.message,
          details: assessmentError.details,
          hint: assessmentError.hint,
        },
      },
      { status: 500 }
    );
  }

  // Upsert career plan — one plan per candidate
  const { error: planError } = await supabase
    .from("career_plans")
    .upsert(
      {
        candidate_id: user.id,
        career_goal,
        employment_status,
        education_level,
        experience_area: experience_area.trim(),
        location: location.trim(),
        work_preferences,
        latest_assessment_id: assessment.id,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id" }
    );

  if (planError) {
    // Non-fatal: the assessment was saved, plan upsert failed
    console.error("[career-support/assessment] Plan upsert error:", planError);
  }

  return NextResponse.json({ redirect: "/career-support/plan", assessment_id: assessment.id });
}
