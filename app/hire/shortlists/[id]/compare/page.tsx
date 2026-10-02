import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Compare Candidates",
};

export default async function CandidateComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("*, candidate:profiles(*)")
    .eq("job_id", id)
    .in("status", ["shortlisted", "interview"]);

  const candidates = applications?.map((app) => app.candidate) ?? [];

  return (
    <div className="max-w-[1200px] overflow-x-auto">
      <div className="mb-8">
        <nav className="font-data text-[12px] text-ink-soft mb-2">
          <Link href="/hire" className="hover:text-ink">Dashboard</Link> /
          <Link href="/hire/jobs" className="hover:text-ink mx-1">Jobs</Link> /
          <Link href={`/hire/shortlists/${id}`} className="hover:text-ink mx-1">{job.title}</Link> /
          Compare
        </nav>
        <h1 className="font-display font-bold text-[28px] text-accent">Compare Candidates</h1>
        <p className="mt-1 text-ink-soft text-[15px]">
          Comparing {candidates.length} shortlisted candidates for {job.title}.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-ink-soft text-[15px]">No shortlisted candidates to compare.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-5 border-b border-r border-line bg-paper sticky left-0 z-10 min-w-[200px]">
                  <div className="font-data text-[12px] uppercase text-muted-label tracking-wider">Candidate</div>
                </th>
                {candidates.map((c) => (
                  <th key={c.id} className="p-5 border-b border-r border-line last:border-r-0 min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[16px] shrink-0">
                        {c.name?.charAt(0) ?? "C"}
                      </div>
                      <div>
                        <div className="font-display font-semibold text-[16px] truncate">{c.name}</div>
                        <div className="text-[13px] text-ink-soft truncate font-normal">{c.headline}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Location */}
              <tr>
                <td className="p-5 border-b border-r border-line bg-paper sticky left-0 z-10 font-medium text-[14px]">Location</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-5 border-b border-r border-line last:border-r-0 text-[14px] text-ink-soft">
                    {c.location ?? "—"}
                  </td>
                ))}
              </tr>
              {/* Readiness Score */}
              <tr>
                <td className="p-5 border-b border-r border-line bg-paper sticky left-0 z-10 font-medium text-[14px]">Readiness</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-5 border-b border-r border-line last:border-r-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display font-semibold text-accent-dark">{c.readiness_score ?? 0}%</div>
                    </div>
                  </td>
                ))}
              </tr>
              {/* Skills */}
              <tr>
                <td className="p-5 border-b border-r border-line bg-paper sticky left-0 z-10 font-medium text-[14px]">Skills</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-5 border-b border-r border-line last:border-r-0 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {(c.skills ?? []).length > 0 ? (
                        c.skills.map((skill: string) => (
                          <span key={skill} className="text-[11.5px] font-data text-ink-soft bg-paper border border-line rounded px-2 py-0.5">
                            {skill}
                          </span>
                        ))
                      ) : "—"}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Work Preferences */}
              <tr>
                <td className="p-5 border-b border-r border-line bg-paper sticky left-0 z-10 font-medium text-[14px]">Work Preferences</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-5 border-b border-r border-line last:border-r-0 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {(c.work_preferences ?? []).length > 0 ? (
                        c.work_preferences.map((pref: string) => (
                          <span key={pref} className="text-[11.5px] font-data text-ink-soft capitalize">
                            {pref}
                          </span>
                        ))
                      ) : "—"}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Actions */}
              <tr>
                <td className="p-5 border-r border-line bg-paper sticky left-0 z-10"></td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-5 border-r border-line last:border-r-0">
                    <Link href={`/hire/candidates/${c.id}`} className="text-[13px] font-medium text-accent-dark hover:underline">
                      View full profile →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
