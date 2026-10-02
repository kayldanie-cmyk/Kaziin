import Link from "next/link";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates",
};

type ApplicantRow = {
  id: string;
  status: string | null;
  applied_at: string | null;
  candidate: {
    id: string;
    name: string | null;
    headline: string | null;
    location: string | null;
    availability: string | null;
    readiness_score: number | null;
  } | null;
  job: {
    id: string;
    title: string | null;
    employer_id: string | null;
  } | null;
};

type ApplicantSelectRow = Omit<ApplicantRow, "candidate" | "job"> & {
  candidate: ApplicantRow["candidate"] | ApplicantRow["candidate"][];
  job: ApplicantRow["job"] | ApplicantRow["job"][];
};

async function getApplicants(query: string) {
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

  let applicationsQuery = supabase
    .from("applications")
    .select(
      "id, status, applied_at, candidate:profiles(id, name, headline, location, availability, readiness_score), job:jobs!inner(id, title, employer_id)"
    )
    .order("applied_at", { ascending: false });

  if (profile.role !== "admin") {
    if (!profile.employer_id) return [];
    applicationsQuery = applicationsQuery.eq("job.employer_id", profile.employer_id);
  }

  const { data } = await applicationsQuery;
  const applications = ((data ?? []) as ApplicantSelectRow[]).map((application) => ({
    ...application,
    candidate: Array.isArray(application.candidate)
      ? application.candidate[0] ?? null
      : application.candidate,
    job: Array.isArray(application.job)
      ? application.job[0] ?? null
      : application.job,
  }));
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return applications;

  return applications.filter((application) => {
    const searchable = [
      application.candidate?.name,
      application.candidate?.headline,
      application.candidate?.location,
      application.candidate?.availability,
      application.job?.title,
      application.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

export default async function HireCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const applicants = await getApplicants(query);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-[26px] text-accent">Candidates</h1>
        <p className="mt-1 text-ink-soft text-[15px]">
          Review candidates who have applied to jobs in your workspace.
        </p>
      </div>

      <form action="/hire/candidates" className="flex gap-3 mb-8 flex-wrap">
        <div className="flex-1 min-w-[280px] flex items-center gap-2.5 pb-2 border-b border-line px-2">
          
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name, role, location, job, or status"
            className="border-none outline-none bg-transparent text-[15px] w-full placeholder:text-ink-soft/60"
            aria-label="Search applicants"
          />
        </div>
        <button type="submit" className={buttonVariants()}>
          Search
        </button>
      </form>

      <div className="text-[13px] text-ink-soft font-data mb-4">
        {applicants.length} applicant{applicants.length === 1 ? "" : "s"} found
      </div>

      {applicants.length === 0 ? (
        <div className="py-10 text-center">
          <h2 className="font-display font-semibold text-[18px]">No applicants yet</h2>
          <p className="mt-2 text-[14.5px] text-ink-soft">
            Candidates appear here after they apply to jobs connected to your employer account.
          </p>
          <Link href="/hire/jobs" className={buttonVariants({ variant: "ghost", className: "mt-5" })}>
            View job posts
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {applicants.map((application) => {
            const candidate = application.candidate;
            const readinessScore = candidate?.readiness_score ?? 0;
            const candidateName = candidate?.name ?? "Unnamed candidate";

            return (
              <div
                key={application.id}
                className="py-5 border-b border-line last:border-0 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[18px] shrink-0">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-[16px] flex items-center gap-2 flex-wrap">
                      {candidateName}
                      {candidate?.readiness_score ? <Badge variant="verified" className="text-[10.5px]">Profile ready</Badge> : null}
                    </div>
                    <div className="text-ink-soft text-[14px] mt-0.5">
                      {candidate?.headline ?? "Candidate profile"}
                    </div>
                    <div className="mt-2 flex gap-3 font-data text-[13px] text-ink-soft flex-wrap">
                      <span>{candidate?.location ?? "Location not set"}</span>
                      <span>{candidate?.availability ?? "Availability not set"}</span>
                      <span>Applied {application.applied_at?.slice(0, 10) ?? "recently"}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 max-w-[260px]">
                      <span className="font-data text-[11.5px] text-ink-soft shrink-0">Readiness</span>
                      <ProgressBar
                        value={readinessScore}
                        height={6}
                        animate={false}
                        className="flex-1"
                      />
                      <span className="font-data text-[11.5px] text-ink-soft shrink-0">
                        {readinessScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-3">
                  <StatusBadge status={application.status ?? "submitted"} />
                  <div className="text-[13px] text-ink-soft font-data">
                    {application.job?.title ?? "Job application"}
                  </div>
                  {application.job?.id ? (
                    <Link href={`/hire/shortlists/${application.job.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      Review application
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
