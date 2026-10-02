"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { createPortal } from "react-dom";

interface SessionUser { name: string; role: string; }

const NAV_ITEMS = [
  { label: "Find Work",      authHref: "/dashboard",      guestHref: "/#work" },
  { label: "Career Support", authHref: "/career-support", guestHref: "/career-support" },
  { label: "Quick Tasks",    authHref: "/quick-tasks",    guestHref: "/quick-tasks" },
  { label: "Hire Talent",    authHref: "/hire",           guestHref: "/#employers" },
  { label: "How it works",   authHref: "/how-it-works",   guestHref: "/#how-it-works" },
];

export function PublicNavClient({ sessionUser }: { sessionUser: SessionUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const dashboardHref =
    sessionUser?.role === "recruiter" ? "/hire"
    : sessionUser?.role === "admin"   ? "/admin"
    : "/dashboard";

  // Only render portal after mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const mobileMenu = mobileOpen && mounted && createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#E3ECE6]">
      {/* Header row inside mobile menu */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="p-2 cursor-pointer bg-transparent border-none"
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2e24" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Nav links */}
        <nav className="flex flex-col gap-4 mb-8">
          {NAV_ITEMS.map((item) => {
            const href = sessionUser ? item.authHref : item.guestHref;
            return (
              <Link
                key={item.label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-[18px] font-semibold text-[#2F6D53] border-b border-line pb-4"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth buttons */}
        <div className="flex flex-col gap-3">
          {sessionUser ? (
            <Link href={dashboardHref} className={buttonVariants({ className: "w-full justify-center py-4 text-[16px]" })} onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className={buttonVariants({ variant: "ghost", className: "w-full justify-center py-4 text-[16px]" })} onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link href="/auth/signup" className={buttonVariants({ className: "w-full justify-center py-4 text-[16px]" })} onClick={() => setMobileOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-[#E3ECE6]">
        <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-[16px] max-w-[1360px] mx-auto">

          {/* Logo */}
          <Link href="/" aria-label="Kaziin home" className="flex items-center shrink-0 mt-1">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const href = sessionUser ? item.authHref : item.guestHref;
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`text-[14px] font-semibold py-1 border-b transition-colors duration-150 ${
                    isActive
                      ? "text-[#2F6D53] border-[#2F6D53]"
                      : "text-[#2F6D53] border-transparent hover:text-accent-dark hover:border-[#2F6D53]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-2">
            {sessionUser ? (
              <Link href={dashboardHref} className={buttonVariants()}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className={buttonVariants({ variant: "ghost" })}>
                  Log in
                </Link>
                <Link href="/auth/signup" className={buttonVariants()}>
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger — large touch target, always visible */}
          <button
            type="button"
            className="lg:hidden flex flex-col gap-[5px] p-3 -mr-3 cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-6 h-[2px] bg-[#2F6D53] rounded-full" />
            <span className="block w-6 h-[2px] bg-[#2F6D53] rounded-full" />
            <span className="block w-6 h-[2px] bg-[#2F6D53] rounded-full" />
          </button>
        </div>
      </header>

      {mobileMenu}
    </>
  );
}
