import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Support & Funding | Career Support | Kaziin",
  description:
    "Discover career support and funding opportunities tailored to your career goals. Kaziin connects you with the right resources to accelerate your journey.",
};

type FundingProgram = {
  id: string;
  name: string;
  provider: string | null;
  description: string | null;
  max_support: number | null;
  currency: string | null;
  active: boolean;
};

type CareerPlan = {
  career_goal: string | null;
  experience_area: string | null;
};

type FundingApplication = {
  id: string;
  status: string;
  applied_at: string | null;
  requested_amount: number | null;
};

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

const SUPPORT_CATEGORIES = [
  {
    title: "Training support",
    description: "Support for courses, vocational training and professional certifications.",
    icon: "",
  },
  {
    title: "Certification & examination",
    description: "Help covering the cost of professional exams and licensing fees.",
    icon: "",
  },
  {
    title: "Career preparation",
    description: "CV, interview coaching, professional development and job search support.",
    icon: "",
  },
  {
    title: "International career expenses",
    description: "Support for relocation, credential recognition and mobility preparation.",
    icon: "",
  },
  {
    title: "Equipment & tools",
    description: "Assistance with tools and equipment needed to practice a trade or profession.",
    icon: "",
  },
  {
    title: "Transport & attendance",
    description: "Support for transport costs related to training or work attendance.",
    icon: "",
  },
] as const;

function formatCurrency(amount: number | null, currency: string | null) {
  if (!amount) return null;
  return `${currency ?? "USD"} ${amount.toLocaleString()}`;
}

