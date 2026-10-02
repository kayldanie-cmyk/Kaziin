import { PublicNav } from "@/components/navigation/public-nav";
import { HeroGateway } from "@/components/home/hero-gateway";
import { HowItWorks } from "@/components/home/how-it-works";
import { GlobalSection } from "@/components/home/global-section";
import { EmployerSection } from "@/components/home/employer-section";
import { SupportUsBand } from "@/components/home/support-us-band";
import { Footer } from "@/components/navigation/footer";
import { QuickTaskBanner } from "@/components/home/quick-task-banner";

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <QuickTaskBanner />
      <main>
        <HeroGateway />
        <hr className="border-t border-line" />
        <HowItWorks />
        <hr className="border-t border-line" />
        <GlobalSection />
        <hr className="border-t border-line" />
        <EmployerSection />
        <SupportUsBand />
      </main>
      <Footer />
    </>
  );
}
