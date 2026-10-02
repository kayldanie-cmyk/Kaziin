/* ============================================================
   KAZIIN — Utility Functions
   ============================================================ */

import { type ClassValue, clsx } from "clsx";

/** Merge class names — handles conditional classes cleanly. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a number with commas (e.g. 1842 → "1,842"). */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Format salary range for display. */
export function formatSalary(
  min: number,
  max: number,
  currency: string,
  period: "annual" | "monthly" = "monthly"
): string {
  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toLocaleString("en-US");
  };
  const suffix = period === "annual" ? "/yr" : "/mo";
  return `${currency} ${fmt(min)}–${fmt(max)}${suffix}`;
}

/** Capitalize first letter. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Slugify a string for URLs. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Get a human-readable label for application status. */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: "Submitted",
    screening: "Screening",
    shortlisted: "Shortlisted",
    interview: "Interview",
    offer: "Offer",
    hired: "Hired",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
    draft: "Draft",
    published: "Published",
    paused: "Paused",
    filled: "Filled",
    expired: "Expired",
    not_started: "Not started",
    pending: "Pending",
    verified: "Verified",
    failed: "Failed",
    assessment: "Assessment",
    approved: "Approved",
    declined: "Declined",
    disbursed: "Disbursed",
    repaying: "Repaying",
    completed: "Completed",
  };
  return labels[status] || capitalize(status.replace(/_/g, " "));
}

/** Get a status color class (Tailwind). */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // positive
    verified: "bg-accent-soft text-accent-dark",
    approved: "bg-accent-soft text-accent-dark",
    hired: "bg-accent-soft text-accent-dark",
    completed: "bg-accent-soft text-accent-dark",
    offer: "bg-accent-soft text-accent-dark",
    // warning
    pending: "bg-gold-soft text-gold",
    screening: "bg-gold-soft text-gold",
    assessment: "bg-gold-soft text-gold",
    interview: "bg-gold-soft text-gold",
    // negative
    rejected: "bg-danger-soft text-danger",
    failed: "bg-danger-soft text-danger",
    declined: "bg-danger-soft text-danger",
    withdrawn: "bg-danger-soft text-danger",
    // neutral
    expired: "bg-muted-label-soft text-muted-label",
    draft: "bg-muted-label-soft text-muted-label",
    not_started: "bg-muted-label-soft text-muted-label",
  };
  return colors[status] || "bg-muted-label-soft text-muted-label";
}
