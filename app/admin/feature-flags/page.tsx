import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Feature Flags | Admin",
};

export default async function AdminFeatureFlagsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: flags } = await supabase
    .from("feature_flags")
    .select("*")
    .order("key");

  // Default flags if none seeded
  const defaultFlags = [
    { key: "semantic_matching", enabled: false, description: "Enable pgvector-based semantic similarity matching" },
    { key: "ai_cv_parsing", enabled: false, description: "Enable AI-powered CV parsing on upload" },
    { key: "ai_job_analysis", enabled: false, description: "Enable AI-powered job requirement extraction" },
    { key: "realtime_messaging", enabled: false, description: "Enable Supabase Realtime for messaging" },
    { key: "global_opportunities", enabled: true, description: "Show global career opportunities section" },
    { key: "funding_applications", enabled: true, description: "Allow candidates to submit funding applications" },
    { key: "career_dna", enabled: true, description: "Show Career DNA analysis to candidates" },
    { key: "opportunity_radar", enabled: true, description: "Show opportunity radar on candidate dashboard" },
  ];

  const displayFlags = (flags && flags.length > 0) ? flags : defaultFlags;

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Feature Flags</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Toggle platform features on or off without code deployments.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="py-4 border-b border-line">
          <div className="grid grid-cols-[1fr_auto_120px] gap-4 text-[12px] font-data uppercase tracking-wider text-muted-label">
            <span>Feature</span>
            <span>Description</span>
            <span className="text-right">Status</span>
          </div>
        </div>
        <div className="divide-y divide-line">
          {displayFlags.map((flag: any) => (
            <div key={flag.key} className="py-4 grid grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="font-data font-medium text-[14px] text-ink">{flag.key}</div>
                {flag.description && (
                  <div className="text-[13px] text-muted-label mt-0.5">{flag.description}</div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[12px] font-data font-semibold px-2.5 py-1 rounded-full ${
                  flag.enabled
                    ? "bg-[#E8F5E9] text-[#2E7D32]"
                    : "bg-paper border border-line text-muted-label"
                }`}>
                  {flag.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[13px] text-muted-label">
        Run migration 011 and seed flags to enable toggle controls.
      </p>
    </div>
  );
}
