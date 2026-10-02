import Link from "next/link";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { HelpContent } from "./help-content";

export default function HelpPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <section className="py-16 md:py-24">
          <div className="wrap text-center">
            <span className="font-data text-[13px] text-ink-soft block mb-4">
              Help center
            </span>
            <h1
              className="font-display font-bold max-w-[600px] mx-auto"
              style={{
                fontSize: "clamp(32px, 5vw, 50px)",
                lineHeight: 1.1,
              }}
            >
              How can we help?
            </h1>
            <p className="mt-5 text-[18px] text-ink-soft max-w-[500px] mx-auto">
              Find answers about job search, career support, hiring, and
              platform features.
            </p>
          </div>
        </section>

        <HelpContent />

        <section className="py-16">
          <div className="wrap text-center">
            <h2 className="font-display font-semibold text-[22px] mb-3">
              Still need help?
            </h2>
            <p className="text-[15px] text-ink-soft mb-6">
              Visit Trust & Safety for reporting and support guidance.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/trust"
                className="bg-ink text-paper-alt px-5 py-2.5 rounded-[7px] text-[14.5px] font-semibold hover:bg-accent-dark transition-colors"
              >
                Trust & Safety
              </Link>
              <Link
                href="/trust"
                className="text-ink px-5 py-2.5 rounded-[7px] text-[14.5px] font-semibold hover:opacity-80 transition-colors"
              >
                Contact support
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
