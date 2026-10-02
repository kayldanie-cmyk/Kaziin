"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ============================================================
   Quick Tasks — Active Task
   Per SKILL.md §10 & §11
   ============================================================ */

type ActiveTask = {
  id: string;
  category: string;
  title: string;
  location: string;
  budget: string;
  currency: string;
  customerName: string;
  customerPhone: string;
  acceptedAt: string;
  status: "TASKER_ACCEPTED" | "EN_ROUTE" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CUSTOMER_CONFIRMED" | "RATED";
};

const CATEGORY_ICONS: Record<string, string> = {
  delivery: "", cleaning: "", moving: "", shopping: "️",
  repairs: "", computer_help: "", event_support: "", personal_assistance: "", other: "",
};

export default function ActiveQuickTasksPage() {
  const [tasks, setTasks] = useState<ActiveTask[]>([]);
  const [ratingTask, setRatingTask] = useState<ActiveTask | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("kaziin_active_quick_tasks") || "[]") as ActiveTask[];
    setTasks(stored);
  }, []);

  function updateStatus(taskId: string, newStatus: ActiveTask["status"]) {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updated);
    localStorage.setItem("kaziin_active_quick_tasks", JSON.stringify(updated));
  }

  function handleComplete(task: ActiveTask) {
    updateStatus(task.id, "COMPLETED");
  }

  function handleConfirm(task: ActiveTask) {
    updateStatus(task.id, "CUSTOMER_CONFIRMED");
    setRatingTask({ ...task, status: "CUSTOMER_CONFIRMED" });
    setRating(0);
    setRatingNote("");
    setRatingSubmitted(false);
  }

  function submitRating() {
    if (!ratingTask) return;
    updateStatus(ratingTask.id, "RATED");
    setRatingSubmitted(true);
  }

  function closeRating() {
    setRatingTask(null);
    setRating(0);
    setRatingNote("");
    setRatingSubmitted(false);
  }

  const getStatusLabel = (status: ActiveTask["status"]) => {
    const map = {
      "TASKER_ACCEPTED": "Tasker accepted",
      "EN_ROUTE": "On the way to pickup",
      "ARRIVED": "Arrived",
      "IN_PROGRESS": "In progress",
      "COMPLETED": "Completed - Waiting for confirmation",
      "CUSTOMER_CONFIRMED": "Customer confirmed",
      "RATED": "Rated & Closed",
    };
    return map[status] || status;
  };

  const getNextStatus = (status: ActiveTask["status"]): ActiveTask["status"] | null => {
    const sequence: ActiveTask["status"][] = ["TASKER_ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"];
    const idx = sequence.indexOf(status);
    if (idx >= 0 && idx < sequence.length - 1) return sequence[idx + 1];
    return null;
  };

  const activeTasks = tasks.filter(t => t.status !== "RATED");

  return (
    <div className="max-w-[700px] mx-auto py-10 px-5">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">ACTIVE TASKS</h1>
          <p className="mt-1 text-ink-soft text-[15px]">Track tasks you&apos;ve accepted and manage their status.</p>
        </div>
        <Link href="/dashboard/quick-tasks" className="text-[13.5px] text-accent-dark font-medium hover:underline">
          ← Browse more tasks
        </Link>
      </div>

      {activeTasks.length === 0 ? (
        <div className="py-16 text-center border border-line rounded-[14px] bg-paper">
          <div className="text-[15px] font-semibold text-ink mb-2">No active tasks right now</div>
          <p className="text-ink-soft text-[14px] mb-6 max-w-[360px] mx-auto">Browse the quick tasks feed and accept tasks to see them here.</p>
          <Link href="/dashboard/quick-tasks" className="inline-block px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors">
            Get a Task
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {activeTasks.map(task => {
            const nextStatus = getNextStatus(task.status);
            
            return (
              <div key={task.id} className="border border-line rounded-[14px] overflow-hidden">
                {/* Header */}
                <div className="bg-paper p-5 border-b border-line flex items-center justify-between gap-4">
                  <div>
                    <span className="font-data text-[10px] font-semibold uppercase tracking-wider text-accent-dark block mb-1">
                      {task.category}
                    </span>
                    <h2 className="font-display font-bold text-[18px] uppercase">{task.title}</h2>
                  </div>
                  <div className="text-right">
                    <span className="font-data text-[10px] uppercase tracking-wider text-ink-soft block mb-1">Status</span>
                    <span className="text-[13.5px] font-semibold text-accent-dark">{getStatusLabel(task.status)}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1 block">Location</span>
                      <div className="text-[14px] font-medium">{task.location}</div>
                    </div>
                    <div>
                      <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1 block">Payment</span>
                      <div className="text-[15px] font-bold text-[#2F6D53]">
                        {task.currency} {Number(task.budget).toLocaleString()}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1 block">Customer</span>
                      <div className="flex items-center gap-3">
                        <div className="text-[14px] font-medium">{task.customerName}</div>
                        <a href={`https://wa.me/${task.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors">
                          
                          Message
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-line">
                    {nextStatus && nextStatus !== "COMPLETED" && (
                      <button onClick={() => updateStatus(task.id, nextStatus)}
                        className="px-5 py-2 rounded-xl bg-paper border border-line text-ink font-semibold text-[13px] hover:bg-line/40 transition-colors">
                        Update Status → {getStatusLabel(nextStatus)}
                      </button>
                    )}
                    {nextStatus === "COMPLETED" && (
                      <button onClick={() => handleComplete(task)}
                        className="px-5 py-2 rounded-xl bg-[#2F6D53] text-white font-bold text-[13px] hover:bg-[#1E4D39] transition-colors">
                        Mark Task Completed
                      </button>
                    )}
                    {task.status === "COMPLETED" && (
                      <button onClick={() => handleConfirm(task)}
                        className="px-5 py-2 rounded-xl border border-[#2F6D53] text-[#2F6D53] font-bold text-[13px] hover:bg-accent-soft transition-colors flex items-center gap-2">
                        [DEMO] Simulate Customer Confirmation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rating Modal ── */}
      {ratingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-paper border border-line rounded-[16px] p-8 max-w-sm w-full relative shadow-2xl">
            {ratingSubmitted ? (
              <div className="text-center">
                <div className="text-4xl mb-4"></div>
                <h3 className="font-display font-bold text-[20px] text-[#2F6D53] mb-2">Task Closed!</h3>
                <p className="text-ink-soft text-[14px] mb-6">Thank you for your rating. The task is now officially complete and your payment has been released.</p>
                <button onClick={closeRating} className="w-full px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display font-bold text-[18px] mb-1">Rate this task</h3>
                <p className="text-ink-soft text-[14px] mb-6 uppercase">{ratingTask.title}</p>
                
                <div className="mb-6 text-center">
                  <label className="block font-data text-[12.5px] uppercase tracking-wider text-ink-soft mb-3 font-semibold">How was the customer?</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(star)}
                        className={`text-[32px] transition-transform hover:scale-110 ${star <= rating ? "opacity-100 grayscale-0" : "opacity-30 grayscale"}`}>
                        
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="rating-note" className="block font-data text-[12.5px] uppercase tracking-wider text-ink-soft mb-1.5 font-semibold">
                    Optional feedback
                  </label>
                  <textarea id="rating-note" value={ratingNote} onChange={e => setRatingNote(e.target.value)} rows={3}
                    className="w-full border border-line rounded-[9px] px-3 py-2.5 text-[14px] focus:outline-none focus:border-accent resize-none bg-paper"
                    placeholder="Was the customer clear, fair, and punctual?" />
                </div>
                
                <button onClick={submitRating} disabled={rating === 0}
                  className="w-full px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Submit Rating
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
