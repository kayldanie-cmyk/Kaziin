import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/events";

/* ============================================================
   GET  /api/events — Recent events (admin only)
   POST /api/events — Track a client-side event
   ============================================================ */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, entityType, entityId, metadata } = body;

    if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

    await trackEvent({
      type,
      actorId: user.id,
      entityType,
      entityId,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
