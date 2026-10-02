import type React from "react";
import { cn } from "@/lib/utils";

/* ============================================================
   Skeleton Loader Component
   Based on SKILL.md §41.
   "Use skeleton loaders for standard content.
   Avoid generic indefinite spinners."
   ============================================================ */

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[8px] bg-line/60", className)}
      {...props}
    />
  );
}

// Pre-composed skeletons for common patterns
export function SkeletonCard() {
  return (
    <div className="bg-paper border border-line rounded-[12px] p-5">
      <div className="flex gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[90%]" />
      </div>
      <div className="mt-4 pt-4 border-t border-line flex justify-between">
        <Skeleton className="h-8 w-20 rounded-[6px]" />
        <Skeleton className="h-8 w-24 rounded-[6px]" />
      </div>
    </div>
  );
}
