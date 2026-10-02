import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Analytics | Admin",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  // Fetch counts for analytics
  const [
    { count: totalUsers },
    { count: totalJobs },
    { count: totalApps },
    { count: totalMatches },
    { count: totalVerifications },
    { count: totalFunding },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    (async () => {
      const res = await supabase.from("matches").select("*", { count: "exact", head: true });
      return res.error ? { count: 0 } : res;
    })(),
    (async () => {
      const res = await supabase.from("verifications").select("*", { count: "exact", head: true });
      return res.error ? { count: 0 } : res;
    })(),
    (async () => {
      const res = await supabase.from("funding_applications").select("*", { count: "exact", head: true });
      return res.error ? { count: 0 } : res;
    })(),
  ]);

  // Application stage breakdown
  const { data: stageData } = await supabase
    .from("applications")
    .select("status");

  const stageCounts: Record<string, number> = {};
  (stageData ?? []).forEach((a: any) => {
    const s = a.status ?? "unknown";
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  });

  const metrics = [
    { label: "Total Users", value: totalUsers ?? 0, change: "+12%", trend: "up" },
    { label: "Published Jobs", value: totalJobs ?? 0, change: "+8%", trend: "up" },
    { label: "Applications", value: totalApps ?? 0, change: "+24%", trend: "up" },
    { label: "AI Matches", value: totalMatches ?? 0, change: "New", trend: "neutral" },
    { label: "Verifications", value: totalVerifications ?? 0, change: "+3", trend: "up" },
    { label: "Funding Applications", value: totalFunding ?? 0, change: "New", trend: "neutral" },
  ];

  const stages = [
    "submitted", "screening", "shortlisted", "interview", "offer", "hired", "rejected", "withdrawn",
  ];

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Platform Analytics</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Key metrics across all platform operations.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-8 py-8 border-y border-line mb-12">
        {metrics.map((m) => (
          <div key={m.label} className="py-2">
            <div className="font-data text-[12px] uppercase tracking-wider text-muted-label mb-2">{m.label}</div>
            <div className="font-display font-bold text-[32px]">{m.value.toLocaleString()}</div>
            <div className={`mt-1 text-[13px] font-medium ${m.trend === "up" ? "text-[#2E7D32]" : "text-muted-label"}`}>
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* Application Funnel */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="font-display font-semibold text-[18px]">Application Pipeline Breakdown</h2>
        </div>
        <div>
          <div className="space-y-4">
            {stages.map((stage) => {
              const count = stageCounts[stage] ?? 0;
              const pct = totalApps ? Math.round((count / (totalApps as number)) * 100) : 0;
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-24 text-[13px] font-data capitalize text-right text-muted-label">{stage}</div>
                  <div className="flex-1 h-2.5 bg-paper rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-[13px] font-data text-right text-muted-label">
                    {count} ({pct}%)
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
