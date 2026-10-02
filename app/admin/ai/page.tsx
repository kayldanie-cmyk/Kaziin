import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "AI Control Center | Admin",
};

export default async function AdminAIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  // Fetch matching config weights
  const { data: weights } = await supabase
    .from("matching_config")
    .select("*")
    .order("weight", { ascending: false });

  // System health indicators (stubbed until real AI infra)
  const engines = [
    { name: "Matching Engine", status: "online", version: "v1.0", lastRun: "Active", metric: "Weighted algorithm" },
    { name: "CV Processor", status: "pending", version: "v1.0", lastRun: "Not configured", metric: "Requires AI provider" },
    { name: "Job Analyzer", status: "pending", version: "v1.0", lastRun: "Not configured", metric: "Requires AI provider" },
    { name: "Fraud Detector", status: "pending", version: "v1.0", lastRun: "Not configured", metric: "Requires AI provider" },
    { name: "Embeddings", status: "pending", version: "—", lastRun: "pgvector not active", metric: "Semantic search disabled" },
  ];

  const statusColors: Record<string, string> = {
    online: "bg-[#E8F5E9] text-[#2E7D32]",
    degraded: "bg-[#FFF3E0] text-[#E65100]",
    offline: "bg-danger-soft text-danger",
    pending: "bg-paper text-muted-label border border-line",
  };

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">AI Control Center</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Monitor and configure the AI systems powering matching, analysis, and fraud detection.
        </p>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mb-10">
        {engines.map((engine) => (
          <div key={engine.name} className="py-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-semibold text-[16px]">{engine.name}</h3>
                <p className="text-[13px] text-muted-label mt-0.5">{engine.metric}</p>
              </div>
              <span className={`shrink-0 text-[11.5px] font-data font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[engine.status]}`}>
                {engine.status}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-[13px] text-muted-label">
              <span className="font-data">{engine.version}</span>
              <span>{engine.lastRun}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Matching Weight Configuration */}
      <div className="flex flex-col mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h2 className="font-display font-semibold text-[18px]">Matching Weights</h2>
            <p className="text-[13px] text-muted-label mt-0.5">
              Configurable weights for the scoring algorithm (Blueprint §43). Updates require re-running the match queue.
            </p>
          </div>
          <Link href="/admin/config" className="text-[13px] text-accent-dark font-medium hover:underline">
            Configure →
          </Link>
        </div>
        <div className="divide-y divide-line">
          {(weights ?? []).map((w: any) => (
            <div key={w.factor} className="px-6 py-4 flex items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[14.5px] capitalize">
                  {w.factor.replace(/_/g, " ")}
                </div>
                {w.description && (
                  <div className="text-[13px] text-muted-label mt-0.5">{w.description}</div>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-36 bg-paper rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${Math.round(w.weight * 100)}%` }}
                  />
                </div>
                <span className="font-data font-semibold text-[15px] w-12 text-right">
                  {Math.round(w.weight * 100)}%
                </span>
              </div>
            </div>
          ))}
          {(!weights || weights.length === 0) && (
            <div className="px-6 py-8 text-center text-muted-label text-[14px]">
              No matching config found. Run migration 012 to seed defaults.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
        {[
          { title: "Configure Weights", desc: "Adjust algorithm scoring factors", href: "/admin/config", icon: "️" },
          { title: "Feature Flags", desc: "Toggle features on and off", href: "/admin/feature-flags", icon: "" },
          { title: "Audit Logs", desc: "Review all system actions", href: "/admin/audit", icon: "" },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="py-4 border-b border-line last:border-0 hover:opacity-80 transition-opacity group"
          >
            <span className="text-[24px] mb-3 block">{action.icon}</span>
            <h3 className="font-display font-semibold text-[16px] group-hover:text-accent-dark transition-colors">
              {action.title}
            </h3>
            <p className="text-[13.5px] text-muted-label mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
