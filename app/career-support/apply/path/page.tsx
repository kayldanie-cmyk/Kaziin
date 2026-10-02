"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitCareerApplication } from "../actions";
import { Select } from "@/components/ui/select";

/* ============================================================
   Career Path Application Form — /career-support/apply/path
   ============================================================ */

const CAREER_GOALS = [
  { value: "find_first_job", label: "Find my first job" },
  { value: "change_career", label: "Change career direction" },
  { value: "advance_career", label: "Advance in my current career" },
  { value: "learn_new_skill", label: "Learn a new skill or specialize" },
  { value: "get_certified", label: "Get certified or licensed" },
  { value: "start_skilled_trade", label: "Start a skilled trade" },
  { value: "work_internationally", label: "Work internationally" },
  { value: "work_remotely", label: "Work remotely" },
  { value: "become_self_employed", label: "Become self-employed / freelancer" },
];

const EMPLOYMENT_STATUSES = [
  { value: "employed_full_time", label: "Employed full-time" },
  { value: "employed_part_time", label: "Employed part-time" },
  { value: "self_employed", label: "Self-employed / Freelancer" },
  { value: "unemployed_seeking", label: "Unemployed — actively seeking work" },
  { value: "unemployed_not_seeking", label: "Not currently seeking work" },
  { value: "student", label: "Currently studying" },
  { value: "returner", label: "Returning to work after a break" },
];

const EDUCATION_LEVELS = [
  { value: "no_formal", label: "No formal qualifications" },
  { value: "secondary", label: "Secondary school certificate" },
  { value: "higher_secondary", label: "A-levels / High school diploma" },
  { value: "vocational", label: "Vocational / Trade certificate" },
  { value: "undergraduate", label: "Bachelor's degree" },
  { value: "postgraduate", label: "Master's degree or higher" },
  { value: "professional", label: "Professional qualification (e.g. CPA, CFA)" },
];

