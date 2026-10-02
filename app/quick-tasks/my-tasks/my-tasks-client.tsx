"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import {
  getPostedTasks,
  getActiveTasks,
  getCategoryInfo,
  getStatusBadgeClasses,
  getStatusLabel,
  timeAgo,
  type QuickTask,
} from "@/lib/quick-tasks";

/* ============================================================
   My Tasks — Universal Task View
   Per SKILL.md §10 & §18
   Tabs: [ Tasks I Posted ] [ Tasks I'm Doing ]
   ============================================================ */

export function MyTasksClient() {
  const [activeTab, setActiveTab] = useState("posted");
  const [postedFilter, setPostedFilter] = useState("all");
  const [doingFilter, setDoingFilter] = useState("all");

  const [postedTasks, setPostedTasks] = useState<QuickTask[]>([]);
  const [doingTasks, setDoingTasks] = useState<QuickTask[]>([]);

  useEffect(() => {
    setPostedTasks(getPostedTasks());
    setDoingTasks(getActiveTasks());
  }, []);

  const TABS = [
    { id: "posted", label: "Tasks I Posted", count: postedTasks.length },
    { id: "doing", label: "Tasks I'm Doing", count: doingTasks.length },
  ];

  // ── Filters ──

  const POSTED_FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "Active", statuses: ["SEARCHING", "TASKER_MATCHED", "TASKER_ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CUSTOMER_CONFIRMED"] },
    { id: "completed", label: "Completed", statuses: ["PAYMENT_RELEASED", "RATED", "CLOSED"] },
    { id: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "DECLINED", "FAILED", "EXPIRED"] },
  ];

  const DOING_FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "Active", statuses: ["TASKER_ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"] },
    { id: "completed", label: "Completed", statuses: ["CUSTOMER_CONFIRMED", "PAYMENT_RELEASED", "RATED", "CLOSED"] },
  ];

  type FilterConfig = { id: string; label: string; statuses?: string[] };

  function filterTasks(tasks: QuickTask[], filterId: string, filterConfig: FilterConfig[]) {
    if (filterId === "all") return tasks;
    const config = filterConfig.find((f) => f.id === filterId);
    if (!config || !config.statuses) return tasks;
    return tasks.filter((t) => config.statuses!.includes(t.status));
  }

  const displayedPosted = filterTasks(postedTasks, postedFilter, POSTED_FILTERS as FilterConfig[]);
  const displayedDoing = filterTasks(doingTasks, doingFilter, DOING_FILTERS as FilterConfig[]);

  // ── Task List Renderer ──

  function renderTaskList(tasks: QuickTask[], emptyMessage: string) {
    if (tasks.length === 0) {
      return (
        <div className="py-16 text-center border border-line rounded-[14px] bg-paper">
          <p className="text-ink-soft text-[15px]">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {tasks.map((task) => {
          const catInfo = getCategoryInfo(task.category);
          return (
            <Link
              key={task.id}
              href={`/quick-tasks/${task.id}`}
              className="block border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/40 hover:bg-paper transition-colors group bg-paper"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
                      {catInfo.icon} {catInfo.label}
                    </span>
                    <span
                      className={`font-data text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusBadgeClasses(
                        task.status
                      )}`}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                    <span className="font-data text-[11px] text-ink-soft">
                      {timeAgo(task.postedAt)}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-[17px] text-ink mb-2">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-[13px] text-ink-soft">
                    <span className="flex items-center gap-1.5">
                      
                      {task.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      
                      {task.urgency === "asap" ? "ASAP" : task.scheduledDate}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-3">
                  <div className="font-display font-bold text-[18px] text-[#2F6D53]">
                    {task.pricingType === "fixed"
                      ? `${task.currency} ${Number(task.budget).toLocaleString()}`
                      : "Open Offer"}
                  </div>
                  <span className="text-[13px] font-semibold text-accent-dark group-hover:underline">
                    View Task →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <main className="wrap py-10 max-w-[800px] mx-auto min-h-[70vh]">
        {/* Breadcrumb & Header */}
        <nav className="font-data text-[12px] text-ink-soft mb-5">
          <Link href="/quick-tasks" className="hover:text-ink">Quick Tasks</Link> / My Tasks
        </nav>

        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">
              MY TASKS
            </h1>
            <p className="mt-1 text-ink-soft text-[15px]">
              Manage the tasks you posted and the ones you are working on.
            </p>
          </div>
          <Link
            href="/quick-tasks/post"
            className="px-6 py-2.5 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors"
          >
            Post a Task
          </Link>
        </div>

        {/* Universal Tabs */}
        <div className="mb-6 border-b border-line">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        {/* Tab Panels */}
        <TabPanel id="posted" activeTab={activeTab}>
          {/* Sub-filters for Posted */}
          <div className="flex gap-2 mb-6 border-b border-line/60 pb-4">
            {POSTED_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setPostedFilter(f.id)}
                className={`text-[13.5px] font-medium transition-colors px-3 py-1.5 rounded-full ${
                  postedFilter === f.id
                    ? "bg-accent-soft text-accent-dark"
                    : "text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {renderTaskList(
            displayedPosted,
            postedTasks.length === 0
              ? "You haven't posted any tasks yet."
              : "No tasks found for this filter."
          )}
        </TabPanel>

        <TabPanel id="doing" activeTab={activeTab}>
          {/* Sub-filters for Doing */}
          <div className="flex gap-2 mb-6 border-b border-line/60 pb-4">
            {DOING_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setDoingFilter(f.id)}
                className={`text-[13.5px] font-medium transition-colors px-3 py-1.5 rounded-full ${
                  doingFilter === f.id
                    ? "bg-accent-soft text-accent-dark"
                    : "text-ink-soft hover:bg-paper hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {renderTaskList(
            displayedDoing,
            doingTasks.length === 0
              ? "You haven't accepted any tasks yet."
              : "No tasks found for this filter."
          )}
        </TabPanel>
    </main>
  );
}
