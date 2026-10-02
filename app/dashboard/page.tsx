import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MatchRing } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { getMatchedJobs, type MatchedJob } from "@/lib/data";
import { computeCareerDNA } from "@/lib/career-dna";
import { CareerDNA } from "@/components/candidates/career-dna";
import { OpportunityRadar } from "@/components/candidates/opportunity-radar";

export const metadata: Metadata = {
  title: "Dashboard",
};

type CandidateProfile = {
  name: string | null;
  headline: string | null;
  summary: string | null;
  location: string | null;
  readiness_score: number | null;
  cv_uploaded: boolean | null;
  skills: string[] | null;
  experience: string[] | null;
  certifications: string[] | null;
  work_preferences: string[] | null;
  employment_types: string[] | null;
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



async function getCandidateDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userName: "there", profile: null, applications: [], matchedJobs: [] };
  }

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, headline, summary, location, readiness_score, cv_uploaded, skills, experience, certifications, work_preferences, employment_types")
      .eq("id", user.id)
      .maybeSingle<CandidateProfile>(),
    supabase
      .from("applications")
      .select("id, status, applied_at, job:jobs(slug, title, location, employer:employers(name))")
      .eq("candidate_id", user.id)
      .order("applied_at", { ascending: false }),
  ]);

  const matchedJobs = await getMatchedJobs(profile as any);

  return {
    userName: (profile?.name ?? (user.user_metadata?.name as string | undefined) ?? user.email ?? "there").split("@")[0].split(" ")[0],
    profile,
    applications: ((applications ?? []) as DashboardApplicationSelect[]).map((application) => ({
      ...application,
      job: normalizeApplicationJob(application.job),
    })),
    matchedJobs: matchedJobs.slice(0, 3),
  };
}

function normalizeApplicationJob(job: DashboardApplicationSelect["job"]): DashboardApplication["job"] {
  const row = Array.isArray(job) ? job[0] ?? null : job;
  if (!row) return null;

  return {
    ...row,
    employer: Array.isArray(row.employer) ? row.employer[0] ?? null : row.employer,
  };
}

