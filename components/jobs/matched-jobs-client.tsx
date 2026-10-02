"use client";

import { useState } from "react";
import { JobCard } from "@/components/jobs/job-card";
import type { Job } from "@/types";

/* ============================================================
   MatchedJobsClient — Auto-matched jobs display.
   No manual search. Jobs are shown pre-matched with scores.
   Users refine by work arrangement only.
   ============================================================ */

const ARRANGEMENT_FILTERS = ["All", "Remote", "Onsite", "Hybrid"] as const;

interface MatchedJob {
  job: Job;
  score: number;
  explanation?: any; // Keep simple here, type is in types/index.ts
}

export function MatchedJobsClient({
  matchedJobs,
  profileComplete,
}: {
  matchedJobs: MatchedJob[];
  profileComplete: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered =
    activeFilter === "All"
      ? matchedJobs
      : matchedJobs.filter(
          (m) =>
            m.job.workArrangement.toLowerCase() === activeFilter.toLowerCase()
        );

  return (
    <div className="py-2">
      <span className="font-data text-[13px] text-ink-soft block mb-3">
        Matched automatically
      </span>
      <h1 className="font-display font-bold text-[#2F6D53] text-[30px] max-sm:text-[24px]">
        Your Matches
      </h1>
      <p className="mt-2 text-[15.5px] text-ink-soft max-w-[560px]">
        Roles matched to your profile, skills, and preferences. Keep your
        profile updated for better matches.
      </p>

      {/* Work arrangement filter pills */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {ARRANGEMENT_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`font-data text-[13px] border rounded-full px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeFilter === filter
                ? "bg-accent-soft text-accent-dark border-accent-soft"
                : "bg-paper text-ink-soft border-line hover:border-ink"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-3 text-[14px] text-ink-soft font-data">
        {filtered.length} {filtered.length === 1 ? "match" : "matches"} found
      </div>

      {/* Matched jobs list */}
      <div className="mt-4 flex flex-col gap-3">
        {!profileComplete ? (
          <div className="border border-line rounded-[14px] bg-paper p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
              
            </div>
            <h2 className="font-display font-semibold text-[18px] text-[#2F6D53]">
              Complete your profile to get matched
            </h2>
            <p className="mt-2 text-[14.5px] text-ink-soft max-w-[400px] mx-auto">
              Add your skills, experience, and work preferences so we can
              automatically match you with the right roles.
            </p>
            <a
              href="/dashboard/profile"
              className="inline-flex items-center justify-center mt-5 px-6 py-2.5 bg-accent text-white font-semibold text-[14px] rounded-xl hover:bg-accent/90 transition-colors"
            >
              Complete profile
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-line rounded-[14px] bg-paper p-10 text-center">
            <h2 className="font-display font-semibold text-[18px]">
              No matches yet
            </h2>
            <p className="mt-2 text-[14.5px] text-ink-soft">
              We are looking for roles that fit your profile. Check back soon or
              update your preferences to broaden your matches.
            </p>
          </div>
        ) : (
          filtered.map((match) => (
            <JobCard
              key={match.job.id}
              job={match.job}
              score={match.score}
              explanation={match.explanation}
              linked
              basePath="/dashboard/jobs"
            />
          ))
        )}
      </div>
    </div>
  );
}
