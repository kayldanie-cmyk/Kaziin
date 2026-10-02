"use client";

import { useState } from "react";
import type { ATSApplication } from "@/lib/ats-data";
import type { ApplicationStatus } from "@/types";
import { MatchRing } from "@/components/ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STAGES: { id: ApplicationStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "reviewed", label: "Reviewed" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
  { id: "hired", label: "Hired" },
];

export function ATSKanbanClient({
  initialApplications,
  jobId,
}: {
  initialApplications: ATSApplication[];
  jobId: string;
}) {
  const [applications, setApplications] = useState<ATSApplication[]>(initialApplications);
  const router = useRouter();

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications(apps => apps.map(app =>
      app.id === appId ? { ...app, status: newStatus } : app
    ));

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (e) {
      console.error(e);
      // Revert on error
      setApplications(initialApplications);
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 snap-x">
      {STAGES.map(stage => {
        const stageApps = applications.filter(a => a.status === stage.id);

        return (
          <div key={stage.id} className="min-w-[300px] max-w-[300px] flex flex-col bg-paper rounded-[16px] border border-line/50 snap-center">
            <div className="p-4 flex items-center justify-between border-b border-line/40 shrink-0">
              <h3 className="font-display font-semibold text-[15px]">{stage.label}</h3>
              <span className="bg-paper border border-line text-ink-soft text-[12px] font-bold px-2 py-0.5 rounded-full">
                {stageApps.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {stageApps.length === 0 && (
                <p className="text-[13px] text-ink-soft text-center py-8">No candidates</p>
              )}

              {stageApps.map(app => (
                <ATSCard
                  key={app.id}
                  app={app}
                  stages={STAGES}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ATSCard({
  app,
  stages,
  onStatusChange,
}: {
  app: ATSApplication;
  stages: { id: ApplicationStatus; label: string }[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-transparent border border-line/80 rounded-[12px] p-4 hover:border-accent/40 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <Link
          href={`/hire/candidates/${app.id}`}
          className="font-display font-semibold text-[14.5px] hover:text-accent transition-colors truncate pr-2"
        >
          {app.candidate_profile.name}
        </Link>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="text-ink-soft hover:text-ink w-7 h-7 flex items-center justify-center rounded hover:bg-paper"
          >
            
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-paper border border-line shadow-lg rounded-lg z-20">
              <div className="py-1">
                {stages.map(s => (
                  <button
                    key={s.id}
                    disabled={s.id === app.status}
                    onClick={() => { onStatusChange(app.id, s.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    → {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-[12.5px] text-ink-soft mb-4 line-clamp-1">
        {app.candidate_profile.headline || "No headline"}
      </div>

      <div className="flex items-center gap-3 bg-paper rounded-lg p-2.5">
        <MatchRing score={app.match_score ?? 0} size="xs" animate={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-data font-bold text-[12px]">{app.match_score ?? 0}% Match</span>
            {app.match_explanation?.label && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                app.match_explanation.label === "strong" ? "bg-green-100 text-green-700" :
                app.match_explanation.label === "good" ? "bg-accent-soft text-accent-dark" :
                app.match_explanation.label === "transferable" ? "bg-purple-100 text-purple-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {app.match_explanation.label}
              </span>
            )}
          </div>

          <div className="text-[11px] text-ink-soft mt-1.5 space-y-0.5">
            {app.match_explanation?.matched?.[0] && (
              <div className="flex gap-1 items-start truncate">
                <span className="text-green-500 shrink-0"></span>
                <span className="truncate">{app.match_explanation.matched[0]}</span>
              </div>
            )}
            {app.match_explanation?.gap?.[0] && (
              <div className="flex gap-1 items-start truncate">
                <span className="text-red-400 shrink-0">!</span>
                <span className="truncate">{app.match_explanation.gap[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 gap-2">
        <Link
          href={`/hire/candidates/${app.id}`}
          className="block text-center flex-1 text-[12px] font-semibold text-accent hover:underline border border-line rounded py-1"
        >
          Review →
        </Link>
        {(app.candidate_profile as any).phone && (
          <a
            href={`https://wa.me/${(app.candidate_profile as any).phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 flex-1 text-[12px] font-semibold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded py-1 transition-colors"
          >
            
            Chat
          </a>
        )}
      </div>
    </div>
  );
}
