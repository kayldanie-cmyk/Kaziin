"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitCareerApplication } from "../actions";
import { Select } from "@/components/ui/select";

/* ============================================================
   Skills Support Application Form — /career-support/apply/skills
   ============================================================ */

const SUPPORT_TYPES = [
  { value: "short_course", label: "Short course (1-3 months)" },
  { value: "certification", label: "Professional Certification" },
  { value: "bootcamp", label: "Intensive Bootcamp" },
  { value: "vocational", label: "Vocational Training" },
  { value: "language", label: "Language Course" },
];

const FUNDING_NEEDS = [
  { value: "full", label: "I need full funding / scholarship" },
  { value: "partial", label: "I need partial funding" },
  { value: "self_funded", label: "I am self-funding, I just need access to the course" },
];

const PREFERRED_FORMATS = [
  { value: "online", label: "100% Online" },
  { value: "hybrid", label: "Hybrid (Online + In-person)" },
  { value: "in_person", label: "In-person only" },
];

export default function SkillsSupportApplyPage() {
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
    skillArea: "",
    supportType: "",
    preferredFormat: "",
    fundingNeed: "",
    currentProficiency: "",
    motivation: "",
    availability: "",
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
      if (!form.skillArea.trim()) e.skillArea = "Please specify the skill area";
      if (!form.supportType) e.supportType = "Please select a support type";
      if (!form.preferredFormat) e.preferredFormat = "Please select a preferred format";
    }
    if (step === 3) {
      if (!form.fundingNeed) e.fundingNeed = "Please select your funding needs";
      if (!form.motivation.trim()) e.motivation = "Please tell us your motivation";
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
    const res = await submitCareerApplication("skills", form);
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
            Thank you, <strong>{form.fullName}</strong>. We've received your skills support application. Our team will review it and get back to you with potential training and funding matches within <strong>2–3 business days</strong>.
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
          Skills Support Application
        </span>
        <h1 className="font-display font-bold text-ink text-[32px] mb-1">Build My Skills</h1>
        <p className="text-ink-soft text-[15px] mb-8 leading-relaxed">
          Apply for funded skills support to acquire high-demand skills and boost your market value.
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
            {["Your Details", "Training Needs", "Motivation & Funding", "Review"].map((label, i) => (
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

          {/* Step 2 — Training Needs */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-[20px] mb-4">What do you want to learn?</h2>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">Skill Area *</label>
                <input value={form.skillArea} onChange={e => set("skillArea", e.target.value)}
                  placeholder="e.g. Data Analysis, Digital Marketing, Python, Plumbing"
                  className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors ${errors.skillArea ? "border-danger" : "border-line"}`} />
                {errors.skillArea && <p className="text-danger text-[12px] mt-1">{errors.skillArea}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Type of support needed *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUPPORT_TYPES.map(s => (
                    <button key={s.value} type="button" onClick={() => set("supportType", s.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.supportType === s.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {errors.supportType && <p className="text-danger text-[12px] mt-1">{errors.supportType}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Preferred Learning Format *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PREFERRED_FORMATS.map(f => (
                    <button key={f.value} type="button" onClick={() => set("preferredFormat", f.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.preferredFormat === f.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                {errors.preferredFormat && <p className="text-danger text-[12px] mt-1">{errors.preferredFormat}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Current proficiency in this skill <span className="text-ink-soft/60">(optional)</span>
                </label>
                <Select value={form.currentProficiency} onChange={e => set("currentProficiency", e.target.value)}
                  className="w-full">
                  <option value="">Select proficiency</option>
                  <option value="beginner">Beginner (No prior experience)</option>
                  <option value="intermediate">Intermediate (Some experience)</option>
                  <option value="advanced">Advanced (Looking to specialize/certify)</option>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3 — Motivation & Funding */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-[20px] mb-4">Motivation & Funding</h2>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Funding Needs *</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {FUNDING_NEEDS.map(f => (
                    <button key={f.value} type="button" onClick={() => set("fundingNeed", f.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.fundingNeed === f.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                {errors.fundingNeed && <p className="text-danger text-[12px] mt-1">{errors.fundingNeed}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Why do you want to acquire this skill? *
                </label>
                <textarea value={form.motivation} onChange={e => set("motivation", e.target.value)}
                  placeholder="Explain how this skill will help you achieve your career goals..."
                  rows={4}
                  className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors resize-none ${errors.motivation ? "border-danger" : "border-line"}`} />
                {errors.motivation && <p className="text-danger text-[12px] mt-1">{errors.motivation}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  What is your weekly availability for training? <span className="text-ink-soft/60">(optional)</span>
                </label>
                <Select value={form.availability} onChange={e => set("availability", e.target.value)}
                  className="w-full">
                  <option value="">Select availability</option>
                  <option value="full_time">Full-time (30+ hours/week)</option>
                  <option value="part_time">Part-time (10-20 hours/week)</option>
                  <option value="evenings_weekends">Evenings & Weekends only</option>
                </Select>
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
                  { label: "Skill Area", value: form.skillArea },
                  { label: "Support Type", value: SUPPORT_TYPES.find(s => s.value === form.supportType)?.label || "—" },
                  { label: "Format", value: PREFERRED_FORMATS.find(f => f.value === form.preferredFormat)?.label || "—" },
                  { label: "Proficiency", value: form.currentProficiency || "Not specified" },
                  { label: "Funding Need", value: FUNDING_NEEDS.find(f => f.value === form.fundingNeed)?.label || "—" },
                  { label: "Motivation", value: form.motivation },
                  { label: "Availability", value: form.availability ? form.availability.replace("_", " ") : "Not specified" },
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
                  I agree to be contacted by the Kaziin team regarding my skills support application and relevant training opportunities.
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
