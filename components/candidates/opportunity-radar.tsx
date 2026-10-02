"use client";

import clsx from "clsx";
import Link from "next/link";

interface OpportunityRadarProps {
  newMatchesCount: number;
  strongMatchesCount: number;
  className?: string;
}

export function OpportunityRadar({ newMatchesCount, strongMatchesCount, className }: OpportunityRadarProps) {
  if (newMatchesCount === 0) return null;

  return (
    <div className={clsx("rounded-[14px] bg-[#E8F5E9] border border-[#2E7D32]/20 p-4 relative overflow-hidden", className)}>
      {/* Radar sweeping background effect */}
      <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(46,125,50,0.05)_280deg,transparent_360deg)] animate-[spin_4s_linear_infinite]" />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center shrink-0">
            
          </div>
          <div>
            <h3 className="font-semibold text-[14px] sm:text-[15px] text-[#1B5E20] flex items-center gap-2 flex-wrap">
              Opportunity Radar active <span className="text-[10px] bg-transparent text-[#1B5E20] px-2 py-0.5 rounded-full tracking-wide uppercase">Local Mode</span>
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#2E7D32] mt-0.5">
              Found <strong className="font-semibold">{newMatchesCount} new gigs</strong> near you today. {strongMatchesCount > 0 && <span>{strongMatchesCount} exceptional matches.</span>}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/jobs"
          className="shrink-0 bg-transparent border border-[#2E7D32]/20 text-[#2E7D32] font-medium text-[13px] px-4 py-2.5 sm:py-2 rounded-full hover:bg-[#2E7D32]/10 transition-colors text-center w-full sm:w-auto"
        >
          View matches
        </Link>
      </div>
    </div>
  );
}
