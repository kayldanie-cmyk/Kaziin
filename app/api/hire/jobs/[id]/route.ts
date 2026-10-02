import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/types";

const JOB_STATUSES: JobStatus[] = ["draft", "published", "paused", "filled", "expired"];

type RecruiterProfile = {
  role: string | null;
  employer_id: string | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, employer_id")
      .eq("id", user.id)
      .maybeSingle<RecruiterProfile>();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile || (profile.role !== "recruiter" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Recruiter access required." }, { status: 403 });
    }

    if (profile.role === "recruiter" && !profile.employer_id) {
      return NextResponse.json(
        { error: "Your recruiter profile needs an employer before jobs can be updated." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { status?: unknown };
    const nextStatus = typeof body.status === "string" ? body.status : "";

    if (!JOB_STATUSES.includes(nextStatus as JobStatus)) {
      return NextResponse.json({ error: "Unsupported job status." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", id)
      .select("id, status")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ job: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
