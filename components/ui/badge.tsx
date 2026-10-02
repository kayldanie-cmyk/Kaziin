import type React from "react";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────── */

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "verified" | "status" | "info" | "warning" | "danger" | "neutral";
  className?: string;
  icon?: boolean;
}

/* ── Styles ──────────────────────────────────────────────── */

const variantStyles: Record<string, string> = {
  verified: "bg-accent-soft text-accent-dark",
  status: "bg-accent-soft text-accent-dark",
  info: "bg-accent-soft text-accent-dark",
  warning: "bg-amber-soft text-amber",
  danger: "bg-rejected-soft text-rejected",
  neutral: "bg-paper text-ink border border-line",
};

/* ── Component ───────────────────────────────────────────── */

export function Badge({
  children,
  variant = "verified",
  className,
  icon = true,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-data text-[11.5px] px-2 py-[3px] rounded-[5px]",
        variantStyles[variant],
        className
      )}
    >
      {icon && variant === "verified" && (
        <span aria-hidden="true"></span>
      )}
      {children}
    </span>
  );
}

/* ── Status Badge (for data states) ──────────────────────── */

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  // positive
  verified: "bg-accent-soft text-accent-dark",
  approved: "bg-accent-soft text-accent-dark",
  hired: "bg-accent-soft text-accent-dark",
  completed: "bg-accent-soft text-accent-dark",
  offer: "bg-accent-soft text-accent-dark",
  published: "bg-accent-soft text-accent-dark",
  // warning / in-progress
  pending: "bg-gold-soft text-gold",
  screening: "bg-gold-soft text-gold",
  assessment: "bg-gold-soft text-gold",
  interview: "bg-gold-soft text-gold",
  submitted: "bg-gold-soft text-gold",
  shortlisted: "bg-gold-soft text-gold",
  repaying: "bg-gold-soft text-gold",
  disbursed: "bg-gold-soft text-gold",
  // negative
  rejected: "bg-danger-soft text-danger",
  failed: "bg-danger-soft text-danger",
  declined: "bg-danger-soft text-danger",
  withdrawn: "bg-danger-soft text-danger",
  // neutral
  expired: "bg-muted-label-soft text-muted-label",
  draft: "bg-muted-label-soft text-muted-label",
  not_started: "bg-muted-label-soft text-muted-label",
  paused: "bg-muted-label-soft text-muted-label",
  filled: "bg-muted-label-soft text-muted-label",
  scheduled: "bg-gold-soft text-gold",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const displayLabel =
    label ||
    status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center font-data text-[11.5px] px-2 py-[3px] rounded-[5px]",
        statusColors[status] || "bg-expired-soft text-expired",
        className
      )}
    >
      {displayLabel}
    </span>
  );
}