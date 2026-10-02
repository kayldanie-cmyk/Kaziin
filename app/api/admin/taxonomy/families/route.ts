import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET /api/admin/taxonomy/families?category_id=uuid
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");

  let query = supabase
    .from("job_families")
    .select(`*, roles:job_roles(count), category:job_categories(name)`)
    .order("sort_order", { ascending: true });

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ families: data });
}

// POST /api/admin/taxonomy/families
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { category_id, name, slug, description, sort_order } = body;

  if (!category_id || !name || !slug) {
    return NextResponse.json({ error: "category_id, name, and slug are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("job_families")
    .insert({ category_id, name, slug, description, sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ family: data }, { status: 201 });
}

// PATCH /api/admin/taxonomy/families
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("job_families")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ family: data });
}

// DELETE /api/admin/taxonomy/families?id=uuid
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("job_families").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
