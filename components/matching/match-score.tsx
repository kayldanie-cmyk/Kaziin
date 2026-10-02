"use client";

import { useState } from "react";
import clsx from "clsx";
import type { MatchFactor } from "@/lib/matching";

export interface MatchScoreProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  factors?: MatchFactor[];
  className?: string;
}

export function MatchScore({
  score,
  label,
  size = "md",
  factors,
  className,
}: MatchScoreProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Score colors based on ranges
  const getColor = (s: number) => {
    if (s >= 85) return "text-accent-dark bg-accent-soft border-accent/20";
    if (s >= 70) return "text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/20";
    if (s >= 50) return "text-gold bg-gold-soft border-gold/20";
    return "text-danger bg-danger-soft border-danger/20";
  };

  const getRingColor = (s: number) => {
    if (s >= 85) return "text-accent-dark";
    if (s >= 70) return "text-[#2E7D32]";
    if (s >= 50) return "text-gold";
    return "text-danger";
  };

  const sizes = {
    sm: "w-10 h-10 text-[13px]",
    md: "w-14 h-14 text-[18px]",
    lg: "w-20 h-20 text-[26px]",
  };

  const hasDetails = factors && factors.length > 0;

  return (
    <div className={clsx("relative inline-flex flex-col items-center", className)}>
      <div
        className={clsx(
          "relative flex items-center justify-center rounded-full border-4 font-display font-bold",
          sizes[size],
          getColor(score),
          hasDetails && "cursor-pointer hover:opacity-90 transition-opacity"
        )}
        onClick={() => hasDetails && setShowDetails(!showDetails)}
        role={hasDetails ? "button" : undefined}
        aria-expanded={showDetails}
      >
        {/* SVG Ring for exact percentage */}
        
        <span className="relative z-10">{score}</span>
      </div>

      {label && (
        <span
          className={clsx(
            "mt-2 block font-medium",
            size === "sm" ? "text-[11px]" : "text-[13px]",
            getRingColor(score)
          )}
        >
          {label}
        </span>
      )}

      {/* Popover for factor details */}
      {showDetails && hasDetails && (
        <div className="absolute top-full left-1/2 mt-3 w-64 -translate-x-1/2 rounded-[12px] border border-line bg-paper shadow-xl z-50 animate-in fade-in zoom-in-95">
          <div className="p-3 border-b border-line bg-paper rounded-t-[12px]">
            <h4 className="font-semibold text-[13px]">Match Explanation</h4>
          </div>
          <div className="p-3 max-h-60 overflow-y-auto">
            <div className="space-y-3">
              {factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className={clsx(
                      "mt-0.5 shrink-0",
                      factor.matched ? "text-accent" : "text-danger"
                    )}
                  >
                    {factor.matched ? (null) : (null)}
                  </span>
                  <div>
                    <p className={clsx("text-[12.5px] font-medium leading-tight", factor.matched ? "text-ink" : "text-ink-soft")}>
                      {factor.factor}
                    </p>
                    {factor.detail && (
                      <p className="mt-0.5 text-[11.5px] text-muted-label">
                        {factor.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
