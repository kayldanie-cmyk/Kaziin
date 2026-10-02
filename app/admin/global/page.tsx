import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Global Careers | Admin",
};

export default async function AdminGlobalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const [
    { count: requestsCount },
    { count: fundingCount },
    { data: recentRequests },
  ] = await Promise.all([
    (async () => {
      const res = await supabase.from("global_interest_requests").select("*", { count: "exact", head: true });
      return res.error ? { count: 0 } : res;
    })(),
    (async () => {
      const res = await supabase.from("funding_applications").select("*", { count: "exact", head: true });
      return res.error ? { count: 0 } : res;
    })(),
    (async () => {
      const res = await supabase.from("global_interest_requests").select("*, candidate:profiles(name)").order("created_at", { ascending: false }).limit(10);
      return res.error ? { data: [] } : res;
    })(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Global Careers</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Manage global interest requests, funding applications, and international mobility programs.
        </p>
      </div>

      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8 py-8 border-y border-line mb-12">
        {[
          { label: "Interest Requests", value: requestsCount ?? 0 },
          { label: "Funding Applications", value: fundingCount ?? 0 },
          { label: "Programs Active", value: 0 },
        ].map((stat) => (
          <div key={stat.label} className="py-2">
            <div className="font-data text-[12px] uppercase tracking-wider text-muted-label">{stat.label}</div>
            <div className="font-display font-bold text-[36px] mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-6">
          <h2 className="font-display font-semibold text-[18px]">Recent Global Interest Requests</h2>
        </div>
        <div className="flex flex-col gap-2">
          {(!recentRequests || recentRequests.length === 0) ? (
            <div className="py-8 text-center text-muted-label text-[14px]">
              No global interest requests yet.
            </div>
          ) : (
            (recentRequests as any[]).map((r) => (
              <div key={r.id} className="py-4 flex items-center justify-between gap-4 border-b border-line last:border-0">
                <div>
                  <div className="font-medium text-[14.5px]">
                    {Array.isArray(r.candidate) ? r.candidate[0]?.name : r.candidate?.name ?? "Candidate"}
                  </div>
                  <div className="text-[13px] text-muted-label mt-0.5">
                    {r.created_at?.slice(0, 10)}
                  </div>
                </div>
                <span className={`text-[12px] font-data font-semibold px-2.5 py-1 rounded-full capitalize ${
                  r.status === "approved" ? "bg-[#E8F5E9] text-[#2E7D32]" :
                  r.status === "pending" ? "bg-[#FFF3E0] text-[#E65100]" :
                  "bg-paper border border-line text-muted-label"
                }`}>
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
