import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { buttonVariants } from "@/components/ui/button";
import {
  GLOBAL_DESTINATIONS,
  GLOBAL_PROFESSIONS,
  GLOBAL_SUPPORT_NEEDS,
} from "@/lib/global-interest";

export const metadata: Metadata = {
  title: "Global Careers",
  description:
    "Explore international career paths and request a funding application for mobility support where available.",
};

const PROCESS_STEPS = [
  {
    title: "Choose a direction",
    description: "Tell Kaziin which regions, professions, and support needs are relevant to you.",
  },
  {
    title: "Request review",
    description: "Submit a funding application request from your Global dashboard.",
  },
  {
    title: "Review next steps",
    description: "If support is available, the details and terms are shared before any commitment.",
  },
] as const;

export default function GlobalCareersPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <section className="bg-paper border-y border-line text-ink py-10 max-md:py-6">
          <div className="wrap">
            <span className="font-data text-[13px] block mb-4 text-[#9CB8AA]">
              Global careers
            </span>
            <h1 className="font-display font-bold max-w-[760px] text-paper-alt text-[58px] max-lg:text-[44px] max-sm:text-[34px] leading-[1.05]">
              Explore work abroad with support you can verify.
            </h1>
            <p className="mt-5 text-[18px] max-w-[600px] text-[#C7C9CC]">
              Kaziin records your international work interest and checks whether mobility support may be available. This is an application for global career support to help you reach your goals.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                href="/global-dashboard/apply"
                className={buttonVariants({ size: "lg", className: "border border-line hover:bg-paper text-ink" })}
              >
                Request funding application
              </Link>
              <Link
                href="#pathways"
                className={buttonVariants({ variant: "ghost", size: "lg", className: "border-line text-paper hover:border-paper hover:bg-transparent" })}
              >
                Explore pathways
              </Link>
            </div>
          </div>
        </section>

        <section id="pathways" className="py-10 max-md:py-6">
          <div className="wrap">
            <h2 className="font-display font-bold text-[26px] mb-3">
              Pathways under review
            </h2>
            <p className="text-[15.5px] text-ink-soft max-w-[620px] mb-8">
              These are preference categories used for funding application requests, not open vacancies. Real opportunities should be posted through the jobs system once an employer is verified.
            </p>

            <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-6">
              <section className="pt-8 border-t border-line">
                <h3 className="font-display font-semibold text-[18px] text-[#2F6D53]">
                  Destination regions
                </h3>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {GLOBAL_DESTINATIONS.map((destination) => (
                    <span key={destination.value} className="text-[12px] font-data text-ink-soft border border-line rounded-[5px] px-2 py-1">
                      {destination.label}
                    </span>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t border-line">
                <h3 className="font-display font-semibold text-[18px] text-[#2F6D53]">
                  Professional areas
                </h3>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {GLOBAL_PROFESSIONS.map((profession) => (
                    <span key={profession.value} className="text-[12px] font-data text-ink-soft border border-line rounded-[5px] px-2 py-1">
                      {profession.label}
                    </span>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t border-line">
                <h3 className="font-display font-semibold text-[18px] text-[#2F6D53]">
                  Support needs
                </h3>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {GLOBAL_SUPPORT_NEEDS.map((need) => (
                    <span key={need.value} className="text-[12px] font-data text-ink-soft border border-line rounded-[5px] px-2 py-1">
                      {need.label}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="py-10 max-md:py-6 border-t border-line">
          <div className="wrap">
            <h2 className="font-display font-bold text-[26px] mb-8">
              How funding application works
            </h2>
            <div className="flex flex-col">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.title} className="py-6 border-b border-line last:border-0">
                  <span className="font-data text-[12px] text-accent-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display font-semibold text-[18px] text-[#2F6D53] mt-3">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] text-ink-soft leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href="/global-dashboard/apply" className={buttonVariants()}>
                Start funding application
              </Link>
              <Link href="/trust" className={buttonVariants({ variant: "ghost" })}>
                Review trust guidance
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
