"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { createPortal } from "react-dom";

interface NavItem { label: string; href: string; }

const RECRUITER_NAV: readonly NavItem[] = [
  { label: "Overview", href: "/hire" },
  { label: "Jobs", href: "/hire/jobs" },
  { label: "Quick Tasks", href: "/hire/quick-tasks" },
  { label: "Candidates", href: "/hire/candidates" },
  { label: "Shortlists", href: "/hire/shortlists" },
  { label: "Interviews", href: "/hire/interviews" },
  { label: "Messages", href: "/hire/messages" },
  { label: "Analytics", href: "/hire/analytics" },
] as const;

export function HireNavClient({ recruiterName = "Recruiter" }: { recruiterName?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const initials = recruiterName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const mobileMenu = mobileOpen && mounted && createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
        <Link href="/hire" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
          <Logo size={18} />
          <span className="font-data text-[10px] uppercase tracking-wider bg-accent-soft text-accent-dark px-2 py-0.5 rounded-full font-semibold">Hire</span>
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button type="button" onClick={() => setMobileOpen(false)} className="p-2 cursor-pointer" aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2e24" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-accent-soft/40 border border-line">
          <div className="w-10 h-10 rounded-full bg-[#2F6D53] flex items-center justify-center font-display font-bold text-[14px] text-white shrink-0">{initials}</div>
          <div><p className="font-semibold text-[14px] text-[#2F6D53]">{recruiterName}</p><p className="text-[12px] text-ink-soft">Hire Dashboard</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <nav className="flex flex-col gap-1">
          {RECRUITER_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/hire" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-[10px] text-[16px] font-semibold transition-colors ${isActive ? "bg-[#2F6D53] text-white" : "text-[#2F6D53] hover:bg-[#2F6D53]/10"}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-5 pb-8 pt-3 border-t border-line shrink-0">
        <button type="button" onClick={handleSignOut} className="w-full flex items-center justify-center px-4 py-3 rounded-[10px] border border-line text-[15px] font-semibold text-ink-soft hover:text-[#A24B3F] hover:border-[#A24B3F]/30 transition-colors">Sign out</button>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col gap-sp-6 border-r border-line p-sp-5 px-sp-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2">
          <Link href="/hire" aria-label="Kaziin Hire"><Logo size={20} /></Link>
          <span className="font-data text-[10.5px] uppercase tracking-wider bg-accent-soft text-accent-dark px-2 py-0.5 rounded-full font-semibold">Hire</span>
        </div>
        <nav className="flex flex-col gap-0.5" aria-label="Employer navigation">
          {RECRUITER_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/hire" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-bold transition-colors ${isActive ? "bg-[#2F6D53] text-white" : "text-[#2F6D53] hover:bg-[#2F6D53]/10"}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#2F6D53]/80 font-data">Notifications</span>
            <div className="text-[#2F6D53]"><NotificationBell direction="up" /></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-[#2F6D53]">
              <div className="w-6 h-6 rounded-full border border-accent bg-[#2F6D53]/10 flex items-center justify-center font-display font-bold text-[10px] text-[#2F6D53]">{initials}</div>
              <span className="font-medium truncate">{recruiterName}</span>
            </div>
            <button type="button" onClick={handleSignOut} className="ml-2 font-data text-[12.5px] text-[#2F6D53]/70 hover:text-[#A24B3F] transition-colors shrink-0 cursor-pointer">Sign out</button>
          </div>
        </div>
      </aside>
      <div className="lg:hidden sticky top-0 z-40 bg-paper border-b border-line">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/hire" aria-label="Kaziin Hire" className="flex items-center gap-2">
            <Logo size={18} />
            <span className="font-data text-[10px] uppercase tracking-wider bg-accent-soft text-accent-dark px-1.5 py-0.5 rounded-full font-semibold">Hire</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full border border-accent bg-accent-soft flex items-center justify-center font-display font-bold text-[12px] text-accent-dark" aria-label="Profile">{initials}</div>
            <button type="button" className="flex flex-col gap-[5px] p-2 -mr-2 cursor-pointer" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <span className="block w-5 h-[2px] bg-[#2F6D53] rounded-full" />
              <span className="block w-5 h-[2px] bg-[#2F6D53] rounded-full" />
              <span className="block w-5 h-[2px] bg-[#2F6D53] rounded-full" />
            </button>
          </div>
        </div>
      </div>
      {mobileMenu}
    </>
  );
}
