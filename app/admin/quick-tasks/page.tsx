import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_TASKS, DEMO_TASKERS, getStatusLabel } from "@/lib/quick-tasks";

export const metadata: Metadata = {
  title: "Quick Tasks | Admin",
  description: "Admin overview of Quick Tasks activity.",
};

/* ============================================================
   Admin — Quick Tasks Overview
   Per SKILL.md §29
   ============================================================ */
export default function AdminQuickTasksPage() {
  const statusCounts = DEMO_TASKS.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Quick Tasks</h1>
          <p className="text-ink-soft text-[15px] mt-1">Platform-wide Quick Task activity and management.</p>
        </div>
        <Link
          href="/quick-tasks"
          className="text-[13px] text-accent-dark font-medium hover:underline"
        >
          View public feed →
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: DEMO_TASKS.length },
          { label: "Active Taskers", value: DEMO_TASKERS.length },
          { label: "Verified Taskers", value: DEMO_TASKERS.filter(t => t.verified).length },
          { label: "Categories", value: 9 },
        ].map((s) => (
          <div key={s.label} className="border border-line rounded-[12px] p-5 bg-paper">
            <div className="font-data text-[12px] text-ink-soft mb-1">{s.label}</div>
            <div className="font-display font-bold text-[28px] text-[#2F6D53]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-nav */}
      <div className="flex gap-3 flex-wrap mb-8">
        {[
          { label: "Active Tasks", href: "/admin/quick-tasks/active" },
          { label: "Taskers", href: "/admin/quick-tasks/taskers" },
          { label: "Disputes", href: "/admin/quick-tasks/disputes" },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-5 py-2.5 rounded-[10px] border border-line bg-paper text-[14px] font-semibold text-[#2F6D53] hover:bg-accent-soft transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Task list */}
      <div>
        <h2 className="font-display font-semibold text-[18px] text-[#2F6D53] mb-4">Demo Tasks</h2>
        <div className="flex flex-col gap-3">
          {DEMO_TASKS.map(task => (
            <div key={task.id} className="border border-line rounded-[12px] p-4 bg-paper flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-display font-semibold text-[15px]">{task.title}</div>
                <div className="text-[13px] text-ink-soft mt-1">{task.location} · {task.category}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-data text-[11px] font-semibold uppercase tracking-wider bg-accent-soft text-accent-dark px-2 py-0.5 rounded">
                  {getStatusLabel(task.status)}
                </span>
                <span className="font-display font-bold text-[15px] text-[#2F6D53]">
                  {task.currency} {Number(task.budget).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasker list */}
      <div className="mt-10">
        <h2 className="font-display font-semibold text-[18px] text-[#2F6D53] mb-4">Demo Taskers</h2>
        <div className="flex flex-col gap-3">
          {DEMO_TASKERS.map(tasker => (
            <div key={tasker.id} className="border border-line rounded-[12px] p-4 bg-paper flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-display font-bold text-[14px]">
                  {tasker.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-display font-semibold text-[15px]">{tasker.name}</div>
                  <div className="text-[13px] text-ink-soft mt-0.5">
                     {tasker.rating} · {tasker.completedTasks} tasks · {tasker.serviceArea}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tasker.verified && (
                  <span className="font-data text-[11px] font-semibold uppercase tracking-wider bg-accent-soft text-accent-dark px-2 py-0.5 rounded">
                     Verified
                  </span>
                )}
                <span className="text-[12px] text-ink-soft">{tasker.categories.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
