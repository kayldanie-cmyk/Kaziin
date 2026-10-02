import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Kaziin handles candidate, recruiter, employer, and application information.",
};

const SECTIONS = [
  {
    title: "Information we collect",
    body: "Kaziin collects account details, profile information, job applications, employer records, and support requests that users choose to submit through the platform.",
  },
  {
    title: "How information is used",
    body: "Candidate data is used to maintain profiles, submit applications, show application progress, and help recruiters review applicants connected to their employer workspace.",
  },
  {
    title: "Recruiter access",
    body: "Recruiter access is scoped to applications for their employer workspace. Admin access is reserved for platform operations and user support.",
  },
  {
    title: "Career support",
    body: "Career Support assessments and funding requests are eligibility-interest records. They are not funding approvals, job offers, or relocation guarantees.",
  },
  {
    title: "Data choices",
    body: "Users can update their profile information in the dashboard. Account, deletion, and export requests should be sent through the help center while self-service controls are being expanded.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <section className="wrap py-12 md:py-20">
          <div className="max-w-[760px]">
            <span className="font-data text-[12px] text-ink-soft uppercase tracking-widest">
              Policy
            </span>
            <h1 className="font-display font-bold text-[32px] md:text-[42px] text-accent mt-3 mb-5">
              Privacy Policy
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              This page summarizes how Kaziin handles information in the current product. Formal legal terms may need counsel review before launch.
            </p>
          </div>
        </section>

        <section className="wrap pb-20">
          <div className="max-w-[760px] space-y-5">
            {SECTIONS.map((section) => (
              <article key={section.title} className="py-8">
                <h2 className="font-display font-semibold text-[20px] text-accent mb-2">
                  {section.title}
                </h2>
                <p className="text-[15px] text-ink-soft leading-relaxed">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
