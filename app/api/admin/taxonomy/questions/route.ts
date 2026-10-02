import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const QUESTION_TYPES = [
  "text", "textarea", "number", "date", "single_select", "multi_select",
  "boolean", "file", "location", "currency", "skill_picker",
  "license_picker", "certification_picker", "portfolio",
] as const;

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET /api/admin/taxonomy/questions?category_id=&family_id=&role_id=&active=true
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");
  const familyId = searchParams.get("family_id");
  const roleId = searchParams.get("role_id");
  const activeOnly = searchParams.get("active") !== "false";

  let query = supabase
    .from("application_questions")
    .select(`
      *,
      category:job_categories(name),
      family:job_families(name),
      role:job_roles(name)
    `)
    .order("sort_order", { ascending: true });

  if (activeOnly) query = query.eq("active", true);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (familyId) query = query.eq("family_id", familyId);
  if (roleId) query = query.eq("role_id", roleId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ questions: data });
}

// POST /api/admin/taxonomy/questions
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const {
    question, type, required, category_id, family_id, role_id,
    validation, options, conditional_rule, evidence_required, sort_order,
  } = body;

  if (!question || !type) {
    return NextResponse.json({ error: "question and type are required" }, { status: 400 });
  }
  if (!QUESTION_TYPES.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${QUESTION_TYPES.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("application_questions")
    .insert({
      question, type, required: required ?? false,
      category_id: category_id ?? null,
      family_id: family_id ?? null,
      role_id: role_id ?? null,
      validation: validation ?? {},
      options: options ?? [],
      conditional_rule: conditional_rule ?? null,
      evidence_required: evidence_required ?? false,
      sort_order: sort_order ?? 0,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ question: data }, { status: 201 });
}

// PATCH /api/admin/taxonomy/questions — update or toggle active
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("application_questions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ question: data });
}

// DELETE /api/admin/taxonomy/questions?id=uuid — soft delete (active=false)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  if (!await requireAdmin(supabase)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase
    .from("application_questions")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
