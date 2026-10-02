"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AssessmentSuccess } from "./assessment-success";
import { BackButton } from "@/components/ui/back-button";

/* ============================================================
   Career Assessment Form — Multi-step client component
   ============================================================ */

const EMPLOYMENT_STATUSES = [
  { value: "employed_full_time", label: "Employed full-time" },
  { value: "employed_part_time", label: "Employed part-time" },
  { value: "self_employed", label: "Self-employed / Freelance" },
  { value: "unemployed_seeking", label: "Unemployed — actively seeking work" },
  { value: "unemployed_not_seeking", label: "Not currently seeking work" },
  { value: "student", label: "Currently studying" },
  { value: "returner", label: "Returning to work" },
] as const;

const EDUCATION_LEVELS = [
  { value: "no_formal", label: "No formal qualifications" },
  { value: "secondary", label: "Secondary school / GCSE equivalent" },
  { value: "higher_secondary", label: "A-levels / Diploma / High school leaving" },
  { value: "vocational", label: "Vocational qualification / Trade certificate" },
  { value: "undergraduate", label: "Bachelor's degree" },
  { value: "postgraduate", label: "Master's degree or higher" },
  { value: "professional", label: "Professional qualification (e.g. ACCA, CPA, PMP)" },
] as const;

const CAREER_GOALS = [
  { value: "find_first_job", label: "Find my first job" },
  { value: "change_career", label: "Change career direction" },
  { value: "advance_career", label: "Advance in my current career" },
  { value: "learn_new_skill", label: "Learn a new skill or specialize" },
  { value: "get_certified", label: "Get certified or licensed" },
  { value: "start_skilled_trade", label: "Start a skilled trade" },
  { value: "work_internationally", label: "Work internationally" },
  { value: "work_remotely", label: "Work remotely" },
  { value: "become_self_employed", label: "Become self-employed" },
] as const;

const EXPERIENCE_AREAS = [
  "Technology & IT",
  "Finance & Accounting",
  "Healthcare & Medical",
  "Education & Training",
  "Engineering",
  "Construction & Skilled Trades",
  "Sales & Marketing",
  "Customer Service",
  "Administration",
  "Transport & Logistics",
  "Hospitality & Tourism",
  "Retail",
  "Agriculture",
  "Creative & Media",
  "Legal & Compliance",
  "Human Resources",
  "Security",
  "Other",
] as const;

const WORK_PREFERENCES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract / Fixed-term" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On-site" },
  { value: "flexible", label: "Flexible / Open to all" },
] as const;

type StepNum = 1 | 2 | 3 | 4;

interface AssessmentData {
  employment_status: string;
  education_level: string;
  career_goal: string;
  experience_area: string;
  location: string;
  work_preferences: string[];
}

const STEPS: { step: StepNum; title: string; subtitle: string }[] = [
  { step: 1, title: "Your current situation", subtitle: "This helps us understand where you are today." },
  { step: 2, title: "Your career goal", subtitle: "What are you trying to achieve?" },
  { step: 3, title: "Your experience area", subtitle: "What sector or area is most relevant to you?" },
  { step: 4, title: "Location & preferences", subtitle: "Where you are and how you prefer to work." },
];

