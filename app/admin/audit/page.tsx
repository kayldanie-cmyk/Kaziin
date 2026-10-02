import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Audit Logs | Admin",
};

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at, actor:profiles(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Audit Logs</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Immutable record of all actions taken across the platform.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="py-4 border-b border-line">
          <div className="grid grid-cols-4 text-[12px] font-data uppercase tracking-wider text-muted-label">
            <span>Action</span>
            <span>Actor</span>
            <span>Entity</span>
            <span>Timestamp</span>
          </div>
        </div>
        <div className="divide-y divide-line max-h-[65vh] overflow-y-auto">
          {(!logs || logs.length === 0) ? (
            <div className="px-6 py-10 text-center text-muted-label text-[14px]">
              No audit logs yet.
            </div>
          ) : (
            (logs as any[]).map((log) => (
              <div key={log.id} className="px-6 py-3 grid grid-cols-4 gap-2 text-[13.5px] hover:bg-paper transition-colors">
                <span className="font-data text-accent-dark capitalize truncate">
                  {log.action?.replace(/_/g, " ")}
                </span>
                <span className="text-ink-soft truncate">
                  {Array.isArray(log.actor) ? log.actor[0]?.name : log.actor?.name ?? "System"}
                </span>
                <span className="text-muted-label capitalize truncate">
                  {log.entity_type} {log.entity_id?.slice(0, 8)}
                </span>
                <span className="text-muted-label font-data text-[12px]">
                  {log.created_at?.slice(0, 16).replace("T", " ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
