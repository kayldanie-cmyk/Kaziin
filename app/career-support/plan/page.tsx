import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "My Career Plan | Kaziin",
  description: "Your personal career plan — goal, skills gap, recommended next steps and journey progress.",
};

/* ── helpers ───────────────────────────────────────────── */

const GOAL_LABELS: Record<string, string> = {
  find_first_job: "Find my first job",
  change_career: "Change career direction",
  advance_career: "Advance in my current career",
  learn_new_skill: "Learn a new skill or specialize",
  get_certified: "Get certified or licensed",
  start_skilled_trade: "Start a skilled trade",
  work_internationally: "Work internationally",
  work_remotely: "Work remotely",
  become_self_employed: "Become self-employed",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  employed_full_time: "Employed full-time",
  employed_part_time: "Employed part-time",
  self_employed: "Self-employed",
  unemployed_seeking: "Unemployed — seeking work",
  unemployed_not_seeking: "Not currently seeking",
  student: "Currently studying",
  returner: "Returning to work",
};

const EDUCATION_LABELS: Record<string, string> = {
  no_formal: "No formal qualifications",
  secondary: "Secondary school",
  higher_secondary: "A-levels / Diploma",
  vocational: "Vocational / Trade certificate",
  undergraduate: "Bachelor's degree",
  postgraduate: "Master's or higher",
  professional: "Professional qualification",
};

type CareerPlan = {
  id: string;
  career_goal: string | null;
  employment_status: string | null;
  education_level: string | null;
  experience_area: string | null;
  location: string | null;
  work_preferences: string[] | null;
  status: string | null;
  updated_at: string | null;
};

/* ── journey stages ──────────────────────────────────────── */

function getJourneyStages(goal: string | null) {
  const base = [
    { key: "assessment", label: "Career Assessment" },
    { key: "plan", label: "Career Plan" },
  ];

  const goalSpecific: Record<string, { key: string; label: string }[]> = {
    find_first_job: [
      { key: "skills", label: "Skills Review" },
      { key: "jobs", label: "Job Matching" },
      { key: "application", label: "Application" },
      { key: "employment", label: "Employment" },
    ],
    change_career: [
      { key: "skills_gap", label: "Skills Gap Analysis" },
      { key: "training", label: "Training" },
      { key: "jobs", label: "Job Matching" },
      { key: "employment", label: "Employment" },
    ],
    work_internationally: [
      { key: "global_readiness", label: "Global Readiness" },
      { key: "support", label: "Support & Funding" },
      { key: "global", label: "Global Opportunities" },
      { key: "employment", label: "Employment" },
    ],
    default: [
      { key: "skills_gap", label: "Skills Gap" },
      { key: "training", label: "Training / Certification" },
      { key: "support", label: "Support & Funding" },
      { key: "jobs", label: "Job Matching" },
      { key: "employment", label: "Employment" },
    ],
  };

  const specific = goalSpecific[goal ?? ""] ?? goalSpecific.default;
  return [...base, ...specific];
}

/* ── next actions derived from plan ────────────────────── */

function getNextActions(plan: CareerPlan) {
  const actions: { label: string; href: string; primary?: boolean }[] = [];

  if (plan.career_goal === "work_internationally") {
    actions.push({ label: "Explore Global Careers", href: "/global-dashboard", primary: true });
    actions.push({ label: "Apply for Career Support", href: "/career-support/apply" });
    actions.push({ label: "Explore Support & Funding", href: "/career-support/funding" });
  } else {
    actions.push({ label: "View matched jobs", href: "/dashboard/jobs", primary: true });
    actions.push({ label: "Apply for Career Support", href: "/career-support/apply" });
    actions.push({ label: "Explore Support & Funding", href: "/career-support/funding" });
  }

  actions.push({ label: "Update assessment", href: "/career-support/assessment" });
  return actions;
}

/* ── page ──────────────────────────────────────────────── */