function RadioCard({
  value,
  checked,
  onChange,
  label,
}: {
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3.5 rounded-[10px] border cursor-pointer transition-colors ${
        checked ? "border-[#2F6D53] bg-accent-soft" : "border-line hover:border-[#2F6D53]/40"
      }`}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label={label}
      />
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
          checked ? "border-[#2F6D53]" : "border-line"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#2F6D53]" />}
      </span>
      <span className="text-[14px]">{label}</span>
    </label>
  );
}

export function CareerAssessmentForm({ userName = "Candidate" }: { userName?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<StepNum>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [data, setData] = useState<AssessmentData>({
    employment_status: "",
    education_level: "",
    career_goal: "",
    experience_area: "",
    location: "",
    work_preferences: [],
  });

  function update<K extends keyof AssessmentData>(key: K, value: AssessmentData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreference(value: string) {
    setData((prev) => ({
      ...prev,
      work_preferences: prev.work_preferences.includes(value)
        ? prev.work_preferences.filter((p) => p !== value)
        : [...prev.work_preferences, value],
    }));
  }

  function canAdvance(): boolean {
    if (step === 1) return Boolean(data.employment_status && data.education_level);
    if (step === 2) return Boolean(data.career_goal);
    if (step === 3) return Boolean(data.experience_area);
    if (step === 4) return Boolean(data.location.trim() && data.work_preferences.length > 0);
    return false;
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/career-support/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/signup?next=/career-support/plan");
          return;
        }
        const debugMsg = json.debug ? ` (${json.debug.code}: ${json.debug.message})` : "";
        throw new Error((json.error ?? "Something went wrong.") + debugMsg);
      }
      // Show success screen instead of redirecting
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  const currentStepMeta = STEPS.find((s) => s.step === step)!;

  return (
    <div className="min-h-screen py-16 max-md:py-10">
      <div className="max-w-[680px] mx-auto px-5">
        {isSuccess ? (
          <AssessmentSuccess careerGoal={data.career_goal} name={userName} />
        ) : (
          <>
            {/* Header */}
        <div className="mb-10">
          <BackButton href="/career-support" label="Career Support" className="mb-6" />
          <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
            Career Assessment
          </span>
          <h1 className="font-display font-bold text-[32px] max-sm:text-[26px] text-[#2F6D53] mt-2 leading-tight">
            {currentStepMeta.title}
          </h1>
          <p className="mt-2 text-ink-soft text-[15px]">{currentStepMeta.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
          {STEPS.map((s) => (
            <div
              key={s.step}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                s.step <= step ? "bg-[#2F6D53]" : "bg-line"
              }`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-8">
            <fieldset>
              <legend className="font-display font-semibold text-[15.5px] mb-3">
                Current employment status
              </legend>
              <div className="flex flex-col gap-2">
                {EMPLOYMENT_STATUSES.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    checked={data.employment_status === opt.value}
                    onChange={() => update("employment_status", opt.value)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display font-semibold text-[15.5px] mb-3">
                Highest education level
              </legend>
              <div className="flex flex-col gap-2">
                {EDUCATION_LEVELS.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    checked={data.education_level === opt.value}
                    onChange={() => update("education_level", opt.value)}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <fieldset>
            <legend className="font-display font-semibold text-[15.5px] mb-3">
              Primary career goal
            </legend>
            <div className="flex flex-col gap-2">
              {CAREER_GOALS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  checked={data.career_goal === opt.value}
                  onChange={() => update("career_goal", opt.value)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <fieldset>
            <legend className="font-display font-semibold text-[15.5px] mb-3">
              Most relevant sector or area
            </legend>
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2">
              {EXPERIENCE_AREAS.map((area) => (
                <RadioCard
                  key={area}
                  value={area}
                  label={area}
                  checked={data.experience_area === area}
                  onChange={() => update("experience_area", area)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex flex-col gap-8">
            <div>
              <label
                htmlFor="assessment-location"
                className="font-display font-semibold text-[15.5px] block mb-3"
              >
                Where are you currently based?
              </label>
              <input
                id="assessment-location"
                type="text"
                placeholder="City, country (e.g. Nairobi, Kenya)"
                value={data.location}
                onChange={(e) => update("location", e.target.value)}
                className="w-full px-4 py-3.5 rounded-[10px] border border-line focus:border-[#2F6D53] focus:outline-none text-[14.5px] bg-transparent"
              />
            </div>

            <fieldset>
              <legend className="font-display font-semibold text-[15.5px] mb-3">
                Work preferences (select all that apply)
              </legend>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2">
                {WORK_PREFERENCES.map((opt) => {
                  const selected = data.work_preferences.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-[10px] border cursor-pointer transition-colors ${
                        selected
                          ? "border-[#2F6D53] bg-accent-soft"
                          : "border-line hover:border-[#2F6D53]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={opt.value}
                        checked={selected}
                        onChange={() => togglePreference(opt.value)}
                        className="sr-only"
                        aria-label={opt.label}
                      />
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                          selected ? "border-[#2F6D53] bg-[#2F6D53]" : "border-line"
                        }`}
                      >
                        {selected && (null)}
                      </span>
                      <span className="text-[14px]">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-[10px] bg-red-50 border border-red-200 text-[14px] text-red-700"
          >
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as StepNum)}
              className="px-5 py-2.5 text-[14px] font-medium text-[#2F6D53] hover:bg-[#2F6D53]/10 rounded-lg transition-colors"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              type="button"
              id="assessment-next-btn"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => (s + 1) as StepNum)}
              className="px-6 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14.5px] hover:bg-[#2F6D53]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              id="assessment-submit-btn"
              disabled={!canAdvance() || saving}
              onClick={handleSubmit}
              className="px-6 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14.5px] hover:bg-[#2F6D53]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Build my career plan →"}
            </button>
          )}
        </div>

          <div className="mt-6 text-center text-[12.5px] font-data text-ink-soft">
            Step {step} of {STEPS.length}
          </div>
        </>
        )}
      </div>
    </div>
  );
}
