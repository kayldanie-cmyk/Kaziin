import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET /api/admin/skills?q=&type=&page=0&pageSize=50&withAliases=true
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const skillType = searchParams.get("type") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "0");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "50"), 100);

  let query = supabase
    .from("skills")
    .select("*, aliases:skill_aliases(id, alias)", { count: "exact" })
    .order("canonical_name")
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (q) query = query.ilike("canonical_name", `%${q}%`);
  if (skillType) query = query.eq("skill_type", skillType);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ skills: data, total: count, page, pageSize });
}

// POST /api/admin/skills — create a new skill
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { canonical_name, slug, description, category, skill_type, sort_order, aliases } = body;

  if (!canonical_name || !slug) {
    return NextResponse.json({ error: "canonical_name and slug are required" }, { status: 400 });
  }

  const { data: skill, error } = await supabase
    .from("skills")
    .insert({ canonical_name, slug, description, category, skill_type: skill_type ?? "technical", sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert aliases if provided
  if (aliases?.length) {
    const aliasRows = aliases.map((a: string) => ({ skill_id: skill.id, alias: a }));
    await supabase.from("skill_aliases").insert(aliasRows).throwOnError();
  }

  return NextResponse.json({ skill }, { status: 201 });
}

// PATCH /api/admin/skills — update a skill
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { id, aliases, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data: skill, error } = await supabase
    .from("skills")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ skill });
}

// DELETE /api/admin/skills?id=uuid
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
