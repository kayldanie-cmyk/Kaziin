import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   Quick Task Banner — Slim top bar with action shortcuts.
   Session-aware: logged-in users are deep-linked to their
   role-scoped dashboard, never back to the public landing.
   ============================================================ */

export async function QuickTaskBanner() {
  const supabase = await createClient();

  let user = null;
  let role: string | null = null;

  if (supabase) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = profile?.role ?? (user.user_metadata?.role as string) ?? "candidate";
    }
  }

  // Deep-link authenticated users directly into their dashboard.
  // Unauthenticated users go to the public landing.
  const qtPostHref =
    user && role === "recruiter"
      ? "/hire/quick-tasks/new"
      : user
      ? "/dashboard/quick-tasks"
      : "/quick-tasks/post";

  const qtGetHref =
    user && role !== "recruiter"
      ? "/dashboard/quick-tasks"
      : user
      ? "/hire/quick-tasks"
      : "/quick-tasks";

  const findWorkHref    = user ? "/dashboard"      : "/auth/signup?role=work";
  const careerHref      = user ? "/career-support" : "/auth/signup?role=global";
  const startHiringHref = user && role === "recruiter" ? "/hire" : "/auth/signup?role=hire";

  const NAV_LINKS = [
    { label: "Post a Task",    href: qtPostHref },
    { label: "Get a Task",     href: qtGetHref },
    { label: "Find Work",      href: findWorkHref },
    { label: "Career Support", href: careerHref },
    { label: "Start Hiring",   href: startHiringHref },
  ];

  return (
    <div className="bg-[#2F6D53] text-white border-b border-[#2F6D53]/80">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-5 md:px-10 py-2 flex items-center justify-between gap-4">
        {/* Left: brand tagline (desktop only) */}
        <span className="font-data text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold hidden lg:block shrink-0">
          Kaziin — Find work. Go global. Hire talent.
        </span>

        {/* Center/Right: action links — scrollable on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto scrollbar-none -mx-1 px-1">
          {NAV_LINKS.map((link, i) => (
            <span key={link.label} className="flex items-center gap-1 shrink-0">
              {i > 0 && (
                <span className="text-white/30 text-[11px] hidden sm:inline">|</span>
              )}
              <Link
                href={link.href}
                className="whitespace-nowrap px-2 sm:px-3 py-1 text-[11.5px] sm:text-[12.5px] font-semibold text-white/90 hover:text-accent-soft border-b border-transparent hover:border-accent-soft transition-all duration-150"
              >
                {link.label}
              </Link>
            </span>
          ))}

          {/* Auth links — only shown when logged out */}
          {!user && (
            <>
              <span className="text-white/30 text-[11px] hidden sm:inline ml-1 sm:ml-2 shrink-0">|</span>
              <Link
                href="/auth/signin"
                className="ml-1 sm:ml-2 whitespace-nowrap px-2 sm:px-3 py-1 text-[11.5px] sm:text-[12.5px] font-semibold text-white/90 hover:text-accent-soft border-b border-transparent hover:border-accent-soft transition-all duration-150 shrink-0"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="whitespace-nowrap px-3 sm:px-3.5 py-1 rounded-full text-[11.5px] sm:text-[12.5px] font-bold bg-white text-[#2F6D53] hover:bg-accent-soft transition-all duration-150 ml-1 shrink-0"
              >
                Get started
              </Link>
            </>
          )}

          {/* Dashboard shortcut — shown when signed in */}
          {user && (
            <>
              <span className="text-white/30 text-[11px] hidden sm:inline ml-1 sm:ml-2 shrink-0">|</span>
              <Link
                href={role === "recruiter" ? "/hire" : "/dashboard"}
                className="ml-1 sm:ml-2 whitespace-nowrap px-2 sm:px-3 py-1 text-[11.5px] sm:text-[12.5px] font-semibold text-white/90 hover:text-accent-soft border-b border-transparent hover:border-accent-soft transition-all duration-150 shrink-0"
              >
                Dashboard →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}