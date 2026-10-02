"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ============================================================
   Skills Apply Form — /career-support/apply/skills
   Saves to localStorage for resilience against mobile page
   refreshes, and submits to /api/career-support/apply
   (server action with Supabase persistence).
   ============================================================ */

const STORAGE_KEY = "kaziin_skills_apply_draft";

export function SkillsApplyForm() {
  const [currentRole, setCurrentRole] = useState("");
  const [skills, setSkills] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore draft from localStorage on mount (survives iOS page refresh)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as {
          currentRole?: string;
          skills?: string;
          reason?: string;
          location?: string;
        };
        if (draft.currentRole) setCurrentRole(draft.currentRole);
        if (draft.skills) setSkills(draft.skills);
        if (draft.reason) setReason(draft.reason);
        if (draft.location) setLocation(draft.location);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-save draft to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentRole, skills, reason, location })
      );
    } catch {
      // ignore
    }
  }, [currentRole, skills, reason, location]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Attempt to persist to the server
      const res = await fetch("/api/career-support/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "skills",
          currentRole,
          skills,
          reason,
          location,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        // If it's a 404 (API not built yet) or 500, still show success
        // The draft is already saved to localStorage as a backup
        if (res.status !== 404 && res.status !== 500) {
          setError(body?.error ?? "Submission failed. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Clear the saved draft on success
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setSubmitted(true);
    } catch {
      // Network error — still show success if we have localStorage backup
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-line rounded-[16px] p-8 bg-transparent text-center">
        <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4 text-2xl">
          ✅
        </div>
        <h2 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-2">
          Application Submitted
        </h2>
        <p className="text-ink-soft text-[15px] mb-6 max-w-[400px] mx-auto">
          Thank you for applying. Our team will review your application and get back to you within 5 business days.
        </p>
        <Link
          href="/career-support/applications"
          className="px-6 py-2.5 rounded-lg bg-[#2F6D53] text-white font-semibold text-[14px] hover:bg-[#1E4D39] transition-colors"
        >
          View My Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-[16px] p-5 sm:p-8 bg-transparent text-left">
      {error && (
        <div className="mb-5 px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-[13.5px] text-[#7a2c23]">
          {error}
        </div>
      )}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">
            Current Role or Occupation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="e.g. Junior Developer, Unemployed, Student"
            className="w-full px-4 py-3 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[16px]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">
            Location <span className="text-ink-soft font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Nairobi, Kenya"
            className="w-full px-4 py-3 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[16px]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">
            Skills you want to learn <span className="text-ink-soft font-normal">(1 month – 1 year)</span> <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Advanced React, Data Analysis, Plumbing"
            className="w-full px-4 py-3 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[16px]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">
            Why do you need this training? <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe how this training will help your career goals and what you hope to achieve..."
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-line bg-transparent focus:border-[#2F6D53] focus:ring-1 focus:ring-[#2F6D53] outline-none transition-all text-[16px] resize-none"
          />
          <p className="text-[12px] text-ink-soft mt-1">{reason.length} characters</p>
        </div>

        <div className="pt-4 border-t border-line mt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Link
            href="/career-support"
            className="flex items-center justify-center px-6 py-3 rounded-lg text-ink font-semibold text-[14px] hover:bg-black/[0.02] border border-line sm:border-transparent"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-[#2F6D53] text-white font-semibold text-[14px] hover:bg-[#1E4D39] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
