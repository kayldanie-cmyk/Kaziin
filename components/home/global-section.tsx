"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ============================================================
   Global Careers Section
   3-step funding application flow.
   ============================================================ */

const FUNDING_STEPS = [
  {
    step: "01",
    title: "Build your plan",
    subtitle: "Discover your path",
    desc: "Complete a short assessment to generate your personalized career plan, highlighting your skills gap and recommended training.",
  },
  {
    step: "02",
    title: "Learn & Get Support",
    subtitle: "Find training & funding",
    desc: "Browse verified training programs. Apply for contextual funding and support to help cover the costs of your development.",
  },
  {
    step: "03",
    title: "Find Work & Grow",
    subtitle: "Connect to opportunities",
    desc: "Upload your completed credentials. Your profile updates automatically, matching you with relevant jobs as you progress.",
  },
];

const JOURNEY_STAGES = [
  { label: "Apply" },
  { label: "Verification" },
  { label: "Funding" },
  { label: "Relocation" },
  { label: "Work" },
] as const;

export function GlobalSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const stages = Array.from(
            track.querySelectorAll(".journey-stage")
          );
          stages.forEach((s: Element, i: number) => {
            if (prefersReduced) {
              s.classList.add("opacity-100", "translate-y-0");
              s.classList.remove("opacity-0", "translate-y-1.5");
            } else {
              setTimeout(() => {
                s.classList.add("opacity-100", "translate-y-0");
                s.classList.remove("opacity-0", "translate-y-1.5");
              }, i * 90);
            }
          });
          observer.unobserve(track);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="global"
      className="py-6 md:py-10 bg-accent-soft text-ink"
    >
      <div className="wrap">
        {/* Section Header */}
        <span className="font-data text-[13px] text-accent-dark font-semibold block mb-3 uppercase tracking-wider">
          Career Support & Funding
        </span>
        <h2
          className="font-display font-bold max-w-[680px] text-accent"
          style={{ fontSize: "clamp(28px, 3.4vw, 40px)" }}
        >
          Build the career you want with support you can understand.
        </h2>
        <p className="mt-4 text-[15px] sm:text-[16.5px] max-w-[560px] text-ink leading-relaxed">
          Explore career paths, identify the skills you need, find relevant training, explore support opportunities and connect with work through one career journey.
        </p>

        {/* Funding application steps — dot timeline style matching For Workers */}
        <div className="mt-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {FUNDING_STEPS.map((step) => (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-3 mb-3 md:mb-5">
                  <div className="w-[22px] h-[22px] rounded-full border-2 border-accent bg-accent flex items-center justify-center shrink-0 relative z-10">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  </div>
                  <span className="font-data text-[12px] text-ink">{step.step}</span>
                </div>
                <h3 className="font-display font-semibold text-[17px] text-accent mb-2">
                  {step.title}
                </h3>
                <div className="font-data text-[11.5px] text-accent-dark font-medium mb-2">
                  {step.subtitle}
                </div>
                <p className="text-[14px] text-ink leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/career-support"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-accent text-white font-semibold text-[15px] rounded-xl hover:bg-accent/90 transition-colors shadow-xs"
          >
            Get Career Support
          </Link>
        </div>
      </div>
    </section>
  );
}
