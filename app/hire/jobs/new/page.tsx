"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

/* ============================================================
   Job Post Wizard — /hire/jobs/new
   5-step progressive disclosure. Based on SKILL.md §31.
   "Who are you hiring? → Where? → What matters? → Review → Publish"
   ============================================================ */

const TOTAL_STEPS = 5;

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Temporary",
  "Internship",
];

const WORK_ARRANGEMENTS = ["On-site", "Hybrid", "Remote"];

const EXPERIENCE_LEVELS = [
  "Entry-level",
  "Mid-level",
  "Senior",
  "Lead",
  "Executive",
];

type FormData = {
  title: string;
  description: string;
  location: string;
  workArrangement: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  skills: string;
  requirements: string;
  benefits: string;
};

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  location: "",
  workArrangement: "",
  employmentType: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "KES",
  skills: "",
  requirements: "",
  benefits: "",
};

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isParsingAi, setIsParsingAi] = useState(false);

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    setIsParsingAi(true);
    
    // Mocking an AI parse delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setForm(prev => ({
      ...prev,
      title: aiPrompt.includes("deliver") ? "Delivery Runner" : aiPrompt.includes("clean") ? "Cleaner" : "Gig Worker",
      description: `Task: ${aiPrompt}`,
      location: aiPrompt.match(/to (\w+)/)?.[1] || "Local",
      salaryMin: aiPrompt.match(/\b\d+\b/)?.[0] || "",
      salaryCurrency: "KES",
      employmentType: "Gig",
      workArrangement: "On-site"
    }));
    
    setIsParsingAi(false);
    setStep(2); // Jump to step 2 to review
  };

  function set(key: keyof FormData, value: string) {
    setForm((prev: FormData) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s: number) => Math.min(s + 1, TOTAL_STEPS));
  }
  function back() {
    setStep((s: number) => Math.max(s - 1, 1));
  }

  async function publish() {
    setPublishing(true);
    setPublishError("");

    let response: Response;
    try {
      response = await fetch("/api/hire/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          location: form.location,
          description: form.description || form.title,
          workArrangement: normalizeWorkArrangement(form.workArrangement),
          employmentType: normalizeEmploymentType(form.employmentType),
          experienceLevel: form.experienceLevel || "Mid-level",
          salaryMin: form.salaryMin,
          salaryMax: form.salaryMax,
          salaryCurrency: form.salaryCurrency,
          salaryPeriod: "annual",
          requirements: form.requirements,
          skills: form.skills,
          benefits: form.benefits,
          status: "published",
        }),
      });
    } catch {
      setPublishError("Failed to reach the server. Please try again.");
      setPublishing(false);
      return;
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setPublishError(payload?.error ?? "Failed to publish this job.");
      setPublishing(false);
      return;
    }

    router.push("/hire/jobs");
    router.refresh();
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="max-w-[640px]">
      {/* Header */}
      <div className="mb-8">
        <BackButton href="/hire/jobs" label="Back to Jobs" className="mb-4" />
        <h1 className="font-display font-bold text-[26px] text-accent">Post a job</h1>
        <p className="mt-1 text-ink-soft text-[15px]">
          Tell us what you&apos;re looking for and we&apos;ll find the right
          people.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-data text-[12.5px] text-ink-soft">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="font-data text-[12.5px] text-accent-dark">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step labels */}
        <div className="flex justify-between mt-2">
          {["Role", "Location", "Details", "Review", "Publish"].map(
            (label, i) => (
              <span
                key={label}
                className={`font-data text-[11px] ${
                  i + 1 === step
                    ? "text-accent-dark font-semibold"
                    : i + 1 < step
                      ? "text-ink-soft"
                      : "text-line"
                }`}
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>

      {/* Step panels */}
      <div className="pt-8 border-t border-line">
        {/* ── Step 1: Who? ── */}
        {step === 1 && (
          <div>
            <h2 className="font-display font-semibold text-[22px] mb-2">
              What do you need done?
            </h2>
            <p className="text-ink-soft text-[15px] mb-7">
              Post jobs the traditional way, or use AI to fast-track gigs.
            </p>

            <div className="flex bg-paper p-1 rounded-xl mb-6">
              <button
                onClick={() => setIsAiMode(false)}
                className={`flex-1 text-[13px] font-semibold py-2 rounded-lg transition-colors ${!isAiMode ? "bg-paper-alt shadow text-ink" : "text-ink-soft hover:text-ink"}`}
              >
                Standard Post
              </button>
              <button
                onClick={() => setIsAiMode(true)}
                className={`flex-1 text-[13px] font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${isAiMode ? "bg-accent text-white shadow" : "text-ink-soft hover:text-ink"}`}
              >
                
                Fast Track (AI)
              </button>
            </div>

            {isAiMode ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="bg-accent-soft/30 border border-accent/20 rounded-xl p-5">
                  <label htmlFor="ai-prompt" className="block font-data font-semibold text-[13px] text-accent-dark mb-2">
                    Just tell us what you need in one sentence.
                  </label>
                  <textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Need someone to deliver a parcel from CBD to Westlands today, paying KES 500."
                    rows={4}
                    className="w-full border border-accent/30 rounded-[9px] px-4 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none bg-transparent"
                  />
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleAiParse} disabled={!aiPrompt.trim() || isParsingAi}>
                      {isParsingAi ? "Generating..." : "Generate Post "}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in zoom-in-95">
                <div>
                  <label
                    htmlFor="job-title"
                    className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                  >
                    Job title
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Senior Accountant"
                    className="w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="job-description"
                    className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                  >
                    Tell us more about this role{" "}
                    <span className="text-ink-soft/60">(optional)</span>
                  </label>
                  <textarea
                    id="job-description"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe the responsibilities, the team, or what makes this role unique…"
                    rows={4}
                    className="w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Where? ── */}
        {step === 2 && (
          <div>
            <h2 className="font-display font-semibold text-[22px] mb-2">
              Where is this role based?
            </h2>
            <p className="text-ink-soft text-[15px] mb-7">
              Location and work arrangement affect who can apply.
            </p>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="location"
                  className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                >
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Nairobi, Kenya"
                  className="w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <div className="block font-data text-[12.5px] text-ink-soft mb-2.5">
                  Work arrangement
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {WORK_ARRANGEMENTS.map((arr) => (
                    <button
                      key={arr}
                      type="button"
                      onClick={() => set("workArrangement", arr)}
                      className={`py-3 px-3 rounded-[9px] border text-[14px] font-medium transition-all cursor-pointer ${
                        form.workArrangement === arr
                          ? "border-accent bg-accent-soft text-accent-dark"
                          : "border-line text-ink hover:border-ink"
                      }`}
                    >
                      {arr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="block font-data text-[12.5px] text-ink-soft mb-2.5">
                  Employment type
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {EMPLOYMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set("employmentType", type)}
                      className={`py-3 px-3 rounded-[9px] border text-[13.5px] font-medium transition-all cursor-pointer ${
                        form.employmentType === type
                          ? "border-accent bg-accent-soft text-accent-dark"
                          : "border-line text-ink hover:border-ink"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: What matters? ── */}
        {step === 3 && (
          <div>
            <h2 className="font-display font-semibold text-[22px] mb-2">
              What matters for this role?
            </h2>
            <p className="text-ink-soft text-[15px] mb-7">
              These details help candidates understand the role and help recruiters review fit.
            </p>

            <div className="space-y-5">
              <div>
                <div className="block font-data text-[12.5px] text-ink-soft mb-2.5">
                  Experience level
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => set("experienceLevel", level)}
                      className={`py-2 px-4 rounded-full border text-[13.5px] font-medium transition-all cursor-pointer ${
                        form.experienceLevel === level
                          ? "border-accent bg-accent-soft text-accent-dark"
                          : "border-line text-ink hover:border-ink"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                  Salary range{" "}
                  <span className="text-ink-soft/60">(optional)</span>
                </label>
                <div className="flex gap-2.5 items-center">
                  <select
                    value={form.salaryCurrency}
                    onChange={(e) => set("salaryCurrency", e.target.value)}
                    className="border border-line rounded-[9px] px-3 py-3 text-[14px] focus:outline-none focus:border-accent w-[80px]"
                  >
                    {["KES", "NGN", "ZAR", "USD", "AED", "GBP", "SAR"].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      )
                    )}
                  </select>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => set("salaryMin", e.target.value)}
                    placeholder="Min"
                    className="flex-1 border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent"
                  />
                  <span className="text-ink-soft font-data text-[13px]">
                    to
                  </span>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => set("salaryMax", e.target.value)}
                    placeholder="Max"
                    className="flex-1 border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                >
                  Key skills{" "}
                  <span className="text-ink-soft/60">(comma-separated)</span>
                </label>
                <input
                  id="skills"
                  type="text"
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  placeholder="e.g. CPA, IFRS, Excel, Financial Reporting"
                  className="w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                >
                  Requirements{" "}
                  <span className="text-ink-soft/60">(one per line)</span>
                </label>
                <textarea
                  id="requirements"
                  value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                  placeholder={"CPA certification\n4+ years of accounting experience\nKnowledge of IFRS"}
                  rows={4}
                  className="w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none font-body"
                />
              </div>

              <div>
                <label
                  htmlFor="benefits"
                  className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                >
                  Benefits{" "}
                  <span className="text-ink-soft/60">(one per line, optional)</span>
                </label>
                <textarea
                  id="benefits"
                  value={form.benefits}
                  onChange={(e) => set("benefits", e.target.value)}
                  placeholder={"Medical cover\nAnnual bonus\nFlexible hours"}
                  rows={3}
                  className="w-full border border-line rounded-[9px] px-3.5 py-3 text-[15px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none font-body"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div>
            <h2 className="font-display font-semibold text-[22px] mb-2">
              Review your job post
            </h2>
            <p className="text-ink-soft text-[15px] mb-7">
              Check everything looks right before publishing.
            </p>

            <dl className="space-y-4">
              {[
                { label: "Title", value: form.title || "—" },
                { label: "Location", value: form.location || "—" },
                {
                  label: "Work arrangement",
                  value: form.workArrangement || "—",
                },
                { label: "Employment type", value: form.employmentType || "—" },
                { label: "Experience", value: form.experienceLevel || "—" },
                {
                  label: "Salary",
                  value:
                    form.salaryMin && form.salaryMax
                      ? `${form.salaryCurrency} ${Number(form.salaryMin).toLocaleString()} – ${Number(form.salaryMax).toLocaleString()}`
                      : "Not specified",
                },
                { label: "Skills", value: form.skills || "—" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex gap-4 py-3 border-b border-line last:border-b-0"
                >
                  <dt className="font-data text-[13px] text-ink-soft w-[140px] shrink-0">
                    {row.label}
                  </dt>
                  <dd className="text-[14.5px] font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>

            {form.requirements && (
              <div className="mt-5">
                <div className="font-data text-[12.5px] text-ink-soft mb-2">
                  Requirements
                </div>
                <ul className="space-y-1.5">
                  {form.requirements.split("\n").filter(Boolean).map((r) => (
                    <li key={r} className="flex gap-2 text-[14.5px]">
                      <span className="text-accent-dark font-data shrink-0">
                        
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 p-4 bg-accent-soft/50 rounded-[10px] text-[13.5px] text-ink-soft border border-accent-soft">
              Once published, candidates can discover and apply to this role
              automatically. You can pause or edit the post at any time.
            </div>
          </div>
        )}

        {/* ── Step 5: Publish ── */}
        {step === 5 && (
          <div className="text-center py-8">
            {publishing ? (
              <>
                <div className="w-14 h-14 border-2 border-line border-t-accent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="font-display font-bold text-[22px] mb-2">
                  Publishing your job…
                </h2>
                <p className="text-ink-soft text-[15px]">
                  Just a moment while we set things up.
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-6">
                  <span className="text-accent-dark text-[26px]"></span>
                </div>
                <h2 className="font-display font-bold text-[22px] mb-3">
                  Ready to publish
                </h2>
                <p className="text-ink-soft text-[15px] max-w-[360px] mx-auto mb-8">
                  <strong className="text-ink">{form.title || "Your job"}</strong>{" "}
                  will be visible to candidates immediately after
                  publishing.
                </p>
                {publishError && (
                  <div className="mb-6 rounded-[10px] border border-danger/20 bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
                    {publishError}
                  </div>
                )}

                {/* Final summary pill */}
                <div className="inline-flex flex-col items-center gap-2 bg-paper border border-line rounded-[12px] px-6 py-4 text-left mb-8 min-w-[280px]">
                  {[
                    form.location,
                    form.workArrangement,
                    form.employmentType,
                    form.experienceLevel,
                  ]
                    .filter(Boolean)
                    .map((val) => (
                      <div key={val} className="flex items-center gap-2 text-[14px]">
                        <span className="text-accent-dark font-data"></span>
                        <span>{val}</span>
                      </div>
                    ))}
                </div>

                <Button
                  variant="primary"
                  className="w-full max-w-[280px] py-3.5 text-[15px]"
                  onClick={publish}
                >
                  Publish job
                </Button>
              </>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-line">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={next}
              disabled={
                (step === 1 && !form.title.trim()) ||
                (step === 2 && !form.location.trim())
              }
            >
              {step === 4 ? "Confirm & continue" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeWorkArrangement(value: string) {
  if (value === "Remote") return "remote";
  if (value === "Hybrid") return "hybrid";
  return "onsite";
}

function normalizeEmploymentType(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-") || "full-time";
}
