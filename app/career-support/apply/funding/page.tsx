"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitCareerApplication } from "../actions";

/* ============================================================
   Funding Support Application Form — /career-support/apply/funding
   ============================================================ */

const FUNDING_PURPOSES = [
  { value: "tuition", label: "Tuition Fees (University / College)" },
  { value: "short_course", label: "Short Course or Bootcamp Fees" },
  { value: "certification", label: "Certification or Licensing Exams" },
  { value: "equipment", label: "Work Equipment (Laptop, Tools)" },
  { value: "relocation", label: "Relocation Costs for Work" },
  { value: "living_stipend", label: "Living Stipend while studying/training" },
  { value: "business", label: "Small Business / Freelance Startup Capital" },
];

const FUNDING_AMOUNTS = [
  { value: "under_500", label: "Under $500" },
  { value: "500_1000", label: "$500 – $1,000" },
  { value: "1000_5000", label: "$1,000 – $5,000" },
  { value: "5000_10000", label: "$5,000 – $10,000" },
  { value: "over_10000", label: "Over $10,000" },
];

const CURRENT_SITUATIONS = [
  { value: "student", label: "Currently a student" },
  { value: "employed", label: "Employed but need funding to upskill" },
  { value: "unemployed", label: "Unemployed and looking for work" },
  { value: "entrepreneur", label: "Starting my own business/freelancing" },
];

