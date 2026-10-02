import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { ApplicationStatusActions } from "./application-status-actions";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Shortlist",
};

/* ============================================================
   Employer Shortlist View
   Dynamic route that fetches applications for a specific job.
   ============================================================ */

export default async function ShortlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch job details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, slug")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  // Fetch applications with candidate profiles
  const { data: applications } = await supabase
    .from("applications")
    .select("*, candidate:profiles(*)")
    .eq("job_id", id);

  const hasApplications = applications && applications.length > 0;

  const total = hasApplications ? applications.length : 0;
  const screening = hasApplications ? applications.filter(a => a.status === "screening").length : 0;
  const shortlisted = hasApplications ? applications.filter(a => ["shortlisted", "interview", "offer"].includes(a.status)).length : 0;
  
  const funnel = [
    { label: "Total Applied", count: total, percentage: 100 },
    { label: "In Screening", count: screening, percentage: total > 0 ? Math.round((screening / total) * 100) : 0 },
    { label: "Shortlisted", count: shortlisted, percentage: total > 0 ? Math.round((shortlisted / total) * 100) : 0 },
  ];

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <BackButton href="/hire/jobs" label="Back to Jobs" className="mb-3" />
        <nav className="font-data text-[12px] text-ink-soft mb-2">
          <Link href="/hire" className="hover:text-ink">Dashboard</Link> /
          <Link href="/hire/jobs" className="hover:text-ink mx-1">Jobs</Link> /
          {job.title}
        </nav>
        <h1 className="font-display font-bold text-[28px] text-accent">{job.title} Shortlist</h1>
      </div>

      {/* Pipeline summary */}
      <section className="mb-10 pb-8 border-b border-line">
        <h2 className="font-display font-semibold text-[18px] mb-6">Pipeline Funnel</h2>
        <div className="flex flex-col">
          {funnel.map((row, i) => (
            <div key={row.label} className={`flex items-center gap-4 py-3 ${i > 0 ? 'border-t border-line' : ''}`}>
              <div className="w-[140px] shrink-0">
                <div className="font-data text-[12.5px] text-ink-soft">{row.label}</div>
                <div className="font-display font-semibold text-[20px]">{row.count}</div>
              </div>
              <ProgressBar value={row.percentage} animate={true} className="flex-1" />
            </div>
          ))}
        </div>
      </section>

      {/* Candidate List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-[18px]">Candidates</h2>
          <div className="text-[13px] font-data text-ink-soft">Sorted by application date</div>
        </div>

        {!hasApplications ? (
          <div className="py-10 text-center">
             <div className="text-ink-soft text-[15px] mb-2">No applications yet for this role.</div>
             <p className="text-[13.5px] text-ink-soft/80">When candidates apply, they will appear here with their current application status.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <div key={app.id} className="py-5 border-b border-line last:border-0">
                <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[18px]">
                      {app.candidate?.name?.charAt(0) ?? "C"}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-[17px] flex items-center gap-2">
                        {app.candidate?.name ?? "Unknown Candidate"}
                        <StatusBadge status={app.status ?? "submitted"} />
                      </div>
                      <div className="text-ink-soft text-[14px] mt-0.5">
                        {app.candidate?.headline ?? "Candidate"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-data font-semibold text-accent-dark text-[18px]">{app.candidate?.readiness_score ?? 0}%</div>
                    <div className="font-data text-[12px] text-ink-soft mt-0.5">Profile readiness</div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-line pt-4">
                  <ApplicationStatusActions
                    applicationId={app.id}
                    currentStatus={app.status ?? "submitted"}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
