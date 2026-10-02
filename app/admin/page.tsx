import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";

type RecentUser = {
  id: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
};

type RecentJob = {
  id: string;
  title: string | null;
  status: string;
  posted_at: string | null;
  employer: { name: string | null } | null;
};

type RecentApplication = {
  id: string;
  status: string;
  candidate: { name: string | null } | null;
  job: { title: string | null } | null;
};

/* ============================================================
   Admin Overview Dashboard
   Live KPIs and recent activity from Supabase.
   ============================================================ */

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [
    { count: usersCount },
    { count: jobsCount },
    { count: appsCount },
    { count: employersCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("employers").select("*", { count: "exact", head: true }),
  ]);

  // Recent sign-ups
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  // Recent jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("id, title, slug, status, posted_at, employer:employers(name)")
    .order("posted_at", { ascending: false })
    .limit(8);

  // Recent applications
  const { data: recentApps } = await supabase
    .from("applications")
    .select("id, status, applied_at, candidate:profiles(name), job:jobs(title)")
    .order("applied_at", { ascending: false })
    .limit(8);

  const recentUserRows = (recentUsers ?? []) as RecentUser[];
  const recentJobRows = (recentJobs ?? []) as unknown as RecentJob[];
  const recentApplicationRows = (recentApps ?? []) as unknown as RecentApplication[];

  const kpis = [
    { label: "Total Users", value: usersCount ?? 0, href: "/admin/users", color: "text-accent-dark", bg: "bg-accent-soft" },
    { label: "Active Jobs", value: jobsCount ?? 0, href: "/admin/jobs", color: "text-accent-dark", bg: "bg-accent-soft" },
    { label: "Applications", value: appsCount ?? 0, href: "/admin/applications", color: "text-[#B8863B]", bg: "bg-[#F3E7D3]" },
    { label: "Employers", value: employersCount ?? 0, href: "/admin/employers", color: "text-ink", bg: "bg-paper" },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-[28px] mb-1">
        Admin Dashboard
      </h1>
      <p className="text-ink-soft text-[15px] mb-8">
        Platform overview and recent activity.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-8 py-8 border-y border-line mb-12">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group flex flex-col items-start hover:opacity-80 transition-opacity"
          >
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-3 text-[18px] font-bold`}>
              {kpi.value}
            </div>
            <div className="font-data text-[12px] text-ink-soft uppercase tracking-wide">
              {kpi.label}
            </div>
            <div className="font-display font-bold text-[32px] mt-1 group-hover:text-accent-dark transition-colors">
              {kpi.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Three-column recent activity */}
      <div className="grid grid-cols-3 max-xl:grid-cols-1 gap-6">
        {/* Recent Users */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-2">
            <h2 className="font-display font-semibold text-[16px]">
              Recent Sign-ups
            </h2>
            <Link href="/admin/users" className="text-[12px] text-accent-dark font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex flex-col">
            {recentUserRows.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 border-b border-line last:border-0">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">
                    {u.name}
                  </div>
                  <div className="text-[12px] text-ink-soft font-data">
                    {u.created_at?.slice(0, 10)}
                  </div>
                </div>
                <span className={`text-[11px] font-data font-semibold px-2 py-0.5 rounded-full ${
                  u.role === "admin"
                    ? "bg-danger-soft text-danger"
                    : u.role === "recruiter"
                    ? "bg-accent-soft text-accent-dark"
                    : "bg-accent-soft text-accent-dark"
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
            {recentUserRows.length === 0 && (
              <div className="py-6 text-center text-ink-soft text-[13px]">
                No users yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-2">
            <h2 className="font-display font-semibold text-[16px]">
              Recent Jobs
            </h2>
            <Link href="/admin/jobs" className="text-[12px] text-accent-dark font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex flex-col">
            {recentJobRows.map((j) => (
              <div key={j.id} className="py-3 flex items-center justify-between gap-3 border-b border-line last:border-0">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">
                    {j.title}
                  </div>
                  <div className="text-[12px] text-ink-soft font-data">
                    {j.employer?.name} · {j.posted_at?.slice(0, 10)}
                  </div>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
            {recentJobRows.length === 0 && (
              <div className="py-6 text-center text-ink-soft text-[13px]">
                No jobs yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-2">
            <h2 className="font-display font-semibold text-[16px]">
              Recent Applications
            </h2>
            <Link href="/admin/applications" className="text-[12px] text-accent-dark font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex flex-col">
            {recentApplicationRows.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between gap-3 border-b border-line last:border-0">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">
                    {a.candidate?.name}
                  </div>
                  <div className="text-[12px] text-ink-soft font-data truncate">
                    → {a.job?.title}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {recentApplicationRows.length === 0 && (
              <div className="py-6 text-center text-ink-soft text-[13px]">
                No applications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
