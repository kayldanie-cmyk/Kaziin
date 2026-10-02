import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Career Assessments | Admin",
};

type Assessment = {
  id: string;
  employment_status: string;
  education_level: string;
  career_goal: string;
  experience_area: string;
  location: string | null;
  work_preferences: string[] | null;
  created_at: string;
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

export default async function AdminAssessmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data, count } = await supabase
    .from("career_assessments")
    .select("id, employment_status, education_level, career_goal, experience_area, location, work_preferences, created_at, profiles(name, email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .limit(50);

  const assessments = (data ?? []) as unknown as Assessment[];

  // Quick goal breakdown
  const goalCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    const label = GOAL_LABELS[a.career_goal] ?? a.career_goal;
    goalCounts[label] = (goalCounts[label] ?? 0) + 1;
  });
  const topGoals = Object.entries(goalCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">
          Admin → Career Support
        </span>
        <h1 className="font-display font-bold text-[28px] mt-1">Career Assessments</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          {count ?? 0} total assessments submitted by candidates.
        </p>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] max-md:grid-cols-1 gap-8">
        {/* Assessment list */}
        <div>
          <div className="border border-line rounded-[12px] divide-y divide-line">
            {assessments.length === 0 ? (
              <div className="p-8 text-center text-[14px] text-muted-label">
                No assessments submitted yet.
              </div>
            ) : (
              assessments.map((a) => {
                const candidate = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
                return (
                  <div key={a.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[14.5px] truncate">
                          {candidate?.name ?? "Candidate"}
                        </div>
                        <div className="text-[12.5px] text-muted-label mt-0.5 truncate">
                          {candidate?.email ?? ""}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="font-data text-[11px] bg-accent-soft text-accent-dark px-2 py-0.5 rounded-full border border-[#2F6D53]/20">
                            {GOAL_LABELS[a.career_goal] ?? a.career_goal}
                          </span>
                          <span className="font-data text-[11px] bg-paper text-ink-soft px-2 py-0.5 rounded-full border border-line">
                            {a.experience_area}
                          </span>
                          {a.location && (
                            <span className="font-data text-[11px] bg-paper text-ink-soft px-2 py-0.5 rounded-full border border-line">
                              {a.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-data text-[11.5px] text-muted-label">
                          {new Date(a.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Goal breakdown */}
        <div>
          <h2 className="font-display font-semibold text-[18px] mb-4">Goal breakdown</h2>
          {topGoals.length === 0 ? (
            <div className="p-6 border border-line rounded-[12px] text-[14px] text-muted-label text-center">
              No data yet.
            </div>
          ) : (
            <div className="border border-line rounded-[12px] divide-y divide-line">
              {topGoals.map(([goal, count]) => (
                <div key={goal} className="p-4 flex items-center justify-between gap-3">
                  <span className="text-[14px]">{goal}</span>
                  <span className="font-data font-bold text-[16px] text-[#2F6D53]">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}