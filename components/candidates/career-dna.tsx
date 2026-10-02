"use client";

import clsx from "clsx";
import type { CareerDNAResult } from "@/lib/career-dna";
import { Badge } from "@/components/ui/badge";

interface CareerDNAProps {
  dna: CareerDNAResult;
  className?: string;
  showDetails?: boolean;
}

export function CareerDNA({ dna, className, showDetails = false }: CareerDNAProps) {
  if (!dna.dimensions || dna.dimensions.length === 0) {
    return (
      <div className={clsx("rounded-[16px] border border-line bg-paper p-6 text-center", className)}>
        <p className="text-ink-soft text-[14px]">
          {dna.summary}
        </p>
      </div>
    );
  }

  // Get top 5 dimensions for the radar/bar chart
  const topDimensions = dna.dimensions.slice(0, 5);

  return (
    <div className={clsx("rounded-[16px] border border-line bg-paper overflow-hidden", className)}>
      <div className="p-6 border-b border-line">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">
              Career DNA
            </span>
            <h3 className="mt-1 font-display font-semibold text-[20px] text-ink">
              {dna.topStrength}
            </h3>
            <p className="mt-1.5 text-[14px] text-ink-soft max-w-[400px]">
              {dna.summary}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent-dark border border-accent/20">
            
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {topDimensions.map((dim) => (
            <div key={dim.dimension}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[14px] font-medium text-ink">{dim.dimension}</span>
                <span className="font-data text-[13px] text-muted-label">{dim.score}</span>
              </div>
              <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-1000"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              {showDetails && dim.skills.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {dim.skills.map((skill) => (
                    <span key={skill} className="text-[11.5px] bg-paper px-2 py-0.5 rounded text-ink-soft">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
