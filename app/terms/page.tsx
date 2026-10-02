import type { Metadata } from "next";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Use terms for candidates, recruiters, employers, and global career interest requests on Kaziin.",
};

const TERMS = [
  {
    title: "Platform role",
    body: "Kaziin helps candidates manage career profiles, apply to jobs, and lets recruiters review applications. Kaziin does not guarantee employment, funding, visas, or relocation outcomes.",
  },
  {
    title: "Candidate accounts",
    body: "Candidates are responsible for keeping profile, credential, and application information accurate and current.",
  },
  {
    title: "Employer and recruiter accounts",
    body: "Recruiters must represent an employer they are authorized to hire for and must use candidate information only for legitimate recruiting activity.",
  },
  {
    title: "Global career support",
    body: "Eligibility assessments record interest and context. Any funding or mobility support depends on partner review, destination requirements, and separate written terms.",
  },
  {
    title: "Operational changes",
    body: "Kaziin may change, pause, or remove features as the product evolves. Material legal terms should be reviewed by counsel before public launch.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen">
        <section className="wrap py-12 md:py-20">
          <div className="max-w-[760px]">
            <span className="font-data text-[12px] text-ink-soft uppercase tracking-widest">
              Terms
            </span>
            <h1 className="font-display font-bold text-[32px] md:text-[42px] text-accent mt-3 mb-5">
              Terms of Service
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              These product terms summarize expected use of Kaziin while formal launch terms are being finalized.
            </p>
          </div>
        </section>

        <section className="wrap pb-20">
          <div className="max-w-[760px] space-y-5">
            {TERMS.map((term) => (
              <article key={term.title} className="py-8">
                <h2 className="font-display font-semibold text-[20px] text-accent mb-2">
                  {term.title}
                </h2>
                <p className="text-[15px] text-ink-soft leading-relaxed">{term.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
