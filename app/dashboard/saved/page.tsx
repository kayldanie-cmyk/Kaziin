import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MatchRing } from "@/components/ui/progress";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Saved Jobs | Kaziin",
};

export default async function SavedJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  // In a real app we'd fetch actual saved jobs from the `saved_jobs` table.
  // We'll mock it for now since the table is empty.
  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job:jobs(slug, title, location, employer:employers(name))")
    .eq("candidate_id", user.id);

  return (
    <div className="max-w-[800px]">
      <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Saved Jobs</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-8">
        Opportunities you have bookmarked for later review.
      </p>

      {!savedJobs || savedJobs.length === 0 ? (
        <div className="py-10 text-center">
          
          <h3 className="font-display font-semibold text-[18px]">No saved jobs yet</h3>
          <p className="mt-2 text-ink-soft text-[14.5px]">
            When you see a job you like, click the bookmark icon to save it here.
          </p>
          <Link href="/jobs" className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white hover:bg-accent-dark transition-colors">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedJobs.map((saved: any, i) => (
            <div key={i} className="flex items-center justify-between py-5 border-b border-line last:border-0">
              <div>
                <h3 className="font-display font-semibold text-[16px]">{saved.job.title}</h3>
                <p className="text-[14px] text-ink-soft mt-1">
                  {Array.isArray(saved.job.employer) ? saved.job.employer[0].name : saved.job.employer.name} • {saved.job.location}
                </p>
              </div>
              <Link
                href={`/jobs/${saved.job.slug}`}
                className="text-[13.5px] font-medium text-accent hover:underline"
              >
                View job
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
