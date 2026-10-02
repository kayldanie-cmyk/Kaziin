import { NextRequest, NextResponse } from "next/server";
import { getJobBySlug } from "@/lib/data";

/**
 * GET /api/jobs/[slug]
 * Returns a single job by its slug.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const job = await getJobBySlug(slug);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (err) {
    console.error(`[API /api/jobs/${slug}]`, err);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
