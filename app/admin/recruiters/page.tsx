import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Recruiters | Admin",
};

export default async function AdminRecruitersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: recruiters } = await supabase
    .from("profiles")
    .select("id, name, headline, created_at, employer_id, employer:employers(name, verification_status)")
    .eq("role", "recruiter")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Recruiters</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Manage all recruiter accounts and their employer associations.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="py-4 border-b border-line bg-paper grid grid-cols-[1fr_180px_140px_100px] gap-4 text-[12px] font-data uppercase tracking-wider text-muted-label">
          <span>Name</span>
          <span>Employer</span>
          <span>Verification</span>
          <span>Joined</span>
        </div>
        <div className="divide-y divide-line">
          {(!recruiters || recruiters.length === 0) ? (
            <div className="px-6 py-10 text-center text-muted-label text-[14px]">No recruiters yet.</div>
          ) : (
            (recruiters as any[]).map((r) => {
              const employer = Array.isArray(r.employer) ? r.employer[0] : r.employer;
              return (
                <div key={r.id} className="px-6 py-4 grid grid-cols-[1fr_180px_140px_100px] gap-4 items-center hover:bg-paper transition-colors">
                  <div className="font-medium text-[14.5px] truncate">{r.name ?? "—"}</div>
                  <div className="text-[13.5px] text-muted-label truncate">{employer?.name ?? "No employer"}</div>
                  <div>
                    <span className={`text-[11.5px] font-data font-semibold px-2.5 py-1 rounded-full capitalize ${
                      employer?.verification_status === "verified" ? "bg-[#E8F5E9] text-[#2E7D32]" :
                      employer?.verification_status === "pending" ? "bg-[#FFF3E0] text-[#E65100]" :
                      "bg-paper border border-line text-muted-label"
                    }`}>
                      {employer?.verification_status?.replace("_", " ") ?? "not started"}
                    </span>
                  </div>
                  <div className="font-data text-[12px] text-muted-label">{r.created_at?.slice(0, 10)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
