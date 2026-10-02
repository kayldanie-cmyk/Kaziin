import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Applications" };

type AdminApplication = {
  id: string;
  status: string;
  applied_at: string | null;
  candidate: { name: string | null } | null;
  job: {
    title: string | null;
    employer: { name: string | null } | null;
  } | null;
};

/* ============================================================
   Admin — Application Oversight
   Full table of all applications across the platform.
   ============================================================ */

export default async function AdminApplicationsPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, candidate:profiles(name), job:jobs(title, employer:employers(name))")
    .order("applied_at", { ascending: false });

  const applicationRows: AdminApplication[] = applications ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px]">Applications</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            All job applications across the platform.
          </p>
        </div>
        <div className="font-data text-[13px] text-ink-soft">
          {applicationRows.length} total applications
        </div>
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 p-4 border-b border-line bg-paper font-data text-[12.5px] text-ink-soft">
          <div>Candidate</div>
          <div>Job</div>
          <div>Employer</div>
          <div>Status</div>
          <div>Applied</div>
        </div>

        {applicationRows.length === 0 ? (
          <div className="p-10 text-center text-ink-soft text-[14px]">
            No applications found.
          </div>
        ) : (
          applicationRows.map((app, i) => (
            <div
              key={app.id}
              className={`flex flex-col md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] md:items-center gap-3 p-4 ${
                i > 0 ? "border-t border-line" : ""
              } hover:bg-paper/50 transition-colors`}
            >
              <div className="min-w-0">
                <div className="font-display font-semibold text-[15px] truncate">
                  {app.candidate?.name ?? "Unknown"}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-[14px] truncate">
                  {app.job?.title}
                </div>
              </div>

              <div className="font-data text-[13px] text-ink-soft truncate">
                {app.job?.employer?.name}
              </div>

              <div>
                <StatusBadge status={app.status} />
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {app.applied_at?.slice(0, 10)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
