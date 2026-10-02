import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   GET  /api/admin/matching-config — Get all matching weights
   PUT  /api/admin/matching-config — Update a specific weight
   ============================================================ */

async function assertAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = await assertAdmin(supabase, user.id);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("matching_config")
      .select("*")
      .order("weight", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ config: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = await assertAdmin(supabase, user.id);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { factor, weight } = body;

    if (!factor || weight === undefined) {
      return NextResponse.json({ error: "factor and weight required" }, { status: 400 });
    }

    if (weight < 0 || weight > 1) {
      return NextResponse.json({ error: "weight must be between 0 and 1" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("matching_config")
      .update({ weight, updated_at: new Date().toISOString(), updated_by: user.id })
      .eq("factor", factor)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log to audit
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "update_matching_weight",
      entity_type: "matching_config",
      metadata: { factor, weight },
    });

    return NextResponse.json({ config: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
