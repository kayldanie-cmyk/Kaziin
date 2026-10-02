"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ============================================================
   Apply for Career Support — /career-support/apply
   User selects what they want to do, then proceeds to the
   relevant application or onboarding route.
   ============================================================ */

const OPTIONS = [
  {
    id: "path",
    title: "Find My Career Path",
    description: "Discover the exact roadmap to your dream job and unlock your true earning potential.",
    detail: "Career goal mapping, skill gap analysis, and a personalised step-by-step plan.",
    href: "/career-support/apply/path",
  },
  {
    id: "skills",
    title: "Build My Skills",
    description: "Apply for funded skills support to acquire high-demand skills and boost your market value.",
    detail: "Matched with verified training providers (1 month – 1 year). Funding & grants where available.",
    href: "/career-support/apply/skills",
  },
  {
    id: "funding",
    title: "Get Career Funding",
    description: "Secure the grants and scholarships you need to fund your career development.",
    detail: "Grants, scholarships, and mobility funding matched to your situation.",
    href: "/career-support/apply/funding",
  },
  {
    id: "global",
    title: "Pursue an International Career",
    description: "Take your career to another country with expert support for visas and relocation.",
    detail: "International job matching, visa & relocation guidance, global mobility funding.",
    href: "/global-dashboard",
  },
  {
    id: "work",
    title: "Find Work Now",
    description: "Get matched instantly with top employers who are actively hiring.",
    detail: "Instant job matching across multiple sectors based on your profile.",
    href: "/dashboard/jobs",
  },
];

export default function ApplySelectorPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const option = OPTIONS.find((o) => o.id === selected);
    if (option) router.push(option.href);
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[720px] mx-auto px-5 py-16">
        {/* Back link */}
        <Link
          href="/career-support"
          className="text-[13px] text-ink-soft hover:text-ink font-medium mb-8 inline-block"
        >
          ← Back to Career Support
        </Link>

        <span className="font-data text-[12px] text-accent-dark uppercase tracking-widest font-semibold block mb-3">
          Apply for Career Support
        </span>
        <h1
          className="font-display font-bold text-[#2F6D53] leading-[1.1] mb-3"
          style={{ fontSize: "clamp(26px, 4vw, 38px)" }}
        >
          What do you want to do?
        </h1>
        <p className="text-[15px] text-ink-soft mb-8 max-w-[520px] leading-relaxed">
          Select the type of support that best matches your situation. We&apos;ll guide you to the right application.
        </p>

        {/* Steps overview */}
        <div className="mb-10 border border-line rounded-[14px] p-5">
          <span className="block font-data text-[11px] uppercase tracking-widest text-ink-soft mb-4">How it works</span>
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-0">
            {[
              { step: "1", label: "Select your pathway", detail: "Choose what kind of support you need" },
              { step: "2", label: "Complete your application", detail: "Answer a short set of questions about your situation and goals" },
              { step: "3", label: "We review & respond", detail: "Our team reviews and connects you to available support" },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex-1 flex flex-col sm:flex-row items-start">
                <div className="flex-1 flex flex-col gap-1 py-3 sm:py-0 sm:px-4 first:sm:pl-0 last:sm:pr-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2F6D53] text-white font-bold font-data text-[11px] flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <span className="font-semibold text-[13.5px] text-ink">{s.label}</span>
                  </div>
                  <p className="text-[12.5px] text-ink-soft leading-relaxed ml-8">{s.detail}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:block self-center mx-2 text-line text-[18px] font-light">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleProceed}>
          <div className="flex flex-col gap-3 mb-10">
            {OPTIONS.map((opt) => (
              <label
                key={opt.id}
                htmlFor={`option-${opt.id}`}
                className={`border rounded-[14px] p-5 cursor-pointer transition-all ${
                  selected === opt.id
                    ? "border-[#2F6D53] bg-accent-soft/40 ring-1 ring-[#2F6D53]/30"
                    : "border-line hover:border-[#2F6D53]/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      id={`option-${opt.id}`}
                      name="pathway"
                      value={opt.id}
                      checked={selected === opt.id}
                      onChange={() => setSelected(opt.id)}
                      className="w-4 h-4 accent-[#2F6D53]"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="block font-display font-bold text-[16px] text-ink mb-1">
                      {opt.title}
                    </span>
                    <span className="block text-[13.5px] text-ink-soft leading-relaxed">
                      {opt.description}
                    </span>
                    {selected === opt.id && (
                      <span className="block text-[12.5px] text-accent-dark mt-2 font-medium">
                        {opt.detail}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-line">
            <button
              type="submit"
              disabled={!selected}
              id="apply-proceed-btn"
              className={`w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-[15px] transition-colors ${
                selected
                  ? "bg-[#2F6D53] text-white hover:bg-[#1E4D39]"
                  : "bg-line/40 text-ink-soft cursor-not-allowed"
              }`}
            >
              Proceed
            </button>
            <Link
              href="/career-support"
              className="text-[14px] text-ink-soft hover:text-ink font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
