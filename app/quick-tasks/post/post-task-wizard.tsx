"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  TASK_CATEGORIES,
  savePostedTask,
  findMatchingTasker,
  type QuickTask,
} from "@/lib/quick-tasks";
import { Select } from "@/components/ui/select";

/* ============================================================
   Post a Task — Public wizard /quick-tasks/post
   6-step wizard: Category → Details → Location → When → Budget → Review
   ============================================================ */

const CURRENCIES = [
  { code: "KES", label: "KES — Kenyan Shilling" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "UGX", label: "UGX — Ugandan Shilling" },
];

const BUDGET_SUGGESTIONS: Record<string, number[]> = {
  delivery:            [300, 500, 800, 1200],
  cleaning:            [800, 1500, 2500, 4000],
  moving:              [2000, 4000, 8000, 15000],
  shopping:            [200, 500, 1000, 2000],
  repairs:             [500, 1000, 2500, 5000],
  computer_help:       [500, 1000, 2000, 3500],
  event_support:       [1500, 3000, 6000, 12000],
  personal_assistance: [500, 1000, 2000, 4000],
  other:               [500, 1000, 2500, 5000],
};

function inputClass(extra = "") {
  return `w-full border border-line rounded-[10px] px-3.5 py-3 text-[15px] text-ink bg-transparent focus:outline-none focus:border-[#2F6D53] focus:ring-2 focus:ring-[#2F6D53]/20 transition-colors placeholder:text-ink-soft/50 ${extra}`;
}

