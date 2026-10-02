import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchSkills } from "@/lib/skills";

/**
 * Public skills picker endpoint.
 * GET /api/skills?q=react&type=technical&limit=20
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const skillType = searchParams.get("type") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  try {
    const skills = await searchSkills(q, { limit, skillType });
    return NextResponse.json({ skills });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
