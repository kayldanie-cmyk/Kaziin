import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*, job:jobs(*, employer:employers(*))")
      .eq("candidate_id", user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch applications." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = (await request.json()) as { jobId?: unknown };
    const jobId = typeof body.jobId === "string" ? body.jobId : "";

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        candidate_id: user.id,
        status: "submitted",
      })
      .select("id, job_id, candidate_id, status, applied_at")
      .single();

    if (error) {
      const duplicate = error.code === "23505";

      return NextResponse.json(
        {
          error: duplicate
            ? "You have already applied for this job."
            : error.message,
        },
        { status: duplicate ? 409 : 500 }
      );
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
