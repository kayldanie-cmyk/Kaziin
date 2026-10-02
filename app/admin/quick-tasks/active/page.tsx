import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_TASKS, DEMO_TASKERS, getStatusLabel, getStatusBadgeClasses } from "@/lib/quick-tasks";

export const metadata: Metadata = { title: "Active Tasks | Admin Quick Tasks" };

export default function AdminQTActivePage() {
  const activeTasks = DEMO_TASKS.filter(t =>
    ["REQUESTED", "SEARCHING", "TASKER_MATCHED", "TASKER_ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(t.status)
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link href="/admin/quick-tasks" className="text-[13px] text-ink-soft hover:text-ink">← Quick Tasks</Link>
        <h1 className="font-display font-bold text-[24px] text-[#2F6D53]">Active Tasks</h1>
      </div>

      {activeTasks.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-line rounded-[14px] bg-paper">
          <p className="text-ink-soft">No active tasks at this time.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeTasks.map(task => (
            <div key={task.id} className="border border-line rounded-[12px] p-4 bg-paper">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-display font-semibold text-[15px]">{task.title}</div>
                  <div className="text-[13px] text-ink-soft mt-1">{task.location} · {task.category} · by {task.customerName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-data text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusBadgeClasses(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className="font-display font-bold text-[15px] text-[#2F6D53]">
                    {task.currency} {Number(task.budget).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
