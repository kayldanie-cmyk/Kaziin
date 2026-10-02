import Link from "next/link";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Applications",
};

type DashboardApplication = {
  id: string;
  status: string;
  applied_at: string | null;
  job: {
    slug: string | null;
    title: string | null;
    location: string | null;
    employer: { name: string | null } | null;
  } | null;
};

type JoinedApplicationJob = Omit<NonNullable<DashboardApplication["job"]>, "employer"> & {
  employer:
    | NonNullable<NonNullable<DashboardApplication["job"]>["employer"]>
    | NonNullable<NonNullable<DashboardApplication["job"]>["employer"]>[];
};

type DashboardApplicationSelect = Omit<DashboardApplication, "job"> & {
  job: JoinedApplicationJob | JoinedApplicationJob[] | null;
};

function normalizeApplicationJob(job: DashboardApplicationSelect["job"]): DashboardApplication["job"] {
  const row = Array.isArray(job) ? job[0] ?? null : job;
  if (!row) return null;

  return {
    ...row,
    employer: Array.isArray(row.employer) ? row.employer[0] ?? null : row.employer,
  };
}

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userApps, error } = await supabase
    .from("applications")
    .select("id, status, applied_at, job:jobs(slug, title, location, employer:employers(name))")
    .eq("candidate_id", user?.id)
    .order("applied_at", { ascending: false });

  const applications: DashboardApplication[] = !error && userApps
    ? (userApps as DashboardApplicationSelect[]).map((application) => ({
        ...application,
        job: normalizeApplicationJob(application.job),
      }))
    : [];

  return (
    <div>
      <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Applications</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Track your submitted job applications and hiring progress.
          </p>
        </div>
        <Link href="/dashboard/jobs" className={buttonVariants({ variant: "ghost" })}>
          Browse jobs
        </Link>
      </div>

      <div className="mt-sp-5 flex flex-col">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 py-4 border-b border-line font-data text-[12.5px] text-ink-soft">
          <div>Role and company</div>
          <div>Status</div>
          <div>Date applied</div>
          <div className="text-right">Actions</div>
        </div>

        {applications.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-ink-soft text-[15px] mb-4">
              You have not applied to any jobs yet.
            </div>
            <Link href="/dashboard/jobs" className={buttonVariants({ variant: "ghost" })}>
              Browse open roles
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {applications.map((application, i) => (
              <div
                key={application.id}
                className={`py-4 md:grid md:grid-cols-[2fr_1fr_1fr_auto] md:items-center gap-4 flex flex-col border-b border-line last:border-0 hover:opacity-80 transition-opacity`}
              >
                <div className="min-w-0">
                  {application.job?.slug ? (
                    <Link
                      href={`/jobs/${application.job.slug}`}
                      className="font-display font-semibold text-[15px] hover:underline truncate block"
                    >
                      {application.job?.title ?? "Job application"}
                    </Link>
                  ) : (
                    <div className="font-display font-semibold text-[15px] truncate">
                      {application.job?.title ?? "Job application"}
                    </div>
                  )}
                  <div className="text-[13.5px] text-ink-soft mt-0.5 truncate">
                    {application.job?.employer?.name ?? "Employer"} - {application.job?.location ?? "Location not set"}
                  </div>
                </div>

                <div>
                  <StatusBadge status={application.status} />
                </div>

                <div className="font-data text-[13px] text-ink-soft">
                  <span className="md:hidden">Applied: </span>
                  {application.applied_at?.slice(0, 10) ?? "-"}
                </div>

                <div className="text-right flex gap-2 md:justify-end mt-2 md:mt-0">
                  {application.job?.slug ? (
                    <Link href={`/jobs/${application.job.slug}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      View role
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
