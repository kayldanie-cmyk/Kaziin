import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Interviews | Kaziin",
};

export default async function InterviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, application:applications(job:jobs(title, employer:employers(name)))")
    .eq("applications.candidate_id", user.id);

  return (
    <div className="max-w-[800px]">
      <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Interviews</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-8">
        Manage your upcoming and past interview schedules.
      </p>

      {!interviews || interviews.length === 0 ? (
        <div className="py-10 text-center">
          
          <h3 className="font-display font-semibold text-[18px]">No interviews scheduled</h3>
          <p className="mt-2 text-ink-soft text-[14.5px]">
            When an employer invites you to an interview, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview: any) => (
            <div key={interview.id} className="flex items-center justify-between py-5 border-b border-line last:border-0">
              <div>
                <h3 className="font-display font-semibold text-[16px]">
                  {interview.application?.job?.title || "Interview"}
                </h3>
                <p className="text-[14px] text-ink-soft mt-1">
                  {Array.isArray(interview.application?.job?.employer) 
                    ? interview.application.job.employer[0].name 
                    : interview.application?.job?.employer?.name} 
                  • {new Date(interview.scheduled_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={interview.status} />
                {interview.meeting_type && (
                  <span className="text-[12px] font-data text-muted-label uppercase tracking-wider">
                    {interview.meeting_type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
