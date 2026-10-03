import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Employer Dashboard",
};

type RecruiterProfile = {
  role: string | null;
  employer_id: string | null;
  employer: { name: string | null } | null;
};

type DashboardJob = {
  id: string;
  title: string;
  location: string;
  status: string | null;
  posted_at: string | null;
  applications?: { count: number }[];
};

type ApplicationRow = {
  status: string | null;
};

const FUNNEL_STATUSES = [
  { label: "Submitted", statuses: ["submitted"] },
  { label: "Screening", statuses: ["screening"] },
  { label: "Shortlisted", statuses: ["shortlisted", "interview", "offer"] },
  { label: "Hired", statuses: ["hired"] },
];

async function getHireDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, jobs: [], applications: [] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, employer_id, employer:employers(name)")
    .eq("id", user.id)
    .maybeSingle<RecruiterProfile>();

  if (!profile || (profile.role !== "recruiter" && profile.role !== "admin")) {
    return { profile: null, jobs: [], applications: [] };
  }

  let jobsQuery = supabase
    .from("jobs")
    .select("id, title, location, status, posted_at, applications(count)")
    .eq("status", "published")
    .order("posted_at", { ascending: false })
    .limit(3);

  if (profile.role !== "admin") {
    if (!profile.employer_id) {
      return { profile, jobs: [], applications: [] };
    }
    jobsQuery = jobsQuery.eq("employer_id", profile.employer_id);
  }

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    jobsQuery,
    supabase.from("applications").select("status"),
  ]);

  return {
    profile,
    jobs: (jobs ?? []) as DashboardJob[],
    applications: (applications ?? []) as ApplicationRow[],
  };
}

