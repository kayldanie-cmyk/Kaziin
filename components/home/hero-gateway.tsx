"use client";

import Link from "next/link";

/* ============================================================
   Hero Gateway — The three-portal gateway
   "Find work. Go global. Hire talent."
   Each portal routes to /auth/signup?role=<key>.
   ============================================================ */

type PathKey = "work" | "global" | "hire";

interface PortalData {
  key: PathKey;
  audience: string;
  title: string;
  description: string;
  tags: string[];
  cta: string;
  href: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
}

const PORTALS: PortalData[] = [
  {
    key: "work",
    audience: "For candidates",
    title: "Find Work",
    description: "Explore local jobs, remote roles, and quick tasks with match signals tied to your profile.",
    tags: ["Local", "Quick Tasks", "Remote", "Freelance"],
    cta: "Find jobs",
    href: "/auth/signup?role=work",
    accentBg: "bg-[#E3ECE6]",
    badgeBg: "bg-transparent",
    badgeText: "text-ink-soft",
  },
  {
    key: "global",
    audience: "For candidates",
    title: "Career Support",
    description: "Get help to acquire short skills or apply for global career support.",
    tags: ["Skills Support", "Global Careers", "Funding"],
    cta: "Get career support",
    href: "/auth/signup?role=global",
    accentBg: "bg-[#E3ECE6]",
    badgeBg: "bg-transparent",
    badgeText: "text-ink-soft",
  },
  {
    key: "hire",
    audience: "For employers",
    title: "Hire Talent",
    description: "Post jobs, review applicants, and manage your hiring pipeline end-to-end.",
    tags: ["Search", "Screen", "Shortlist", "Hire"],
    cta: "Start hiring",
    href: "/auth/signup?role=hire",
    accentBg: "bg-[#E3ECE6]",
    badgeBg: "bg-transparent",
    badgeText: "text-ink-soft",
  },
];

export function HeroGateway() {
  return (
    <section className="wrap pt-4 md:pt-10 pb-8">
      {/* ── Headline ── */}
      <div className="max-w-[760px] mb-8 md:mb-10">
        <span className="font-data text-[13px] text-accent-dark block mb-3.5 tracking-wide uppercase font-semibold">
          Where Talent Meets Opportunity
        </span>
        <h1
          className="font-display font-bold leading-[1.05] text-accent"
          style={{ fontSize: "clamp(30px, 5.4vw, 58px)" }}
        >
          <span className="block md:inline">FIND WORK</span>{" "}
          <span className="block md:inline">GET FUNDED</span>
          <br className="hidden md:inline" />
          <span className="block md:inline">HIRE TALENT</span>
        </h1>
        <p className="mt-5 text-[15px] md:text-[17px] text-ink-soft max-w-[560px] leading-relaxed">
          One platform connecting candidates, employers, and global opportunities
          across local, remote, and international work.
        </p>
      </div>

      {/* ── Three Portals Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {PORTALS.map((portal) => (
          <Link
            key={portal.key}
            href={portal.href}
            className="group flex flex-col justify-between rounded-[16px] bg-transparent p-5 sm:p-7 hover:bg-black/[0.02] transition-all duration-200 no-underline"
          >
            {/* Top info */}
            <div>
              <h2 className="font-display font-bold text-[22px] sm:text-[24px] text-accent mt-2 leading-tight">
                {portal.title}
              </h2>
              <p className="text-[14px] text-ink-soft mt-2.5 leading-relaxed">
                {portal.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {portal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-data text-[11px] text-ink-soft bg-transparent rounded-md font-medium px-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom visual & CTA */}
            <div className="mt-6">
              {/* Mini visual */}
              <div className={`h-[90px] rounded-[12px] relative overflow-hidden ${portal.accentBg}`}>
                <PortalVisual type={portal.key} />
              </div>

              {/* CTA link */}
              <div className="mt-4 flex items-center justify-center pt-1">
                <span className="font-semibold text-[14.5px] inline-flex items-center gap-2 text-accent-dark group-hover:text-accent font-display">
                  {portal.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Global CTA & Login */}
      <div className="mt-12 flex flex-col items-center justify-center gap-5">
        <Link href="/auth/signup" className="inline-flex items-center justify-center px-10 py-3.5 rounded-full bg-[#2F6D53] text-white font-bold text-[15.5px] hover:bg-[#1E4D39] transition-colors">
          Get Started
        </Link>
        <div className="text-center text-[14px] text-ink-soft">
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

/* ── Mini visuals inside each portal ────────────────────────────── */

function PortalVisual({ type }: { type: PathKey }) {
  if (type === "work") {
    return (
      <div className="absolute inset-0 flex items-center px-3 gap-2">
        {[
          { status: "98%", label: "Frontend Dev", width: "w-full" },
          { status: "92%", label: "Ops Manager", width: "w-4/5" },
          { status: "85%", label: "UX Writer", width: "w-3/5" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex-1 min-w-0 bg-accent rounded-[8px] p-2 font-data text-[10.5px] text-white shadow-xs"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-white font-bold text-[12px]">{item.status}</span>
              <div className="w-[14px] h-[14px] rounded-full bg-white/20 flex items-center justify-center text-[7px] text-white font-bold">
                JD
              </div>
            </div>
            <span className="text-white/80 truncate block text-[10px] mt-1">{item.label}</span>
            <div className="mt-1.5 h-[3px] bg-black/20 rounded-full overflow-hidden">
              <div className={`h-full ${item.width} bg-white rounded-full`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "global") {
    return (
      <div className="absolute inset-0 flex items-center px-3 gap-2">
        {[
          { label: "Apply" },
          { label: "Verification" },
          { label: "Funding" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex-1 min-w-0 bg-accent rounded-[8px] p-2 font-data text-[10.5px] text-white shadow-xs flex items-center justify-center h-[68px]"
          >
            <b className="text-white text-[11px] block truncate text-center">{item.label}</b>
          </div>
        ))}
      </div>
    );
  }

  // hire
  return (
    <div className="absolute inset-0 flex items-center px-3 gap-2">
      {[
        { score: "96%", label: "Candidate A", initials: "KA" },
        { score: "89%", label: "Candidate B", initials: "BT" },
        { score: "82%", label: "Candidate C", initials: "CM" },
      ].map((item) => (
        <div
          key={item.label}
          className="flex-1 min-w-0 bg-accent rounded-[8px] p-2 font-data text-[10.5px] text-white shadow-xs"
        >
          <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center font-bold text-[8.5px] text-white mb-1">
            {item.initials}
          </div>
          <b className="text-white text-[11px] block truncate">{item.label}</b>
          <span className="text-white/90 font-bold text-[10.5px]">{item.score}</span>
        </div>
      ))}
    </div>
  );
}
