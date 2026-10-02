import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Career Plans | Admin",
};

type CareerPlan = {
  id: string;
  career_goal: string | null;
  employment_status: string | null;
  experience_area: string | null;
  location: string | null;
  status: string;
  updated_at: string;
  profiles: { name: string; email: string } | null;
};

const GOAL_LABELS: Record<string, string> = {
  find_first_job: "Find first job",
  change_career: "Change career",
  advance_career: "Advance career",
  learn_new_skill: "Learn new skill",
  get_certified: "Get certified",
  start_skilled_trade: "Skilled trade",
  work_internationally: "Work internationally",
  work_remotely: "Work remotely",
  become_self_employed: "Self-employed",
};

export default async function AdminCareerPlansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data, count } = await supabase
    .from("career_plans")
    .select(
      "id, career_goal, employment_status, experience_area, location, status, updated_at, profiles(name, email)",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .limit(50);

  const plans = (data ?? []) as CareerPlan[];

  const activePlans = plans.filter((p) => p.status === "active");
  const internationalPlans = plans.filter((p) => p.career_goal === "work_internationally");

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">
          Admin → Career Support
        </span>
        <h1 className="font-display font-bold text-[28px] mt-1">Career Plans</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          {count ?? 0} total career plans across all candidates.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 mb-8">
        {[
          { label: "Total plans", value: count ?? 0 },
          { label: "Active plans", value: activePlans.length },
          { label: "International goal", value: internationalPlans.length },
        ].map((stat) => (
          <div key={stat.label} className="border border-line rounded-[12px] p-4">
            <div className="font-data text-[11.5px] text-muted-label uppercase tracking-wide">
              {stat.label}
            </div>
            <div className="font-display font-bold text-[26px] mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Plans list */}
      <div className="border border-line rounded-[12px] divide-y divide-line">
        {plans.length === 0 ? (
          <div className="p-8 text-center text-[14px] text-muted-label">
            No career plans created yet.
          </div>
        ) : (
          plans.map((plan) => {
            const candidate = Array.isArray(plan.profiles) ? plan.profiles[0] : plan.profiles;
            return (
              <div key={plan.id} className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[14.5px] truncate">
                    {candidate?.name ?? "Candidate"}
                  </div>
                  <div className="text-[12.5px] text-muted-label mt-0.5 truncate">
                    {candidate?.email ?? ""}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.career_goal && (
                      <span className="font-data text-[11px] bg-accent-soft text-accent-dark px-2 py-0.5 rounded-full border border-[#2F6D53]/20">
                        {GOAL_LABELS[plan.career_goal] ?? plan.career_goal}
                      </span>
                    )}
                    {plan.experience_area && (
                      <span className="font-data text-[11px] bg-paper text-ink-soft px-2 py-0.5 rounded-full border border-line">
                        {plan.experience_area}
                      </span>
                    )}
                    {plan.location && (
                      <span className="font-data text-[11px] bg-paper text-ink-soft px-2 py-0.5 rounded-full border border-line">
                        {plan.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`font-data text-[11px] px-2.5 py-1 rounded-full border ${
                      plan.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {plan.status}
                  </span>
                  <div className="font-data text-[11.5px] text-muted-label mt-1.5">
                    {new Date(plan.updated_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
