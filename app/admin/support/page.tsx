import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Status } from "@/components/ui/status";

export const metadata: Metadata = {
  title: "Support Cases | Admin",
};

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const priorityColors: Record<string, string> = {
    critical: "bg-danger-soft text-danger",
    high: "bg-[#FFF3E0] text-[#E65100]",
    medium: "bg-[#FFF8E1] text-[#F9A825]",
    low: "bg-paper text-muted-label border border-line",
  };

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Support Cases</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Manage fraud reports, disputes, verification cases, and user support.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-display font-semibold text-[18px]">Open Cases</h2>
          <button className="rounded-full bg-accent text-white text-[13px] font-medium px-4 py-2 hover:bg-accent-dark transition-colors">
            New Case
          </button>
        </div>
        <div className="divide-y divide-line">
          {(!cases || cases.length === 0) ? (
            <div className="px-6 py-10 text-center">
              <p className="text-muted-label text-[14px]">No cases open.</p>
            </div>
          ) : (
            (cases as any[]).map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[11px] text-muted-label">{c.case_number}</span>
                    <span className={`text-[11px] font-data font-semibold px-2 py-0.5 rounded-full capitalize ${priorityColors[c.priority] ?? priorityColors.low}`}>
                      {c.priority}
                    </span>
                  </div>
                  <div className="font-medium text-[14.5px] mt-1 capitalize">
                    {c.type?.replace(/_/g, " ")}
                  </div>
                  <div className="text-[13px] text-muted-label mt-0.5">
                    {c.created_at?.slice(0, 10)}
                    {c.entity_type && ` • ${c.entity_type}`}
                  </div>
                </div>
                <Status status={c.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
