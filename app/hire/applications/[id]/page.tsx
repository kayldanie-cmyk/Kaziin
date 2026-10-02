import { createClient } from "@/lib/supabase/server";
import { getApplicationDetails } from "@/lib/ats-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MatchRing } from "@/components/ui/progress";

export default async function HiringRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: applicationId } = await params;
  const application = await getApplicationDetails(applicationId);

  if (!application) {
    notFound();
  }

  const { candidate, job, answers, match_score, match_explanation, status, job_id } = application;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/hire/jobs/${job_id}/applications`}
          className="text-ink-soft hover:text-ink transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-paper shrink-0"
        >
          
        </Link>
        <div>
          <h1 className="font-display font-bold text-[24px]">Hiring Room</h1>
          <p className="text-ink-soft text-[14.5px] font-data">
            {candidate?.name} — {job?.title}
          </p>
        </div>
        <div className="ml-auto">
          <span className="bg-paper border border-line text-ink text-[13px] font-semibold px-4 py-2 rounded-full capitalize">
            {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Main Column */}
        <div className="space-y-8">

          {/* Candidate Snapshot */}
          <section className="bg-paper border border-line rounded-[16px] p-6">
            <div className="flex gap-5 items-start">
              <div className="w-20 h-20 bg-accent-soft text-accent-dark rounded-full flex items-center justify-center font-display font-bold text-[28px] shrink-0">
                {candidate?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-[22px]">{candidate?.name}</h2>
                <p className="text-ink-soft text-[15px] mt-1">{candidate?.headline}</p>

                <div className="flex gap-4 mt-4 flex-wrap">
                  {candidate?.email && (
                    <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 text-[13px] text-accent hover:underline font-data">
                      
                      {candidate.email}
                    </a>
                  )}
                  {candidate?.phone && (
                    <span className="flex items-center gap-1.5 text-[13px] text-ink-soft font-data">
                      
                      {candidate.phone}
                    </span>
                  )}
                  {candidate?.location && (
                    <span className="flex items-center gap-1.5 text-[13px] text-ink-soft font-data">
                      
                      {candidate.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Screening Questions */}
          {answers && answers.length > 0 && (
            <section className="bg-paper border border-line rounded-[16px] overflow-hidden">
              <div className="bg-paper border-b border-line px-6 py-4">
                <h3 className="font-display font-bold text-[18px]">Screening Questions</h3>
              </div>
              <div className="p-6 space-y-6">
                {answers.map((ans: any, idx: number) => (
                  <div key={idx} className="pb-6 border-b border-line last:border-0 last:pb-0">
                    <p className="text-[14.5px] font-semibold mb-2">Q: {ans.question?.question}</p>
                    <div className="text-[14px] text-ink-soft bg-paper p-3 rounded-lg">
                      {typeof ans.answer === "boolean"
                         ? (ans.answer ? "Yes" : "No")
                         : Array.isArray(ans.answer)
                           ? ans.answer.join(", ")
                           : String(ans.answer)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Career Passport Preview */}
          <section className="bg-paper border border-line rounded-[16px] overflow-hidden">
            <div className="bg-paper border-b border-line px-6 py-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-[18px]">Career Passport</h3>
              <button className="flex items-center gap-2 text-[13px] text-accent font-semibold hover:underline">
                
                Download CV
              </button>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-[15px] mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {candidate?.skills?.length > 0
                  ? candidate.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 bg-paper border border-line rounded-lg text-[13px] text-ink-soft font-data">
                        {skill}
                      </span>
                    ))
                  : <span className="text-ink-soft text-[14px]">No skills listed</span>}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: AI Match Intelligence */}
        <div>
          <section className="bg-paper border border-line rounded-[16px] p-6 sticky top-6">
            <h3 className="font-display font-bold text-[18px] mb-6">AI Match Analysis</h3>

            <div className="flex items-center justify-center mb-6">
              <MatchRing score={match_score ?? 0} size="lg" animate={true} />
            </div>

            {match_explanation && (
              <div className="space-y-5">
                <div className="text-center">
                  <span className={`text-[12px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    match_explanation.label === "strong" ? "bg-green-100 text-green-700" :
                    match_explanation.label === "good" ? "bg-accent-soft text-accent-dark" :
                    match_explanation.label === "transferable" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {match_explanation.label} Match
                  </span>
                </div>

                {match_explanation.matched?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-2">Requirements Met</h4>
                    <ul className="text-[13.5px] text-ink-soft space-y-2">
                      {match_explanation.matched.map((m: string, i: number) => (
                        <li key={i} className="flex gap-2"><span className="text-green-500 mt-0.5"></span>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {match_explanation.gap?.length > 0 && (
                  <div className="pt-4 border-t border-line/50">
                    <h4 className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">Gaps</h4>
                    <ul className="text-[13.5px] text-ink-soft space-y-2">
                      {match_explanation.gap.map((g: string, i: number) => (
                        <li key={i} className="flex gap-2"><span className="text-red-400 mt-0.5">!</span>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {match_explanation.transferable?.length > 0 && (
                  <div className="pt-4 border-t border-line/50">
                    <h4 className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-2">Transferable</h4>
                    <ul className="text-[13.5px] text-ink-soft space-y-2">
                      {match_explanation.transferable.map((t: string, i: number) => (
                        <li key={i} className="flex gap-2"><span className="text-purple-500 mt-0.5"></span>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
