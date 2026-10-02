import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import {
  GLOBAL_DESTINATIONS,
  GLOBAL_SUPPORT_NEEDS,
  getGlobalInterestStatus,
  labelForValue,
} from "@/lib/global-interest";

export const metadata: Metadata = {
  title: "Global Application",
};

type GlobalInterestRequest = {
  id: string;
  destination_region: string;
  profession: string;
  support_needs: string[] | null;
  status: string;
  created_at: string | null;
};

function getProgress(status: string) {
  if (status === "under_review") return 66;
  if (status === "support_available" || status === "not_eligible") return 100;
  return 33;
}

export default async function GlobalApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = user
    ? await supabase
        .from("global_interest_requests")
        .select("id, destination_region, profession, support_needs, status, created_at")
        .eq("candidate_id", user.id)
        .maybeSingle()
    : { data: null, error: null };
  // Treat errors (e.g. RLS rejection when no row exists yet) same as no data
  const request = error ? null : (data as GlobalInterestRequest | null);

  if (!request) {
    return (
      <div className="max-w-[800px]">
        <h1 className="font-display font-bold text-[26px] text-accent">Global application</h1>
        <p className="mt-1 text-[15px] text-ink-soft">Keep your career planning and support preferences in one place.</p>
        <div className="mt-6 pt-10 text-center border-t border-line">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            
          </div>
          <h2 className="font-display text-[18px] font-semibold">No application yet</h2>
          <p className="mx-auto mt-2 max-w-[460px] text-[14px] leading-relaxed text-ink-soft">
            You haven&apos;t submitted an application yet. Apply when you have a destination or opportunity in mind.
          </p>
          <Link href="/global-dashboard/apply" className={`mt-5 inline-block ${buttonVariants({ variant: "primary" })}`}>
            Apply for global support
          </Link>
        </div>
      </div>
    );
  }

  const status = getGlobalInterestStatus(request.status);
  const progress = getProgress(request.status);
  const supportNeeds = request.support_needs ?? [];

  return (
    <div className="max-w-[800px]">
      <h1 className="font-display font-bold text-[26px] text-accent">Global application</h1>
      <p className="mt-1 text-[15px] text-ink-soft mb-8">Your submitted application and the current review state.</p>

      <section className="pt-6 border-t border-line">
        <div className="flex items-start justify-between gap-4 max-sm:flex-col">
          <div>
            <div className="font-data text-[12px] text-ink-soft">Current status</div>
            <h2 className="mt-1 font-display text-[20px] font-semibold">{status.label}</h2>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-ink-soft">{status.description}</p>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 font-data text-[12px] font-semibold text-accent-dark">
            {progress}% complete
          </span>
        </div>

        <div className="mt-6">
          <ProgressBar value={progress} />
          <div className="mt-2 flex justify-between font-data text-[11.5px] text-ink-soft">
            <span>Request</span>
            <span>Review</span>
            <span>Next step</span>
          </div>
        </div>
      </section>

      <section className="mt-6 pt-6 border-t border-line">
        <h2 className="font-display text-[18px] font-semibold">Your preferences</h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 max-sm:grid-cols-1">
          <div>
            <dt className="font-data text-[12px] text-ink-soft">Target destination</dt>
            <dd className="mt-1 text-[15px] font-medium">{labelForValue(GLOBAL_DESTINATIONS, request.destination_region)}</dd>
          </div>
          <div>
            <dt className="font-data text-[12px] text-ink-soft">Profession or industry</dt>
            <dd className="mt-1 text-[15px] font-medium">{request.profession}</dd>
          </div>
          <div className="col-span-2 max-sm:col-span-1">
            <dt className="font-data text-[12px] text-ink-soft">Support you noted</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {supportNeeds.length > 0 ? supportNeeds.map((need) => (
                <span key={need} className="rounded-full border border-line bg-paper px-2.5 py-1 text-[12px] text-ink-soft">
                  {labelForValue(GLOBAL_SUPPORT_NEEDS, need)}
                </span>
              )) : <span className="text-[14px] text-ink-soft">No specific support selected</span>}
            </dd>
          </div>
        </dl>

        {request.status === "received" && (
          <Link href="/global-dashboard/apply" className={`mt-6 ${buttonVariants({ variant: "ghost", size: "sm" })}`}>
            Update application
          </Link>
        )}
      </section>

      <p className="mt-5 text-center text-[12.5px] leading-relaxed text-ink-soft">
        Our team will review your application and discuss the available support with you before you decide to proceed.
      </p>
    </div>
  );
}
