"use client";

import { useState } from "react";
import { adminAuthAction } from "./actions";
import { Button } from "@/components/ui/button";

export default function AdminSignupPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    formData.append("isLogin", String(isLogin));

    const result = await adminAuthAction(formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-5">
      <div className="max-w-[400px] w-full">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-[28px] text-ink">
            Admin {isLogin ? "Login" : "Sign Up"}
          </h1>
          <p className="text-ink-soft text-[15px] mt-2">
            Secure portal for site administrators
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pt-8 border-t border-line mt-8">
          {error && (
            <div className="mb-6 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-[13.5px] text-[#7a2c23]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-paper border border-line rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  className="w-full bg-paper border border-line rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-shadow pr-10"
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

            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">
                Admin Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  name="secret"
                  required
                  className="w-full bg-paper border border-line rounded-[10px] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-shadow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={pending} className="w-full mt-6" size="lg">
            {pending ? "Authenticating..." : isLogin ? "Sign in to Dashboard" : "Create Admin Account"}
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[13px] text-accent-dark hover:underline font-medium"
            >
              {isLogin ? "Need to create an admin account?" : "Already have an admin account?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
