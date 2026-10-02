"use client";

import { useEffect, useRef, useState } from "react";

const PROFILE_ITEMS = [
  { label: "CV uploaded", status: "Ready" },
  { label: "Skills added", status: "Ready" },
  { label: "Work preferences", status: "Ready" },
  { label: "References", status: "Optional" },
] as const;

export function ProfilePreview() {
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
    <section id="work" ref={sectionRef} className="py-16 md:py-24">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-10 md:gap-16 items-center">
          <div className="rounded-[14px] bg-transparent p-8">
            <div className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent-dark mb-4">
              Career profile preview
            </div>
            <div className="flex items-center gap-6 mb-7">
              <div className="relative w-[100px] h-[100px] shrink-0 rounded-full bg-accent-soft flex items-center justify-center">
                <div className={`absolute inset-2 rounded-full border-4 border-accent transition-transform duration-700 ${visible ? "scale-100" : "scale-90"}`} />
                <div className="relative text-center">
                  <span className="font-display font-bold text-[28px] leading-none">95<span className="text-[16px] text-accent">/100</span></span>
                  <span className="font-data text-[10px] text-ink-soft mt-0.5 block uppercase tracking-wide">score</span>
                </div>
              </div>
              <div>
                <div className="font-display font-semibold text-[18px] text-accent leading-tight">
                  One profile for every application
                </div>
                <div className="font-data text-[13px] text-ink-soft mt-1.5">
                  Local, remote, and global career paths
                </div>
              </div>
            </div>

            <div className="pt-5 flex flex-col gap-3">
              {PROFILE_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="text-[14px] text-ink">{item.label}</span>
                  <span className="font-data text-[12px] text-accent-dark">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="font-data text-[13px] text-accent-dark font-semibold block mb-3 uppercase tracking-wider">
              Career Passport
            </span>
            <h2 className="font-display font-bold text-accent text-[26px] sm:text-[38px]">
              Keep your profile ready for real opportunities.
            </h2>
            <p className="mt-5 text-[16px] text-ink-soft leading-relaxed max-w-[440px]">
              Build one profile with your CV, skills, availability, and preferences. Employers and support workflows can use that information once the relevant review process is connected.
            </p>
            <div className="mt-8 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: "1", label: "shared profile" },
                { n: "3", label: "career paths" },
                { n: "0", label: "candidate fees" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display font-bold text-[26px] text-accent">{stat.n}</div>
                  <div className="font-data text-[12px] text-ink-soft mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
