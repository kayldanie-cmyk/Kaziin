import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/career/gap-analysis?jobId=123
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  // 1. Get Candidate Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("skills, experience, certifications")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // 2. Get Job Requirements
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("title, hard_requirements, soft_requirements, required_skills:job_skills(skill:skills(canonical_name))")
    .eq("id", jobId)
    .single();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  // 3. Compute Gap Analysis
  // For a real production app, this would use the `skills` graph and transferring logic.
  // We'll simulate a basic comparison here.
  const candidateSkills = (profile.skills || []).map((s: any) => s.name?.toLowerCase());
  const jobSkills = (job.required_skills || []).map((js: any) => js.skill?.canonical_name);

  const matchedSkills = [];
  const missingSkills = [];

  for (const js of jobSkills) {
    if (!js) continue;
    if (candidateSkills.includes(js.toLowerCase())) {
      matchedSkills.push(js);
    } else {
      missingSkills.push(js);
    }
  }

  return NextResponse.json({
    jobTitle: job.title,
    matched: matchedSkills,
    missing: missingSkills,
    recommendations: missingSkills.map(s => `Consider taking a course or gaining experience in ${s}.`)
  });
}
