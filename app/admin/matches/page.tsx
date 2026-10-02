import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Matches | Admin",
};

export default async function AdminMatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: matches } = await supabase
    .from("matches")
    .select("*, candidate:profiles(name), job:jobs(title)")
    .order("score", { ascending: false })
    .limit(50);

  const { count: totalMatches } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true });

  const labelColors: Record<string, string> = {
    strong: "bg-[#E8F5E9] text-[#2E7D32]",
    good: "bg-accent-soft text-accent-dark",
    potential: "bg-[#FFF3E0] text-[#E65100]",
    ineligible: "bg-danger-soft text-danger",
  };

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Match Management</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Review AI-generated match scores and algorithm quality.
        </p>
      </div>

      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-8">
        {[
          { label: "Total Matches", value: totalMatches ?? 0 },
          { label: "Strong (≥85)", value: (matches ?? []).filter((m: any) => m.score >= 85).length },
          { label: "Good (70–84)", value: (matches ?? []).filter((m: any) => m.score >= 70 && m.score < 85).length },
          { label: "Potential (<70)", value: (matches ?? []).filter((m: any) => m.score < 70).length },
        ].map((stat) => (
          <div key={stat.label} className="py-2">
            <div className="font-data text-[12px] uppercase tracking-wider text-muted-label">{stat.label}</div>
            <div className="font-display font-bold text-[32px] mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        <div className="py-4 border-b border-line grid grid-cols-[1fr_1fr_100px_120px] gap-4 text-[12px] font-data uppercase tracking-wider text-muted-label">
          <span>Candidate</span>
          <span>Job</span>
          <span>Score</span>
          <span>Label</span>
        </div>
        <div className="divide-y divide-line max-h-[55vh] overflow-y-auto">
          {(!matches || matches.length === 0) ? (
            <div className="px-6 py-10 text-center text-muted-label text-[14px]">
              No matches generated yet. Matching runs when candidates apply or when the engine is triggered.
            </div>
          ) : (
            (matches as any[]).map((m) => {
              const candidate = Array.isArray(m.candidate) ? m.candidate[0] : m.candidate;
              const job = Array.isArray(m.job) ? m.job[0] : m.job;
              return (
                <div key={m.id} className="px-6 py-3 grid grid-cols-[1fr_1fr_100px_120px] gap-4 items-center hover:bg-paper transition-colors">
                  <div className="font-medium text-[14px] truncate">{candidate?.name ?? "—"}</div>
                  <div className="text-[13.5px] text-muted-label truncate">{job?.title ?? "—"}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-paper rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${m.score}%` }} />
                    </div>
                    <span className="font-data font-bold text-[13px] w-8 text-right">{m.score}</span>
                  </div>
                  <span className={`inline-block text-[11.5px] font-data font-semibold px-2 py-0.5 rounded-full capitalize ${labelColors[m.match_label] ?? labelColors.potential}`}>
                    {m.match_label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