export default async function CareerSupportFundingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parallel data fetching
  const [planResult, programsResult, applicationResult] = await Promise.all([
    user
      ? supabase
          .from("career_plans")
          .select("career_goal, experience_area")
          .eq("candidate_id", user.id)
          .eq("status", "active")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle<CareerPlan>()
      : Promise.resolve({ data: null }),
    supabase
      .from("funding_programs")
      .select("id, name, provider, description, max_support, currency, active")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("funding_applications")
          .select("id, status, applied_at, requested_amount")
          .eq("candidate_id", user.id)
          .order("applied_at", { ascending: false })
          .limit(1)
          .maybeSingle<FundingApplication>()
      : Promise.resolve({ data: null }),
  ]);

  const plan = planResult.data as CareerPlan | null;
  const programs = (programsResult.data ?? []) as FundingProgram[];
  const existingApplication = applicationResult.data as FundingApplication | null;

  const goalLabel = plan?.career_goal ? GOAL_LABELS[plan.career_goal] ?? plan.career_goal : null;

  return (
    <div className="min-h-screen py-16 max-md:py-10">
      <div className="max-w-[820px] mx-auto px-5">
        {/* Breadcrumb */}
        <BackButton href="/career-support" label="Career Support" className="mb-8" />

        {/* Header */}
        <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
          Support & Funding
        </span>
        <h1 className="font-display font-bold text-[34px] max-sm:text-[26px] text-[#2F6D53] mt-1 leading-tight mb-3">
          Unlock the support your career deserves
        </h1>
        <p className="text-ink-soft text-[16px] leading-relaxed max-w-[620px] mb-10">
          Kaziin connects you with tailored career support and funding opportunities designed to
          accelerate your journey. Whether it's training, certification, or relocation — we'll help
          you find the right resources.
        </p>

        {/* Career goal context — shown if plan exists */}
        {plan && goalLabel && (
          <div className="mb-10 p-5 rounded-[14px] bg-accent-soft border border-[#2F6D53]/20">
            <div className="font-data text-[11px] uppercase tracking-wider text-[#2F6D53]/60 mb-1">
              Your career goal
            </div>
            <div className="font-display font-semibold text-[16px] text-[#2F6D53]">{goalLabel}</div>
            {plan.experience_area && (
              <div className="text-[13.5px] text-ink-soft mt-1">{plan.experience_area}</div>
            )}
            <Link
              href="/career-support/plan"
              className="mt-3 inline-flex items-center gap-1 text-[13px] text-accent-dark font-medium hover:underline"
            >
              View career plan →
            </Link>
          </div>
        )}

        {/* No plan — prompt to complete assessment */}
        {!plan && user && (
          <div className="mb-10 p-5 rounded-[14px] border border-line">
            <div className="font-display font-semibold text-[15px] mb-1">
              Complete your career assessment first
            </div>
            <p className="text-[14px] text-ink-soft mb-3">
              Your career goal helps us show you the most relevant support. The assessment takes a few minutes.
            </p>
            <Link href="/career-support/assessment" className={buttonVariants({ size: "sm" })}>
              Start assessment
            </Link>
          </div>
        )}

        {/* Existing application status */}
        {existingApplication && (
          <div className="mb-10 p-5 rounded-[14px] border border-line flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
            <div>
              <div className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1">
                Your application
              </div>
              <div className="font-display font-semibold text-[16px]">
                {existingApplication.status.replace(/_/g, " ")}
              </div>
              {existingApplication.applied_at && (
                <div className="text-[13px] text-ink-soft mt-0.5">
                  Applied {new Date(existingApplication.applied_at).toLocaleDateString("en-GB")}
                  {existingApplication.requested_amount
                    ? ` · ${existingApplication.requested_amount.toLocaleString()} requested`
                    : ""}
                </div>
              )}
            </div>
            <Link
              href="/global-dashboard/applications"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View details
            </Link>
          </div>
        )}

        <div className="grid grid-cols-[1.2fr_1fr] max-md:grid-cols-1 gap-8">
          {/* Support categories */}
          <div>
            <h2 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-5">
              Types of support
            </h2>
            <div className="flex flex-col gap-0">
              {SUPPORT_CATEGORIES.map((cat, i) => (
                <div
                  key={cat.title}
                  className="flex items-start gap-4 py-4 border-b border-line last:border-0"
                >
                  <span className="text-[20px] shrink-0 mt-0.5">{cat.icon}</span>
                  <div>
                    <div className="font-display font-semibold text-[14.5px]">{cat.title}</div>
                    <div className="text-[13px] text-ink-soft mt-1 leading-relaxed">{cat.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-line">
              <p className="text-[12.5px] text-ink-soft leading-relaxed">
                Support is tailored to your career goal and circumstances. Our team reviews each
                application to match you with the best available options.
              </p>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h2 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-5">
              Active programs
            </h2>

            {programs.length === 0 ? (
              <div className="py-8 text-center border border-line rounded-[14px]">
                <div className="text-[14px] text-ink-soft">
                  New programs are being added regularly.
                </div>
                <p className="text-[13px] text-ink-soft mt-2 max-w-[280px] mx-auto leading-relaxed">
                  Complete your career assessment so we can notify you when programs matching your goals become available.
                </p>
                <Link
                  href="/career-support/assessment"
                  className="mt-4 inline-block text-[13px] text-accent-dark font-medium hover:underline"
                >
                  Take the Career Assessment →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    className="border border-line rounded-[12px] p-5 hover:border-[#2F6D53]/30 transition-colors"
                  >
                    <div className="font-display font-semibold text-[15px]">{program.name}</div>
                    {program.provider && (
                      <div className="text-[12.5px] text-ink-soft mt-0.5">{program.provider}</div>
                    )}
                    {program.description && (
                      <p className="text-[13px] text-ink-soft mt-2 leading-relaxed">{program.description}</p>
                    )}
                    {program.max_support && (
                      <div className="mt-3 font-data text-[12px] text-accent-dark">
                        Up to {formatCurrency(program.max_support, program.currency)}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-4">
                  <Link
                    href={user ? "/career-support/apply" : "/auth/signup?next=/career-support/apply"}
                    className={buttonVariants({ size: "sm" })}
                  >
                    {existingApplication ? "View my application" : "Apply for Career Funding"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer guidance */}
        <div className="mt-12 pt-8 border-t border-line grid grid-cols-3 max-sm:grid-cols-1 gap-6">
          {[
            {
              label: "Your career, your way",
              description:
                "Kaziin is built around your goals. Every support option is matched to your personal career plan.",
            },
            {
              label: "Trusted by thousands",
              description:
                "Join a growing community of professionals who have accelerated their careers with Kaziin support.",
            },
            {
              label: "Transparent at every step",
              description:
                "Track your application status in real time. Every step, requirement, and update is visible to you.",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="font-display font-semibold text-[14px] text-[#2F6D53] mb-1">{item.label}</div>
              <p className="text-[13px] text-ink-soft leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