export default async function DashboardPage() {
  const { userName, profile, applications, matchedJobs } = await getCandidateDashboardData();
  const readinessScore = profile?.readiness_score ?? 0;
  const recentApps = applications.slice(0, 4);
  const activeApplications = applications.filter(
    (application) => !["withdrawn", "rejected"].includes(application.status)
  ).length;

  const checklist = [
    { label: "CV uploaded", done: Boolean(profile?.cv_uploaded) },
    { label: "Headline added", done: Boolean(profile?.headline) },
    { label: "Location set", done: Boolean(profile?.location) },
    { label: "Summary added", done: Boolean(profile?.summary) },
    { label: "Applications started", done: applications.length > 0 },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-[#2F6D53] text-[30px] max-sm:text-[24px]">
        Welcome, {userName}
      </h1>
      <p className="mt-2 text-ink-soft text-[15.5px]">
        Here is what is happening with your career.
      </p>

      {/* Opportunity Radar (§10) */}
      <div className="mt-6 mb-2">
        <OpportunityRadar
          newMatchesCount={matchedJobs.length}
          strongMatchesCount={matchedJobs.filter(m => m.score >= 85).length}
        />
      </div>

      {/* Quick Tasks Integration — §13, §16 */}
      <div className="mt-4 mb-2 border border-line rounded-[16px] overflow-hidden">
        {/* Header */}
        <div className="bg-paper p-4 flex items-center justify-between gap-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-lg shrink-0"></div>
            <div>
              <div className="font-display font-semibold text-[15px]">Quick Tasks</div>
              <div className="text-[13px] text-ink-soft mt-0.5">Immediate work — delivery, cleaning, repairs &amp; more.</div>
            </div>
          </div>
          <Link href="/quick-tasks/my-tasks" className="shrink-0 text-[13px] font-semibold text-accent-dark hover:underline whitespace-nowrap">
            My Tasks →
          </Link>
        </div>
        {/* Three actions */}
        <div className="grid grid-cols-3 divide-x divide-line text-center">
          <Link href="/quick-tasks" className="flex flex-col items-center gap-1 p-3 hover:bg-accent-soft/40 transition-colors text-center">
            <span className="text-[18px]"></span>
            <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark">Browse</span>
          </Link>
          <Link href="/quick-tasks/post" className="flex flex-col items-center gap-1 p-3 hover:bg-accent-soft/40 transition-colors text-center">
            <span className="text-[18px]"></span>
            <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark">Post Task</span>
          </Link>
          <Link href="/quick-tasks/my-tasks" className="flex flex-col items-center gap-1 p-3 hover:bg-accent-soft/40 transition-colors text-center">
            <span className="text-[18px]"></span>
            <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark">My Tasks</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-8 md:gap-10">
        <div className="flex flex-col justify-between md:pr-8 md:border-r border-line border-b md:border-b-0 pb-8 md:pb-0">
          <div className="font-data text-[12.5px] text-ink-soft mb-4">
            Career readiness
          </div>
          <div className="flex items-center gap-sp-3">
            <MatchRing score={readinessScore} size="lg" />
            <div>
              <div className="font-display font-bold text-[22px]">
                {readinessScore}
                <span className="text-ink-soft text-[14px] font-normal"> / 100</span>
              </div>
              <Link
                href="/dashboard/profile"
                className="text-[13.5px] text-accent-dark font-medium hover:underline"
              >
                Improve your profile
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2">
            {checklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-[13.5px]"
              >
                <span className={item.done ? "text-ink" : "text-ink-soft"}>
                  {item.label}
                </span>
                <span className={`font-data ${item.done ? "text-accent-dark" : "text-ink-soft"}`}>
                  {item.done ? "Done" : "Open"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 border-b border-line mb-8">
            {[
              { label: "Matches", value: matchedJobs.length },
              { label: "Applied", value: activeApplications },
              { label: "Interviews", value: applications.filter((application) => application.status === "interview").length },
              { label: "Offers", value: applications.filter((application) => application.status === "offer").length },
            ].map((stat) => (
              <div key={stat.label} className="py-2">
                <div className="font-data text-[12px] text-ink-soft">
                  {stat.label}
                </div>
                <div className="mt-1.5 font-display font-bold text-[22px]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-data text-[12.5px] text-ink-soft">
                Your top matches
              </span>
              <Link
                href="/dashboard/jobs"
                className="text-[13px] text-accent-dark font-medium hover:underline"
              >
                View all
              </Link>
            </div>

            {matchedJobs.length === 0 ? (
              <div className="p-5">
                <p className="text-[14.5px] text-ink-soft">
                  Complete your profile to start receiving matched roles.
                </p>
                <Link
                  href="/dashboard/profile"
                  className="text-[13.5px] text-accent-dark font-medium hover:underline mt-2 inline-block"
                >
                  Update profile
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {matchedJobs.map((match) => (
                  <Link
                    key={match.job.id}
                    href={`/dashboard/jobs/${match.job.slug}`}
                    className="flex items-center gap-sp-3 py-3 border-b border-line last:border-0 hover:opacity-80 transition-opacity"
                  >
                    <MatchRing score={match.score} size="sm" animate={false} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-semibold text-[15px] truncate">
                        {match.job.title}
                      </div>
                      <div className="text-[13px] text-ink-soft truncate">
                        {match.job.employer.name} · {match.job.location}
                      </div>
                    </div>
                    <span className="font-data text-[12.5px] text-accent-dark shrink-0 font-semibold">
                      {match.score}% match
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 md:mt-12 pt-8 border-t border-line grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 md:gap-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[19px] font-semibold text-[#2F6D53]">
              Recent applications
            </h2>
            <Link
              href="/dashboard/applications"
              className="text-[13px] text-accent-dark font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-col">
            {recentApps.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-ink-soft text-[15px] mb-4">No recent applications</div>
                <Link href="/dashboard/jobs" className={buttonVariants({ variant: "ghost" })}>
                  Browse your matches
                </Link>
              </div>
            ) : (
              recentApps.map((application, i) => (
                  <div
                    key={application.id}
                    className={`flex items-center justify-between gap-sp-3 py-4 border-b border-line last:border-0`}
                  >
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-[15px] truncate">
                      {application.job?.title ?? "Job application"}
                    </div>
                    <div className="text-[13px] text-ink-soft mt-0.5 truncate">
                      {application.job?.employer?.name ?? "Employer"} · Applied {application.applied_at?.slice(0, 10) ?? "recently"}
                    </div>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[19px] font-semibold text-[#2F6D53]">
              Career DNA
            </h2>
            <Link
              href="/dashboard/career-dna"
              className="text-[13px] text-accent-dark font-medium hover:underline"
            >
              Full analysis
            </Link>
          </div>
          <CareerDNA
            dna={computeCareerDNA(
              profile?.skills ?? [],
              profile?.experience ?? [],
              profile?.certifications ?? [],
              3 // Assuming 3 years experience for the teaser
            )}
          />
        </div>
      </div>
    </div>
  );
}