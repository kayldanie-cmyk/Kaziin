"use client";

import type React from "react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { signUpAction } from "./actions";

/* ============================================================
   Sign Up — 3-portal role selector then registration form.
   URL: /auth/signup?role=work|global|hire
   ============================================================ */

type Role = "work" | "global" | "hire" | null;

const ROLES = [
  {
    key: "work" as const,
    title: "Find Work",
    subtitle: "For job seekers",
    description: "Local, remote, freelance, and contract opportunities — matched to your verified profile.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    iconBg: "bg-accent-soft",
    iconColor: "text-accent-dark",
    activeBorder: "border-accent ring-2 ring-accent/25",
    activeBg: "bg-accent-soft/30",
    tag: "Free to join",
  },
  {
    key: "global" as const,
    title: "Career Support",
    subtitle: "For global candidates",
    description: "Discover career paths, find training, and explore funding to support your goals.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    iconBg: "bg-accent-soft",
    iconColor: "text-accent-dark",
    activeBorder: "border-accent ring-2 ring-accent/25",
    activeBg: "bg-accent-soft/30",
    tag: "Funding available",
  },
  {
    key: "hire" as const,
    title: "Hire Talent",
    subtitle: "For employers & recruiters",
    description: "Post jobs, review applicants, shortlist candidates, and manage your pipeline.",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    iconBg: "bg-accent-soft",
    iconColor: "text-accent-dark",
    activeBorder: "border-accent ring-2 ring-accent/25",
    activeBg: "bg-accent-soft/30",
    tag: "Teams welcome",
  },
];

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) ?? null;
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [showForm, setShowForm] = useState(!!initialRole);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const selectedRoleData = ROLES.find((r) => r.key === selectedRole);

  const nextParam = searchParams.get("next");
  const callbackParam = searchParams.get("callbackUrl");
  const fallbackHref =
    selectedRole === "global"
      ? "/career-support"
      : selectedRole === "hire"
        ? "/hire"
        : "/dashboard";
        
  const dashboardHref = getSafeRedirect(nextParam || callbackParam, fallbackHref);

  function handleRoleSelect(key: "work" | "global" | "hire") {
    setSelectedRole(key);
    setShowForm(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("firstName", firstName);
      formData.set("lastName", lastName);
      formData.set("role", selectedRole ?? "work");

      const result = await signUpAction(null, formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (
        err !== null &&
        typeof err === "object" &&
        "digest" in err &&
        String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setError("Something went wrong. Please try again.");
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
        <div className="w-full max-w-[640px]">
          {!showForm ? (
            <>
              <div className="flex flex-col">
                <BackButton href="/" className="mb-6" />
              </div>
              <div className="text-center mb-10">
                <h1 className="font-display font-bold text-[28px] text-[#2F6D53] mb-2">Join Kaziin</h1>
                <p className="text-[15px] text-ink-soft">
                  Choose how you&apos;d like to use the platform
                </p>
              </div>

              {/* Role cards */}
              <div className="grid grid-cols-1 gap-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      onClick={() => handleRoleSelect(role.key)}
                      className={`w-full text-left border rounded-[14px] p-5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? `${role.activeBorder} ${role.activeBg}`
                          : "border-line/60 bg-transparent hover:border-line hover:bg-accent-soft/10"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${role.iconBg} ${role.iconColor}`}
                        >
                          {role.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="font-display font-bold text-[17px] text-[#2F6D53]">{role.title}</h2>
                            <span className="font-data text-[10.5px] text-[#2F6D53] bg-[#2F6D53]/10 border border-[#2F6D53]/20 px-2 py-0.5 rounded-full">
                              {role.tag}
                            </span>
                          </div>
                          <div className="font-data text-[11.5px] text-accent-dark mb-1">{role.subtitle}</div>
                          <p className="text-[13.5px] text-ink-soft leading-relaxed">{role.description}</p>
                        </div>
                        {/* Radio */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected ? "border-accent bg-accent" : "border-line"
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
                disabled={!selectedRole}
                onClick={() => setShowForm(true)}
              >
                {selectedRole
                  ? `Continue as ${selectedRoleData?.title}`
                  : "Select a portal to continue"}
              </Button>
            </>
          ) : (
            <div className="w-full max-w-[440px] mx-auto">
              {/* Back to role select */}
              <div className="mb-7">
                <BackButton label="Choose a different role" onClick={() => setShowForm(false)} />
              </div>

              {/* Selected role chip */}
              {selectedRoleData && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold mb-6 ${selectedRoleData.iconBg} ${selectedRoleData.iconColor}`}
                >
                  <span className="w-4 h-4">{selectedRoleData.icon}</span>
                  {selectedRoleData.title}
                </div>
              )}

              <h1 className="font-display font-bold text-[24px] text-[#2F6D53] mb-1">Create your account</h1>
              <p className="text-[14px] text-ink-soft mb-7">
                {selectedRoleData?.description}
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
                    void handleRegister(e);
                  }}
                >
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      placeholder="Alex"
                      className="w-full border border-line rounded-lg px-3 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      placeholder="Johnson"
                      className="w-full border border-line rounded-lg px-3 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="su-email" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="su-email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    className="w-full border border-line rounded-lg px-3 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="su-password" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="su-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Must be at least 8 characters"
                      className="w-full border border-line rounded-lg px-3 py-3 text-[16px] bg-transparent focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  loading={loading}
                >
                  Create account
                </Button>
              </form>


            </div>

            <p className="mt-6 text-center text-[12.5px] text-ink-soft leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="underline hover:text-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-ink">
                Privacy Policy
              </Link>
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-[14px] text-ink-soft">
          Already have an account?{" "}
          <Link
            href={selectedRole ? `/auth/signin?role=${selectedRole}` : "/auth/signin"}
            className="text-accent-dark font-semibold hover:underline"
          >
            Log in
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-paper"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}

function getSafeRedirect(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
