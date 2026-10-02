import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Funding | Global Careers",
};

export default async function GlobalFundingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  // Fetch funding applications
  const { data: applications } = await supabase
    .from("funding_applications")
    .select("*, program:funding_programs(*)")
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false });

  // Fetch available programs
  const { data: programs } = await supabase
    .from("funding_programs")
    .select("*")
    .eq("active", true)
    .order("max_support", { ascending: false });

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <nav className="font-data text-[12px] text-ink-soft mb-2">
          <Link href="/global-dashboard" className="hover:text-ink">Global Dashboard</Link> /
          Funding
        </nav>
        <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Mobility Funding</h1>
        <p className="mt-1 text-ink-soft text-[15px]">
          Financial support programs to help you relocate for international roles.
        </p>
      </div>

      <div className="grid grid-cols-[2fr_1fr] max-md:grid-cols-1 gap-8 items-start">
        <div className="space-y-8">
          <section>
            <h2 className="font-display font-semibold text-[18px] mb-4">Your Applications</h2>
            {(!applications || applications.length === 0) ? (
              <div className="py-8 text-center">
                <div className="text-ink-soft text-[14.5px]">You haven't applied for any funding programs yet.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {(applications as any[]).map((app) => (
                  <div key={app.id} className="py-5 border-b border-line last:border-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-display font-semibold text-[17px]">{app.program?.name ?? "Funding Program"}</div>
                        <div className="text-[13px] text-ink-soft mt-0.5">Applied {app.applied_at?.slice(0, 10)}</div>
                      </div>
                      <Badge variant="status" className="capitalize">{app.status}</Badge>
                    </div>
                    {app.requested_amount && (
                      <div className="font-data text-[13px] text-ink-soft bg-paper rounded-lg p-3 mt-3 border border-line inline-block">
                        Requested: {app.program?.currency ?? "USD"} {app.requested_amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display font-semibold text-[18px] mb-4">Available Programs</h2>
            <div className="grid gap-4">
              {(programs ?? []).map((prog: any) => (
                <div key={prog.id} className="py-6 border-b border-line last:border-0 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-[10px] bg-accent-soft text-accent-dark flex items-center justify-center shrink-0">
                    
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[17px]">{prog.name}</h3>
                    <div className="text-[13.5px] text-ink-soft mt-1">Provided by {prog.provider}</div>
                    <div className="mt-3 font-data text-[13px] text-ink-soft flex items-center gap-2">
                      <span className="font-semibold text-accent-dark">Up to {prog.currency} {prog.max_support?.toLocaleString()}</span>
                      {prog.requires_job_offer && <span className="bg-paper border border-line px-1.5 py-0.5 rounded text-[11px]">Requires job offer</span>}
                    </div>
                    <button className="mt-4 text-[13px] font-medium text-accent-dark hover:underline">
                      Learn more & apply →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-[14px] bg-[#E8F5E9] border border-[#2E7D32]/20 p-5">
            <h3 className="font-display font-semibold text-[16px] text-[#1B5E20] mb-2">How funding works</h3>
            <ul className="space-y-3 text-[13.5px] text-[#2E7D32]/90">
              <li className="flex gap-2">
                <span className="shrink-0 font-bold">1.</span>
                <span>Get a verified job offer through Kaziin for an eligible international role.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-bold">2.</span>
                <span>Submit a funding application outlining your relocation costs.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-bold">3.</span>
                <span>Once approved, funds are disbursed directly to you or service providers (like airlines).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
