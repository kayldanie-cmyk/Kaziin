"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

/* ============================================================
   Quick Tasks — Task Details
   Per SKILL.md §8
   ============================================================ */

type QuickTask = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  locationDetails?: string;
  budget: string;
  currency: string;
  urgency: string;
  scheduledDate?: string;
  scheduledTime?: string;
  pricingType: string;
  customerName: string;
  customerPhone: string;
  postedAt: string;
  status: string;
};

const CATEGORIES = [
  { id: "delivery", label: " Delivery" },
  { id: "cleaning", label: " Cleaning" },
  { id: "moving", label: " Moving" },
  { id: "shopping", label: "️ Shopping" },
  { id: "repairs", label: " Repairs" },
  { id: "computer_help", label: " Computer Help" },
  { id: "event_support", label: " Event Support" },
  { id: "personal_assistance", label: " Personal Assistance" },
  { id: "other", label: " Other" },
];

export default function QuickTaskDetailsPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<QuickTask | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Check demo tasks first, then localStorage
    const DEMO_TASKS: QuickTask[] = [
      { id: "qt_demo_1", category: "delivery", title: "Deliver documents from Kilimani to Karen", description: "A4 envelope, handle with care. Address will be shared on WhatsApp.", location: "Kilimani → Karen, Nairobi", budget: "400", currency: "KES", urgency: "today", pricingType: "fixed", customerName: "Sarah", customerPhone: "+254711000001", postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "REQUESTED" },
      { id: "qt_demo_2", category: "cleaning", title: "House cleaning — 3-bedroom apartment", description: "Deep clean needed. Cleaning supplies provided.", location: "Westlands, Nairobi", budget: "1500", currency: "KES", urgency: "schedule", scheduledDate: "2026-10-01", scheduledTime: "09:00", pricingType: "fixed", customerName: "James", customerPhone: "+254711000002", postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "REQUESTED" },
      { id: "qt_demo_3", category: "repairs", title: "Plumber needed — kitchen sink leak", description: "Pipe under the sink is dripping. Should be a quick fix.", location: "South B, Nairobi", budget: "800", currency: "KES", urgency: "asap", pricingType: "fixed", customerName: "Mike", customerPhone: "+254711000003", postedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: "REQUESTED" },
    ];
    
    const stored = JSON.parse(localStorage.getItem("kaziin_quick_tasks") || "[]") as QuickTask[];
    const found = DEMO_TASKS.find(t => t.id === taskId) || stored.find(t => t.id === taskId);
    
    if (found) {
      setTask(found);
    }
  }, [taskId]);

  function handleAccept() {
    if (!task) return;
    
    // Move to active
    const acceptedTasks = JSON.parse(localStorage.getItem("kaziin_accepted_quick_tasks") || "[]") as string[];
    if (!acceptedTasks.includes(task.id)) {
      acceptedTasks.push(task.id);
      localStorage.setItem("kaziin_accepted_quick_tasks", JSON.stringify(acceptedTasks));
      
      const activeTasks = JSON.parse(localStorage.getItem("kaziin_active_quick_tasks") || "[]");
      activeTasks.push({ ...task, acceptedAt: new Date().toISOString(), status: "TASKER_ACCEPTED" });
      localStorage.setItem("kaziin_active_quick_tasks", JSON.stringify(activeTasks));
    }
    setAccepted(true);
  }

  if (!task) {
    return (
      <div className="max-w-[700px] mx-auto py-20 px-5 text-center">
        <p className="text-ink-soft text-[15px]">Task not found or loading...</p>
        <Link href="/dashboard/quick-tasks" className="mt-4 inline-block text-accent-dark hover:underline">Back to feed</Link>
      </div>
    );
  }

  const catInfo = CATEGORIES.find(c => c.id === task.category);
  
  if (accepted) {
    return (
      <div className="max-w-[700px] mx-auto py-10 px-5">
        <div className="border border-line rounded-[16px] p-8 text-center bg-paper mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-6 text-3xl"></div>
          <h1 className="font-display font-bold text-[24px] text-[#2F6D53] mb-2">Task Accepted!</h1>
          <p className="text-[15px] text-ink-soft mb-6">You have committed to this task. The customer is expecting you.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/quick-tasks/active" className="px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors">
              Go to Active Tasks
            </Link>
            <a href={`https://wa.me/${task.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl border border-[#25D366] text-[#25D366] font-bold text-[14px] hover:bg-[#25D366]/10 transition-colors flex items-center gap-2">
              
              Message Customer
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto py-10 px-5">
      <nav className="font-data text-[12px] text-ink-soft mb-6">
        <Link href="/dashboard/quick-tasks" className="hover:text-ink">← Back to Tasks</Link>
      </nav>

      {/* ── Title Area ── */}
      <div className="mb-8">
        <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded mb-3 inline-block">
          {catInfo?.label || task.category}
        </span>
        <h1 className="font-display font-bold text-[32px] text-ink leading-tight mb-2 uppercase">{task.title}</h1>
        <div className="text-[15px] text-ink-soft flex items-center gap-2">
          <span>{task.location}</span>
        </div>
      </div>

      <hr className="border-t border-line mb-8" />

      {/* ── Details Sections ── */}
      <div className="space-y-8 mb-10">
        
        <section>
          <h2 className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">TASK</h2>
          <p className="text-[15px] text-ink leading-relaxed">{task.description}</p>
        </section>
        
        <hr className="border-t border-line border-dashed" />

        <section>
          <h2 className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">WHEN</h2>
          <p className="text-[15px] text-ink font-medium">
            {task.urgency === "asap" ? "Right Now (ASAP)" : `${task.scheduledDate} at ${task.scheduledTime}`}
          </p>
        </section>
        
        <hr className="border-t border-line border-dashed" />

        <section>
          <h2 className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">LOCATION</h2>
          <p className="text-[15px] text-ink font-medium">{task.location}</p>
          {task.locationDetails && (
            <p className="text-[14px] text-ink-soft mt-1">{task.locationDetails}</p>
          )}
        </section>
        
        <hr className="border-t border-line border-dashed" />

        <section>
          <h2 className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-2 font-semibold">PAYMENT</h2>
          <p className="text-[20px] text-[#2F6D53] font-display font-bold">
            {task.pricingType === "fixed" ? `${task.currency} ${Number(task.budget).toLocaleString()}` : "Open to offers"}
          </p>
        </section>

      </div>

      {/* ── CTA ── */}
      <div className="sticky bottom-0 bg-paper border-t border-line p-5 -mx-5 flex items-center justify-between gap-4">
        <p className="text-[12.5px] text-ink-soft hidden sm:block max-w-[280px]">
          By accepting, you agree to complete this task at the specified time and location.
        </p>
        <button 
          onClick={handleAccept}
          className="px-10 py-3.5 rounded-xl bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors w-full sm:w-auto text-center"
        >
          ACCEPT TASK
        </button>
      </div>
    </div>
  );
}
