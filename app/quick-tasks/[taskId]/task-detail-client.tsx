"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  findTaskById,
  acceptTask,
  updateTaskStatus,
  getCategoryInfo,
  getStatusBadgeClasses,
  getStatusLabel,
  getNextTaskerStatus,
  getPostedTasks,
  getActiveTasks,
  type QuickTask,
} from "@/lib/quick-tasks";

/* ============================================================
   Task Details — /quick-tasks/[taskId]
   Adapts to Customer view vs Tasker view (SKILL.md §11)
   State machine controls (SKILL.md §12)
   ============================================================ */

export function TaskDetailClient() {
  const { taskId } = useParams();
  
  const [task, setTask] = useState<QuickTask | null>(null);
  const [role, setRole] = useState<"customer" | "tasker" | "prospective" | null>(null);
  const [loading, setLoading] = useState(true);

  // Ratings (mock)
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    const t = findTaskById(taskId as string);
    if (!t) {
      setLoading(false);
      return;
    }

    setTask(t);

    // Determine role (mock authentication based on localStorage)
    const posted = getPostedTasks();
    const active = getActiveTasks();
    
    if (posted.some(p => p.id === t.id)) {
      setRole("customer");
    } else if (active.some(a => a.id === t.id)) {
      setRole("tasker");
    } else {
      setRole("prospective");
    }
    
    setLoading(false);
  }, [taskId]);

  if (loading) {
    return (
      <main className="wrap py-20 text-center"><p className="text-ink-soft">Loading task...</p></main>
    );
  }

  if (!task || !role) {
    return (
      <main className="wrap py-20 text-center">
        <p className="text-ink-soft mb-4">Task not found or unavailable.</p>
        <Link href="/quick-tasks" className="text-accent-dark font-medium hover:underline">Back to Quick Tasks</Link>
      </main>
    );
  }

  const catInfo = getCategoryInfo(task.category);

  // ── Actions ──

  function handleAccept() {
    if (!task) return;
    const accepted = acceptTask(task);
    setTask(accepted);
    setRole("tasker");
  }

  function handleTaskerUpdate(newStatus: QuickTask["status"]) {
    if (!task) return;
    updateTaskStatus(task.id, newStatus);
    setTask({ ...task, status: newStatus });
  }

  function handleCustomerConfirm() {
    if (!task) return;
    // Real implementation would hit an API, we just update local state
    const updatedTasks = getPostedTasks().map(t => 
      t.id === task.id ? { ...t, status: "CUSTOMER_CONFIRMED" as const } : t
    );
    localStorage.setItem("kaziin_quick_tasks", JSON.stringify(updatedTasks));
    // Also update active tasks so tasker sees it
    updateTaskStatus(task.id, "CUSTOMER_CONFIRMED");
    setTask({ ...task, status: "CUSTOMER_CONFIRMED" });
    setShowRating(true); // Automatically show rating after confirming
  }

  function submitRating() {
    if (!task) return;
    updateTaskStatus(task.id, "RATED");
    const updatedTasks = getPostedTasks().map(t => 
      t.id === task.id ? { ...t, status: "RATED" as const } : t
    );
    localStorage.setItem("kaziin_quick_tasks", JSON.stringify(updatedTasks));
    setTask({ ...task, status: "RATED" });
    setShowRating(false);
  }

  const nextTaskerStatus = getNextTaskerStatus(task.status);

  return (
    <main className="bg-paper py-10 min-h-[70vh]">
        <div className="max-w-[700px] mx-auto wrap">
          
          {/* Breadcrumb */}
          <nav className="font-data text-[12px] text-ink-soft mb-6">
            <Link href="/quick-tasks" className="hover:text-ink">Quick Tasks</Link> / 
            {role === "prospective" && " Available Task"}
            {role === "customer" && " Your Posted Task"}
            {role === "tasker" && " Your Active Task"}
          </nav>

          {/* ── Title Area ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
                {catInfo.icon} {catInfo.label}
              </span>
              <span className={`font-data text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusBadgeClasses(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
            
            <h1 className="font-display font-bold text-[32px] text-ink leading-tight mb-2 uppercase">
              {task.title}
            </h1>
            
            {role === "customer" && task.taskerId && task.status !== "REQUESTED" && task.status !== "SEARCHING" && (
              <div className="flex items-center gap-3 mt-4 p-4 border border-line rounded-[12px] bg-paper">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-display font-bold text-[14px]">
                  {task.taskerName?.[0]}
                </div>
                <div>
                  <div className="text-[13.5px] text-ink-soft font-data uppercase tracking-wider font-semibold">Assigned Tasker</div>
                  <div className="font-display font-bold text-[16px]">{task.taskerName}</div>
                </div>
                <div className="ml-auto flex gap-2">
                  <a href={`https://wa.me/254700000000`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-[#25D366]/10 text-[#25D366] font-semibold text-[13px] border border-[#25D366]/20">
                    Message
                  </a>
                </div>
              </div>
            )}

            {role === "tasker" && (
              <div className="flex items-center gap-3 mt-4 p-4 border border-line rounded-[12px] bg-paper">
                <div className="w-10 h-10 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[14px]">
                  {task.customerName?.[0]}
                </div>
                <div>
                  <div className="text-[13.5px] text-ink-soft font-data uppercase tracking-wider font-semibold">Customer</div>
                  <div className="font-display font-bold text-[16px]">{task.customerName}</div>
                </div>
                <div className="ml-auto flex gap-2">
                  <a href={`https://wa.me/${task.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-[#25D366]/10 text-[#25D366] font-semibold text-[13px] border border-[#25D366]/20">
                    Message
                  </a>
                </div>
              </div>
            )}
          </div>

          <hr className="border-t border-line mb-8" />

          {/* ── Details Sections ── */}
          <div className="space-y-8 mb-10 bg-paper border border-line rounded-[16px] p-6 md:p-8">
            
            <section>
              <h2 className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">Description</h2>
              <p className="text-[15px] text-ink leading-relaxed">{task.description}</p>
            </section>
            
            <hr className="border-t border-line border-dashed" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <section>
                <h2 className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">When</h2>
                <p className="text-[15px] text-ink font-medium">
                  {task.urgency === "asap" ? "Right Now (ASAP)" : `${task.scheduledDate} at ${task.scheduledTime}`}
                </p>
              </section>

              <section>
                <h2 className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">Payment</h2>
                <p className="text-[20px] text-[#2F6D53] font-display font-bold">
                  {task.pricingType === "fixed" ? `${task.currency} ${Number(task.budget).toLocaleString()}` : "Open to offers"}
                </p>
              </section>
            </div>
            
            <hr className="border-t border-line border-dashed" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <section>
                <h2 className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">Location</h2>
                <p className="text-[15px] text-ink font-medium">{task.location}</p>
                {task.locationDetails && (
                  <p className="text-[14px] text-ink-soft mt-1">{task.locationDetails}</p>
                )}
              </section>
              
              {task.destination && (
                <section>
                  <h2 className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">Destination</h2>
                  <p className="text-[15px] text-ink font-medium">{task.destination}</p>
                </section>
              )}
            </div>
          </div>

          {/* ── Action Bars ── */}

          {/* Prospective Tasker Action */}
          {role === "prospective" && task.status === "REQUESTED" && (
            <div className="bg-paper border border-line p-5 rounded-[16px] flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[13.5px] text-ink-soft max-w-[320px]">
                By accepting, you agree to complete this task at the specified time and location.
              </p>
              <button 
                onClick={handleAccept}
                className="px-8 py-3.5 rounded-[12px] bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors w-full sm:w-auto text-center"
              >
                ACCEPT TASK
              </button>
            </div>
          )}

          {/* Active Tasker Actions */}
          {role === "tasker" && task.status !== "RATED" && task.status !== "CLOSED" && (
            <div className="bg-paper border border-line p-5 rounded-[16px] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[13.5px] text-ink-soft">
                <span className="font-semibold text-ink block mb-1">Update Task Status</span>
                Keep the customer informed of your progress.
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {nextTaskerStatus && nextTaskerStatus !== "COMPLETED" && (
                  <button 
                    onClick={() => handleTaskerUpdate(nextTaskerStatus)}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] bg-paper border border-line text-ink font-semibold text-[13.5px] hover:bg-line/40 transition-colors"
                  >
                    → {getStatusLabel(nextTaskerStatus)}
                  </button>
                )}
                {nextTaskerStatus === "COMPLETED" && (
                  <button 
                    onClick={() => handleTaskerUpdate("COMPLETED")}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[13.5px] hover:bg-[#1E4D39] transition-colors"
                  >
                    Mark Completed
                  </button>
                )}
                {task.status === "COMPLETED" && (
                  <div className="px-5 py-3 rounded-[10px] bg-gold-soft text-gold font-semibold text-[13.5px] w-full text-center">
                    Waiting for customer confirmation...
                  </div>
                )}
                {(task.status === "CUSTOMER_CONFIRMED" || task.status === "PAYMENT_RELEASED") && (
                  <div className="px-5 py-3 rounded-[10px] bg-accent-soft text-accent-dark font-semibold text-[13.5px] w-full text-center">
                    Payment processing / Task finished
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Actions */}
          {role === "customer" && task.status === "COMPLETED" && !showRating && (
            <div className="bg-paper border border-accent p-6 rounded-[16px] text-center">
              <h3 className="font-display font-bold text-[20px] text-[#2F6D53] mb-2">Tasker marked this as completed</h3>
              <p className="text-[14.5px] text-ink-soft mb-5">Please confirm that the work was done satisfactorily to release the payment.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    updateTaskStatus(task.id, "DISPUTED");
                    setTask({ ...task, status: "DISPUTED" });
                  }}
                  className="px-6 py-3 rounded-[10px] border border-line hover:bg-paper font-semibold text-[14px]"
                >
                  Report an issue
                </button>
                <button onClick={handleCustomerConfirm} className="px-8 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39]">
                  Confirm &amp; Pay
                </button>
              </div>
            </div>
          )}

          {/* Customer: Cancel Task — only while task is still REQUESTED/SEARCHING */}
          {role === "customer" && (task.status === "REQUESTED" || task.status === "DRAFT") && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  updateTaskStatus(task.id, "CANCELLED");
                  setTask({ ...task, status: "CANCELLED" });
                }}
                className="text-[13.5px] text-danger font-medium hover:underline"
              >
                Cancel Task
              </button>
            </div>
          )}

          {/* Disputed state */}
          {task.status === "DISPUTED" && (
            <div className="bg-danger-soft border border-danger/20 p-5 rounded-[16px] text-center mt-6">
              <div className="text-[15px] font-semibold text-danger mb-1">This task is under dispute</div>
              <p className="text-[13.5px] text-ink-soft">Our team has been notified and will review this task.</p>
            </div>
          )}

          {/* Rating Flow (Customer) */}
          {showRating && (
            <div className="bg-paper border border-line p-8 rounded-[16px] text-center mt-6 shadow-sm">
              <h3 className="font-display font-bold text-[22px] text-ink mb-1">Rate your Tasker</h3>
              <p className="text-[14.5px] text-ink-soft mb-6">How was your experience with {task.taskerName}?</p>
              
              <div className="flex gap-2 justify-center mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)}
                    className={`text-[36px] transition-transform hover:scale-110 ${star <= rating ? "opacity-100 grayscale-0" : "opacity-30 grayscale"}`}>
                    
                  </button>
                ))}
              </div>
              
              <button 
                onClick={submitRating} 
                disabled={rating === 0}
                className="px-10 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] disabled:opacity-40"
              >
                Submit & Close Task
              </button>
            </div>
          )}

          {/* Finished state */}
          {task.status === "RATED" && (
            <div className="bg-paper border border-line p-6 rounded-[16px] text-center text-ink-soft mt-6">
              This task is fully complete and closed.
            </div>
          )}

        </div>
    </main>
  );
}
