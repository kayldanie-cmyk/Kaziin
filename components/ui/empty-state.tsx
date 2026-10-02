import type React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "./button";

/* ============================================================
   Empty State Component
   Based on SKILL.md §40.
   "Never display only 'No results found.'"
   ============================================================ */

interface EmptyStateProps {
  title?: string;
  description?: string;
  suggestions?: string[];
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Nothing here yet.",
  description = "We couldn't find exactly what you're looking for.",
  suggestions,
  actionLabel,
  onAction,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-transparent border border-line/60 rounded-[14px] w-full">
      {icon ? (
        <div className="text-ink-soft mb-6">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-paper border border-line flex items-center justify-center text-ink-soft mb-6">
          
        </div>
      )}

      <h3 className="font-display font-semibold text-[18px] mb-2">{title}</h3>
      <p className="text-[14.5px] text-ink-soft mb-6 max-w-[360px]">
        {description}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="text-left bg-paper p-5 rounded-[10px] border border-line w-full max-w-[400px] mb-6">
          <p className="font-data text-[12px] text-ink-soft mb-3 uppercase tracking-wider">Try:</p>
          <ul className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-2 text-[14px] text-ink-soft">
                <span className="text-line">•</span> {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className={buttonVariants({ variant: "primary" })}>
            {actionLabel}
          </Link>
        ) : (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
