import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { VerifyToggle } from "./verify-toggle";

export const metadata: Metadata = { title: "Employers" };

type AdminEmployer = {
  id: string;
  name: string | null;
  verified: boolean;
  website: string | null;
  industry: string | null;
  location: string | null;
  jobs: { count: number }[] | null;
};

/* ============================================================
   Admin — Employer Management
   Full table of all employers with verification toggle.
   ============================================================ */

export default async function AdminEmployersPage() {
  const supabase = await createClient();

  const { data: employers } = await supabase
    .from("employers")
    .select("*, jobs(count)")
    .order("created_at", { ascending: false });

  const employerRows: AdminEmployer[] = employers ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px]">Employers</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Manage employer accounts and verification status.
          </p>
        </div>
        <div className="font-data text-[13px] text-ink-soft">
          {employerRows.length} total employers
        </div>
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-line bg-paper font-data text-[12.5px] text-ink-soft">
          <div>Company</div>
          <div>Industry</div>
          <div>Location</div>
          <div>Jobs</div>
          <div className="text-right">Verified</div>
        </div>

        {employerRows.length === 0 ? (
          <div className="p-10 text-center text-ink-soft text-[14px]">
            No employers found.
          </div>
        ) : (
          employerRows.map((emp, i) => (
            <div
              key={emp.id}
              className={`flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center gap-3 p-4 ${
                i > 0 ? "border-t border-line" : ""
              } hover:bg-paper/50 transition-colors`}
            >
              <div className="min-w-0">
                <div className="font-display font-semibold text-[15px] truncate flex items-center gap-2">
                  {emp.name ?? "Unnamed employer"}
                  {emp.verified && <Badge variant="verified">Verified</Badge>}
                </div>
                <div className="text-[13px] text-ink-soft truncate font-data">
                  {emp.website || "No website"}
                </div>
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {emp.industry}
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {emp.location}
              </div>

              <div className="font-data text-[14px]">
                {emp.jobs?.[0]?.count ?? 0}
                <span className="text-ink-soft text-[11px] ml-1">jobs</span>
              </div>

              <div className="text-right">
                <VerifyToggle employerId={emp.id} verified={emp.verified} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
