import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getJobBySlug, getJobs } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { JobApplyButton } from "@/components/jobs/job-apply-button";
import { MatchScore } from "@/components/matching/match-score";
import { computeMatch, type CandidateData, type JobData } from "@/lib/matching";
import { BackButton } from "@/components/ui/back-button";

export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} - ${job.employer.name}`,
    description: `${job.title} at ${job.employer.name}.`,
    openGraph: {
      title: `${job.title} - ${job.employer.name} | Kaziin`,
      description: `${job.title} at ${job.employer.name}.`,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const candidateId = user?.id;

  let matchResult = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      const candidateData: CandidateData = {
        skills: profile.skills || [],
        experienceYears: 3, // Assuming 3 for now
        location: profile.location || "",
        workPreferences: profile.work_preferences || [],
        employmentTypes: profile.employment_types || [],
        salaryMin: profile.salary_min,
        salaryMax: profile.salary_max,
        salaryCurrency: profile.salary_currency,
        availability: profile.availability || "open",
        certifications: profile.certifications || [],
        education: profile.education || [],
      };

      const jobData: JobData = {
        title: job.title,
        skills: job.skills || [],
        experienceLevel: job.experienceLevel || "",
        location: job.location,
        workArrangement: job.workArrangement,
        employmentType: job.employmentType,
        salaryMin: job.salary?.min,
        salaryMax: job.salary?.max,
        salaryCurrency: job.salary?.currency,
        requirements: job.requirements || [],
      };

      matchResult = computeMatch(candidateData, jobData);
    }
  }

  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <div className="max-w-[1160px] mx-auto px-10 max-md:px-5">
          <div className="pt-8">
            <BackButton href="/jobs" label="Back to Jobs" className="mb-3" />
            <nav className="font-data text-[13px] text-ink-soft">
              <Link href="/jobs" className="hover:text-ink">
                Jobs
              </Link>{" "}
              / {job.title}
            </nav>
          </div>

          <div className="pt-sp-3">
            <div className="flex justify-between items-start gap-sp-4 flex-wrap">
              <div>
                <h1 className="font-display font-bold text-[36px] max-sm:text-[26px]">
                  {job.title}
                </h1>
                <div className="mt-3 flex items-center gap-2.5 text-[15px] text-ink-soft flex-wrap">
                  <span>{job.employer.name}</span>
                  {job.verified ? <Badge variant="verified">Verified employer</Badge> : null}
                </div>
                <div className="mt-sp-3 flex gap-sp-3 flex-wrap font-data text-[14.5px] text-ink-soft">
                  <span>{job.location}</span>
                  <span>
                    {job.workArrangement === "hybrid"
                      ? "Hybrid"
                      : job.workArrangement === "remote"
                        ? "Remote"
                        : "On-site"}
                  </span>
                  {job.salary ? (
                    <span>
                      {job.salary.currency} {Math.round(job.salary.min / 1000)}K-
                      {Math.round(job.salary.max / 1000)}K
                    </span>
                  ) : null}
                  <span>{job.employmentType}</span>
                </div>
              </div>
              
              {matchResult && (
                <div className="shrink-0 text-right">
                  <MatchScore
                    score={matchResult.score}
                    label={matchResult.label}
                    size="lg"
                    factors={matchResult.factors}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-[1fr_340px] max-md:grid-cols-1 gap-12 items-start pb-16">
            <div>
              <section className="py-sp-5 border-t border-line first:border-t-0 first:pt-0">
                <h2 className="font-display text-[19px] font-semibold">
                  About the role
                </h2>
                <p className="text-[15.5px] text-ink-soft mt-2.5 leading-relaxed">
                  {job.description}
                </p>
              </section>

              {job.requirements.length > 0 ? (
                <section className="py-sp-5 border-t border-line">
                  <h2 className="font-display text-[19px] font-semibold">
                    Requirements
                  </h2>
                  <ul className="mt-3.5 flex flex-col gap-2.5">
                    {job.requirements.map((requirement) => (
                      <li key={requirement} className="text-[15px] text-ink-soft">
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {job.skills.length > 0 ? (
                <section className="py-sp-5 border-t border-line">
                  <h2 className="font-display text-[19px] font-semibold">
                    Skills
                  </h2>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[12px] font-data text-ink-soft border border-line rounded-[5px] px-2 py-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {job.salary || job.benefits?.length ? (
                <section className="py-sp-5 border-t border-line">
                  <h2 className="font-display text-[19px] font-semibold">
                    Compensation and benefits
                  </h2>
                  {job.salary ? (
                    <div className="mt-4 grid grid-cols-3 max-sm:grid-cols-1 gap-4 py-4 border-b border-line">
                      <div className="py-2">
                        <div className="font-data text-[12.5px] text-ink-soft">
                          Salary
                        </div>
                        <div className="mt-1.5 font-display font-semibold text-[16px]">
                          {job.salary.currency} {Math.round(job.salary.min / 1000)}K-
                          {Math.round(job.salary.max / 1000)}K
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="font-data text-[12.5px] text-ink-soft">
                          Type
                        </div>
                        <div className="mt-1.5 font-display font-semibold text-[16px] capitalize">
                          {job.employmentType}
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="font-data text-[12.5px] text-ink-soft">
                          Experience
                        </div>
                        <div className="mt-1.5 font-display font-semibold text-[16px]">
                          {job.experienceLevel}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {job.benefits?.length ? (
                    <ul className="mt-4 pl-4 text-[15.5px] text-ink-soft list-disc">
                      {job.benefits.map((benefit) => (
                        <li key={benefit} className="mt-1.5">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside className="sticky top-sp-4 flex flex-col pt-sp-4 border-t border-line lg:border-t-0 lg:pt-0">
              <div>
                <h2 className="font-display font-semibold text-[17px]">
                  Ready to apply?
                </h2>
                <p className="mt-2 text-[13.5px] text-ink-soft">
                  Submit your application with your Kaziin profile.
                </p>
              </div>

              <JobApplyButton
                jobId={job.id}
                jobSlug={job.slug}
                candidateId={candidateId}
              />

              <Link
                href="/dashboard/profile"
                className={buttonVariants({ variant: "ghost", className: "w-full mt-2.5 py-3.5 text-[15px] rounded-[9px]" })}
              >
                Update profile
              </Link>

              <div className="mt-5 pt-5 border-t border-line">
                <div className="font-data text-[13px] text-ink-soft mb-2.5">
                  Employer
                </div>
                <div className="font-display font-semibold text-[15px]">
                  {job.employer.name}
                </div>
                {job.employer.description ? (
                  <p className="mt-2 text-[13.5px] text-ink-soft">
                    {job.employer.description}
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
