import clsx from "clsx";

/* ============================================================
   Timeline — Vertical timeline for journeys and pipelines
   Design System §46
   ============================================================ */

export interface TimelineStep {
  label: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
  detail?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
  compact?: boolean;
}

export function Timeline({ steps, className, compact = false }: TimelineProps) {
  return (
    <div className={clsx("flex flex-col", className)} role="list">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={clsx("flex gap-4", !compact && "min-h-[60px]")}
          role="listitem"
        >
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center shrink-0">
            <span
              className={clsx(
                "w-3 h-3 rounded-full border-2 shrink-0 mt-1",
                step.status === "completed" && "bg-accent border-accent",
                step.status === "current" && "bg-paper border-accent shadow-[0_0_0_3px] shadow-accent/20",
                step.status === "upcoming" && "bg-paper border-line"
              )}
            />
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  "w-px flex-1 min-h-[24px]",
                  step.status === "completed" ? "bg-accent" : "bg-line"
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className={clsx("pb-4", compact && "pb-3")}>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "text-[14px] font-medium",
                  step.status === "completed" && "text-ink",
                  step.status === "current" && "text-accent-dark font-semibold",
                  step.status === "upcoming" && "text-muted-label"
                )}
              >
                {step.status === "completed" && " "}
                {step.status === "current" && "● "}
                {step.status === "upcoming" && "○ "}
                {step.label}
              </span>
              {step.timestamp && (
                <span className="font-data text-[11px] text-muted-label">
                  {step.timestamp}
                </span>
              )}
            </div>
            {step.description && (
              <p className={clsx(
                "mt-0.5 text-[13px]",
                step.status === "upcoming" ? "text-muted-label" : "text-ink-soft"
              )}>
                {step.description}
              </p>
            )}
            {step.detail && (
              <p className="mt-1 text-[12px] font-data text-muted-label">
                {step.detail}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
