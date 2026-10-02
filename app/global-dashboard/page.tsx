import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { getGlobalInterestStatus } from "@/lib/global-interest";

export const metadata: Metadata = {
  title: "Global Careers | Career Support",
};

type GlobalInterestRequest = {
  status: string;
  updated_at: string | null;
};

type CareerPlan = {
  career_goal: string | null;
  experience_area: string | null;
};

export default async function GlobalDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [globalResult, planResult] = await Promise.all([
    user
      ? supabase
          .from("global_interest_requests")
          .select("status, updated_at")
          .eq("candidate_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("career_plans")
          .select("career_goal, experience_area")
          .eq("candidate_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const request = globalResult.data as GlobalInterestRequest | null;
  const plan = planResult.data as CareerPlan | null;
  const status = request ? getGlobalInterestStatus(request.status) : null;

  return (
    <div className="max-w-[880px]">
      {/* Career Support breadcrumb — Phase 8 */}
      <div className="flex items-center gap-2 text-[13px] text-ink-soft mb-6">
        <Link href="/career-support" className="hover:text-[#2F6D53] transition-colors">
          Career Support
        </Link>
        <span>/</span>
        <span className="text-ink">Global Careers</span>
      </div>

      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Global Careers</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-6">
        Explore international roles and apply for funding when support could help.
      </p>

      {/* Career plan context — Phase 8 */}
      {plan && (
        <div className="mb-6 p-4 rounded-[12px] bg-accent-soft border border-[#2F6D53]/20 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <div className="font-data text-[11px] uppercase tracking-wider text-[#2F6D53]/60 mb-0.5">
              From your career plan
            </div>
            <div className="text-[14px] font-medium text-[#2F6D53]">
              {plan.experience_area ?? plan.career_goal ?? "Career goal set"}
            </div>
          </div>
          <Link
            href="/career-support/plan"
            className="text-[13px] text-accent-dark font-medium hover:underline shrink-0"
          >
            View career plan →
          </Link>
        </div>
      )}

      <section className="overflow-hidden rounded-[16px] bg-transparent">
        <div className="bg-[#2F6D53] p-10 rounded-[16px] text-white max-sm:p-6 mb-8">
          <span className="mb-3 block font-data text-[12px] uppercase tracking-wider text-[#9CB8AA]">
            Global career planning
          </span>
          <h2 className="max-w-[560px] font-display text-[28px] font-bold leading-tight max-sm:text-[24px]">
            Take the next step with clear information.
          </h2>
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-[#C7C9CC]">
            Start with the role and destination you are considering. Kaziin can review your
            preferences to provide you with the mobility and funding support you need to succeed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={request ? "/global-dashboard/applications" : "/global-dashboard/apply"}
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className: "border-white/40 text-white hover:border-white hover:bg-transparent",
              })}
            >
              {request ? "View application" : "Apply for global support"}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0 max-md:grid-cols-1">
          {[
            ["1", "Find a role", "Review the work, location, and employer requirements before deciding to proceed."],
            ["2", "Share preferences", "Record where you want to work and the practical support that may matter to you."],
            ["3", "Get supported", "We are dedicated to eradicating unemployment. If you qualify, we are ready to support your career journey."],
          ].map(([number, title, description], index) => (
            <div
              key={title}
              className={`py-6 pr-6 ${index < 2 ? "border-r border-line max-md:border-r-0 max-md:border-b" : ""} ${index > 0 ? "pl-6 max-md:pl-0" : ""}`}
            >
              <div className="font-data text-[12px] text-accent-dark">{number}</div>
              <h3 className="mt-2 font-semibold text-[15px]">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {request && status && (
        <section className="mt-12 pt-6 border-t border-line flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <div className="font-data text-[12px] text-ink-soft">Application status</div>
            <h2 className="mt-1 font-display text-[18px] font-semibold">{status.label}</h2>
            <p className="mt-1 text-[14px] text-ink-soft">{status.description}</p>
          </div>
          <Link href="/global-dashboard/applications" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View details
          </Link>
        </section>
      )}
    </div>
  );
}