export default async function HireDashboardPage() {
  const { profile, jobs, applications } = await getHireDashboardData();
  const employerName = profile?.employer?.name ?? "Employer workspace";
  const totalApplications = applications.length;
  const activeJobs = jobs;
  const shortlistedApplications = applications.filter((application) =>
    ["shortlisted", "interview", "offer"].includes(application.status ?? "")
  ).length;
  const interviewApplications = applications.filter(
    (application) => application.status === "interview"
  ).length;

  const funnel = FUNNEL_STATUSES.map((row) => {
    const count = applications.filter((application) =>
      row.statuses.includes(application.status ?? "")
    ).length;

    return {
      label: row.label,
      count,
      percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display font-bold text-[30px] max-sm:text-[24px] text-[#2F6D53]">
            Recruiter Overview
          </h1>
          <p className="mt-1 text-ink-soft text-[15.5px]">
            {employerName} · Track your jobs, applicants, and candidate pipeline.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/hire/jobs/new" className={buttonVariants({ className: "min-w-[130px] whitespace-nowrap" })}>
            Post a job
          </Link>
        </div>
      </div>

      {/* Quick Tasks Integration — §14, §17 */}
      <div className="mb-8 border border-line rounded-[16px] overflow-hidden">
        <div className="bg-paper p-5 border-b border-line flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-xl shrink-0"></div>
            <div>
              <div className="font-display font-semibold text-[16px]">Quick Tasks</div>
              <div className="text-[13px] text-ink-soft mt-0.5">Need immediate help? Post a task and get matched in minutes.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/quick-tasks/my-tasks" className="shrink-0 px-5 py-2.5 rounded-xl bg-[#2F6D53] text-white font-bold text-[13.5px] hover:bg-[#1E4D39] transition-colors whitespace-nowrap">
              My Posted Tasks
            </Link>
            <Link href="/quick-tasks/post" className="shrink-0 px-5 py-2.5 rounded-xl bg-[#2F6D53] text-white font-bold text-[13.5px] hover:bg-[#1E4D39] transition-colors whitespace-nowrap">
              Post a Task
            </Link>
          </div>
        </div>
        {/* Formal vs Quick comparison */}
        <div className="grid grid-cols-2 divide-x divide-line">
          <div className="p-4">
            <div className="font-data text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-2">Formal Hiring</div>
            <div className="text-[13px] text-ink-soft leading-relaxed">
              Post a job → Screen applicants → Interview → Hire.
              Best for long-term positions and structured teams.
            </div>
            <Link href="/hire/jobs/new" className="mt-3 text-[13px] font-semibold text-accent-dark hover:underline block">
              Post a Job →
            </Link>
          </div>
          <div className="p-4">
            <div className="font-data text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-2">Quick Task</div>
            <div className="text-[13px] text-ink-soft leading-relaxed">
              Post a task → Kaziin dispatches a tasker → Task done.
              Best for immediate, on-demand needs.
            </div>
            <Link href="/quick-tasks/post" className="mt-3 text-[13px] font-semibold text-accent-dark hover:underline block">
              Post a Quick Task →
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Stat Metric Row matching Find Work Dashboard */}
      <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-4 pb-8 border-b border-line mb-8">
        {[
          { label: "Active Jobs", value: activeJobs.length },
          { label: "Applicants", value: totalApplications },
          { label: "Shortlisted", value: shortlistedApplications },
          { label: "Interviews", value: interviewApplications },
        ].map((stat) => (
          <div key={stat.label} className="py-2">
            <div className="font-data text-[12px] text-ink-soft">{stat.label}</div>
            <div className="mt-1.5 font-display font-bold text-[22px] text-ink">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Left Shortlists, Right Pipeline */}
      <div className="grid grid-cols-[2fr_1fr] max-md:grid-cols-1 gap-12 items-start">
        <div className="flex flex-col gap-6 pr-8 border-r border-line max-md:border-r-0 max-md:pr-0">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-[18px] text-[#2F6D53]">
              Active shortlists
            </h2>
            <Link
              href="/hire/jobs"
              className="text-[13.5px] text-accent-dark font-medium hover:underline"
            >
              View all jobs
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-3 text-accent-dark">
                
              </div>
              <h3 className="font-display font-semibold text-[18px]">No active shortlists yet</h3>
              <p className="mt-2 text-[14.5px] text-ink-soft max-w-[480px] mx-auto">
                Published jobs with candidate applications will appear here with real applicant counts and pipeline tracking.
              </p>
              <Link href="/hire/jobs/new" className={buttonVariants({ className: "mt-5 min-w-[160px]" })}>
                Post your first job
              </Link>
            </div>
          ) : (
            activeJobs.map((job) => {
              const applicantCount = job.applications?.[0]?.count ?? 0;

              return (
                <div key={job.id} className="py-5 border-b border-line last:border-0">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                      <Link
                        href={`/hire/shortlists/${job.id}`}
                        className="font-display font-semibold text-[18px] text-[#2F6D53] hover:underline"
                      >
                        {job.title}
                      </Link>
                      <div className="text-ink-soft text-[14px] mt-1">
                        Posted {job.posted_at?.slice(0, 10) ?? "recently"} · {job.location}
                      </div>
                    </div>
                    <Badge variant="status">Published</Badge>
                  </div>

                  <div className="flex gap-4 my-5">
                    <div className="flex-1 text-center">
                      <div className="font-data text-[12px] text-ink-soft">Applicants</div>
                      <div className="font-semibold text-[18px] mt-1 text-ink">
                        {applicantCount}
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-data text-[12px] text-ink-soft">In shortlist</div>
                      <div className="font-semibold text-[18px] mt-1 text-accent-dark">
                        {shortlistedApplications}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/hire/shortlists/${job.id}`}
                    className={buttonVariants({ variant: "ghost", className: "w-full text-center" })}
                  >
                    Review shortlist
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* Application Pipeline Sidebar */}
        <div className="sticky top-5">
          <h2 className="font-display font-semibold text-[18px] mb-5 text-[#2F6D53]">
            Application pipeline
          </h2>
          <div className="flex flex-col gap-4">
            {funnel.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-[13px] font-data mb-1.5">
                  <span className="text-ink-soft">{row.label}</span>
                  <span className="font-semibold">{row.count}</span>
                </div>
                <ProgressBar value={row.percentage} animate={false} height={6} />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-line text-[13px] text-ink-soft">
            Counts are based on applications visible to this recruiter workspace.
          </div>
        </div>
      </div>
    </div>
  );
}
