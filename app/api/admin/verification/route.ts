import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET /api/admin/verification
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("verifications")
    .select("*, candidate:profiles(name, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ verifications: data });
}

// PATCH /api/admin/verification
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const adminUser = await requireAdmin(supabase);
  if (!adminUser) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id, status, notes } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("verifications")
    .update({ 
      status, 
      notes,
      verified_by: adminUser.id,
      verified_at: status === "verified" ? new Date().toISOString() : null
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ verification: data });
}
