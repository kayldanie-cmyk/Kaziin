import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getApplicationQuestions } from "@/lib/taxonomy";

// GET /api/applications/questions?categoryId=...&familyId=...&roleId=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const familyId = searchParams.get("familyId") || undefined;
  const roleId = searchParams.get("roleId") || undefined;

  try {
    const questions = await getApplicationQuestions(categoryId, familyId, roleId);
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
