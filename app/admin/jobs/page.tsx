import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { JobActions } from "./job-actions";

export const metadata: Metadata = { title: "Jobs" };

type AdminJob = {
  id: string;
  title: string | null;
  status: string;
  applicant_count: number | null;
  location: string | null;
  posted_at: string | null;
  employer: { name: string | null } | null;
  applications: { count: number }[] | null;
};

/* ============================================================
   Admin — Job Management
   Full table of all jobs with status management.
   ============================================================ */

export default async function AdminJobsPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employer:employers(name), applications(count)")
    .order("posted_at", { ascending: false });

  const jobRows: AdminJob[] = jobs ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px]">Jobs</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Manage all job listings across the platform.
          </p>
        </div>
        <div className="font-data text-[13px] text-ink-soft">
          {jobRows.length} total jobs
        </div>
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 py-4 border-b border-line font-data text-[12.5px] text-ink-soft">
          <div>Title & Employer</div>
          <div>Status</div>
          <div>Applicants</div>
          <div>Location</div>
          <div>Posted</div>
          <div className="text-right">Actions</div>
        </div>

        {jobRows.length === 0 ? (
          <div className="p-10 text-center text-ink-soft text-[14px]">
            No jobs found.
          </div>
        ) : (
          jobRows.map((job, i) => (
            <div
              key={job.id}
              className={`flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center gap-3 py-4 border-b border-line last:border-0 hover:opacity-80 transition-opacity`}
            >
              <div className="min-w-0">
                <div className="font-display font-semibold text-[15px] truncate">
                  {job.title}
                </div>
                <div className="text-[13px] text-ink-soft truncate font-data">
                  {job.employer?.name}
                </div>
              </div>

              <div>
                <StatusBadge status={job.status} />
              </div>

              <div className="font-data text-[14px]">
                {job.applications?.[0]?.count ?? job.applicant_count ?? 0}
                <span className="text-ink-soft text-[11px] ml-1">apps</span>
              </div>

              <div className="font-data text-[13px] text-ink-soft truncate">
                {job.location}
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {job.posted_at?.slice(0, 10)}
              </div>

              <div className="text-right">
                <JobActions jobId={job.id} currentStatus={job.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