export default function FundingApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    fundingPurpose: "",
    specificProgram: "",
    fundingAmount: "",
    currentSituation: "",
    financialNeed: "",
    careerImpact: "",
    additionalInfo: "",
    agreeToContact: false,
  });

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.email.trim()) e.email = "Email is required";
      if (!form.location.trim()) e.location = "Location is required";
    }
    if (step === 2) {
      if (!form.fundingPurpose) e.fundingPurpose = "Please select the purpose of the funding";
      if (!form.fundingAmount) e.fundingAmount = "Please select the estimated amount";
      if (!form.currentSituation) e.currentSituation = "Please select your current situation";
    }
    if (step === 3) {
      if (!form.financialNeed.trim()) e.financialNeed = "Please explain your financial need";
      if (!form.careerImpact.trim()) e.careerImpact = "Please explain how this will impact your career";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const res = await submitCareerApplication("funding", form);
    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      alert("Failed to submit: " + res.error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-5">
        <div className="max-w-[520px] w-full text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-6">
            <span className="text-[32px]">✓</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-ink mb-3">Application Received</h1>
          <p className="text-ink-soft text-[16px] leading-relaxed mb-8">
            Thank you, <strong>{form.fullName}</strong>. We've received your funding support application. Our team will review your application and match you with potential grants or scholarships within <strong>3–5 business days</strong>.
          </p>
          <Link
            href="/career-support"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors"
          >
            Back to Career Support
          </Link>
        </div>
      </div>
    );
  }

  const TOTAL_STEPS = 4;
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[700px] mx-auto px-5 py-14">
        <Link
          href="/career-support/apply"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-[#2F6D53] transition-colors mb-6"
        >
          ← Back to pathway selection
        </Link>

        <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider font-semibold block mb-2">
          Funding Support Application
        </span>
        <h1 className="font-display font-bold text-ink text-[32px] mb-1">Get Career Funding</h1>
        <p className="text-ink-soft text-[15px] mb-8 leading-relaxed">
          Apply for grants, scholarships, and mobility funding matched to your career situation.
        </p>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-[12px] font-data text-ink-soft mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span className="text-accent-dark font-medium">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-line rounded-full overflow-hidden">
            <div className="h-full bg-[#2F6D53] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            {["Your Details", "Funding Needs", "Justification", "Review"].map((label, i) => (
              <span key={label} className={`font-data text-[10px] ${i + 1 === step ? "text-accent-dark font-semibold" : i + 1 < step ? "text-ink-soft" : "text-line"}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 — Personal Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-[20px] mb-4">Tell us about yourself</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13.5px] font-medium text-ink mb-1.5">Full Name *</label>
                  <input value={form.fullName} onChange={e => set("fullName", e.target.value)}
                    placeholder="e.g. Amara Osei"
                    className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors ${errors.fullName ? "border-danger" : "border-line"}`} />
                  {errors.fullName && <p className="text-danger text-[12px] mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-[13.5px] font-medium text-ink mb-1.5">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors ${errors.email ? "border-danger" : "border-line"}`} />
                  {errors.email && <p className="text-danger text-[12px] mt-1">{errors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13.5px] font-medium text-ink mb-1.5">Phone Number <span className="text-ink-soft/60">(optional)</span></label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13.5px] font-medium text-ink mb-1.5">Current Location *</label>
                  <input value={form.location} onChange={e => set("location", e.target.value)}
                    placeholder="e.g. Nairobi, Kenya"
                    className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors ${errors.location ? "border-danger" : "border-line"}`} />
                  {errors.location && <p className="text-danger text-[12px] mt-1">{errors.location}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Funding Needs */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-[20px] mb-4">Funding Requirements</h2>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Primary purpose of funding *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FUNDING_PURPOSES.map(p => (
                    <button key={p.value} type="button" onClick={() => set("fundingPurpose", p.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.fundingPurpose === p.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
                {errors.fundingPurpose && <p className="text-danger text-[12px] mt-1">{errors.fundingPurpose}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Specific program, institution, or equipment <span className="text-ink-soft/60">(optional)</span>
                </label>
                <input value={form.specificProgram} onChange={e => set("specificProgram", e.target.value)}
                  placeholder="e.g. AWS Cloud Practitioner Exam, Macbook Pro for coding..."
                  className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors" />
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Estimated amount needed (USD) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FUNDING_AMOUNTS.map(a => (
                    <button key={a.value} type="button" onClick={() => set("fundingAmount", a.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.fundingAmount === a.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
                {errors.fundingAmount && <p className="text-danger text-[12px] mt-1">{errors.fundingAmount}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Current Situation *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CURRENT_SITUATIONS.map(s => (
                    <button key={s.value} type="button" onClick={() => set("currentSituation", s.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.currentSituation === s.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {errors.currentSituation && <p className="text-danger text-[12px] mt-1">{errors.currentSituation}</p>}
              </div>
            </div>
          )}

          {/* Step 3 — Justification */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-[20px] mb-4">Justification</h2>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Why do you need financial assistance? *
                </label>
                <textarea value={form.financialNeed} onChange={e => set("financialNeed", e.target.value)}
                  placeholder="Explain your current financial barriers and why you cannot self-fund this opportunity..."
                  rows={4}
                  className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors resize-none ${errors.financialNeed ? "border-danger" : "border-line"}`} />
                {errors.financialNeed && <p className="text-danger text-[12px] mt-1">{errors.financialNeed}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  How will this funding impact your career? *
                </label>
                <textarea value={form.careerImpact} onChange={e => set("careerImpact", e.target.value)}
                  placeholder="Describe the expected outcome. Will it help you get a job, start a business, or increase your salary?..."
                  rows={4}
                  className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors resize-none ${errors.careerImpact ? "border-danger" : "border-line"}`} />
                {errors.careerImpact && <p className="text-danger text-[12px] mt-1">{errors.careerImpact}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Anything else we should consider? <span className="text-ink-soft/60">(optional)</span>
                </label>
                <textarea value={form.additionalInfo} onChange={e => set("additionalInfo", e.target.value)}
                  placeholder="Any additional context about your situation, specific needs, or links to the program you want to attend..."
                  rows={3}
                  className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors resize-none" />
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div>
              <h2 className="font-display font-semibold text-[20px] mb-6">Review your application</h2>
              <div className="border border-line rounded-[14px] divide-y divide-line mb-6">
                {[
                  { label: "Full Name", value: form.fullName },
                  { label: "Email", value: form.email },
                  { label: "Phone", value: form.phone || "Not provided" },
                  { label: "Location", value: form.location },
                  { label: "Funding Purpose", value: FUNDING_PURPOSES.find(p => p.value === form.fundingPurpose)?.label || "—" },
                  { label: "Specific Program", value: form.specificProgram || "Not specified" },
                  { label: "Amount Needed", value: FUNDING_AMOUNTS.find(a => a.value === form.fundingAmount)?.label || "—" },
                  { label: "Current Situation", value: CURRENT_SITUATIONS.find(s => s.value === form.currentSituation)?.label || "—" },
                  { label: "Financial Need", value: form.financialNeed },
                  { label: "Career Impact", value: form.careerImpact },
                ].map(row => (
                  <div key={row.label} className="flex gap-4 px-5 py-3">
                    <dt className="text-[12.5px] font-data text-ink-soft w-[150px] shrink-0">{row.label}</dt>
                    <dd className="text-[13.5px] text-ink">{row.value}</dd>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input type="checkbox" checked={form.agreeToContact} onChange={e => set("agreeToContact", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#2F6D53] shrink-0" />
                <span className="text-[13.5px] text-ink-soft leading-relaxed">
                  I confirm that the information provided is accurate and I agree to be contacted by Kaziin regarding this funding application.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-line">
            <button type="button" onClick={back} disabled={step === 1}
              className="px-6 py-3 rounded-xl border border-line text-[14px] font-medium text-ink hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Back
            </button>
            {step < TOTAL_STEPS ? (
              <button type="button" onClick={next}
                className="px-10 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14.5px] hover:bg-[#1E4D39] transition-colors">
                Continue
              </button>
            ) : (
              <button type="submit" disabled={submitting || !form.agreeToContact}
                className="px-10 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14.5px] hover:bg-[#1E4D39] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
