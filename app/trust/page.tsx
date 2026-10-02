import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description: "How we verify employers, validate opportunities, and protect candidates on the global employment network.",
};

/* ============================================================
   Trust & Safety Page
   Based on SKILL.md §37.
   ============================================================ */

export default function TrustPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        {/* Header */}
        <section className="bg-paper border-y border-line text-ink py-24 max-md:py-16">
          <div className="wrap">
            <span className="font-data text-[13px] block mb-4 text-[#9CB8AA]">
              Trust & Safety
            </span>
            <h1
              className="font-display font-bold max-w-[760px] text-paper-alt"
              style={{ fontSize: "clamp(34px, 5.4vw, 58px)", lineHeight: 1.05 }}
            >
              OPPORTUNITY REQUIRES TRUST.
            </h1>
            <p className="mt-5 text-[18px] max-w-[560px] text-[#C7C9CC]">
              How we verify employers, validate opportunities, and protect candidates on the global employment network.
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-24 max-md:py-16 border-b border-line">
          <div className="wrap">
            <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-12">
              <div>
                <div className="w-12 h-12 bg-accent-soft text-accent-dark rounded-full flex items-center justify-center mb-6">
                  
                </div>
                <h3 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-3">Employer Verification</h3>
                <p className="text-ink-soft text-[15px] leading-relaxed">
                  We check business registrations, verify recruiter identities, and confirm hiring authority before any employer can access the network or post roles.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-accent-soft text-accent-dark rounded-full flex items-center justify-center mb-6">
                  
                </div>
                <h3 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-3">Candidate Verification</h3>
                <p className="text-ink-soft text-[15px] leading-relaxed">
                  Candidate skills, experience, and credentials are intentionally assessed—not just self-reported—giving employers confidence in the shortlists they review.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-accent-soft text-accent-dark rounded-full flex items-center justify-center mb-6">
                  
                </div>
                <h3 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-3">Payment Safety</h3>
                <p className="text-ink-soft text-[15px] leading-relaxed">
                  Kaziin never charges candidates a fee to apply for jobs. For global opportunities, all funding terms and support providers are clearly disclosed upfront.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Opportunity Verification */}
        <section className="py-24 max-md:py-16">
          <div className="wrap">
            <div className="max-w-[800px]">
              <span className="font-data text-[13px] text-ink-soft block mb-4">Cross-border safety</span>
              <h2 className="font-display font-bold text-[32px] text-[#2F6D53] mb-6">Global Opportunity Checks</h2>
              <p className="text-[16px] text-ink-soft mb-8">
                International opportunities carry higher stakes. We apply an extended verification protocol before surfacing these roles to candidates.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Employer entity and immigration compliance verification.",
                  "Job authenticity and visa eligibility confirmation.",
                  "Contract review to ensure alignment with local labor laws.",
                  "Compensation verification against stated living costs.",
                  "Funding and support provider accreditation."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 p-5 bg-paper rounded-[12px] border border-line">
                    <Badge variant="verified" className="shrink-0 h-fit">Verified</Badge>
                    <span className="text-[15.5px] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section className="py-24 max-md:py-16">
          <div className="wrap">
             <div className="py-10 text-center max-w-[800px] mx-auto border-t border-line mt-10">
                <h2 className="font-display font-bold text-[28px] text-[#2F6D53] mb-4">See something suspicious?</h2>
                <p className="text-[15.5px] text-ink-soft mb-8 max-w-[500px] mx-auto">
                  Use the help center for reporting guidance while dedicated in-product reporting is being completed.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/help" className={buttonVariants({ variant: "ghost" })}>
                    Review reporting guidance
                  </Link>
                </div>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
