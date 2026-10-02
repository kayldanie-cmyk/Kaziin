import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/career/paths
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get Candidate Profile Current Role (Target)
  const { data: targets, error: targetError } = await supabase
    .from("candidate_career_targets")
    .select("role:job_roles(name)")
    .eq("candidate_id", user.id)
    .limit(1);

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  const roleData = targets?.[0]?.role as any;
  const currentTargetRole = (Array.isArray(roleData) ? roleData[0]?.name : roleData?.name) || "Professional";

  // Simulate AI generated path based on current target
  const paths = [
    {
      current: currentTargetRole,
      steps: [
        { role: `Junior ${currentTargetRole}`, timeline: "0-2 years", requirements: ["Basic certification", "Entry-level experience"] },
        { role: currentTargetRole, timeline: "2-5 years", requirements: ["Proven track record", "Advanced skills"] },
        { role: `Senior ${currentTargetRole}`, timeline: "5+ years", requirements: ["Leadership", "Complex project management"] }
      ]
    }
  ];

  return NextResponse.json({ paths });
}