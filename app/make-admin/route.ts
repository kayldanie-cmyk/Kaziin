import { NextResponse } from "next/server";

// This route is intentionally disabled.
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}