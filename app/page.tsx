import { PublicNav } from "@/components/navigation/public-nav";
import { HeroGateway } from "@/components/home/hero-gateway";
import { HowItWorks } from "@/components/home/how-it-works";
import { GlobalSection } from "@/components/home/global-section";
import { EmployerSection } from "@/components/home/employer-section";
import { SupportUsBand } from "@/components/home/support-us-band";

import { Footer } from "@/components/navigation/footer";

import { QuickTaskBanner } from "@/components/home/quick-task-banner";

/* ============================================================
   KAZIIN — Homepage
   The primary conversion surface.
   "FIND WORK. GO GLOBAL. HIRE TALENT."
   Section order matches SKILL.md §12.
   ============================================================ */

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <QuickTaskBanner />

      <main>
        {/* 1. Hero / three portals */}
        <HeroGateway />

        <hr className="border-t border-line" />

        {/* 2. How it works */}
        <HowItWorks />

        <hr className="border-t border-line" />

        {/* 4. Global Careers */}
        <GlobalSection />

        <hr className="border-t border-line" />

        {/* 5. Hire Talent */}
        <EmployerSection />

        {/* 6. Support Us */}
        <SupportUsBand />
      </main>

      {/* 8. Footer */}
      <Footer />
    </>
  );
}
