"use client";

import { ProgressBar } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

/* ============================================================
   Employer Section — Professional, data-driven, clean.
   ============================================================ */

const FUNNEL = [
  { label: "Role posted", state: "Live", fill: 100 },
  { label: "Matched candidates", state: "Auto-surfaced", fill: 88 },
  { label: "Profile fit score", state: "Calculated", fill: 72 },
  { label: "Shortlist ready", state: "Review now", fill: 55 },
];

export function EmployerSection() {
  return (
    <section id="employers" className="py-6 md:py-10 bg-accent-soft text-ink">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-center">
          
          {/* Left: Copy & Actions */}
          <div>
            <span className="font-data text-[13px] text-accent-dark font-semibold block mb-3 uppercase tracking-wider">
              For Employers
            </span>
            <h2
              className="font-display font-bold max-w-[480px] text-accent"
              style={{ fontSize: "clamp(26px, 3.4vw, 38px)" }}
            >
              The right candidates, matched to your role automatically.
            </h2>
            <p className="mt-5 text-[16px] text-ink max-w-[440px] leading-relaxed">
              Post a role and Kaziin instantly surfaces candidates whose verified skills, experience, and availability align with what you need — no manual screening required.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Candidates matched to your role the moment you post",
                "Verified profiles with skills and experience evidence",
                "Shortlists ready for focused review, not guesswork",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14.5px] text-ink-soft">
                  <span className="text-accent font-bold shrink-0 mt-0.5"></span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link href="/auth/signup?role=hire" className={buttonVariants()}>
                Start hiring
              </Link>
              <Link href="/demo" className={buttonVariants({ variant: "ghost" })}>
                Request for demo
              </Link>
            </div>
          </div>

          {/* Right: Data UI */}
          <div className="rounded-[14px] bg-transparent p-8">
            <div className="font-display font-semibold text-[15px] text-accent mb-6 pb-4">
              Candidate matching
            </div>
            
            <div className="flex flex-col gap-5">
              {FUNNEL.map((row) => (
                <div key={row.label} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-[100px] sm:w-[140px] shrink-0 font-data text-[11px] sm:text-[13px] text-ink-soft">
                    {row.label}
                  </div>
                  <div className="flex-1 flex items-center gap-2 sm:gap-3">
                    <ProgressBar value={row.fill} animate={true} />
                    <span className="w-[70px] sm:w-[86px] text-right font-data text-[10px] sm:text-[12px] font-semibold text-ink">
                      {row.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Candidate Result */}
            <div className="mt-8 bg-transparent rounded-[14px] p-5 flex items-center gap-5">
               <div className="relative w-[60px] h-[60px] shrink-0 rounded-full bg-paper flex items-center justify-center">
                 <div className="absolute inset-[4px] rounded-full border-[3px] border-accent" />
                 <div className="relative text-center mt-0.5">
                   <span className="font-display font-bold text-[16px] text-accent leading-none">94<span className="text-[10px]">%</span></span>
                   <span className="font-data text-[7px] text-ink-soft mt-0.5 block uppercase tracking-wide">match</span>
                 </div>
               </div>
               <div>
                 <div className="font-display font-semibold text-[15px] text-accent">Top candidate ready</div>
                 <div className="font-data text-[12px] text-ink mt-0.5">Skills & experience verified</div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
