import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Settings" };

/* ============================================================
   Admin - Platform Settings
   Quick reference and platform configuration info.
   ============================================================ */

export default function AdminSettingsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const env = process.env.NODE_ENV ?? "development";
  const supabaseDashboardUrl = getSupabaseDashboardUrl(supabaseUrl);

  return (
    <div className="max-w-[700px]">
      <h1 className="font-display font-bold text-[26px] mb-1">Settings</h1>
      <p className="text-ink-soft text-[15px] mb-8">
        Platform configuration and quick links.
      </p>

      <section className="pt-8 mt-8 border-t border-line first:pt-0 first:mt-0 first:border-0 mb-6">
        <h2 className="font-display font-semibold text-[18px] mb-5">
          Platform Info
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 py-2 border-b border-line">
            <span className="font-data text-[12.5px] text-ink-soft">
              Environment
            </span>
            <span
              className={`font-data text-[13px] font-semibold px-2.5 py-1 rounded-full ${
                env === "production"
                  ? "bg-accent-soft text-accent-dark"
                  : "bg-paper border border-line text-ink-soft"
              }`}
            >
              {env}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2 border-b border-line">
            <span className="font-data text-[12.5px] text-ink-soft">
              Supabase URL
            </span>
            <span className="font-data text-[13px] text-ink truncate max-w-[300px]">
              {supabaseUrl || "Not configured"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2 border-b border-line">
            <span className="font-data text-[12.5px] text-ink-soft">
              Framework
            </span>
            <span className="font-data text-[13px] text-ink">
              Next.js 15 + Supabase
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="font-data text-[12.5px] text-ink-soft">
              Auth Provider
            </span>
            <span className="font-data text-[13px] text-ink">
              Supabase Auth (Email/Password)
            </span>
          </div>
        </div>
      </section>

      <section className="pt-8 mt-8 border-t border-line mb-6">
        <h2 className="font-display font-semibold text-[18px] mb-5">
          Quick Links
        </h2>
        <div className="flex flex-col divide-y divide-line">
          {supabaseDashboardUrl ? (
            <a
              href={supabaseDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity group"
            >
              <div>
                <div className="font-semibold text-[14px]">Supabase Dashboard</div>
                <div className="text-[12px] text-ink-soft">Database, auth, storage, and logs</div>
              </div>
              
            </a>
          ) : (
            <div className="flex items-center justify-between py-4 opacity-40">
              <div>
                <div className="font-semibold text-[14px]">Supabase Dashboard</div>
                <div className="text-[12px] text-ink-soft">Add NEXT_PUBLIC_SUPABASE_URL to enable the project link.</div>
              </div>
            </div>
          )}
          <Link href="/admin/users" className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity group">
            <div>
              <div className="font-semibold text-[14px]">User Management</div>
              <div className="text-[12px] text-ink-soft">View and manage all users</div>
            </div>
            
          </Link>
          <Link href="/admin/jobs" className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity group">
            <div>
              <div className="font-semibold text-[14px]">Job Management</div>
              <div className="text-[12px] text-ink-soft">Manage all job listings</div>
            </div>
            
          </Link>
          <Link href="/admin/employers" className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity group">
            <div>
              <div className="font-semibold text-[14px]">Employer Verification</div>
              <div className="text-[12px] text-ink-soft">Review and verify employers</div>
            </div>
            
          </Link>
        </div>
      </section>

      <section className="pt-8 mt-8 border-t border-line">
        <h2 className="font-display font-semibold text-[18px] mb-2">
          Data Operations
        </h2>
        <p className="text-[13.5px] text-ink-soft mb-5">
          Database resets, exports, and restores should be run from Supabase with migration history and backups visible.
        </p>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 text-[13px]">
          <div className="rounded-lg border border-line bg-paper p-4">
            <div className="font-semibold mb-1">Schema changes</div>
            <div className="text-ink-soft">
              Apply migrations from the Supabase SQL editor or CLI.
            </div>
          </div>
          <div className="rounded-lg border border-line bg-paper p-4">
            <div className="font-semibold mb-1">Backups and exports</div>
            <div className="text-ink-soft">
              Use Supabase project backups or table exports.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getSupabaseDashboardUrl(value: string) {
  try {
    const url = new URL(value);
    const projectRef = url.hostname.split(".")[0];

    if (!projectRef || !url.hostname.endsWith(".supabase.co")) return null;

    return `https://supabase.com/dashboard/project/${projectRef}`;
  } catch {
    return null;
  }
}
