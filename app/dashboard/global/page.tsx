import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Global Careers | Kaziin",
};

export default function GlobalCareersPage() {
  return (
    <div className="max-w-[800px] py-10 px-6 mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-[32px] text-[#2F6D53]">Global Careers</h1>
        <p className="mt-2 text-ink-soft text-[16px] max-w-[600px]">
          Take your career international. Discover roles, manage relocation requirements, and track visa sponsorships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="border border-line rounded-[14px] p-6 hover:border-[#2F6D53]/30 transition-colors">
          <h3 className="font-display font-semibold text-[16px] text-ink mb-2">International Roles</h3>
          <p className="text-ink-soft text-[14px] mb-4">Browse verified international job opportunities with visa sponsorship support.</p>
          <Link href="/dashboard/jobs" className="text-[14px] font-semibold text-[#2F6D53] hover:underline">
            Browse roles →
          </Link>
        </div>
        <div className="border border-line rounded-[14px] p-6 hover:border-[#2F6D53]/30 transition-colors">
          <h3 className="font-display font-semibold text-[16px] text-ink mb-2">Career Support</h3>
          <p className="text-ink-soft text-[14px] mb-4">Get help with skills training, funding, and relocation guidance for your career journey.</p>
          <Link href="/career-support" className="text-[14px] font-semibold text-[#2F6D53] hover:underline">
            Get support →
          </Link>
        </div>
      </div>

      <div className="border border-line rounded-[14px] p-6">
        <h3 className="font-display font-semibold text-[16px] text-ink mb-2">Your Global Profile</h3>
        <p className="text-ink-soft text-[14px] mb-4">
          Complete your profile to improve international match quality. Add language skills, work authorization details, and relocation preferences.
        </p>
        <Link href="/dashboard/profile" className="text-[14px] font-semibold text-[#2F6D53] hover:underline">
          Edit profile →
        </Link>
      </div>
    </div>
  );
}
