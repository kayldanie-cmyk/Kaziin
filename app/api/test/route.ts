import { NextResponse } from "next/server";
// Dev test route — disabled for production.
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
