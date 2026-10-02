"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   How It Works — Step connector timeline
   Clean, editorial. Numbers do the work. No icons.
   ============================================================ */

const STEPS = [
  {
    num: "01",
    title: "Build your profile",
    desc: "Add your skills, experience and availability once. Your profile is verified and ready to work for you across every opportunity on Kaziin.",
  },
  {
    num: "02",
    title: "Get matched",
    desc: "Stop searching manually. Our system automatically connects your profile with roles that match your skills, experience, and preferences.",
  },
  {
    num: "03",
    title: "Apply with confidence",
    desc: "Your matches are ready for you. Apply directly from your dashboard — no CV rework, no repeated forms, just a single verified profile working for you.",
  },
  {
    num: "04",
    title: "Track everything in one place",
    desc: "Follow job applications and global assessment requests from your dashboard as connected workflows come online.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-6 md:py-10 bg-accent-soft">
      <div className="wrap">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
          <div className="max-w-[520px]">
            <span className="font-data text-[13px] text-accent-dark font-semibold block mb-3 uppercase tracking-wider">
              For Workers
            </span>
            <h2
              className="font-display font-bold text-accent"
              style={{ fontSize: "clamp(26px, 3.4vw, 38px)" }}
            >
              Get matched with jobs instantly.
            </h2>
            <p className="mt-4 text-[16px] text-ink leading-relaxed">
              Stop checking for open roles manually. Build your Career Passport once, and Kaziin will automatically connect you with opportunities that fit your verified profile.
            </p>
          </div>

          {/* Career Profile — circle + match breakdown */}
          <div className="rounded-[14px] bg-transparent p-5 md:p-6 w-full md:w-[300px] shrink-0">
            <div className="font-data text-[10px] font-semibold uppercase tracking-wider text-accent-dark mb-4">
              Career Profile
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-[72px] h-[72px] shrink-0 rounded-full bg-paper flex items-center justify-center">
                <div className={`absolute inset-1.5 rounded-full border-[3px] border-accent transition-transform duration-700 ${visible ? "scale-100" : "scale-90"}`} />
                <div className="relative text-center">
                  <span className="font-display font-bold text-[18px] text-accent leading-none">98<span className="text-[11px]">%</span></span>
                  <span className="font-data text-[8px] text-ink-soft mt-0.5 block uppercase tracking-wide">match</span>
                </div>
              </div>
              <div>
                <div className="font-display font-semibold text-[15px] text-accent leading-tight">High Match Rate</div>
                <div className="font-data text-[12px] text-ink-soft mt-0.5">Skills &amp; experience aligned</div>
              </div>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              {[
                { factor: "Skills match", pct: 98 },
                { factor: "Experience level", pct: 91 },
                { factor: "Availability", pct: 100 },
                { factor: "Location", pct: 85 },
              ].map((item) => (
                <div key={item.factor}>
                  <div className="flex justify-between mb-1">
                    <span className="font-data text-[11px] text-ink">{item.factor}</span>
                    <span className="font-data text-[11px] font-bold text-accent-dark">{item.pct}%</span>
                  </div>
                  <div className="h-[4px] bg-accent/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: visible ? `${item.pct}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step connector */}
        <div className="relative">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                {/* Dot */}
                <div className="flex items-center gap-3 mb-3 md:mb-5">
                  <div className="w-[22px] h-[22px] rounded-full border-2 border-accent bg-accent flex items-center justify-center shrink-0 relative z-10">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  </div>
                  <span className="font-data text-[12px] text-ink-soft">{step.num}</span>
                </div>
                <h3 className="font-display font-semibold text-[17px] text-accent mb-2">
                  {step.title}
                </h3>
                <p className="text-[14px] text-ink-soft leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
