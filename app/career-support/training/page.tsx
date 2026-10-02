import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Training & Courses | Career Support | Kaziin",
  description:
    "Find training programs, courses and certifications relevant to your career goal. Browse verified providers and enroll in training that builds the skills you need.",
};

type TrainingProgram = {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  location: string | null;
  country: string | null;
  duration_weeks: number | null;
  cost_amount: number | null;
  cost_currency: string | null;
  cost_subsidised: boolean;
  certification: string | null;
  industry: string | null;
  career_stage: string | null;
  next_start_date: string | null;
  available_spaces: number | null;
  verified: boolean;
  provider_id: string | null;
  training_providers: { name: string; verified: boolean } | null;
};

type CareerPlan = {
  career_goal: string | null;
  experience_area: string | null;
};

const MODE_LABELS: Record<string, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
  self_paced: "Self-paced",
};

const STAGE_LABELS: Record<string, string> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
  any: "All levels",
};

function formatCost(amount: number | null, currency: string | null, subsidised: boolean): string {
  if (subsidised) return "Subsidised";
  if (!amount) return "Contact provider";
  return `${currency ?? "USD"} ${amount.toLocaleString()}`;
}

export default async function TrainingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [programsResult, planResult, enrollmentsResult] = await Promise.all([
    supabase
      .from("training_programs")
      .select(
        "id, title, description, mode, location, country, duration_weeks, cost_amount, cost_currency, cost_subsidised, certification, industry, career_stage, next_start_date, available_spaces, verified, provider_id, training_providers(name, verified)"
      )
      .eq("active", true)
      .order("verified", { ascending: false })
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("career_plans")
          .select("career_goal, experience_area")
          .eq("candidate_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle<CareerPlan>()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("training_enrollments")
          .select("program_id, status")
          .eq("candidate_id", user.id)
      : Promise.resolve({ data: null }),
  ]);

  const programs = (programsResult.data ?? []) as TrainingProgram[];
  const plan = planResult.data as CareerPlan | null;
  const enrollments = enrollmentsResult.data ?? [];
  const enrolledProgramIds = new Set(enrollments.map((e: { program_id: string }) => e.program_id));

  return (
    <div className="min-h-screen py-16 max-md:py-10">
      <div className="max-w-[900px] mx-auto px-5">
        {/* Breadcrumb */}
        <Link
          href="/career-support"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-[#2F6D53] transition-colors mb-8"
        >
          
          Career Support
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
            Training & Courses
          </span>
          <h1 className="font-display font-bold text-[34px] max-sm:text-[26px] text-[#2F6D53] mt-1 leading-tight">
            Build the skills your career goal requires.
          </h1>
          <p className="mt-2 text-ink-soft text-[16px] leading-relaxed max-w-[600px]">
            Browse verified training programs and courses. When you complete a course, your Kaziin profile
            is updated automatically — no manual re-entry.
          </p>
        </div>

        {/* Career goal context */}
        {plan && (
          <div className="mb-10 p-4 rounded-[12px] bg-accent-soft border border-[#2F6D53]/20 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
            <div>
              <div className="font-data text-[11px] uppercase tracking-wider text-[#2F6D53]/60 mb-0.5">
                Showing training relevant to your career plan
              </div>
              <div className="text-[14px] font-medium text-[#2F6D53]">
                {plan.experience_area ?? plan.career_goal ?? "Your Career Goal"}
              </div>
            </div>
            <Link
              href="/career-support/plan"
              className="text-[13px] text-accent-dark font-medium hover:underline shrink-0"
            >
              View plan →
            </Link>
          </div>
        )}

        {programs.length === 0 ? (
          /* Empty state */
          <div className="py-16 text-center border border-line rounded-[16px]">
            <div className="text-[15px] font-semibold text-[#2F6D53] mb-2">
              No training programs available yet
            </div>
            <p className="text-[14px] text-ink-soft max-w-[400px] mx-auto leading-relaxed">
              We are building our training marketplace. Programs will appear here as they are added
              and verified by our team.
            </p>
            {!plan && (
              <div className="mt-6">
                <Link href="/career-support/assessment" className={buttonVariants({ size: "sm" })}>
                  Complete career assessment
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Program list */
          <div className="flex flex-col gap-4">
            {programs.map((program) => {
              const isEnrolled = enrolledProgramIds.has(program.id);
              const provider = program.training_providers;

              return (
                <div
                  key={program.id}
                  className="border border-line rounded-[14px] p-6 hover:border-[#2F6D53]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 max-sm:flex-col">
                    <div className="flex-1">
                      {/* Provider + verification */}
                      <div className="flex items-center gap-2 mb-2">
                        {provider && (
                          <span className="text-[12.5px] text-ink-soft font-medium">
                            {provider.name}
                          </span>
                        )}
                        {program.verified && (
                          <span className="inline-flex items-center gap-1 font-data text-[11px] text-accent-dark bg-accent-soft px-2 py-0.5 rounded-full">
                            
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="font-display font-semibold text-[17px] text-[#2F6D53]">
                        {program.title}
                      </h2>

                      {/* Description */}
                      {program.description && (
                        <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed line-clamp-2">
                          {program.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="font-data text-[11.5px] bg-paper border border-line px-2.5 py-1 rounded-full text-ink-soft">
                          {MODE_LABELS[program.mode] ?? program.mode}
                        </span>
                        {program.career_stage && (
                          <span className="font-data text-[11.5px] bg-paper border border-line px-2.5 py-1 rounded-full text-ink-soft">
                            {STAGE_LABELS[program.career_stage] ?? program.career_stage}
                          </span>
                        )}
                        {program.duration_weeks && (
                          <span className="font-data text-[11.5px] bg-paper border border-line px-2.5 py-1 rounded-full text-ink-soft">
                            {program.duration_weeks} week{program.duration_weeks !== 1 ? "s" : ""}
                          </span>
                        )}
                        {program.industry && (
                          <span className="font-data text-[11.5px] bg-paper border border-line px-2.5 py-1 rounded-full text-ink-soft">
                            {program.industry}
                          </span>
                        )}
                        {program.certification && (
                          <span className="font-data text-[11.5px] bg-accent-soft border border-[#2F6D53]/20 text-accent-dark px-2.5 py-1 rounded-full">
                             {program.certification}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right column: cost + CTA */}
                    <div className="text-right shrink-0 max-sm:text-left">
                      <div className="font-display font-bold text-[16px] text-[#2F6D53]">
                        {formatCost(program.cost_amount, program.cost_currency, program.cost_subsidised)}
                      </div>
                      {program.next_start_date && (
                        <div className="font-data text-[12px] text-ink-soft mt-0.5">
                          Starts {new Date(program.next_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      )}
                      {program.available_spaces !== null && (
                        <div className="font-data text-[12px] text-ink-soft mt-0.5">
                          {program.available_spaces} space{program.available_spaces !== 1 ? "s" : ""} left
                        </div>
                      )}
                      <div className="mt-3">
                        {isEnrolled ? (
                          <Link
                            href="/career-support/training/my-courses"
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                             Enrolled
                          </Link>
                        ) : (
                          <Link
                            href={
                              user
                                ? `/career-support/training/${program.id}`
                                : `/auth/signup?next=/career-support/training/${program.id}`
                            }
                            className={buttonVariants({ size: "sm" })}
                          >
                            View program
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer guidance */}
        <div className="mt-12 pt-8 border-t border-line">
          <p className="text-[13px] text-ink-soft leading-relaxed max-w-[600px]">
            Training programs listed on Kaziin are provided by verified third-party partners.
            employment outcomes, certification results, or program availability. Always verify
            requirements with the training provider before enrolling.
          </p>
        </div>
      </div>
    </div>
  );
}
