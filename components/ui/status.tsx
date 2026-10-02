import clsx from "clsx";

/* ============================================================
   Status — Status indicator with dot and label
   Design System §46
   ============================================================ */

interface StatusProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; dotColor: string; label: string }> = {
  // Application statuses
  submitted: { color: "text-muted-label", dotColor: "bg-muted-label", label: "Submitted" },
  screening: { color: "text-gold", dotColor: "bg-gold", label: "Screening" },
  shortlisted: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Shortlisted" },
  interview: { color: "text-[#4B6BFB]", dotColor: "bg-[#4B6BFB]", label: "Interview" },
  offer: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Offer" },
  hired: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Hired" },
  rejected: { color: "text-danger", dotColor: "bg-danger", label: "Rejected" },
  withdrawn: { color: "text-muted-label", dotColor: "bg-muted-label", label: "Withdrawn" },

  // Job statuses
  draft: { color: "text-muted-label", dotColor: "bg-muted-label", label: "Draft" },
  published: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Published" },
  paused: { color: "text-gold", dotColor: "bg-gold", label: "Paused" },
  filled: { color: "text-[#4B6BFB]", dotColor: "bg-[#4B6BFB]", label: "Filled" },
  expired: { color: "text-danger", dotColor: "bg-danger", label: "Expired" },

  // Verification
  not_started: { color: "text-muted-label", dotColor: "bg-muted-label", label: "Not Started" },
  pending: { color: "text-gold", dotColor: "bg-gold", label: "Pending" },
  verified: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Verified" },
  failed: { color: "text-danger", dotColor: "bg-danger", label: "Failed" },

  // Funding
  assessment: { color: "text-gold", dotColor: "bg-gold", label: "Assessment" },
  approved: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Approved" },
  declined: { color: "text-danger", dotColor: "bg-danger", label: "Declined" },
  disbursed: { color: "text-[#4B6BFB]", dotColor: "bg-[#4B6BFB]", label: "Disbursed" },
  repaying: { color: "text-gold", dotColor: "bg-gold", label: "Repaying" },
  completed: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Completed" },

  // Cases
  open: { color: "text-gold", dotColor: "bg-gold", label: "Open" },
  under_review: { color: "text-[#4B6BFB]", dotColor: "bg-[#4B6BFB]", label: "Under Review" },
  resolved: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Resolved" },
  closed: { color: "text-muted-label", dotColor: "bg-muted-label", label: "Closed" },

  // System
  online: { color: "text-accent-dark", dotColor: "bg-accent-dark", label: "Online" },
  offline: { color: "text-danger", dotColor: "bg-danger", label: "Offline" },
  degraded: { color: "text-gold", dotColor: "bg-gold", label: "Degraded" },
};

export function Status({ status, className, showDot = true }: StatusProps) {
  const config = STATUS_CONFIG[status] ?? {
    color: "text-muted-label",
    dotColor: "bg-muted-label",
    label: status.replace(/_/g, " "),
  };

  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-[13px] font-data font-medium capitalize", config.color, className)}>
      {showDot && (
        <span className={clsx("w-2 h-2 rounded-full shrink-0", config.dotColor)} />
      )}
      {config.label}
    </span>
  );
}
