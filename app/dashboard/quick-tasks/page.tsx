"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ============================================================
   Quick Tasks — Find Work Dashboard (/dashboard/quick-tasks)
   Candidate/tasker view: browse available tasks and earn.
   No "Post a Task" here — candidates earn, they don't post.
   ============================================================ */

type QuickTask = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  budget: string;
  currency: string;
  urgency: string;
  scheduledDate?: string;
  pricingType: string;
  postedAt: string;
  status: string;
};

const CATEGORIES = [
  { id: "delivery", label: "Delivery", icon: "📦" },
  { id: "cleaning", label: "Cleaning", icon: "🧹" },
  { id: "moving", label: "Moving", icon: "🚚" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "repairs", label: "Repairs", icon: "🔧" },
  { id: "computer_help", label: "Computer Help", icon: "💻" },
  { id: "event_support", label: "Event Support", icon: "🎉" },
  { id: "personal_assistance", label: "Personal Assistance", icon: "🤝" },
  { id: "other", label: "Other", icon: "✨" },
];

const DEMO_TASKS: QuickTask[] = [
  {
    id: "qt_demo_1",
    category: "delivery",
    title: "Deliver documents from Kilimani to Karen",
    description: "A4 envelope, handle with care. Address will be shared on WhatsApp.",
    location: "Kilimani → Karen, Nairobi",
    budget: "400",
    currency: "KES",
    urgency: "today",
    pricingType: "fixed",
    postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "REQUESTED",
  },
  {
    id: "qt_demo_2",
    category: "cleaning",
    title: "House cleaning — 3-bedroom apartment",
    description: "Deep clean needed. Cleaning supplies provided.",
    location: "Westlands, Nairobi",
    budget: "1500",
    currency: "KES",
    urgency: "schedule",
    scheduledDate: "2026-10-01",
    pricingType: "fixed",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "REQUESTED",
  },
  {
    id: "qt_demo_3",
    category: "repairs",
    title: "Plumber needed — kitchen sink leak",
    description: "Pipe under the sink is dripping. Should be a quick fix.",
    location: "South B, Nairobi",
    budget: "800",
    currency: "KES",
    urgency: "asap",
    pricingType: "fixed",
    postedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: "REQUESTED",
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CandidateQuickTasksPage() {
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [filter, setFilter] = useState("all");
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("kaziin_quick_tasks") || "[]") as QuickTask[];
    const accepted = JSON.parse(localStorage.getItem("kaziin_accepted_quick_tasks") || "[]") as string[];
    setTasks([...DEMO_TASKS, ...stored].filter((t) => t.status === "REQUESTED"));
    setAcceptedIds(new Set(accepted));
  }, []);

  const categories = ["all", ...Array.from(new Set(tasks.map((t) => t.category)))];
  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.category === filter);

  return (
    <div className="max-w-[800px] mx-auto py-8 px-2">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Quick Tasks</h1>
        <p className="text-[14.5px] text-ink-soft mt-1">
          Find quick jobs near you. Accept a task and earn on your schedule.
        </p>
      </div>

      {/* ── Active tasks banner ── */}
      {acceptedIds.size > 0 && (
        <Link
          href="/dashboard/quick-tasks/active"
          className="flex items-center justify-between px-4 py-3 mb-6 border border-[#2F6D53]/30 bg-accent-soft rounded-[12px] hover:border-[#2F6D53]/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2F6D53] animate-pulse" />
            <span className="font-semibold text-[14px] text-[#2F6D53]">
              You have {acceptedIds.size} active task{acceptedIds.size > 1 ? "s" : ""}
            </span>
            <span className="text-[13px] text-[#2F6D53]/70 hidden sm:block">— tap to manage</span>
          </div>
          <span className="text-accent-dark font-semibold text-[13px]">View →</span>
        </Link>
      )}

      {/* ── Category filter pills ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => {
          const info = CATEGORIES.find((c) => c.id === cat);
          const label = cat === "all" ? "All tasks" : `${info?.icon ?? ""} ${info?.label ?? cat}`;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                filter === cat
                  ? "bg-[#2F6D53] border-[#2F6D53] text-white"
                  : "border-line text-ink-soft hover:border-[#2F6D53]/40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Task feed ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-line rounded-[16px]">
          <p className="font-display font-bold text-[18px] text-[#2F6D53] mb-2">No tasks available right now</p>
          <p className="text-[14px] text-ink-soft max-w-[320px] mx-auto leading-relaxed">
            New tasks are posted regularly. Check back soon or update your location in your profile.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((task) => {
            const info = CATEGORIES.find((c) => c.id === task.category);
            const isAccepted = acceptedIds.has(task.id);
            return (
              <Link
                key={task.id}
                href={`/dashboard/quick-tasks/${task.id}`}
                id={`qt-card-${task.id}`}
                className="block border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
                        {info?.icon} {info?.label ?? task.category}
                      </span>
                      <span className="font-data text-[11px] text-ink-soft">{timeAgo(task.postedAt)}</span>
                      {task.urgency === "asap" && (
                        <span className="font-data text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Urgent
                        </span>
                      )}
                      {isAccepted && (
                        <span className="font-data text-[10px] bg-accent-soft text-accent-dark border border-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Accepted
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-[17px] text-ink mb-2">{task.title}</h3>
                    <div className="flex flex-wrap gap-3 text-[13px] text-ink-soft">
                      <span>📍 {task.location}</span>
                      <span>·</span>
                      <span>{task.urgency === "asap" ? "ASAP" : task.scheduledDate ?? "Flexible"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-3">
                    <div className="font-display font-bold text-[18px] text-[#2F6D53]">
                      {task.pricingType === "fixed"
                        ? `${task.currency} ${Number(task.budget).toLocaleString()}`
                        : "Open Offer"}
                    </div>
                    <span className="text-[13px] font-semibold text-accent-dark group-hover:underline">
                      {isAccepted ? "Manage →" : "View Task →"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
