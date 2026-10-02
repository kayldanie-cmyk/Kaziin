import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Current Kaziin access model for candidates, global career interest, and employer hiring workspaces.",
};

const ACCESS_OPTIONS = [
  {
    audience: "Candidates",
    name: "Career access",
    price: "$0",
    note: "No card required.",
    description: "Create a profile, search open roles, apply to jobs, and track application progress.",
    features: [
      "Career Passport profile",
      "Open job search",
      "Application tracking",
      "Profile readiness tools",
    ],
    href: "/auth/signup?role=work",
    cta: "Create a candidate profile",
  },
  {
    audience: "Career Support",
    name: "Interest assessment",
    price: "$0",
    note: "Free to apply.",
    description: "Get matched with training, skills funding, and global career support based on your goals.",
    features: [
      "Career Assessment & Skills Gap Analysis",
      "Skills & Training Funding Application",
      "Global Career Support Application",
      "Career Plan & Progress Tracking",
    ],
    href: "/career-support",
    cta: "Get Career Support",
  },
  {
    audience: "Employers",
    name: "Recruiter workspace",
    price: "Pilot",
    note: "Commercial terms set directly.",
    description: "Post roles, review applicant profiles, manage shortlists, and track pipeline status.",
    features: [
      "Job posting workflow",
      "Scoped applicant review",
      "Pipeline status controls",
      "Workspace analytics",
    ],
    href: "/recruiters",
    cta: "Review employer workflow",
  },
];

export default function PricingPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen bg-paper">
        <section className="wrap py-12 md:py-20">
          <div className="max-w-[720px]">
            <span className="font-data text-[12px] text-ink-soft uppercase tracking-widest">
              Pricing
            </span>
            <h1
              className="font-display font-bold text-accent mt-3"
              style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.08 }}
            >
              Clear access today. No invented tiers.
            </h1>
            <p className="mt-5 text-[17px] text-ink-soft max-w-[560px] leading-relaxed">
              Kaziin is currently structured around free candidate access, eligibility-interest capture for career support, and pilot employer workspaces.
            </p>
          </div>
        </section>

        <section className="wrap pb-12 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ACCESS_OPTIONS.map((option) => (
              <article
                key={option.name}
                className="rounded-[14px] bg-white p-8 flex flex-col"
              >
                <div className="font-data text-[12px] text-ink-soft uppercase tracking-wider mb-3">
                  {option.audience}
                </div>
                <h2 className="font-display font-bold text-[24px] text-accent mb-4">
                  {option.name}
                </h2>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display font-bold text-[40px]">{option.price}</span>
                  <span className="text-[13px] text-ink-soft mb-2">{option.note}</span>
                </div>
                <p className="text-[14.5px] text-ink-soft leading-relaxed mb-7">
                  {option.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[14px]">
                      <span className="text-accent font-data mt-0.5 shrink-0">+</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={option.href} className={buttonVariants({ className: "w-full mt-auto" })}>
                  {option.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14">
          <div className="wrap max-w-[720px]">
            <h2 className="font-display font-bold text-[22px] text-accent mb-3">
              What is not live yet
            </h2>
            <p className="text-[15px] text-ink-soft leading-relaxed">
              Self-service paid subscriptions, card billing, ATS integrations, dedicated account management, and premium candidate plans are not presented as active until the product implements them.
            </p>
            <Link href="/trust" className={buttonVariants({ variant: "ghost", className: "mt-6" })}>
              Review trust and safety
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
