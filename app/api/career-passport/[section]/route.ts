import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

const TABLE_MAP: Record<string, string> = {
  experience: "candidate_work_history",
  education: "candidate_education",
  certifications: "candidate_certifications",
  licenses: "candidate_licenses",
  languages: "candidate_languages",
  portfolio: "candidate_portfolio",
  targets: "candidate_career_targets",
};

// GET: fetch all items for a career passport section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await params;
  const table = TABLE_MAP[section];
  if (!table) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: create a new item for a career passport section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await params;
  const table = TABLE_MAP[section];
  if (!table) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const body = await request.json();
  const { data, error } = await supabase
    .from(table)
    .insert({ ...body, candidate_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT: update an existing item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await params;
  const table = TABLE_MAP[section];
  if (!table) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const body = await request.json();
  const { id, ...rest } = body;

  const { data, error } = await supabase
    .from(table)
    .update({ ...rest, updated_at: new Date().toISOString() })
    .match({ id, candidate_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: remove an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await params;
  const table = TABLE_MAP[section];
  if (!table) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from(table)
    .delete()
    .match({ id, candidate_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
