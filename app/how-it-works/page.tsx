import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { buttonVariants } from "@/components/ui/button";
import { MatchRing } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "How it works",
  description: "Learn how Kaziin connects talent with opportunity using verification and explainable matching.",
};

/* ============================================================
   How It Works Page
   Expanded explanation of the platform mechanisms.
   Based on SKILL.md §12.
   ============================================================ */

export default function HowItWorksPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <section className="py-16 md:py-24">
          <div className="wrap">
             <h1 className="font-display font-bold text-[32px] md:text-[42px] text-accent max-w-[600px] leading-tight mb-6">
               How Kaziin connects talent with opportunity.
             </h1>
             <p className="text-[18px] text-ink-soft max-w-[500px]">
               We use verification and explainable matching to remove the noise from hiring, both locally and globally.
             </p>
          </div>
        </section>

        {/* For Candidates */}
        <section className="py-16 md:py-24">
          <div className="wrap grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-data text-[13px] text-ink-soft block mb-4">For Candidates</span>
              <h2 className="font-display font-bold text-[32px] text-accent mb-6">Your Career Passport</h2>
              <p className="text-[16px] text-ink-soft mb-8">
                Build a verified profile once, use it everywhere. Add your skills, experience, and preferences. We&apos;ll show you exactly how well you match with opportunities.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <span className="text-accent-dark"></span>
                  <span>Discover local and remote roles</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-dark"></span>
                  <span>Explore global opportunities with funding support</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-dark"></span>
                  <span>See why you match before you apply</span>
                </li>
              </ul>
              <Link href="/auth/signup" className={buttonVariants()}>
                Create your profile
              </Link>
            </div>
            
            <div className="bg-paper rounded-[16px] p-8 flex justify-center">
               <MatchRing score={92} size="lg" />
            </div>
          </div>
        </section>

        {/* For Employers */}
        <section className="py-16 md:py-24">
          <div className="wrap grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2 order-1 bg-paper border border-line text-ink rounded-[16px] p-8">
              <div className="space-y-6">
                <div className="pb-6">
                  <div className="font-data text-[13px] text-dark-muted mb-1">Role requirements captured</div>
                </div>
                <div className="pb-6">
                  <div className="font-data text-[13px] text-dark-muted mb-1">Verified applications reviewed</div>
                </div>
                <div className="pb-6">
                  <div className="font-data text-[13px] text-dark-muted mb-1">Candidates moved through screening</div>
                </div>
                <div>
                  <div className="font-data text-[13px] text-dark-accent font-bold mb-1">Shortlist decisions tracked</div>
                </div>
              </div>
            </div>

            <div className="md:order-1 order-2">
              <span className="font-data text-[13px] text-ink-soft block mb-4">For Employers</span>
              <h2 className="font-display font-bold text-[32px] text-accent mb-6">Structured Shortlisting</h2>
              <p className="text-[16px] text-ink-soft mb-8">
                Start hiring, review verified application evidence, and move candidates through a clear hiring pipeline.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <span className="text-accent-dark"></span>
                  <span>Natural language candidate search</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-dark"></span>
                  <span>Transparent match explanations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-dark"></span>
                  <span>End-to-end interview management</span>
                </li>
              </ul>
              <Link
                href="/recruiters"
                className={buttonVariants({ className: "bg-[#2F6D53] hover:bg-[#1E4D39] text-white border-transparent" })}
              >
                Start hiring
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-accent-soft text-center">
          <div className="wrap">
            <h2 className="font-display font-bold text-[32px] text-accent mb-6">Ready to get started?</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/auth/signup" className={buttonVariants()}>
                Join as a Candidate
              </Link>
              <Link href="/recruiters" className={buttonVariants({ variant: "ghost", className: "bg-paper" })}>
                I want to hire
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
