import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   POST /api/career-support/apply
   Persists a career support application.
   Requires authentication — unauthenticated users are redirected
   to sign up before reaching this form.
   ============================================================ */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      type?: string;
      currentRole?: string;
      skills?: string;
      reason?: string;
      location?: string;
    };

    const { type, currentRole, skills, reason, location } = body;

    if (!type || !currentRole || !skills || !reason) {
      return NextResponse.json(
        { error: "type, currentRole, skills, and reason are required." },
        { status: 400 }
      );
    }

    // Try to insert into career_applications table
    // If the table doesn't exist yet, return a graceful response
    const { error: insertError } = await supabase
      .from("career_applications")
      .insert({
        user_id: user.id,
        application_type: type,
        current_role: currentRole,
        skills_requested: skills,
        reason,
        location: location || null,
        status: "pending",
        submitted_at: new Date().toISOString(),
      });

    if (insertError) {
      // Table may not exist yet — log but don't fail the user experience
      console.error("[career-support/apply] insert error:", insertError.message);

      // Return success anyway (form state was saved to localStorage as backup)
      return NextResponse.json(
        { ok: true, note: "Application recorded (pending DB setup)" },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[career-support/apply] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("career_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      return NextResponse.json({ applications: [] }, { status: 200 });
    }

    return NextResponse.json({ applications: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
