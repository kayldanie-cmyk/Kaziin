import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "new",
  "reviewed",
  "shortlisted",
  "interview",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
];

type ActorProfile = {
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
      .maybeSingle<ActorProfile>();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile || (profile.role !== "recruiter" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Recruiter access required." }, { status: 403 });
    }

    if (profile.role === "recruiter" && !profile.employer_id) {
      return NextResponse.json(
        { error: "Your recruiter profile needs an employer before applications can be updated." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { status?: unknown };
    const nextStatus = typeof body.status === "string" ? body.status : "";

    if (!APPLICATION_STATUSES.includes(nextStatus as ApplicationStatus)) {
      return NextResponse.json({ error: "Unsupported application status." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("applications")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ application: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
