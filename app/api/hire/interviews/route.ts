import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is a recruiter or admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "recruiter" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { application_id, scheduled_at, duration_minutes, meeting_type, meeting_link, location, notes } = await request.json();

  if (!application_id || !scheduled_at) {
    return NextResponse.json({ error: "application_id and scheduled_at are required" }, { status: 400 });
  }

  const { data: interview, error } = await supabase
    .from("interviews")
    .insert({
      application_id,
      recruiter_id: user.id,
      scheduled_at,
      duration_minutes: duration_minutes || 60,
      meeting_type: meeting_type || "video",
      meeting_link,
      location,
      notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update application status to interview
  await supabase.from("applications").update({ status: "interview" }).eq("id", application_id);

  return NextResponse.json({ interview }, { status: 201 });
}
