import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { SupportUsForm } from "@/components/support/support-us-form";

export const metadata: Metadata = {
  title: "Support Us | Kaziin",
  description: "Join us in our mission to eradicate unemployment.",
};

export default function SupportUsPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen bg-paper py-14 max-md:py-10">
        <div className="max-w-[700px] mx-auto px-5">
          <div className="mb-8 text-center">
            <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider font-semibold">
              Partner with Kaziin
            </span>
            <h1 className="font-display font-bold text-[#2F6D53] text-[36px] mt-2 mb-4">
              Help us eradicate unemployment.
            </h1>
            <p className="text-ink-soft text-[16px] leading-relaxed max-w-[580px] mx-auto">
              We are building a future where everyone has access to career support and verified opportunities. Become a partner, sponsor a candidate, or help fund our career skills programs.
            </p>
          </div>

          <SupportUsForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
