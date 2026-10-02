import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/verification/submit
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, documentUrl, notes, referenceId } = await request.json();

  if (!type || !documentUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Create verification request
  const { data: verification, error: verifyError } = await supabase
    .from("verifications")
    .insert({
      candidate_id: user.id,
      type,
      status: "pending",
      document_urls: [documentUrl],
      notes,
      reference_id: referenceId,
    })
    .select()
    .single();

  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 500 });
  }

  return NextResponse.json({ verification }, { status: 201 });
}
