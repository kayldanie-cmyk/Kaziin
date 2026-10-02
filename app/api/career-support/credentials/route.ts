import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   POST /api/career-support/credentials
   Saves a training credential for the authenticated candidate.
   After admin verification, a separate process sets
   skills_applied = true, triggering the profile/matching update.
   ============================================================ */

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { title, issuer, issued_date, expiry_date, credential_url } = body as Record<
    string,
    unknown
  >;

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Credential title is required." }, { status: 422 });
  }
  if (typeof issuer !== "string" || !issuer.trim()) {
    return NextResponse.json({ error: "Issuing body is required." }, { status: 422 });
  }
  if (typeof issued_date !== "string" || !issued_date.trim()) {
    return NextResponse.json({ error: "Issue date is required." }, { status: 422 });
  }

  // Validate optional URL
  if (credential_url && typeof credential_url === "string" && credential_url.trim()) {
    try {
      new URL(credential_url.trim());
    } catch {
      return NextResponse.json(
        { error: "Verification URL must be a valid URL." },
        { status: 422 }
      );
    }
  }

  const { data: credential, error } = await supabase
    .from("training_credentials")
    .insert({
      candidate_id: user.id,
      title: title.trim(),
      issuer: issuer.trim(),
      issued_date: issued_date.trim(),
      expiry_date:
        typeof expiry_date === "string" && expiry_date.trim() ? expiry_date.trim() : null,
      credential_url:
        typeof credential_url === "string" && credential_url.trim()
          ? credential_url.trim()
          : null,
      verification_status: "unverified",
      skills_applied: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[career-support/credentials] Insert error:", error);
    return NextResponse.json(
      { error: "Could not save your credential. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    credential_id: credential.id,
    message: "Credential submitted for verification.",
  });
}
