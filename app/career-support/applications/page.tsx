import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "My Applications | Career Support | Kaziin",
};

export default async function CareerSupportApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasFundingApp = false;
  let hasGlobalApp = false;

  if (user) {
    const [{ data: fundingData }, { data: globalData }] = await Promise.all([
      supabase.from("funding_applications").select("id").eq("candidate_id", user.id).limit(1).maybeSingle(),
      supabase.from("global_interest_requests").select("id").eq("candidate_id", user.id).limit(1).maybeSingle(),
    ]);
    hasFundingApp = !!fundingData;
    hasGlobalApp = !!globalData;
  }

  const hasAnyApp = hasFundingApp || hasGlobalApp;

  return (
    <div className="max-w-[800px] py-10 px-5">
      <BackButton href="/career-support" label="Back to Career Support" className="mb-4" />
      <h1 className="font-display font-bold text-[32px] text-ink mb-1">My Applications</h1>
      <p className="text-[15px] text-ink-soft mb-10">Track the status of your career support applications.</p>

      {!hasAnyApp ? (
        <div className="py-20 text-center border border-dashed border-line rounded-[16px] bg-paper">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            <span className="text-[20px]">📋</span>
          </div>
          <h2 className="font-display font-bold text-[18px] text-[#2F6D53] mb-2">
            No submitted applications
          </h2>
          <p className="text-[14px] text-ink-soft mb-6 max-w-[340px] mx-auto leading-relaxed">
            You haven&apos;t submitted any applications for career support or funding yet.
          </p>
          <Link
            href="/career-support/apply"
            className={buttonVariants({ variant: "primary" })}
          >
            Apply for Career Support
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {hasFundingApp && (
            <div className="border border-line rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-accent-soft text-accent-dark font-data text-[10px] uppercase tracking-wider mb-2">Funding</span>
                <h3 className="font-display font-semibold text-[16px] text-ink">Career Funding Application</h3>
                <p className="text-[13.5px] text-ink-soft mt-1">Status: Under review</p>
              </div>
              <Link href="/career-support/funding" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View Details
              </Link>
            </div>
          )}
          {hasGlobalApp && (
            <div className="border border-line rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-accent-soft text-accent-dark font-data text-[10px] uppercase tracking-wider mb-2">Global</span>
                <h3 className="font-display font-semibold text-[16px] text-ink">Global Support Application</h3>
                <p className="text-[13.5px] text-ink-soft mt-1">Status: Under review</p>
              </div>
              <Link href="/career-support/applications" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View Details
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