const TIMELINE_OPTIONS = [
  { value: "immediately", label: "Immediately — I need support now" },
  { value: "1_3_months", label: "Within 1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
  { value: "6_12_months", label: "6–12 months" },
  { value: "over_1_year", label: "More than a year from now" },
];

const CHALLENGES = [
  "Don't know where to start",
  "Lack of relevant qualifications",
  "Lack of work experience",
  "Difficulty getting interviews",
  "Need to upskill or reskill",
  "Financial barriers",
  "Location or relocation challenges",
  "Work visa or documentation issues",
  "Career break / gap in employment",
  "Disability or health-related barriers",
  "Language barriers",
  "Family or caring responsibilities",
];

export default function CareerPathApplyPage() {
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
    careerGoal: "",
    targetRole: "",
    targetIndustry: "",
    employmentStatus: "",
    educationLevel: "",
    experienceYears: "",
    currentSkills: "",
    skillsToLearn: "",
    challenges: [] as string[],
    timeline: "",
    additionalInfo: "",
    agreeToContact: false,
  });

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleChallenge = (c: string) => {
    setForm((f) => ({
      ...f,
      challenges: f.challenges.includes(c)
        ? f.challenges.filter((x) => x !== c)
        : [...f.challenges, c],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.email.trim()) e.email = "Email is required";
      if (!form.location.trim()) e.location = "Location is required";
    }
    if (step === 2) {
      if (!form.careerGoal) e.careerGoal = "Please select a career goal";
      if (!form.employmentStatus) e.employmentStatus = "Please select your employment status";
      if (!form.educationLevel) e.educationLevel = "Please select your education level";
    }
    if (step === 3) {
      if (!form.currentSkills.trim()) e.currentSkills = "Please describe your current skills";
      if (!form.timeline) e.timeline = "Please select a timeline";
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
    const res = await submitCareerApplication("path", form);
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
            Thank you, <strong>{form.fullName}</strong>. We've received your career pathway application. Our team will review it and reach out within <strong>2–3 business days</strong> to discuss your next steps.
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
          Career Pathway Application
        </span>
        <h1 className="font-display font-bold text-ink text-[32px] mb-1">Find My Career Path</h1>
        <p className="text-ink-soft text-[15px] mb-8 leading-relaxed">
          Tell us about your current situation and goals. We'll create a personalised step-by-step career plan for you.
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
            {["Your Details", "Career Goals", "Skills & Gaps", "Review"].map((label, i) => (
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

          {/* Step 2 — Career Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-[20px] mb-4">Your career goals</h2>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">What is your main career goal? *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CAREER_GOALS.map(g => (
                    <button key={g.value} type="button" onClick={() => set("careerGoal", g.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.careerGoal === g.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
                {errors.careerGoal && <p className="text-danger text-[12px] mt-1">{errors.careerGoal}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13.5px] font-medium text-ink mb-1.5">Target job title / role <span className="text-ink-soft/60">(optional)</span></label>
                  <input value={form.targetRole} onChange={e => set("targetRole", e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors" />
                </div>
                <div>
                  <label className="block text-[13.5px] font-medium text-ink mb-1.5">Target industry <span className="text-ink-soft/60">(optional)</span></label>
                  <input value={form.targetIndustry} onChange={e => set("targetIndustry", e.target.value)}
                    placeholder="e.g. Technology, Finance"
                    className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Current employment status *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EMPLOYMENT_STATUSES.map(s => (
                    <button key={s.value} type="button" onClick={() => set("employmentStatus", s.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.employmentStatus === s.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {errors.employmentStatus && <p className="text-danger text-[12px] mt-1">{errors.employmentStatus}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">Highest education level *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EDUCATION_LEVELS.map(e => (
                    <button key={e.value} type="button" onClick={() => set("educationLevel", e.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.educationLevel === e.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {e.label}
                    </button>
                  ))}
                </div>
                {errors.educationLevel && <p className="text-danger text-[12px] mt-1">{errors.educationLevel}</p>}
              </div>
            </div>
          )}

          {/* Step 3 — Skills & Gaps */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-[20px] mb-4">Skills & challenges</h2>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Years of work experience <span className="text-ink-soft/60">(optional)</span>
                </label>
                <select value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)}
                  className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors appearance-none">
                  <option value="">Select range</option>
                  <option value="0">No experience yet</option>
                  <option value="1">Less than 1 year</option>
                  <option value="1_3">1–3 years</option>
                  <option value="3_5">3–5 years</option>
                  <option value="5_10">5–10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  What skills or experience do you currently have? *
                </label>
                <textarea value={form.currentSkills} onChange={e => set("currentSkills", e.target.value)}
                  placeholder="Describe your key skills, qualifications, and any relevant experience. Be as specific as possible..."
                  rows={4}
                  className={`w-full border rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors resize-none ${errors.currentSkills ? "border-danger" : "border-line"}`} />
                {errors.currentSkills && <p className="text-danger text-[12px] mt-1">{errors.currentSkills}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  What skills do you want to develop? <span className="text-ink-soft/60">(optional)</span>
                </label>
                <textarea value={form.skillsToLearn} onChange={e => set("skillsToLearn", e.target.value)}
                  placeholder="e.g. Data analysis, project management, Python, public speaking..."
                  rows={3}
                  className="w-full border border-line rounded-[10px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#2F6D53] transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">What barriers are you facing? <span className="text-ink-soft/60">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {CHALLENGES.map(c => (
                    <button key={c} type="button" onClick={() => toggleChallenge(c)}
                      className={`px-3.5 py-2 rounded-full border text-[13px] transition-all ${form.challenges.includes(c) ? "border-[#2F6D53] bg-accent-soft text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-2">When do you want to achieve your goal? *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIMELINE_OPTIONS.map(t => (
                    <button key={t.value} type="button" onClick={() => set("timeline", t.value)}
                      className={`text-left py-3 px-4 rounded-[10px] border text-[14px] transition-all ${form.timeline === t.value ? "border-[#2F6D53] bg-accent-soft/40 text-[#2F6D53] font-medium" : "border-line hover:border-[#2F6D53]/40"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {errors.timeline && <p className="text-danger text-[12px] mt-1">{errors.timeline}</p>}
              </div>
              <div>
                <label className="block text-[13.5px] font-medium text-ink mb-1.5">
                  Anything else you'd like us to know? <span className="text-ink-soft/60">(optional)</span>
                </label>
                <textarea value={form.additionalInfo} onChange={e => set("additionalInfo", e.target.value)}
                  placeholder="Any additional context about your situation, specific needs, or questions for our team..."
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
                  { label: "Career Goal", value: CAREER_GOALS.find(g => g.value === form.careerGoal)?.label || "—" },
                  { label: "Target Role", value: form.targetRole || "Not specified" },
                  { label: "Target Industry", value: form.targetIndustry || "Not specified" },
                  { label: "Employment Status", value: EMPLOYMENT_STATUSES.find(s => s.value === form.employmentStatus)?.label || "—" },
                  { label: "Education Level", value: EDUCATION_LEVELS.find(e => e.value === form.educationLevel)?.label || "—" },
                  { label: "Timeline", value: TIMELINE_OPTIONS.find(t => t.value === form.timeline)?.label || "—" },
                  { label: "Current Skills", value: form.currentSkills },
                  { label: "Skills to Develop", value: form.skillsToLearn || "Not specified" },
                  { label: "Challenges", value: form.challenges.length > 0 ? form.challenges.join(", ") : "None selected" },
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
                  I agree to be contacted by the Kaziin team regarding my career support application and relevant opportunities.
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
