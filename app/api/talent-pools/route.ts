import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/events";

/* ============================================================
   POST /api/talent-pools — Create a talent pool
   GET  /api/talent-pools — List recruiter's talent pools
   ============================================================ */

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ pools: [] });

    const { data } = await supabase
      .from("talent_pools")
      .select("*, members:talent_pool_members(count)")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ pools: data ?? [] });
  } catch {
    return NextResponse.json({ pools: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const { data, error } = await supabase.from("talent_pools").insert({
      recruiter_id: user.id,
      name,
      description: description ?? null,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ pool: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
