import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { JobStatusActions } from "./job-status-actions";

export const metadata: Metadata = { title: "Jobs" };

/* ============================================================
   Employer — Jobs Management Page
   Fetches jobs from Supabase for the current recruiter workspace.
   ============================================================ */

type RecruiterJob = {
  id: string;
  slug: string;
  title: string;
  location: string;
  workArrangement: string;
  employmentType: string;
  status: string;
  postedAt: string;
  applicantCount: number;
  employer: { name: string };
  verified: boolean;
};

async function getRecruiterJobs(): Promise<RecruiterJob[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, employer_id")
      .eq("id", user.id)
      .maybeSingle<{ role: string | null; employer_id: string | null }>();

    if (!profile || (profile.role !== "recruiter" && profile.role !== "admin")) {
      return [];
    }

    let query = supabase
      .from("jobs")
      .select("*, employer:employers(name), applications(count)")
      .order("posted_at", { ascending: false });

    if (profile.role !== "admin") {
      if (!profile.employer_id) return [];
      query = query.eq("employer_id", profile.employer_id);
    }

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((j) => ({
      id:             j.id,
      slug:           j.slug,
      title:          j.title,
      location:       j.location,
      workArrangement: j.work_arrangement,
      employmentType: j.employment_type,
      status:         j.status,
      postedAt:       j.posted_at?.slice(0, 10) ?? "",
      applicantCount: j.applications?.[0]?.count ?? j.applicant_count ?? 0,
      employer:       { name: j.employer?.name ?? "" },
      verified:       j.verified,
    }));
  } catch {
    return [];
  }
}

const STATUS_TABS = ["All", "Published", "Draft", "Paused", "Filled"];

export default async function HireJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params  = await searchParams;
  const filter  = params.status ?? "All";
  const allJobs = await getRecruiterJobs();

  const jobs = filter === "All"
    ? allJobs
    : allJobs.filter((j: { status: string }) =>
        j.status.toLowerCase() === filter.toLowerCase()
      );

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px] text-accent">Jobs</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Manage your active and draft job posts.
          </p>
        </div>
        <Link href="/hire/jobs/new" className={buttonVariants()}>
          + Post a job
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-line">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "All" ? "/hire/jobs" : `/hire/jobs?status=${tab.toLowerCase()}`}
            className={`px-4 py-2.5 font-data text-[13px] border-b-2 -mb-[1px] transition-colors ${
              tab === filter || (tab === "All" && filter === "All")
                ? "border-ink text-ink font-semibold"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {/* Jobs table */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 py-3 border-b border-line font-data text-[12.5px] text-ink-soft">
          <div>Role</div>
          <div>Status</div>
          <div>Applicants</div>
          <div>Posted</div>
          <div>Actions</div>
        </div>

        {jobs.length === 0 ? (
          <div className="px-5 py-12 text-center text-ink-soft text-[15px]">
            No jobs found.{" "}
            <Link href="/hire/jobs/new" className="text-accent-dark font-medium hover:underline">
              Post your first job
            </Link>
          </div>
        ) : (
          jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center gap-3 py-4 border-b border-line last:border-0 hover:opacity-80 transition-opacity`}
            >
              <div className="min-w-0">
                <div className="font-display font-semibold text-[15px] truncate">
                  {job.title}
                </div>
                <div className="text-ink-soft text-[13.5px] mt-0.5 truncate font-data">
                  {job.location} · {job.workArrangement}
                </div>
              </div>

              <div>
                <StatusBadge status={job.status} />
              </div>

              <div className="font-data text-[14px]">
                {job.applicantCount ?? 0}
                <span className="text-ink-soft text-[12px] ml-1">applicants</span>
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {job.postedAt}
              </div>

              <div className="flex items-start gap-2 flex-wrap">
                <Link href={`/hire/jobs/${job.id}/applications`} className={buttonVariants({ size: "sm" })}>
                  Review Pipeline
                </Link>
                <Link href={`/hire/shortlists/${job.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Shortlist
                </Link>
                <JobStatusActions jobId={job.id} currentStatus={job.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
