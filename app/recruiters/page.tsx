import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Hire Talent",
  description:
    "Find, screen, and hire the right people with verified candidate profiles and structured shortlists.",
};

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Post your role",
    desc: "Describe the position, location, compensation, requirements, and hiring status.",
  },
  {
    num: "02",
    title: "Review applicants",
    desc: "Candidate profiles appear after they apply to jobs connected to your employer account.",
  },
  {
    num: "03",
    title: "Manage the shortlist",
    desc: "Track application status and move candidates through screening, interview, offer, and hiring steps.",
  },
  {
    num: "04",
    title: "Keep access scoped",
    desc: "Recruiter workspaces are tied to an employer so jobs and candidate data stay separated.",
  },
] as const;

const TRUST_FEATURES = [
  { badge: "Verified employer", desc: "Business registration and hiring authority should be confirmed before verification is shown." },
  { badge: "Candidate profiles", desc: "Applicant details are visible only through applications for your employer workspace." },
  { badge: "Structured review", desc: "Shortlists use application status and profile readiness instead of opaque scoring claims." },
] as const;

const SCREENING_STEPS = [
  { label: "Role requirements", percentage: 100 },
  { label: "Candidate applications", percentage: 72 },
  { label: "Recruiter review", percentage: 48 },
  { label: "Interview-ready shortlist", percentage: 28 },
] as const;

export default function RecruitersPage() {
  return (
    <>
      <PublicNav />
      <main>
        <section className="wrap py-20 max-md:py-14">
          <span className="font-data text-[13px] text-ink-soft block mb-4">
            For employers and recruiters
          </span>
          <h1 className="font-display font-bold max-w-[760px] text-[#2F6D53] text-[60px] max-lg:text-[44px] max-sm:text-[36px] leading-[1.05]">
            Tell us who you need. We will help you review them.
          </h1>
          <p className="mt-5 text-[18px] text-ink-soft max-w-[560px]">
            Post roles, review applicants, and manage shortlists from an employer-scoped recruiter workspace.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link href="/hire" className={buttonVariants({ size: "lg" })}>
              Start hiring
            </Link>
            <Link href="/how-it-works" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              See how it works
            </Link>
          </div>
        </section>

        <hr className="border-t border-line" />

        <section className="py-20 max-md:py-14">
          <div className="wrap">
            <span className="font-data text-[13px] text-ink-soft block mb-4">
              Structured screening
            </span>
            <h2 className="font-display font-bold max-w-[640px] text-[#2F6D53] text-[38px] max-sm:text-[26px]">
              Move from application volume to structured review.
            </h2>
            <p className="mt-4 text-[16.5px] text-ink-soft max-w-[520px]">
              Kaziin is designed to organize applicants by role requirements, profile readiness, and recruiter decisions so your team can review with context.
            </p>

            <div className="mt-12 max-w-[500px] flex flex-col">
              {SCREENING_STEPS.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center gap-sp-3 py-sp-3 ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <div className="w-[180px] shrink-0">
                    <span className="font-data text-[13px] text-ink-soft block">
                      {row.label}
                    </span>
                  </div>
                  <ProgressBar value={row.percentage} animate height={8} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-t border-line" />

        <section className="py-20 max-md:py-14">
          <div className="wrap">
            <h2 className="font-display font-bold max-w-[640px] text-[#2F6D53] text-[38px] max-sm:text-[26px]">
              Built for how real hiring works.
            </h2>

            <div className="mt-12 flex flex-col gap-4">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.num} className="py-8 border-b border-line last:border-0">
                  <span className="font-data text-[13px] text-accent-dark">
                    {step.num}
                  </span>
                  <h3 className="font-display text-[18px] font-semibold text-[#2F6D53] mt-3.5">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] text-ink-soft leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-t border-line" />

        <section className="py-20 max-md:py-14">
          <div className="wrap">
            <h2 className="font-display font-bold max-w-[640px] text-[#2F6D53] text-[38px] max-sm:text-[26px]">
              Every verification means something specific.
            </h2>
            <div className="mt-12 flex flex-col gap-4">
              {TRUST_FEATURES.map((feature) => (
                <div key={feature.badge} className="py-6 border-b border-line last:border-0">
                  <Badge variant="verified" className="mb-3.5">
                    {feature.badge}
                  </Badge>
                  <p className="mt-2 text-[14.5px] text-ink-soft leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-b border-line bg-accent-soft">
          <div className="wrap flex items-center justify-between gap-sp-4 flex-wrap py-sp-6">
            <h2 className="font-display font-bold max-w-[480px] text-[#2F6D53] text-[30px] max-sm:text-[22px]">
              Ready to review real applicants?
            </h2>
            <Link href="/hire" className={buttonVariants({ size: "lg" })}>
              Start hiring
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
