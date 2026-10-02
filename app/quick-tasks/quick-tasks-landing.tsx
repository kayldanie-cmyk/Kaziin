"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TASK_CATEGORIES,
  getCategoryInfo,
  getAvailableTasks,
  getAcceptedIds,
  timeAgo,
  type QuickTask,
} from "@/lib/quick-tasks";

/* ============================================================
   Quick Tasks Landing — /quick-tasks
   Per SKILL.md §4, §5, §7
   Three actions: POST A TASK / GET A TASK / MY TASKS
   Plus the live task feed for taskers.
   ============================================================ */

export function QuickTasksLanding() {
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [filter, setFilter] = useState("all");
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    setTasks(getAvailableTasks());
    setAcceptedCount(getAcceptedIds().size);
  }, []);

  const categories = ["all", ...Array.from(new Set(tasks.map((t) => t.category)))];
  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.category === filter);

  return (
    <>
        <section className="py-12 md:py-16 bg-paper border-b border-line">
          <div className="wrap text-center">
            <span className="font-data text-[12px] text-accent-dark bg-accent-soft px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-block mb-5">
              On-demand task marketplace
            </span>
            <h1 className="font-display font-bold text-[#2F6D53] leading-[1.05]" style={{ fontSize: "clamp(30px, 5vw, 50px)" }}>
              QUICK TASKS
            </h1>
            <p className="mt-3 text-[15px] md:text-[16px] max-w-[440px] mx-auto leading-relaxed text-ink-soft">
              Get things done fast. Post a task and get matched to a nearby tasker — or find quick work and earn on your schedule.
            </p>

            {/* Primary CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup?role=hire&next=/hire/quick-tasks/new"
                id="qt-post-task-cta"
                className="px-8 py-3 rounded-[12px] bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors"
              >
                Post a Task
              </Link>
              <a
                href="#feed"
                className="px-8 py-3 rounded-[12px] border border-[#2F6D53] text-[#2F6D53] font-bold text-[15px] hover:bg-[#2F6D53]/10 transition-colors"
              >
                Get a Task
              </a>
            </div>

            {/* Three gateway shortcuts */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[760px] mx-auto text-left">
              <Link
                href="/auth/signup?role=hire&next=/hire/quick-tasks/new"
                id="qt-post-task"
                className="group flex flex-col justify-between rounded-[12px] border border-line bg-paper p-5 transition-colors hover:border-accent hover:shadow-sm"
              >
                <div>
                  <span className="block font-display font-bold text-[16px] text-ink group-hover:text-accent transition-colors mb-1.5">
                    Post a Task
                  </span>
                  <span className="block text-[13px] leading-relaxed text-ink-soft mb-3">
                    Need an extra hand? Describe what you need done and get matched with local taskers instantly.
                  </span>
                </div>
                <span className="font-semibold text-[13px] text-[#2F6D53] group-hover:underline">Post now →</span>
              </Link>
              <a
                href="#feed"
                id="qt-get-task"
                className="group flex flex-col justify-between rounded-[12px] border border-line bg-paper p-5 transition-colors hover:border-accent hover:shadow-sm cursor-pointer"
              >
                <div>
                  <span className="block font-display font-bold text-[16px] text-ink group-hover:text-accent transition-colors mb-1.5">
                    Get a Task
                  </span>
                  <span className="block text-[13px] leading-relaxed text-ink-soft mb-3">
                    Find quick jobs in your area. Set your own schedule, work locally, and earn money right away.
                  </span>
                </div>
                <span className="font-semibold text-[13px] text-[#2F6D53] group-hover:underline">Browse available tasks ↓</span>
              </a>
              <Link
                href="/quick-tasks/my-tasks"
                id="qt-my-tasks"
                className="group flex flex-col justify-between rounded-[12px] border border-line bg-paper p-5 transition-colors hover:border-accent hover:shadow-sm"
              >
                <div>
                  <span className="block font-display font-bold text-[16px] text-ink group-hover:text-accent transition-colors mb-1.5">
                    My Tasks
                  </span>
                  <span className="block text-[13px] leading-relaxed text-ink-soft mb-3">
                    Track the status of your posted tasks, manage your active jobs, and review your completion history.
                  </span>
                </div>
                <span className="font-semibold text-[13px] text-[#2F6D53] group-hover:underline">View my tasks →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Active Tasks Banner ── */}
        {acceptedCount > 0 && (
          <div className="wrap py-3">
            <Link
              href="/quick-tasks/my-tasks"
              className="flex items-center justify-between px-4 py-3 border border-line rounded-[12px] bg-paper hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2F6D53] animate-pulse" />
                <span className="font-semibold text-[14px] text-ink">
                  You have {acceptedCount} active task{acceptedCount > 1 ? "s" : ""}
                </span>
                <span className="text-[13px] text-ink-soft hidden sm:block">— View and manage your tasks</span>
              </div>
              <span className="text-accent-dark font-semibold text-[13px]">View →</span>
            </Link>
          </div>
        )}

        {/* ── Task Feed ── */}
        <section id="feed" className="wrap py-10 md:py-14">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div>
                <h2 className="font-display font-bold text-[24px] text-[#2F6D53]">
                  Available Tasks
                </h2>
                <p className="text-ink-soft text-[14px] mt-1">
                  Browse quick tasks near you. Accept one to get started.
                </p>
              </div>
              <span className="font-data text-[12px] text-ink-soft">
                {filtered.length} task{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap mb-8">
              {categories.map((cat) => {
                const catInfo = getCategoryInfo(cat);
                const label = cat === "all" ? "All tasks" : `${catInfo.icon} ${catInfo.label}`;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                      filter === cat
                        ? "bg-[#2F6D53] border-[#2F6D53] text-white"
                        : "bg-paper border-line text-ink-soft hover:border-[#2F6D53]/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Task cards */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-line rounded-[14px] bg-paper">
                <p className="text-ink-soft text-[15px]">
                  No tasks found in this category right now.
                </p>
                <p className="text-ink-soft text-[13px] mt-2">
                  Check back soon or{" "}
                  <Link href="/auth/signup?role=hire&next=/hire/quick-tasks/new" className="text-accent-dark font-semibold hover:underline">
                    post a task
                  </Link>{" "}
                  yourself.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((task) => {
                  const catInfo = getCategoryInfo(task.category);
                  return (
                    <Link
                      key={task.id}
                      href={`/quick-tasks/${task.id}`}
                      id={`task-card-${task.id}`}
                      className="block border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/40 hover:bg-paper transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
                              {catInfo.icon} {catInfo.label}
                            </span>
                            <span className="font-data text-[11px] text-ink-soft">
                              {timeAgo(task.postedAt)}
                            </span>
                            {task.urgency === "asap" && (
                              <span className="font-data text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Urgent
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-semibold text-[17px] text-ink mb-2">
                            {task.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-[13px] text-ink-soft">
                            <span>{task.location}{task.destination && ` → ${task.destination}`}</span>
                            <span>·</span>
                            <span>{task.urgency === "asap" ? "ASAP" : task.scheduledDate}</span>
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
            )}
          </div>
        </section>
      </>
  );
}
