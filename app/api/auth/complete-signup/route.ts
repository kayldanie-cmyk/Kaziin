import { NextResponse } from "next/server";

// ⚠️ DEPRECATED: This logic has been moved to the Server Action in app/auth/signup/actions.ts
// This file should be deleted from the filesystem.
export function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

