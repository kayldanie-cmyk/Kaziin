import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Analytics",
};

type RecruiterProfile = {
  role: string | null;
  employer_id: string | null;
};

type AnalyticsJob = {
  id: string;
  title: string;
  status: string | null;
  posted_at: string | null;
  applications?: { count: number }[] | null;
};

type AnalyticsApplication = {
  status: string | null;
  applied_at: string | null;
};

const PIPELINE_STAGES: { label: string; statuses: string[] }[] = [
  { label: "Submitted", statuses: ["submitted"] },
  { label: "Screening", statuses: ["screening"] },
  { label: "Shortlisted", statuses: ["shortlisted"] },
  { label: "Interview", statuses: ["interview"] },
  { label: "Offer", statuses: ["offer"] },
  { label: "Hired", statuses: ["hired"] },
  { label: "Rejected", statuses: ["rejected"] },
];

async function getAnalyticsData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { profile: null, jobs: [], applications: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, employer_id")
    .eq("id", user.id)
    .maybeSingle<RecruiterProfile>();

  if (!profile || (profile.role !== "recruiter" && profile.role !== "admin")) {
    return { profile: null, jobs: [], applications: [] };
  }

  if (profile.role === "recruiter" && !profile.employer_id) {
    return { profile, jobs: [], applications: [] };
  }

  let jobsQuery = supabase
    .from("jobs")
    .select("id, title, status, posted_at, applications(count)")
    .order("posted_at", { ascending: false });

  let applicationsQuery = supabase
    .from("applications")
    .select("status, applied_at, job:jobs!inner(id, employer_id)")
    .order("applied_at", { ascending: false });

  if (profile.role !== "admin") {
    jobsQuery = jobsQuery.eq("employer_id", profile.employer_id);
    applicationsQuery = applicationsQuery.eq("job.employer_id", profile.employer_id);
  }

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    jobsQuery,
    applicationsQuery,
  ]);

  return {
    profile,
    jobs: (jobs ?? []) as AnalyticsJob[],
    applications: (applications ?? []) as AnalyticsApplication[],
  };
}

export default async function AnalyticsPage() {
  const { profile, jobs, applications } = await getAnalyticsData();
  const totalApplications = applications.length;
  const activeJobs = jobs.filter((job) => job.status === "published").length;
  const shortlisted = applications.filter((application) =>
    ["shortlisted", "interview", "offer", "hired"].includes(application.status ?? "")
  ).length;
  const conversionRate = totalApplications > 0
    ? Math.round((shortlisted / totalApplications) * 100)
    : 0;
  const recentApplications = applications.filter((application) =>
    isWithinLastDays(application.applied_at, 30)
  ).length;

  const pipelineRows = PIPELINE_STAGES.map((stage) => {
    const count = applications.filter((application) =>
      stage.statuses.includes(application.status ?? "")
    ).length;

    return {
      ...stage,
      count,
      percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
    };
  });

  const topJobs = [...jobs]
    .sort((a, b) => readApplicantCount(b) - readApplicantCount(a))
    .slice(0, 5);

  return (
    <div>
      <BackButton href="/hire" label="Back to Dashboard" className="mb-4" />
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px] text-accent">Analytics</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Pipeline activity from jobs and applications visible to this workspace.
          </p>
        </div>
        <Link href="/hire/jobs" className={buttonVariants({ variant: "ghost" })}>
          Manage jobs
        </Link>
      </div>

      {!profile ? (
        <div className="py-12 text-center max-w-[520px] mx-auto mt-8">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4 text-accent-dark">
            
          </div>
          <h2 className="font-display font-semibold text-[20px] mb-2">No analytics yet</h2>
          <p className="text-[14.5px] text-ink-soft leading-relaxed">
            Analytics will appear here once you have an active recruiter or admin account with hiring activity.
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", className: "mt-6" })}>
            Go to dashboard
          </Link>
        </div>
      ) : jobs.length === 0 && applications.length === 0 ? (
        <div className="py-12 text-center max-w-[520px] mx-auto mt-8">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4 text-accent-dark">
            
          </div>
          <h2 className="font-display font-semibold text-[20px] mb-2">No analytics yet</h2>
          <p className="text-[14.5px] text-ink-soft leading-relaxed">
            Publish a job and start reviewing applications to see your hiring analytics and pipeline breakdown here.
          </p>
          <Link href="/hire/jobs/new" className={buttonVariants({ className: "mt-6" })}>
            Post a job
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4 mb-8">
            <MetricCard label="Published jobs" value={activeJobs.toString()} />
            <MetricCard label="Total applications" value={totalApplications.toString()} />
            <MetricCard label="Last 30 days" value={recentApplications.toString()} />
            <MetricCard label="Shortlist rate" value={`${conversionRate}%`} />
          </div>

          <div className="grid grid-cols-[1.4fr_1fr] max-lg:grid-cols-1 gap-6">
            <section className="pr-8 border-r border-line max-lg:border-r-0 max-lg:pr-0 max-lg:pb-8 max-lg:border-b">
              <h2 className="font-display font-semibold text-[18px] mb-5">
                Application Pipeline
              </h2>
              <div className="space-y-4">
                {pipelineRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="font-data text-[12.5px] text-ink-soft">
                        {row.label}
                      </div>
                      <div className="font-data text-[12.5px] text-ink">
                        {row.count} ({row.percentage}%)
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-line/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-dark"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display font-semibold text-[18px] mb-5">
                Jobs by Applicants
              </h2>
              {topJobs.length === 0 ? (
                <p className="text-[14px] text-ink-soft">
                  Jobs will appear here after they are posted.
                </p>
              ) : (
                <div className="space-y-4">
                  {topJobs.map((job) => (
                    <div key={job.id} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-[14px] truncate">{job.title}</div>
                        <div className="font-data text-[12px] text-ink-soft capitalize">
                          {job.status ?? "draft"}
                        </div>
                      </div>
                      <div className="font-data text-[13px] text-ink shrink-0">
                        {readApplicantCount(job)} applicants
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <div className="font-data text-[12px] text-ink-soft mb-2">{label}</div>
      <div className="font-display font-bold text-[24px]">{value}</div>
    </div>
  );
}

function readApplicantCount(job: AnalyticsJob) {
  return job.applications?.[0]?.count ?? 0;
}

function isWithinLastDays(value: string | null, days: number) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}