export function PostTaskWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    requirements: "",
    location: "",
    locationDetails: "",
    destination: "",
    urgency: "asap" as "asap" | "schedule",
    scheduledDate: "",
    scheduledTime: "",
    pricingType: "fixed" as "fixed" | "open",
    budget: "",
    currency: "KES",
    contactName: "",
    contactPhone: "",
  });
  const [phase, setPhase] = useState<"form" | "searching" | "matched">("form");
  const [matchedTasker, setMatchedTasker] = useState<ReturnType<typeof findMatchingTasker> | null>(null);
  const [postedTaskId, setPostedTaskId] = useState<string | null>(null);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = useCallback(() => {
    const task: QuickTask = {
      ...form,
      id: `qt_${Date.now()}`,
      customerName: form.contactName || "You",
      customerPhone: form.contactPhone || "+254700000000",
      postedAt: new Date().toISOString(),
      status: "SEARCHING",
    };
    savePostedTask(task);
    setPostedTaskId(task.id);
    setPhase("searching");

    setTimeout(() => {
      const tasker = findMatchingTasker(task);
      setMatchedTasker(tasker);
      setPhase("matched");
    }, 3000);
  }, [form]);

  const selectedCat = TASK_CATEGORIES.find((c) => c.id === form.category);
  const suggestions = form.category ? BUDGET_SUGGESTIONS[form.category] ?? [] : [];

  const canProceed1 = Boolean(form.category);
  const canProceed2 = Boolean(form.title.trim() && form.description.trim());
  const canProceed3 = Boolean(form.location.trim());
  const canProceed4 = form.urgency === "asap" || Boolean(form.scheduledDate && form.scheduledTime);
  const canProceed5 = form.pricingType === "open" || Boolean(form.budget && Number(form.budget) > 0);

  // ── Searching Screen ──
  if (phase === "searching") {
    return (
      <main className="wrap py-20 text-center max-w-[520px] mx-auto px-5">
        <div className="w-20 h-20 rounded-full border-4 border-accent-soft border-t-[#2F6D53] mx-auto mb-6 animate-spin" />
        <h1 className="font-display font-bold text-[28px] text-[#2F6D53] mb-3">Finding a tasker…</h1>
        <p className="text-ink-soft text-[15px] leading-relaxed max-w-[380px] mx-auto mb-8">
          Kaziin is matching your task with an available, verified tasker nearby.
        </p>
        <div className="bg-paper border border-line rounded-[14px] p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
              {selectedCat?.icon} {selectedCat?.label}
            </span>
          </div>
          <h3 className="font-display font-semibold text-[16px]">{form.title}</h3>
          <p className="text-[13px] text-ink-soft mt-1">📍 {form.location}</p>
          <p className="text-[13px] text-[#2F6D53] font-semibold mt-1">
            {form.pricingType === "fixed" ? `${form.currency} ${Number(form.budget).toLocaleString()}` : "Open to offers"}
          </p>
        </div>
      </main>
    );
  }

  // ── Matched Screen ──
  if (phase === "matched" && matchedTasker) {
    return (
      <main className="wrap py-16 text-center max-w-[520px] mx-auto px-5">
        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-6 text-3xl">✅</div>
        <h1 className="font-display font-bold text-[28px] text-[#2F6D53] mb-3">Tasker Found!</h1>
        <p className="text-ink-soft text-[15px] mb-8">Your task has been posted and a tasker is ready to help.</p>

        <div className="bg-paper border border-line rounded-[16px] p-6 mb-8 text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2F6D53] flex items-center justify-center text-white font-display font-bold text-[18px]">
              {matchedTasker.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[17px]">{matchedTasker.name}</span>
                {matchedTasker.verified && (
                  <span className="font-data text-[10px] font-semibold uppercase tracking-wider text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[13px] text-ink-soft">
                <span>⭐ {matchedTasker.rating}</span>
                <span>·</span>
                <span>{matchedTasker.completedTasks} tasks completed</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-line">
            <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft font-semibold block mb-2">Why this tasker</span>
            <div className="flex flex-wrap gap-2">
              {["Available now", "Within your service area", matchedTasker.verified ? "Verified tasker" : null, "Completed similar tasks"]
                .filter(Boolean)
                .map((reason) => (
                  <span key={reason} className="text-[12px] text-accent-dark bg-accent-soft/60 px-2.5 py-1 rounded-full">
                    {reason}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {postedTaskId && (
            <Link
              href={`/quick-tasks/${postedTaskId}`}
              className="block text-center px-6 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors"
            >
              View Task Details
            </Link>
          )}
          <Link
            href="/quick-tasks/my-tasks"
            className="block text-center px-6 py-3 rounded-[10px] border border-line font-semibold text-[14px] hover:bg-paper transition-colors"
          >
            Go to My Tasks
          </Link>
          <button
            onClick={() => {
              setPhase("form");
              setStep(1);
              setForm({
                category: "", title: "", description: "", requirements: "",
                location: "", locationDetails: "", destination: "",
                urgency: "asap", scheduledDate: "", scheduledTime: "",
                pricingType: "fixed", budget: "", currency: "KES",
                contactName: "", contactPhone: "",
              });
            }}
            className="text-[14px] text-ink-soft hover:text-ink font-medium transition-colors py-2"
          >
            Post another task
          </button>
        </div>
      </main>
    );
  }

  // ── Wizard ──
  return (
    <main className="wrap py-10 max-w-[600px] mx-auto px-5">
      {/* Breadcrumb */}
      <nav className="font-data text-[12px] text-ink-soft mb-5">
        <Link href="/quick-tasks" className="hover:text-ink">Quick Tasks</Link> / Post a Task
      </nav>

      <h1 className="font-display font-bold text-[28px] text-[#2F6D53] mb-1">Post a Task</h1>
      <p className="text-ink-soft text-[15px] mb-6">Describe what you need and get matched with a nearby tasker.</p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-data text-[12.5px] text-ink-soft">Step {step} of 6</span>
          <span className="font-data text-[12.5px] text-[#2F6D53] font-semibold">{Math.round(((step - 1) / 5) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div className="h-full bg-[#2F6D53] rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          {["Category", "Details", "Location", "When", "Budget", "Review"].map((label, i) => (
            <span key={label} className={`font-data text-[10px] uppercase tracking-wider ${i + 1 <= step ? "text-[#2F6D53]" : "text-ink-soft/40"}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-line">

        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-semibold text-[22px]">What do you need done?</h2>
              <p className="text-ink-soft text-[14px] mt-1">Choose the type of task that best describes what you need.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TASK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set("category", cat.id)}
                  className={`text-left px-4 py-3.5 rounded-[12px] border transition-all ${
                    form.category === cat.id
                      ? "border-[#2F6D53] bg-accent-soft shadow-sm"
                      : "border-line hover:border-[#2F6D53]/40"
                  }`}
                >
                  <span className="text-[22px] block mb-1.5">{cat.icon}</span>
                  <span className="font-semibold text-[14px] block">{cat.label}</span>
                  <span className="text-[12px] text-ink-soft block mt-0.5">{cat.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Task Details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-semibold text-[22px]">Describe the task</h2>
              <p className="text-ink-soft text-[14px] mt-1">Be specific — the more detail you provide, the better your match.</p>
            </div>
            <div>
              <label htmlFor="task-title" className="block font-semibold text-[13.5px] text-ink mb-1.5">
                Task title <span className="text-red-500">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputClass()}
                placeholder={`e.g. ${selectedCat?.id === "delivery" ? "Deliver package from Westlands to Karen" : "Need help with " + (selectedCat?.label ?? "a task")}`}
                autoFocus
              />
              <p className="text-[12px] text-ink-soft mt-1.5">Keep it short and clear — taskers will see this first.</p>
            </div>
            <div>
              <label htmlFor="task-desc" className="block font-semibold text-[13.5px] text-ink mb-1.5">
                Full description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="task-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                className={inputClass("resize-none")}
                placeholder="Include all relevant details: what needs to be done, any special requirements, tools or materials needed, access instructions, etc."
              />
              <p className="text-[12px] text-ink-soft mt-1.5">{form.description.length}/500 characters</p>
            </div>
            <div>
              <label htmlFor="task-req" className="block font-semibold text-[13.5px] text-ink mb-1.5">
                Tasker requirements <span className="text-ink-soft font-normal">(optional)</span>
              </label>
              <input
                id="task-req"
                type="text"
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                className={inputClass()}
                placeholder="e.g. Must have own transport, experience with plumbing, non-smoker"
              />
            </div>
            {/* Photo upload placeholder */}
            <div className="border border-dashed border-line rounded-[12px] p-6 text-center hover:border-[#2F6D53]/40 transition-colors cursor-pointer group">
              <span className="text-[28px] mb-2 block">📷</span>
              <span className="text-[14px] font-medium text-ink block mb-1 group-hover:text-[#2F6D53] transition-colors">Add photos</span>
              <span className="text-[12.5px] text-ink-soft">Drag and drop or click to upload · Optional but recommended</span>
            </div>
          </div>
        )}

        {/* ── Step 3: Location ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-semibold text-[22px]">Where does the task happen?</h2>
              <p className="text-ink-soft text-[14px] mt-1">Help taskers know if they can reach you.</p>
            </div>
            <div>
              <label htmlFor="task-location" className="block font-semibold text-[13.5px] text-ink mb-1.5">
                {form.category === "delivery" || form.category === "moving" ? "Pickup location" : "Task location"} <span className="text-red-500">*</span>
              </label>
              <input
                id="task-location"
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className={inputClass()}
                placeholder="e.g. Westlands, Nairobi"
                autoFocus
              />
            </div>
            {(form.category === "delivery" || form.category === "moving" || form.category === "shopping") && (
              <div>
                <label htmlFor="task-destination" className="block font-semibold text-[13.5px] text-ink mb-1.5">
                  Delivery / drop-off location <span className="text-ink-soft font-normal">(optional)</span>
                </label>
                <input
                  id="task-destination"
                  type="text"
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  className={inputClass()}
                  placeholder="e.g. Karen, Nairobi"
                />
              </div>
            )}
            <div>
              <label htmlFor="task-loc-details" className="block font-semibold text-[13.5px] text-ink mb-1.5">
                Access instructions <span className="text-ink-soft font-normal">(optional)</span>
              </label>
              <input
                id="task-loc-details"
                type="text"
                value={form.locationDetails}
                onChange={(e) => set("locationDetails", e.target.value)}
                className={inputClass()}
                placeholder="e.g. Gate 2, 3rd floor, ring bell on arrival"
              />
              <p className="text-[12px] text-ink-soft mt-1.5">This will only be shared with your matched tasker.</p>
            </div>
          </div>
        )}

        {/* ── Step 4: When ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-semibold text-[22px]">When do you need it done?</h2>
              <p className="text-ink-soft text-[14px] mt-1">Timing helps us match you with an available tasker.</p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => set("urgency", "asap")}
                className={`w-full flex items-start gap-4 p-4 border rounded-[12px] transition-all text-left ${
                  form.urgency === "asap" ? "border-[#2F6D53] bg-accent-soft" : "border-line hover:border-[#2F6D53]/40"
                }`}
              >
                <span className="text-[24px] mt-0.5">⚡</span>
                <div className="flex-1">
                  <span className="font-semibold text-[15px] block">Right now (ASAP)</span>
                  <span className="text-[13px] text-ink-soft">We&apos;ll find someone available within the next 2 hours</span>
                </div>
                {form.urgency === "asap" && <span className="text-[#2F6D53] text-lg mt-0.5">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => set("urgency", "schedule")}
                className={`w-full flex items-start gap-4 p-4 border rounded-[12px] transition-all text-left ${
                  form.urgency === "schedule" ? "border-[#2F6D53] bg-accent-soft" : "border-line hover:border-[#2F6D53]/40"
                }`}
              >
                <span className="text-[24px] mt-0.5">📅</span>
                <div className="flex-1">
                  <span className="font-semibold text-[15px] block">Schedule for later</span>
                  <span className="text-[13px] text-ink-soft">Pick a specific date and time — ideal for planned tasks</span>
                </div>
                {form.urgency === "schedule" && <span className="text-[#2F6D53] text-lg mt-0.5">✓</span>}
              </button>
            </div>

            {form.urgency === "schedule" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[13.5px] text-ink mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => set("scheduledDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[13.5px] text-ink mb-1.5">Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => set("scheduledTime", e.target.value)}
                    className={inputClass()}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Budget ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-semibold text-[22px]">What&apos;s your budget?</h2>
              <p className="text-ink-soft text-[14px] mt-1">Set a fair price and get matched faster.</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => set("pricingType", "fixed")}
                className={`w-full flex items-start gap-4 p-4 border rounded-[12px] transition-all text-left ${
                  form.pricingType === "fixed" ? "border-[#2F6D53] bg-accent-soft" : "border-line hover:border-[#2F6D53]/40"
                }`}
              >
                <span className="text-[24px] mt-0.5">💰</span>
                <div className="flex-1">
                  <span className="font-semibold text-[15px] block">Set a fixed budget</span>
                  <span className="text-[13px] text-ink-soft">You decide the price — taskers can accept or decline</span>
                </div>
                {form.pricingType === "fixed" && <span className="text-[#2F6D53] text-lg mt-0.5">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => { set("pricingType", "open"); set("budget", ""); }}
                className={`w-full flex items-start gap-4 p-4 border rounded-[12px] transition-all text-left ${
                  form.pricingType === "open" ? "border-[#2F6D53] bg-accent-soft" : "border-line hover:border-[#2F6D53]/40"
                }`}
              >
                <span className="text-[24px] mt-0.5">🤝</span>
                <div className="flex-1">
                  <span className="font-semibold text-[15px] block">Open to offers</span>
                  <span className="text-[13px] text-ink-soft">Taskers will propose their rate and you can negotiate</span>
                </div>
                {form.pricingType === "open" && <span className="text-[#2F6D53] text-lg mt-0.5">✓</span>}
              </button>
            </div>

            {form.pricingType === "fixed" && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-[13.5px] text-ink mb-1.5">
                    Currency
                  </label>
                  <Select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className={inputClass()}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block font-semibold text-[13.5px] text-ink mb-1.5">
                    Amount ({form.currency}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-[14px] text-ink-soft">{form.currency}</span>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      className={inputClass("pl-14 font-semibold text-[18px]")}
                      placeholder="0"
                      min="1"
                      step="50"
                      autoFocus
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[12px] text-ink-soft mb-2">Suggested amounts for {selectedCat?.label}:</p>
                      <div className="flex gap-2 flex-wrap">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set("budget", String(s))}
                            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
                              form.budget === String(s)
                                ? "bg-[#2F6D53] border-[#2F6D53] text-white"
                                : "border-line text-ink-soft hover:border-[#2F6D53]/40"
                            }`}
                          >
                            {form.currency} {s.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 6: Review ── */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-semibold text-[22px] mb-1">Review & Post</h2>
              <p className="text-ink-soft text-[14px]">Check all details before posting your task.</p>
            </div>

            <div className="border border-line rounded-[14px] p-6 space-y-5">
              {/* Category & Title */}
              <div className="flex items-start gap-3">
                <span className="text-[28px]">{selectedCat?.icon}</span>
                <div>
                  <span className="font-data text-[11px] uppercase tracking-wider text-accent-dark font-semibold block mb-0.5">{selectedCat?.label}</span>
                  <div className="font-display font-bold text-[18px] text-ink">{form.title}</div>
                  <div className="text-[13.5px] text-ink-soft mt-1.5 leading-relaxed">{form.description}</div>
                  {form.requirements && (
                    <div className="text-[12.5px] text-ink-soft mt-1.5">
                      <span className="font-semibold">Requirements:</span> {form.requirements}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-line" />

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1 block">📍 Location</span>
                  <div className="text-[14px] font-medium">{form.location}</div>
                  {form.destination && <div className="text-[13px] text-ink-soft mt-0.5">→ {form.destination}</div>}
                  {form.locationDetails && <div className="text-[12.5px] text-ink-soft mt-0.5">{form.locationDetails}</div>}
                </div>
                <div>
                  <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1 block">🕐 When</span>
                  <div className="text-[14px] font-medium">
                    {form.urgency === "asap" ? "Right now (ASAP)" : `${form.scheduledDate} at ${form.scheduledTime}`}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1 block">💰 Budget</span>
                  <div className="text-[17px] font-bold text-[#2F6D53]">
                    {form.pricingType === "fixed"
                      ? `${form.currency} ${Number(form.budget).toLocaleString()}`
                      : "Open to offers"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#2F6D53]/20 bg-accent-soft/40 rounded-[12px] p-4 text-[13px] text-[#2F6D53]/80 leading-relaxed">
              ✅ Once posted, we&apos;ll match your task with a verified tasker. You&apos;ll be notified as soon as someone is ready.
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-[14px] text-ink-soft hover:text-ink font-medium transition-colors px-2 py-2"
            >
              ← Back
            </button>
          ) : (
            <Link href="/quick-tasks" className="text-[14px] text-ink-soft hover:text-ink font-medium transition-colors px-2 py-2">
              Cancel
            </Link>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !canProceed1) ||
                (step === 2 && !canProceed2) ||
                (step === 3 && !canProceed3) ||
                (step === 4 && !canProceed4) ||
                (step === 5 && !canProceed5)
              }
              className="px-8 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-10 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors"
            >
              Post Task →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
