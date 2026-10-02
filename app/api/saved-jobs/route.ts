import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/events";

/* ============================================================
   POST /api/saved-jobs — Save or unsave a job
   Body: { jobId: string, action: "save" | "unsave" }
   ============================================================ */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, action } = body;

    if (!jobId || !action) {
      return NextResponse.json({ error: "Missing jobId or action" }, { status: 400 });
    }

    if (action === "save") {
      const { error } = await supabase.from("saved_jobs").upsert(
        { candidate_id: user.id, job_id: jobId },
        { onConflict: "candidate_id,job_id" }
      );

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await trackEvent({
        type: "job_saved",
        actorId: user.id,
        entityType: "job",
        entityId: jobId,
      });

      return NextResponse.json({ saved: true });
    } else {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("candidate_id", user.id)
        .eq("job_id", jobId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ saved: false });
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ============================================================
   GET /api/saved-jobs — Get saved job IDs for current user
   ============================================================ */

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ savedJobIds: [] });
    }

    const { data } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("candidate_id", user.id);

    return NextResponse.json({ savedJobIds: (data ?? []).map((r: any) => r.job_id) });
  } catch {
    return NextResponse.json({ savedJobIds: [] });
  }
}
