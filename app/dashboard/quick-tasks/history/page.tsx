"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type HistoryTask = {
  id: string;
  category: string;
  title: string;
  location: string;
  budget: string;
  currency: string;
  customerName: string;
  status: string;
  acceptedAt: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  delivery: "", cleaning: "", moving: "", shopping: "️",
  repairs: "", computer_help: "", event_support: "", personal_assistance: "", other: "",
};

export default function QuickTasksHistoryPage() {
  const [tasks, setTasks] = useState<HistoryTask[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("kaziin_active_quick_tasks") || "[]") as HistoryTask[];
    // History shows rated/closed tasks
    setTasks(stored.filter(t => t.status === "RATED"));
  }, []);

  return (
    <div className="max-w-[700px] mx-auto py-10 px-5">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">TASK HISTORY</h1>
          <p className="mt-1 text-ink-soft text-[15px]">View your completed and closed tasks.</p>
        </div>
        <Link href="/dashboard/quick-tasks/active" className="text-[13.5px] text-accent-dark font-medium hover:underline">
          ← Back to Active Tasks
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="py-16 text-center border border-line rounded-[14px] bg-paper">
          <div className="text-[15px] font-semibold text-ink mb-2">No completed tasks yet</div>
          <p className="text-ink-soft text-[14px] mb-6 max-w-[360px] mx-auto">Complete active tasks to build your history and reputation.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map(task => (
            <div key={task.id} className="border border-line rounded-[12px] p-5 flex items-center justify-between gap-4 opacity-70 bg-paper hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4">
                <span className="text-[20px] shrink-0">{CATEGORY_ICONS[task.category] || ""}</span>
                <div>
                  <div className="font-display font-semibold text-[15px] uppercase">{task.title}</div>
                  <div className="text-[13px] text-ink-soft mt-0.5">{task.location}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-bold text-accent-dark"> Completed</div>
                <div className="text-[12px] text-ink-soft mt-1">{task.currency} {task.budget}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
