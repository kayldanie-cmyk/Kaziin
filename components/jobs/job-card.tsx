import Link from "next/link";
import { useState } from "react";
import { MatchRing } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Job, MatchExplanation } from "@/types";

/* ============================================================
   JobCard — Shared card for job listings.
   Used on /jobs (public search) and dashboard matches.
   Based on SKILL.md §13–14.
   ============================================================ */

interface JobCardProps {
  job: Job;
  score?: number;
  explanation?: MatchExplanation;
  /** When true, wraps the card in a Link to /jobs/[slug] */
  linked?: boolean;
  basePath?: string;
}

function JobCardInner({ job, score, explanation }: { job: Job; score?: number; explanation?: MatchExplanation }) {
  const arrangement =
    job.workArrangement === "remote"
      ? "Remote"
      : job.workArrangement === "hybrid"
      ? "Hybrid"
      : "On-site";

  return (
    <article className="border border-line/60 rounded-[14px] bg-transparent p-sp-4 flex items-center justify-between gap-sp-4 flex-wrap hover:border-accent/40 hover:bg-black/[0.02] transition-colors duration-150">
      <div className="flex items-center gap-sp-3 flex-1 min-w-0">
        {typeof score === "number" ? (
          <MatchRing score={score} size="sm" animate={false} />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[14px] shrink-0">
            {job.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-semibold text-[16.5px]">
              {job.title}
            </h2>
            {job.verified && (
              <Badge variant="verified" className="text-[10px]">
                Verified
              </Badge>
            )}
          </div>
          <div className="text-[13.5px] text-ink-soft mt-0.5">
            {job.employer.name}
          </div>
          <div className="text-[13px] text-ink-soft font-data mt-1.5 flex gap-3 flex-wrap">
            <span>
              {job.location} · {arrangement}
            </span>
            {job.salary && (
              <span>
                {job.salary.currency}{" "}
                {Math.round(job.salary.min / 1000)}K–
                {Math.round(job.salary.max / 1000)}K
              </span>
            )}
          </div>
          {/* Skill tags */}
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[11.5px] font-data text-ink-soft border border-line rounded-[5px] px-1.5 py-0.5"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        {typeof score === "number" ? (
          <div className="flex flex-col items-end gap-1">
            <span className="font-data font-semibold text-accent-dark text-[14px]">
              {score}% match
            </span>
            {explanation && (
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                explanation.label === 'strong' ? 'bg-green-100 text-green-700' :
                explanation.label === 'good' ? 'bg-accent-soft text-accent-dark' :
                explanation.label === 'transferable' ? 'bg-purple-100 text-purple-700' :
                explanation.label === 'potential' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {explanation.label} Match
              </span>
            )}
          </div>
        ) : (
          <span className="font-data font-semibold text-accent-dark text-[14px]">
            Open role
          </span>
        )}
        <div className="text-[12px] text-ink-soft font-data mt-2">
          {job.applicantCount} applicants
        </div>
      </div>

      {explanation && (
        <div className="w-full mt-3 pt-3 border-t border-line/40 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-3">
          {explanation.matched.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block mb-1">Matched</span>
              <ul className="text-[12.5px] text-ink-soft space-y-0.5">
                {explanation.matched.map((m, i) => <li key={i} className="flex gap-1.5"><span className="text-green-500"></span> {m}</li>)}
              </ul>
            </div>
          )}
          
          {explanation.gap.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-1">Gaps</span>
              <ul className="text-[12.5px] text-ink-soft space-y-0.5">
                {explanation.gap.map((g, i) => <li key={i} className="flex gap-1.5"><span className="text-red-400">!</span> {g}</li>)}
              </ul>
            </div>
          )}
          
          {explanation.transferable.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">Transferable</span>
              <ul className="text-[12.5px] text-ink-soft space-y-0.5">
                {explanation.transferable.map((t, i) => <li key={i} className="flex gap-1.5"><span className="text-purple-500"></span> {t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function JobCard({ job, score, explanation, linked = true, basePath = "/jobs" }: JobCardProps) {
  if (!linked) {
    return <JobCardInner job={job} score={score} explanation={explanation} />;
  }

  return (
    <Link href={`${basePath}/${job.slug}`} className="block">
      <JobCardInner job={job} score={score} explanation={explanation} />
    </Link>
  );
}
