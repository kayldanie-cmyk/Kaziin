"use client";

import type React from "react";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/update-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch {
      setError("Could not send the reset email. Please try again.");
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
          Back to sign in
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[440px] border border-line/60 rounded-[14px] p-8">
          <h1 className="font-display font-bold text-[24px] text-[#2F6D53] mb-2">
            Reset your password
          </h1>
          <p className="text-[14px] text-ink-soft mb-7">
            Enter your account email and we will send a secure reset link.
          </p>

          {message ? (
            <div className="mb-4 px-4 py-3 bg-accent-soft border border-accent/20 rounded-lg text-[13.5px] text-accent-dark">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-[13.5px] text-[#7a2c23]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-line rounded-lg px-3 py-2.5 text-[15px] bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Send reset link
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}
