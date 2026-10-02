import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shortlists",
};

/* ============================================================
   Employer Shortlist Index
   Prompts user to select a job from the jobs list.
   ============================================================ */

export default function ShortlistsIndexPage() {
  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-accent">Shortlists</h1>
        <p className="mt-1 text-ink-soft text-[15px]">View candidates for your active jobs.</p>
      </div>

      <div className="py-10 text-center">
        <div className="text-ink-soft text-[15px] mb-4">Please select a job to view its candidate shortlist.</div>
        <Link href="/hire/jobs" className="inline-flex items-center justify-center px-4 py-2 bg-accent text-white font-medium text-[14px] rounded-lg hover:bg-accent-dark transition-colors">
          Go to Jobs
        </Link>
      </div>
    </div>
  );
}
