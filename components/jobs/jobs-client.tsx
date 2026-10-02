"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import type { Job } from "@/types";

const FILTER_TYPES = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Freelance",
];

export function JobsClient({
  initialJobs,
  basePath = "/jobs",
}: {
  initialJobs: Job[];
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentFilter = searchParams.get("filter") ?? "All";
  const [searchQuery, setSearchQuery] = useState(currentQuery);

  function handleFilterClick(filter: string) {
    const params = new URLSearchParams(searchParams);
    params.set("filter", filter);
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="wrap py-12 max-md:py-8">
      <span className="font-data text-[13px] text-ink-soft block mb-3">
        Find work
      </span>
      <h1 className="font-display font-bold text-accent text-[42px] max-sm:text-[28px]">
        Find work that fits you.
      </h1>
      <p className="mt-3 text-[16.5px] text-ink-soft max-w-[520px]">
        Search open opportunities locally, remotely, and across borders.
      </p>

      <form onSubmit={handleSearch} className="mt-7 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[280px] flex items-center gap-2.5 bg-paper border border-line rounded-[10px] px-4 py-3.5">
          
          <input
            type="text"
            placeholder="Try: Remote jobs for a junior graphic designer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none outline-none bg-transparent font-body text-[15px] w-full text-ink placeholder:text-[#9A9A94]"
            aria-label="Search jobs"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
      </form>

      <div className="mt-3 flex gap-2 flex-wrap">
        {FILTER_TYPES.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`font-data text-[13px] border rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
              currentFilter === filter
                ? "bg-accent-soft text-accent-dark border-accent-soft"
                : "bg-paper text-ink-soft border-line hover:border-ink"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-8 text-[14px] text-ink-soft font-data">
        {initialJobs.length} opportunities found
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {initialJobs.length === 0 ? (
          <div className="border border-line rounded-[14px] bg-paper p-10 text-center">
            <h2 className="font-display font-semibold text-[18px]">No open roles found</h2>
            <p className="mt-2 text-[14.5px] text-ink-soft">
              Try a broader search or check back after verified employers publish new jobs.
            </p>
          </div>
        ) : (
          initialJobs.map((job) => (
            <JobCard key={job.id} job={job} linked basePath={basePath} />
          ))
        )}
      </div>
    </div>
  );
}
