"use client";

import Link from "next/link";

/* ============================================================
   Hero Gateway — The three-portal gateway
   Mobile: compact headline + horizontal swipe cards + inline CTA
   Desktop: full layout with 3-col grid
   ============================================================ */

type PathKey = "work" | "global" | "hire";

interface PortalData {
  key: PathKey;
  title: string;
  description: string;
  tags: string[];
  cta: string;
  href: string;
  accentBg: string;
}

const PORTALS: PortalData[] = [
  {
    key: "work",
    title: "Find Work",
    description: "Local jobs, remote roles, and quick tasks matched to your profile.",
    tags: ["Local", "Quick Tasks", "Remote", "Freelance"],
    cta: "Find jobs",
    href: "/auth/signup?role=work",
    accentBg: "bg-[#E3ECE6]",
  },
  {
    key: "global",
    title: "Career Support",
    description: "Skills support, funding, and global career opportunities.",
    tags: ["Skills Support", "Global Careers", "Funding"],
    cta: "Get career support",
    href: "/auth/signup?role=global",
    accentBg: "bg-[#E3ECE6]",
  },
  {
    key: "hire",
    title: "Hire Talent",
    description: "Post jobs, review applicants, and manage your hiring pipeline.",
    tags: ["Search", "Screen", "Shortlist", "Hire"],
    cta: "Start hiring",
    href: "/auth/signup?role=hire",
    accentBg: "bg-[#E3ECE6]",
  },
];

export function HeroGateway() {
  return (
    <section className="wrap pt-3 md:pt-10 pb-4 md:pb-8">
      {/* ── Headline ── */}
      <div className="mb-4 md:mb-10 md:max-w-[760px]">
        <span className="font-data text-[11px] md:text-[13px] text-accent-dark block mb-2 md:mb-3.5 tracking-wide uppercase font-semibold">
          Where Talent Meets Opportunity
        </span>
        <h1
          className="font-display font-bold leading-[1.05] text-accent"
          style={{ fontSize: "clamp(26px, 5.4vw, 58px)" }}
        >
          <span className="inline md:block">FIND WORK </span>
          <span className="inline md:block">GET FUNDED </span>
          <span className="inline md:block">HIRE TALENT</span>
        </h1>
        <p className="mt-2 md:mt-5 text-[13px] md:text-[17px] text-ink-soft md:max-w-[560px] leading-relaxed">
          One platform connecting candidates, employers, and global opportunities
          across local, remote, and international work.
        </p>
      </div>

      {/* ── Portal Cards ──
           Mobile: horizontal swipe row (all 3 visible side by side)
           Desktop: 3-col grid                                        */}
      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth">
        {PORTALS.map((portal) => (
          <Link
            key={portal.key}
            href={portal.href}
            className="group flex flex-col justify-between rounded-[16px] bg-transparent p-4 md:p-7 hover:bg-black/[0.02] transition-all duration-200 no-underline border border-line/40 flex-shrink-0 w-[72vw] md:w-auto snap-start"
          >
            {/* Top info */}
            <div>
              <h2 className="font-display font-bold text-[18px] md:text-[22px] text-accent mt-1 leading-tight">
                {portal.title}
              </h2>
              <p className="text-[12.5px] md:text-[14px] text-ink-soft mt-2 leading-relaxed">
                {portal.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {portal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-data text-[10px] md:text-[11px] text-ink-soft bg-transparent rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom visual & CTA */}
            <div className="mt-4">
              {/* Mini visual */}
              <div className={`h-[70px] md:h-[90px] rounded-[12px] relative overflow-hidden ${portal.accentBg}`}>
                <PortalVisual type={portal.key} />
              </div>

              {/* CTA */}
              <div className="mt-3 flex items-center justify-center">
                <span className="font-semibold text-[13px] md:text-[14.5px] inline-flex items-center gap-1.5 text-accent-dark group-hover:text-accent font-display">
                  {portal.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Global CTA & Login — compact on mobile ── */}
      <div className="mt-6 md:mt-12 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-5">
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center px-7 md:px-10 py-2.5 md:py-3.5 rounded-full border-2 border-[#2F6D53] text-[#2F6D53] font-bold text-[14px] md:text-[15.5px] hover:bg-[#2F6D53] hover:text-white transition-colors whitespace-nowrap"
        >
          Get Started
        </Link>
        <div className="text-[13px] md:text-[14px] text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-accent-dark font-semibold hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Mini visuals inside each portal ─────────────────────── */

function PortalVisual({ type }: { type: PathKey }) {
  if (type === "work") {
    return (
      <div className="absolute inset-0 flex items-center px-2 gap-1.5">
        {[
          { status: "98%", label: "Frontend Dev", width: "w-full" },
          { status: "92%", label: "Ops Manager", width: "w-4/5" },
          { status: "85%", label: "UX Writer", width: "w-3/5" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex-1 min-w-0 bg-accent rounded-[8px] p-1.5 font-data text-[10.5px] text-white shadow-xs"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-white font-bold text-[11px]">{item.status}</span>
              <div className="w-[12px] h-[12px] rounded-full bg-white/20 flex items-center justify-center text-[6px] text-white font-bold">
                JD
              </div>
            </div>
            <span className="text-white/80 truncate block text-[9.5px]">{item.label}</span>
            <div className="mt-1 h-[3px] bg-black/20 rounded-full overflow-hidden">
              <div className={`h-full ${item.width} bg-white rounded-full`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "global") {
    return (
      <div className="absolute inset-0 flex items-center px-2 gap-1.5">
        {[
          { label: "Apply" },
          { label: "Verification" },
          { label: "Funding" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex-1 min-w-0 bg-accent rounded-[8px] p-1.5 font-data text-[10.5px] text-white shadow-xs flex items-center justify-center h-[56px]"
          >
            <b className="text-white text-[10px] block truncate text-center">{item.label}</b>
          </div>
        ))}
      </div>
    );
  }

  // hire
  return (
    <div className="absolute inset-0 flex items-center px-2 gap-1.5">
      {[
        { score: "96%", label: "Candidate A", initials: "KA" },
        { score: "89%", label: "Candidate B", initials: "BT" },
        { score: "82%", label: "Candidate C", initials: "CM" },
      ].map((item) => (
        <div
          key={item.label}
          className="flex-1 min-w-0 bg-accent rounded-[8px] p-1.5 font-data text-[10.5px] text-white shadow-xs"
        >
          <div className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center font-bold text-[7px] text-white mb-1">
            {item.initials}
          </div>
          <b className="text-white text-[10px] block truncate">{item.label}</b>
          <span className="text-white/90 font-bold text-[10px]">{item.score}</span>
        </div>
      ))}
    </div>
  );
}
