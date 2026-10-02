import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Matching Config | Admin",
};

export default async function AdminConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: weights } = await supabase
    .from("matching_config")
    .select("*")
    .order("weight", { ascending: false });

  const totalWeight = (weights ?? []).reduce((sum: number, w: any) => sum + (w.weight ?? 0), 0);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Matching Configuration</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Configure the weights used by the candidate-to-job matching algorithm (Blueprint §43).
        </p>
      </div>

      <div className="grid grid-cols-[1fr_280px] max-lg:grid-cols-1 gap-8">
        {/* Weight Editor */}
        <div className="flex flex-col">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-display font-semibold text-[18px]">Scoring Weights</h2>
            <div className="flex items-center gap-2">
              <span className="font-data text-[13px] text-muted-label">Total:</span>
              <span className={`font-data font-semibold text-[14px] ${Math.abs(totalWeight - 1) < 0.01 ? "text-[#2E7D32]" : "text-danger"}`}>
                {Math.round(totalWeight * 100)}%
              </span>
            </div>
          </div>
          <div className="divide-y divide-line">
            {(!weights || weights.length === 0) ? (
              <div className="px-6 py-10 text-center text-muted-label text-[14px]">
                No weights found. Run migration 012_matching_weights.sql to seed defaults.
              </div>
            ) : (
              (weights as any[]).map((w) => (
                <div key={w.factor} className="px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-[14.5px] capitalize">{w.factor.replace(/_/g, " ")}</div>
                      <div className="text-[13px] text-muted-label">{w.description}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-data font-bold text-[18px] w-12 text-right">
                        {Math.round(w.weight * 100)}
                      </span>
                      <span className="text-muted-label text-[14px]">%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-paper rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.round(w.weight * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="py-2">
            <h3 className="font-display font-semibold text-[16px] mb-3">Blueprint Reference</h3>
            <p className="text-[13.5px] text-muted-label leading-relaxed">
              Weights sum to 100%. The matching algorithm multiplies each dimension by its weight to compute a candidate's final score (0–98).
            </p>
            <div className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-label">Skills</span>
                <span className="font-medium">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-label">Experience</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-label">Semantic</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-label">Location</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-label">Salary</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-label">Availability</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-label">Education</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] bg-[#FFF3E0] border border-[#E65100]/20 p-5">
            <h3 className="font-semibold text-[14px] text-[#E65100] mb-2">️ Important</h3>
            <p className="text-[13px] text-[#E65100]/80">
              Changes to weights require a full re-scoring of all matches. Weights must sum to exactly 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
