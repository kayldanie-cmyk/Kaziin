import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// POST /api/admin/skills/aliases — add alias to a skill
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { skill_id, alias } = await request.json();
  if (!skill_id || !alias) return NextResponse.json({ error: "skill_id and alias are required" }, { status: 400 });

  const { data, error } = await supabase
    .from("skill_aliases")
    .insert({ skill_id, alias })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alias: data }, { status: 201 });
}

// DELETE /api/admin/skills/aliases?id=uuid
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("skill_aliases").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
