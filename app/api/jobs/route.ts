import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/data";

/**
 * GET /api/jobs
 * 
 * Query params:
 *   - type: employment type filter (e.g. "full-time", "contract")
 *   - arrangement: work arrangement filter (e.g. "remote", "hybrid")
 *   - q: text search query
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? undefined;
  const arrangement = searchParams.get("arrangement") ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  try {
    const jobs = await getJobs({
      employmentType: type,
      workArrangement: arrangement,
      query,
    });

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (err) {
    console.error("[API /api/jobs]", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