export default async function CareerPlanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?next=/career-support/plan");
  }

  // Fetch career plan
  const { data: plan } = await supabase
    .from("career_plans")
    .select("id, career_goal, employment_status, education_level, experience_area, location, work_preferences, status, updated_at")
    .eq("candidate_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<CareerPlan>();

  // No plan yet
  if (!plan) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-[680px] mx-auto px-5">
          <BackButton href="/career-support" label="Career Support" className="mb-8" />

          <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
            My Career Plan
          </span>
          <h1 className="font-display font-bold text-[34px] max-sm:text-[26px] text-[#2F6D53] mt-2">
            Your career plan starts here.
          </h1>
          <p className="mt-3 text-ink-soft text-[16px] leading-relaxed max-w-[520px]">
            Take the career assessment to create your personal plan — career goal, recommended next steps
            and relevant support.
          </p>

          <div className="mt-8 flex gap-3 flex-wrap">
            <Link href="/career-support/assessment" className={buttonVariants({ size: "lg" })}>
              Start Career Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const goalLabel = GOAL_LABELS[plan.career_goal ?? ""] ?? plan.career_goal ?? "—";
  const journeyStages = getJourneyStages(plan.career_goal);
  const nextActions = getNextActions(plan);
  // Stages 0 and 1 (assessment + plan) are complete
  const completedStages = 2;

  return (
    <div className="min-h-screen py-16 max-md:py-10">
      <div className="max-w-[820px] mx-auto px-5">
        {/* Breadcrumb */}
        <BackButton href="/career-support" label="Career Support" className="mb-8" />

        <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
          <div>
            <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
              My Career Plan
            </span>
            <h1 className="font-display font-bold text-[34px] max-sm:text-[26px] text-[#2F6D53] mt-1 leading-tight">
              {goalLabel}
            </h1>
            {plan.updated_at && (
              <p className="text-[12.5px] text-ink-soft mt-1 font-data">
                Last updated {new Date(plan.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <Link
            href="/career-support/assessment"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Update assessment
          </Link>
        </div>

        {/* Grid: plan details + next actions */}
        <div className="grid grid-cols-[1.4fr_1fr] max-md:grid-cols-1 gap-8 mb-12">
          {/* Plan details */}
          <div className="border border-line rounded-[14px] p-6">
            <h2 className="font-display font-semibold text-[16px] text-[#2F6D53] mb-4">
              Your profile
            </h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Career goal",
                  value: goalLabel,
                },
                {
                  label: "Current status",
                  value: EMPLOYMENT_LABELS[plan.employment_status ?? ""] ?? plan.employment_status ?? "—",
                },
                {
                  label: "Education",
                  value: EDUCATION_LABELS[plan.education_level ?? ""] ?? plan.education_level ?? "—",
                },
                {
                  label: "Sector / area",
                  value: plan.experience_area ?? "—",
                },
                {
                  label: "Location",
                  value: plan.location ?? "—",
                },
                {
                  label: "Work preferences",
                  value: (plan.work_preferences ?? [])
                    .map((p) => p.replace(/_/g, "-"))
                    .join(", ") || "—",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 py-2.5 border-b border-line last:border-0">
                  <span className="text-[12.5px] font-data text-ink-soft w-[130px] shrink-0">{label}</span>
                  <span className="text-[14px] font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next actions */}
          <div className="border border-line rounded-[14px] p-6">
            <h2 className="font-display font-semibold text-[16px] text-[#2F6D53] mb-4">
              Next steps
            </h2>
            <div className="flex flex-col gap-3">
              {nextActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[10px] text-[13.5px] font-medium transition-colors ${
                    action.primary
                      ? "bg-[#2F6D53] text-white hover:bg-[#2F6D53]/90"
                      : "border border-line text-[#2F6D53] hover:border-[#2F6D53]/40"
                  }`}
                >
                  <span>{action.label}</span>
                  
                </Link>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-line">
              <p className="text-[12px] text-ink-soft leading-relaxed">
                Next steps are based on your career goal and current profile. Recommendations will become
                more specific as your profile is updated.
              </p>
            </div>
          </div>
        </div>

        {/* Journey tracker */}
        <div>
          <h2 className="font-display font-semibold text-[18px] text-[#2F6D53] mb-6">
            Your journey
          </h2>
          <div className="flex flex-col gap-0">
            {journeyStages.map((stage, index) => {
              const isComplete = index < completedStages;
              const isCurrent = index === completedStages;
              return (
                <div
                  key={stage.key}
                  className="flex items-start gap-4 py-4 border-b border-line last:border-0"
                >
                  {/* Icon */}
                  <div className="flex flex-col items-center shrink-0 w-7">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border-2 ${
                        isComplete
                          ? "bg-[#2F6D53] border-[#2F6D53] text-white"
                          : isCurrent
                          ? "bg-paper border-[#2F6D53] text-[#2F6D53]"
                          : "bg-paper border-line text-ink-soft"
                      }`}
                    >
                      {isComplete ? (null) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="flex-1 pt-0.5">
                    <span
                      className={`text-[14.5px] font-semibold ${
                        isComplete
                          ? "text-[#2F6D53]"
                          : isCurrent
                          ? "text-ink"
                          : "text-ink-soft"
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isCurrent && (
                      <span className="ml-2 inline-block font-data text-[11px] bg-accent-soft text-[#2F6D53] px-2 py-0.5 rounded-full align-middle">
                        Current stage
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    <span
                      className={`font-data text-[12px] ${
                        isComplete ? "text-[#2F6D53]" : isCurrent ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {isComplete ? " Done" : isCurrent ? "● In progress" : "○ Upcoming"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
