"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { signInAction } from "./actions";

/* ============================================================
   Sign In Page — Supabase Auth
   Three-portal role selector → login form (mirrors Sign Up flow).
   Uses Supabase Auth and redirects through the selected portal.
   ============================================================ */

type SelectedPortal = "work" | "global" | "hire" | null;

const PORTALS = [
  {
    key: "work" as const,
    title: "Find Work",
    subtitle: "For job seekers",
    description:
      "Local, remote, freelance, and contract opportunities — matched to your verified profile.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    iconBg: "bg-accent-soft",
    iconColor: "text-accent-dark",
    activeBorder: "border-accent ring-2 ring-accent/25",
    activeBg: "bg-accent-soft/30",
    defaultRedirect: "/dashboard",
  },
  {
    key: "global" as const,
    title: "Career Support",
    subtitle: "For global candidates",
    description:
      "Welcome back. Log in to access your career support dashboard and programs.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    iconBg: "bg-accent-soft",
    iconColor: "text-accent-dark",
    activeBorder: "border-accent ring-2 ring-accent/25",
    activeBg: "bg-accent-soft/30",
    defaultRedirect: "/career-support",
  },
  {
    key: "hire" as const,
    title: "Hire Talent",
    subtitle: "For employers & recruiters",
    description:
      "Post jobs, review applicants, shortlist candidates, and manage your pipeline.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    iconBg: "bg-accent-soft",
    iconColor: "text-accent-dark",
    activeBorder: "border-accent ring-2 ring-accent/25",
    activeBg: "bg-accent-soft/30",
    defaultRedirect: "/hire",
  },
];



/* ── Eye Icons ── */
function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
}
function EyeOffIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
}

function SignInContent() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  const callbackUrl = searchParams.get("callbackUrl");
  const initialPortal = (searchParams.get("role") as SelectedPortal) ?? null;
  const [selectedPortal, setSelectedPortal] = useState<SelectedPortal>(initialPortal);
  const [showForm, setShowForm] = useState(!!initialPortal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const portalData = PORTALS.find((p) => p.key === selectedPortal);
  const redirectTo = getSafeRedirect(
    nextUrl || callbackUrl,
    portalData?.defaultRedirect ?? "/dashboard"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use a server action so auth happens on the server.
      // Cookies are set via HTTP Set-Cookie headers — not document.cookie —
      // which means they work reliably through any proxy (ngrok, Cloudflare, etc).
      // The server action calls redirect() which does a full HTTP navigation,
      // triggering the middleware correctly regardless of the client's origin.
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("portal", selectedPortal ?? "work");
      formData.set("redirectTo", redirectTo);

      const result = await signInAction(null, formData);
      // If the action called redirect(), the browser navigates and we never reach here.
      // We only reach here if the action returned an error.
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      // Re-throw Next.js internal redirect errors so navigation is not blocked.
      if (
        err !== null &&
        typeof err === "object" &&
        "digest" in err &&
        String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }



  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Top bar */}
      <div className="flex items-center justify-center px-5 py-4 border-b border-line">
        <Link href="/" className="inline-block" aria-label="Go to home">
          <Logo />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center py-8 px-4 sm:py-12">
        <div className="w-full max-w-[640px] px-0">
          {!showForm ? (
            <>
              {/* ── Portal Selector ── */}
              <BackButton className="mb-6 self-start" />
              <div className="text-center mb-10">
                <h1 className="font-display font-bold text-[28px] text-[#2F6D53] mb-2">
                  Welcome back
                </h1>
                <p className="text-[15px] text-ink-soft">
                  Choose your portal to sign in
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PORTALS.map((portal) => {
                  const isSelected = selectedPortal === portal.key;
                  return (
                    <button
                      key={portal.key}
                      onClick={() => setSelectedPortal(portal.key)}
                      className={`w-full text-left border rounded-[14px] p-5 transition-all duration-200 cursor-pointer ${isSelected
                          ? `${portal.activeBorder} ${portal.activeBg}`
                          : "border-line/60 bg-transparent hover:border-line hover:bg-accent-soft/10"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${portal.iconBg} ${portal.iconColor}`}
                        >
                          {portal.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="font-display font-bold text-[17px] text-[#2F6D53]">
                              {portal.title}
                            </h2>
                          </div>
                          <div className="font-data text-[11.5px] text-accent-dark mb-1">
                            {portal.subtitle}
                          </div>
                          <p className="text-[13.5px] text-ink-soft leading-relaxed">
                            {portal.description}
                          </p>
                        </div>
                        {/* Radio indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isSelected
                              ? "border-accent bg-accent"
                              : "border-line"
                            }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="primary"
                className="w-full mt-6"
                disabled={!selectedPortal}
                onClick={() => setShowForm(true)}
              >
                {selectedPortal
                  ? `Continue to ${portalData?.title}`
                  : "Select a portal to continue"}
              </Button>


            </>
          ) : (
            /* ── Login Form ── */
            <div className="w-full max-w-[440px] mx-auto">
              {/* Back to portal select */}
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-ink mb-7 transition-colors"
              >
                ← Go back
              </button>

              {/* Selected portal chip */}
              {portalData && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold mb-6 ${portalData.iconBg} ${portalData.iconColor}`}
                >
                  <span className="w-4 h-4">{portalData.icon}</span>
                  {portalData.title}
                </div>
              )}

              <h1 className="font-display font-bold text-[24px] text-[#2F6D53] mb-1">
                Sign in to your account
              </h1>
              <p className="text-[14px] text-ink-soft mb-7">
                {portalData?.description}
              </p>

              <div className="bg-transparent border border-line/60 rounded-[14px] p-5 sm:p-8">
                {error && (
                  <div className="mb-4 px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-[13.5px] text-[#7a2c23]">
                    {error}
                  </div>
                )}

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit(e);
                  }}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-data text-[12.5px] text-ink-soft mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      inputMode="email"
                      className="w-full border border-line rounded-lg px-3 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label
                        htmlFor="password"
                        className="block font-data text-[12.5px] text-ink-soft"
                      >
                        Password
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="font-data text-[12.5px] text-accent-dark hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full border border-line rounded-lg px-3 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors pr-10"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    loading={loading}
                  >
                    Sign in
                  </Button>
                </form>


              </div>
            </div>
          )}

          <div className="mt-8 text-center text-[14px] text-ink-soft">
            New to Kaziin?{" "}
            <Link
              href={selectedPortal ? `/auth/signup?role=${selectedPortal}` : "/auth/signup"}
              className="text-accent-dark font-semibold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

function getSafeRedirect(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
