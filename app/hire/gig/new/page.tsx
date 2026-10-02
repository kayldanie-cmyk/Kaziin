"use client";

import { useState } from "react";
import Link from "next/link";

const TASK_CATEGORIES = [
  { id: "delivery", label: " Delivery / Courier" },
  { id: "cleaning", label: " Cleaning" },
  { id: "moving", label: " Moving / Heavy Lifting" },
  { id: "shopping", label: "️ Shopping / Errands" },
  { id: "repairs", label: " Repairs / Maintenance" },
  { id: "tutoring", label: " Tutoring / Teaching" },
  { id: "cooking", label: "️ Cooking / Catering" },
  { id: "security", label: "️ Security / Watchman" },
  { id: "gardening", label: " Gardening / Landscaping" },
  { id: "other", label: " Other" },
];

const URGENCY_OPTIONS = [
  { id: "now", label: "Right now (ASAP)" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "thisweek", label: "This week" },
  { id: "flexible", label: "Flexible" },
];

export default function QuickGigNewPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    budget: "",
    currency: "KES",
    urgency: "",
    contactName: "",
    contactPhone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const existing = JSON.parse(localStorage.getItem("kaziin_gigs") || "[]");
    const newGig = {
      ...form,
      id: `gig_${Date.now()}`,
      postedAt: new Date().toISOString(),
      status: "open",
    };
    localStorage.setItem("kaziin_gigs", JSON.stringify([newGig, ...existing]));
    setSubmitted(true);
  }

  const inputClass = "w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors bg-paper";
  const canProceed1 = form.category && form.title;
  const canProceed2 = form.location && form.urgency;
  const canSubmit = form.contactPhone;

  if (submitted) {
    return (
      <div className="max-w-[520px] mx-auto py-20 px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-6 text-3xl"></div>
        <h1 className="font-display font-bold text-[26px] text-[#2F6D53] mb-3">Task posted!</h1>
        <p className="text-ink-soft text-[15px] mb-8 leading-relaxed">
          Your task is now visible to available workers near you. We will notify them and you should receive contact shortly.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setSubmitted(false); setForm({ category: "", title: "", description: "", location: "", budget: "", currency: "KES", urgency: "", contactName: "", contactPhone: "" }); setStep(1); }}
            className="block text-center px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors w-full"
          >
            Post another task
          </button>
          <Link href="/dashboard" className="block text-center text-[14px] text-ink-soft hover:text-ink transition-colors py-2">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[580px] mx-auto py-10 px-5">
      <div className="mb-8">
        <nav className="font-data text-[12px] text-ink-soft mb-3">
          <Link href="/hire" className="hover:text-ink">Hire</Link> / Quick Task
        </nav>
        <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Post a quick task</h1>
        <p className="mt-1 text-ink-soft text-[15px]">No registration needed. Get help fast.</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-data text-[12.5px] text-ink-soft">Step {step} of 3</span>
          <span className="font-data text-[12.5px] text-accent-dark">{Math.round(((step - 1) / 2) * 100)}% complete</span>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {["What", "Where & When", "Contact"].map((label, i) => (
            <span key={label} className={`font-data text-[11px] ${i + 1 === step ? "text-accent-dark font-semibold" : i + 1 < step ? "text-ink-soft" : "text-line"}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-line">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-semibold text-[20px] mb-2">What do you need done?</h2>
              <p className="text-ink-soft text-[14px]">Choose a category and describe the task.</p>
            </div>
            <div>
              <label className="block font-data text-[12.5px] text-ink-soft mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {TASK_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => set("category", cat.id)}
                    className={`text-left px-3 py-2.5 rounded-[9px] border text-[13px] transition-colors ${form.category === cat.id ? "border-accent bg-accent-soft text-accent-dark font-semibold" : "border-line hover:border-accent/40"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="gig-title" className="block font-data text-[12.5px] text-ink-soft mb-1.5">Task title</label>
              <input id="gig-title" type="text" value={form.title} onChange={e => set("title", e.target.value)} className={inputClass} placeholder="e.g. Deliver parcel from CBD to Westlands" autoFocus />
            </div>
            <div>
              <label htmlFor="gig-desc" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                More details <span className="text-ink-soft/60">(optional)</span>
              </label>
              <textarea id="gig-desc" value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Any extra details the worker should know…" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-semibold text-[20px] mb-2">Where and when?</h2>
              <p className="text-ink-soft text-[14px]">Help us match you to workers nearby.</p>
            </div>
            <div>
              <label htmlFor="gig-location" className="block font-data text-[12.5px] text-ink-soft mb-1.5">Location</label>
              <input id="gig-location" type="text" value={form.location} onChange={e => set("location", e.target.value)} className={inputClass} placeholder="e.g. Nairobi CBD, Westlands" autoFocus />
            </div>
            <div>
              <label className="block font-data text-[12.5px] text-ink-soft mb-2">When do you need it?</label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCY_OPTIONS.map(u => (
                  <button key={u.id} type="button" onClick={() => set("urgency", u.id)}
                    className={`text-left px-3 py-2.5 rounded-[9px] border text-[13px] transition-colors ${form.urgency === u.id ? "border-accent bg-accent-soft text-accent-dark font-semibold" : "border-line hover:border-accent/40"}`}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="gig-budget" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                Budget <span className="text-ink-soft/60">(optional)</span>
              </label>
              <div className="flex gap-2">
                <select value={form.currency} onChange={e => set("currency", e.target.value)} className={`${inputClass} w-24 shrink-0`}>
                  <option>KES</option><option>USD</option><option>GBP</option><option>EUR</option>
                </select>
                <input id="gig-budget" type="number" value={form.budget} onChange={e => set("budget", e.target.value)} className={inputClass} placeholder="e.g. 500" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-semibold text-[20px] mb-2">How can workers reach you?</h2>
              <p className="text-ink-soft text-[14px]">Workers will contact you directly via WhatsApp or phone.</p>
            </div>
            <div>
              <label htmlFor="contact-name" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                Your name <span className="text-ink-soft/60">(optional)</span>
              </label>
              <input id="contact-name" type="text" value={form.contactName} onChange={e => set("contactName", e.target.value)} className={inputClass} placeholder="e.g. John" autoFocus />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block font-data text-[12.5px] text-ink-soft mb-1.5">WhatsApp / Phone number</label>
              <input id="contact-phone" type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} className={inputClass} placeholder="+254 700 000 000" />
            </div>
            <div className="bg-paper border border-line rounded-[12px] p-5 space-y-2">
              <div className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-3">Task summary</div>
              <div className="font-display font-semibold text-[15px]">{form.title}</div>
              <div className="text-[13px] text-ink-soft">{form.location} · {URGENCY_OPTIONS.find(u => u.id === form.urgency)?.label}</div>
              {form.budget && <div className="text-[13px] text-accent-dark font-medium">{form.currency} {form.budget}</div>}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-[14px] text-ink-soft hover:text-ink font-medium transition-colors">← Back</button>
          ) : (
            <Link href="/hire" className="text-[14px] text-ink-soft hover:text-ink font-medium transition-colors">Cancel</Link>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 ? !canProceed1 : !canProceed2}
              className="px-8 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="px-8 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Post Task 
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
