"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type IconKey = "grid" | "users" | "briefcase" | "file-text" | "building" | "settings";

interface NavItem {
  label: string;
  href: string;
  icon?: IconKey;
}

const ICONS: Record<IconKey, React.ReactNode> = {
  grid: (null),
  users: (null),
  briefcase: (null),
  "file-text": (null),
  building: (null),
  settings: (null),
};

const ADMIN_NAV = [
  // Core
  { label: "Overview",       href: "/admin",                  icon: "grid" },
  // People
  { label: "Users",          href: "/admin/users",            icon: "users" },
  { label: "Candidates",     href: "/admin/candidates",       icon: "users" },
  { label: "Recruiters",     href: "/admin/recruiters",       icon: "users" },
  { label: "Employers",      href: "/admin/employers",        icon: "building" },
  // Content
  { label: "Jobs",           href: "/admin/jobs",             icon: "briefcase" },
  { label: "Applications",   href: "/admin/applications",     icon: "file-text" },
  { label: "Matches",        href: "/admin/matches",          icon: "grid" },
  // Intelligence
  { label: "AI Control",     href: "/admin/ai",               icon: "settings" },
  { label: "Verification",   href: "/admin/verification",     icon: "file-text" },
  // Career Support
  { label: "Career Support", href: "/admin/career-support",   icon: "grid" },
  { label: "Assessments",    href: "/admin/career-support/assessments", icon: "file-text" },
  { label: "Career Plans",   href: "/admin/career-support/plans",       icon: "file-text" },
  { label: "Training",       href: "/admin/training",          icon: "grid" },
  { label: "Global Careers", href: "/admin/global",           icon: "grid" },
  { label: "Funding",        href: "/admin/funding",          icon: "grid" },
  // Trust & Safety
  { label: "Support",        href: "/admin/support",          icon: "file-text" },
  // Analytics
  { label: "Analytics",      href: "/admin/analytics",        icon: "grid" },
  // Quick Tasks
  { label: "Quick Tasks",    href: "/admin/quick-tasks",      icon: "grid" },
  { label: "QT Active",      href: "/admin/quick-tasks/active",    icon: "briefcase" },
  { label: "QT Taskers",     href: "/admin/quick-tasks/taskers",   icon: "users" },
  { label: "QT Disputes",    href: "/admin/quick-tasks/disputes",  icon: "file-text" },
  // System
  { label: "Taxonomy",       href: "/admin/taxonomy",         icon: "grid" },
  { label: "Questions",      href: "/admin/questions",        icon: "file-text" },
  { label: "Skills Graph",   href: "/admin/skills",           icon: "grid" },
  { label: "Config",         href: "/admin/config",           icon: "settings" },
  { label: "Feature Flags",  href: "/admin/feature-flags",    icon: "settings" },
  { label: "Audit Logs",     href: "/admin/audit",            icon: "file-text" },
  { label: "Settings",       href: "/admin/settings",         icon: "settings" },
] as const;

export function AdminNavClient({ adminName = "Admin" }: { adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = adminName.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[260px] shrink-0 hidden lg:flex flex-col border-r border-line sticky top-0 h-screen bg-paper">
        {/* Brand */}
        <div className="px-6 pt-6 pb-5 border-b border-line">
          <Link href="/admin" className="block">
            <div className="font-display font-bold text-[18px] tracking-wide text-ink">
              KAZIIN
            </div>
            <div className="font-data text-[10.5px] text-accent uppercase tracking-widest mt-0.5">
              Admin Console
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1 admin-nav-scrollbar">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const iconKey = (item.icon as IconKey) ?? "grid";
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#2F6D53] text-white"
                    : "text-[#2F6D53] hover:bg-[#2F6D53]/10"
                }`}
              >
                <span className="shrink-0">{ICONS[iconKey] ?? ICONS.grid}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-line mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate text-ink">{adminName}</div>
              <div className="text-[11px] text-ink-soft">Administrator</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-[#2F6D53] hover:bg-[#2F6D53]/10 transition-colors w-full"
          >
            
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-paper border-b border-line">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/admin" className="font-display font-bold text-[16px] text-ink tracking-wide">
            KAZIIN <span className="text-accent text-[11px] font-data font-normal ml-1">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold">
              {initials}
            </div>
            <button
              className="flex flex-col gap-[5px] p-2 -mr-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className={`block w-5 h-[1.5px] bg-ink transition-transform duration-200 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-ink transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-ink transition-transform duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <nav className="border-t border-line px-5 py-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-70px)] shadow-xl absolute w-full bg-paper">
            {ADMIN_NAV.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const iconKey = (item.icon as IconKey) ?? "grid";
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-[15px] font-bold transition-colors ${
                    isActive
                      ? "bg-[#2F6D53] text-white"
                      : "text-[#2F6D53] hover:bg-[#2F6D53]/10"
                  }`}
                >
                  <span className="shrink-0">{ICONS[iconKey] ?? ICONS.grid}</span>
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 pb-2 mt-2 border-t border-line/60">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-[15px] font-bold text-[#2F6D53] hover:bg-[#2F6D53]/10 transition-colors mt-1 text-center"
              >
                Sign out
              </button>
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
