import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Candidate Profile",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidate, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !candidate) {
    notFound();
  }

  // Fetch recent applications to this employer's jobs if viewing as recruiter
  const { data: { user } } = await supabase.auth.getUser();
  let applications: any[] = [];
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("employer_id").eq("id", user.id).single();
    if (profile?.employer_id) {
      const { data: apps } = await supabase
        .from("applications")
        .select("id, status, applied_at, job:jobs(title)")
        .eq("candidate_id", id)
        .eq("job.employer_id", profile.employer_id);
      
      applications = (apps ?? []).filter(a => a.job !== null);
    }
  }

  return (
    <div className="max-w-[1000px]">
      <div className="mb-8">
        <BackButton href="/hire/candidates" label="Back to Candidates" className="mb-3" />
        <nav className="font-data text-[12px] text-ink-soft mb-2">
          <Link href="/hire" className="hover:text-ink">Dashboard</Link> /
          <Link href="/hire/candidates" className="hover:text-ink mx-1">Candidates</Link> /
          {candidate.name}
        </nav>
      </div>

      <div className="grid grid-cols-[1fr_320px] max-md:grid-cols-1 gap-8 items-start">
        {/* Main Profile Info */}
        <div className="space-y-8">
          <section className="flex flex-col">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-[14px] bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[32px] shrink-0">
                {candidate.name?.charAt(0) ?? "C"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-[32px] max-sm:text-[24px] leading-tight">
                  {candidate.name}
                </h1>
                <div className="text-[17px] text-ink-soft mt-1">
                  {candidate.headline ?? "Candidate Profile"}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 font-data text-[13.5px] text-ink-soft">
                  <div className="flex items-center gap-1.5">
                    
                    {candidate.location ?? "Location not specified"}
                  </div>
                  <div className="flex items-center gap-1.5 capitalize">
                    
                    {candidate.availability?.replace("_", " ") ?? "Unknown availability"}
                  </div>
                </div>
              </div>
            </div>

            {candidate.summary && (
              <div className="mt-8 pt-6 border-t border-line">
                <h2 className="font-display font-semibold text-[17px] mb-3">About</h2>
                <p className="text-[15px] text-ink-soft leading-relaxed">
                  {candidate.summary}
                </p>
              </div>
            )}
          </section>

          {(candidate.skills && candidate.skills.length > 0) && (
            <section className="pt-8 mt-8 border-t border-line">
              <h2 className="font-display font-semibold text-[19px] mb-5">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2.5">
                {(candidate.skills as string[]).map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-paper border border-line rounded-lg font-data text-[13.5px] text-ink-soft">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(candidate.experience && candidate.experience.length > 0) && (
            <section className="pt-8 mt-8 border-t border-line">
              <h2 className="font-display font-semibold text-[19px] mb-6">Experience</h2>
              <div className="space-y-6">
                {(candidate.experience as any[]).map((exp, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-[2px] bg-line relative mt-2">
                      <div className="absolute top-0 -left-[3px] w-[8px] h-[8px] rounded-full bg-accent" />
                    </div>
                    <div className="flex-1 pb-6 border-b border-line last:border-b-0 last:pb-0">
                      <h3 className="font-display font-semibold text-[16.5px]">{exp.title}</h3>
                      <div className="text-[14px] text-ink-soft mt-0.5">{exp.company} • {exp.location}</div>
                      <div className="font-data text-[12.5px] text-muted-label mt-1">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</div>
                      {exp.description && (
                        <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="sticky top-6 flex flex-col">
            <h3 className="font-display font-semibold text-[16px] mb-4">Profile Readiness</h3>
            <div className="flex items-end gap-3 mb-2">
              <div className="font-display font-bold text-[36px] leading-none text-accent-dark">{candidate.readiness_score ?? 0}</div>
              <div className="font-data text-[13px] text-muted-label pb-1">/ 100</div>
            </div>
            <ProgressBar value={candidate.readiness_score ?? 0} height={8} animate={false} />
            <p className="mt-4 text-[13.5px] text-ink-soft">
              This score indicates how complete and verified this candidate's profile is.
            </p>

            <div className="mt-6 pt-5 border-t border-line">
              <h3 className="font-display font-semibold text-[15px] mb-3">Work Preferences</h3>
              <ul className="space-y-2">
                {(candidate.work_preferences ?? []).map((pref: string) => (
                  <li key={pref} className="text-[13.5px] text-ink-soft capitalize flex items-center gap-2">
                    
                    {pref}
                  </li>
                ))}
                {(candidate.employment_types ?? []).map((type: string) => (
                  <li key={type} className="text-[13.5px] text-ink-soft capitalize flex items-center gap-2">
                    
                    {type}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 pt-6 border-t border-line flex flex-col gap-3">
              <button className="w-full rounded-[10px] bg-accent text-white font-medium text-[14.5px] py-3 hover:bg-accent-dark transition-colors">
                Message Candidate
              </button>
              <button className="w-full rounded-[10px] bg-paper border border-line text-ink font-medium text-[14.5px] py-3 hover:border-ink transition-colors">
                Add to Talent Pool
              </button>
            </div>
          </section>

          {applications.length > 0 && (
            <section className="pt-8 mt-8 border-t border-line flex flex-col">
              <h3 className="font-display font-semibold text-[16px] mb-4">Applications to you</h3>
              <div className="space-y-4">
                {applications.map((app: any) => (
                  <div key={app.id}>
                    <div className="font-medium text-[14px] truncate">{Array.isArray(app.job) ? app.job[0]?.title : app.job?.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="font-data text-[12px] text-muted-label">{app.applied_at?.slice(0, 10)}</div>
                      <Badge variant="status" className="capitalize text-[10px] px-1.5 py-0">{app.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
