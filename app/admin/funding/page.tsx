import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Status } from "@/components/ui/status";

export const metadata: Metadata = {
  title: "Funding | Admin",
};

export default async function AdminFundingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const [
    { data: programs },
    { data: applications },
  ] = await Promise.all([
    supabase.from("funding_programs").select("*").order("created_at", { ascending: false }),
    supabase.from("funding_applications")
      .select("*, candidate:profiles(name)")
      .order("applied_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Funding Management</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Manage funding programs and application review.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr] max-md:grid-cols-1 gap-8">
        {/* Programs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[20px]">Programs</h2>
            <button className="rounded-full bg-accent text-white text-[13px] font-medium px-4 py-2 hover:bg-accent-dark transition-colors">
              Add Program
            </button>
          </div>
          <div className="flex flex-col mb-8">
            <div className="divide-y divide-line">
              {(!programs || programs.length === 0) ? (
                <div className="p-8 text-center text-muted-label text-[14px]">No funding programs configured.</div>
              ) : (
                (programs as any[]).map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="font-semibold text-[15px]">{p.name}</div>
                    <div className="text-[13px] text-muted-label mt-1">{p.provider} • {p.currency} {p.max_support?.toLocaleString()}</div>
                    <div className="mt-2">
                      <Status status={p.active ? "published" : "draft"} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[20px]">Applications</h2>
          </div>
          <div className="flex flex-col">
            <div className="divide-y divide-line">
              {(!applications || applications.length === 0) ? (
                <div className="p-8 text-center text-muted-label text-[14px]">No funding applications yet.</div>
              ) : (
                (applications as any[]).map((a) => (
                  <div key={a.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-[14.5px]">
                        {Array.isArray(a.candidate) ? a.candidate[0]?.name : a.candidate?.name ?? "Candidate"}
                      </div>
                      <div className="text-[13px] text-muted-label mt-0.5">
                        {a.applied_at?.slice(0, 10)} • {a.requested_amount ? `${a.requested_amount.toLocaleString()} requested` : "Amount TBD"}
                      </div>
                    </div>
                    <Status status={a.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
