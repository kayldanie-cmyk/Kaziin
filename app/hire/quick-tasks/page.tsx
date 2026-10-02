import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Quick Tasks — Hire | Kaziin",
  description: "Manage the quick tasks you have posted on Kaziin.",
};

/* ============================================================
   Hire Quick Tasks — /hire/quick-tasks
   Shows the recruiter/employer's POSTED tasks only.
   Hire context = POST ONLY. No task feed. No "Get a Task".
   Per Navigation Strategy §A.
   ============================================================ */

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:       { label: "Draft",       color: "bg-[#E9E6DA] text-[#3E4844]" },
  REQUESTED:   { label: "Posted",      color: "bg-accent-soft text-accent-dark" },
  SEARCHING:   { label: "Searching",   color: "bg-accent-soft text-accent-dark" },
  MATCHED:     { label: "Matched",     color: "bg-gold-soft text-gold" },
  ACCEPTED:    { label: "Accepted",    color: "bg-gold-soft text-gold" },
  IN_PROGRESS: { label: "In Progress", color: "bg-gold-soft text-gold" },
  COMPLETED:   { label: "Completed",   color: "bg-accent-soft text-accent-dark" },
  CONFIRMED:   { label: "Confirmed",   color: "bg-accent-soft text-accent-dark" },
  CLOSED:      { label: "Closed",      color: "bg-[#E9E6DA] text-[#3E4844]" },
  CANCELLED:   { label: "Cancelled",   color: "bg-danger-soft text-danger" },
};

type PostedTask = {
  id: string;
  title: string;
  status: string;
  budget: string;
  currency: string;
  location: string;
  urgency: string;
  postedAt: string;
};

async function getPostedTasks(): Promise<PostedTask[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Query quick_tasks posted by this employer.
    // Falls back gracefully if the table does not exist yet.
    const { data, error } = await supabase
      .from("quick_tasks")
      .select("id, title, status, budget, currency, location, urgency, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return [];

    return (data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      budget: String(t.budget ?? "0"),
      currency: t.currency ?? "KES",
      location: t.location ?? "",
      urgency: t.urgency ?? "schedule",
      postedAt: t.created_at,
    }));
  } catch {
    return [];
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function HireQuickTasksPage() {
  const tasks = await getPostedTasks();

  const ACTIVE_STATUSES = ["REQUESTED", "SEARCHING", "MATCHED", "ACCEPTED", "IN_PROGRESS"];
  const activeTasks = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const pastTasks   = tasks.filter((t) => !ACTIVE_STATUSES.includes(t.status));

  return (
    <div className="max-w-[800px] mx-auto py-8 px-2">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Quick Tasks</h1>
          <p className="text-[14.5px] text-ink-soft mt-1">
            Tasks you have posted. Track status and manage your active assignments.
          </p>
        </div>
        <Link
          href="/hire/quick-tasks/new"
          id="hire-qt-post-new"
          className={buttonVariants({ variant: "primary" })}
        >
          Post a Task
        </Link>
      </div>

      {/* ── Empty state ── */}
      {tasks.length === 0 && (
        <div className="py-20 text-center border border-dashed border-line rounded-[16px]">
          <p className="font-display font-bold text-[18px] text-[#2F6D53] mb-2">
            No tasks posted yet
          </p>
          <p className="text-[14px] text-ink-soft mb-6 max-w-[340px] mx-auto leading-relaxed">
            Post a quick task to get matched with a local tasker — deliveries, cleaning, repairs, and more.
          </p>
          <Link
            href="/hire/quick-tasks/new"
            id="hire-qt-empty-cta"
            className={buttonVariants({ variant: "primary" })}
          >
            Post your first task
          </Link>
        </div>
      )}

      {/* ── Active tasks ── */}
      {activeTasks.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-bold text-[14px] text-ink-soft mb-4 uppercase tracking-widest">
            Active
          </h2>
          <div className="flex flex-col gap-3">
            {activeTasks.map((task) => {
              const s = STATUS_LABELS[task.status] ?? STATUS_LABELS["REQUESTED"];
              return (
                <Link
                  key={task.id}
                  href={`/hire/quick-tasks/${task.id}`}
                  id={`hire-qt-card-${task.id}`}
                  className="flex items-center justify-between gap-4 border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`font-data text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${s.color}`}>
                        {s.label}
                      </span>
                      {task.urgency === "asap" && (
                        <span className="font-data text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Urgent
                        </span>
                      )}
                      <span className="font-data text-[11px] text-ink-soft">{timeAgo(task.postedAt)}</span>
                    </div>
                    <h3 className="font-display font-semibold text-[16px] text-ink truncate">{task.title}</h3>
                    {task.location && (
                      <p className="text-[13px] text-ink-soft mt-0.5">{task.location}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-[17px] text-[#2F6D53]">
                      {task.currency} {Number(task.budget).toLocaleString()}
                    </div>
                    <span className="text-[12.5px] font-semibold text-accent-dark group-hover:underline">
                      Manage →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Past tasks ── */}
      {pastTasks.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-[14px] text-ink-soft mb-4 uppercase tracking-widest">
            Past Tasks
          </h2>
          <div className="flex flex-col gap-3">
            {pastTasks.map((task) => {
              const s = STATUS_LABELS[task.status] ?? STATUS_LABELS["CLOSED"];
              return (
                <Link
                  key={task.id}
                  href={`/hire/quick-tasks/${task.id}`}
                  id={`hire-qt-past-${task.id}`}
                  className="flex items-center justify-between gap-4 border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/40 transition-colors group opacity-70"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`font-data text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${s.color}`}>
                        {s.label}
                      </span>
                      <span className="font-data text-[11px] text-ink-soft">{timeAgo(task.postedAt)}</span>
                    </div>
                    <h3 className="font-display font-semibold text-[16px] text-ink truncate">{task.title}</h3>
                    {task.location && (
                      <p className="text-[13px] text-ink-soft mt-0.5">{task.location}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-[17px] text-ink-soft">
                      {task.currency} {Number(task.budget).toLocaleString()}
                    </div>
                    <span className="text-[12.5px] font-semibold text-accent-dark group-hover:underline">
                      View →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
