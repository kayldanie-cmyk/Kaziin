import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Candidates | Admin",
};

export default async function AdminCandidatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, name, headline, location, readiness_score, availability, created_at, role")
    .in("role", ["candidate", "global_candidate"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Candidates</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          View and manage all candidate accounts on the platform.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="py-4 border-b border-line grid grid-cols-[1fr_160px_120px_100px] gap-4 text-[12px] font-data uppercase tracking-wider text-muted-label">
          <span>Name</span>
          <span>Location</span>
          <span>Readiness</span>
          <span>Joined</span>
        </div>
        <div className="divide-y divide-line">
          {(!candidates || candidates.length === 0) ? (
            <div className="px-6 py-10 text-center text-muted-label text-[14px]">No candidates yet.</div>
          ) : (
            (candidates as any[]).map((c) => (
              <div key={c.id} className="px-6 py-4 grid grid-cols-[1fr_160px_120px_100px] gap-4 items-center hover:bg-paper transition-colors">
                <div className="min-w-0">
                  <div className="font-medium text-[14.5px] truncate">{c.name ?? "—"}</div>
                  <div className="text-[13px] text-muted-label truncate">{c.headline ?? c.role}</div>
                </div>
                <div className="text-[13.5px] text-muted-label truncate">{c.location ?? "—"}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-paper rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${c.readiness_score ?? 0}%` }} />
                  </div>
                  <span className="font-data text-[12px] text-muted-label w-6">{c.readiness_score ?? 0}</span>
                </div>
                <div className="font-data text-[12px] text-muted-label">{c.created_at?.slice(0, 10)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
