"use client";

import type React from "react";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function UpdatePasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not update your password. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <div className="flex items-center justify-between px-8 py-5 border-b border-line max-md:px-5">
        <Link href="/" aria-label="Kaziin home" className="text-ink-soft hover:text-ink transition-colors">
          <Logo size={20} />
        </Link>
        <Link href="/auth/signin" className="text-[14px] text-accent-dark font-medium hover:underline">
          Sign in
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[440px] border border-line/60 rounded-[14px] p-8">
          <h1 className="font-display font-bold text-[24px] text-[#2F6D53] mb-2">
            Choose a new password
          </h1>
          <p className="text-[14px] text-ink-soft mb-7">
            Set a new password for your Kaziin account.
          </p>

          {error ? (
            <div className="mb-4 px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-[13.5px] text-[#7a2c23]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="new-password"
              label="New password"
              value={password}
              onChange={setPassword}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Update password
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block font-data text-[12.5px] text-ink-soft mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className="w-full border border-line rounded-lg px-3 py-2.5 text-[15px] bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors pr-10"
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
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordContent />
    </Suspense>
  );
}
