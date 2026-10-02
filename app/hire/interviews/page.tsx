import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interviews | Hire",
};

export default function HireInterviewsPage() {
  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Interviews</h1>
        <p className="mt-1 text-ink-soft text-[15px]">Manage scheduled interviews for your active jobs.</p>
      </div>

      <div className="py-10 text-center">
        <div className="text-ink-soft text-[15px] mb-4">Please select a job to view its scheduled interviews.</div>
        <Link href="/hire/jobs" className="inline-flex items-center justify-center px-4 py-2 bg-[#2F6D53] text-white font-medium text-[14px] rounded-lg hover:bg-[#1E4D39] transition-colors">
          Go to Jobs
        </Link>
      </div>
    </div>
  );
}
