"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ============================================================
   Upload Credential — Phase 7 entry point
   Candidate submits completed training credential.
   On submission → saved to training_credentials table.
   Admin verifies → skills_applied triggers profile/matching update.
   ============================================================ */

interface CredentialData {
  title: string;
  issuer: string;
  issued_date: string;
  expiry_date: string;
  credential_url: string;
}

export function UploadCredentialForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [data, setData] = useState<CredentialData>({
    title: "",
    issuer: "",
    issued_date: "",
    expiry_date: "",
    credential_url: "",
  });

  function update<K extends keyof CredentialData>(key: K, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function canSubmit(): boolean {
    return Boolean(data.title.trim() && data.issuer.trim() && data.issued_date);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/career-support/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/signin?next=/career-support/training/upload-credential");
          return;
        }
        throw new Error(json.error ?? "Something went wrong. Please try again.");
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen py-16 flex items-start justify-center">
        <div className="max-w-[560px] w-full px-5">
          <div className="text-center py-12">
            <div className="text-[40px] mb-4"></div>
            <h2 className="font-display font-bold text-[26px] text-[#2F6D53] mb-3">
              Credential submitted
            </h2>
            <p className="text-[15px] text-ink-soft leading-relaxed mb-6">
              Your credential has been submitted for verification. Once verified, your profile and job
              matches will be updated automatically. You will be notified when the review is complete.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/career-support/training/my-courses"
                className="px-5 py-2.5 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#2F6D53]/90 transition-colors"
              >
                View my courses
              </Link>
              <Link
                href="/career-support/plan"
                className="px-5 py-2.5 rounded-[10px] border border-line text-[#2F6D53] font-medium text-[14px] hover:border-[#2F6D53]/40 transition-colors"
              >
                View career plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 max-md:py-10">
      <div className="max-w-[600px] mx-auto px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-ink-soft mb-8">
          <Link href="/career-support" className="hover:text-[#2F6D53] transition-colors">
            Career Support
          </Link>
          <span>/</span>
          <Link href="/career-support/training/my-courses" className="hover:text-[#2F6D53] transition-colors">
            My Courses
          </Link>
          <span>/</span>
          <span className="text-ink">Upload Credential</span>
        </div>

        {/* Header */}
        <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
          Upload Credential
        </span>
        <h1 className="font-display font-bold text-[32px] max-sm:text-[26px] text-[#2F6D53] mt-1 mb-2 leading-tight">
          Share your qualification.
        </h1>
        <p className="text-ink-soft text-[15px] leading-relaxed mb-8">
          Upload a completed training certificate or qualification. After verification, your Kaziin
          profile is updated and your job matches recalculate automatically.
        </p>

        {/* What happens after — visible upfront */}
        <div className="mb-8 p-4 bg-accent-soft border border-[#2F6D53]/20 rounded-[12px]">
          <div className="font-display font-semibold text-[14px] text-[#2F6D53] mb-2">
            What happens next
          </div>
          {[
            "Our team reviews your credential",
            "Your skills profile is updated",
            "Job matching recalculates with your new qualification",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px] text-[#2F6D53]/80 mt-1">
              <span className="font-data text-[11px]">{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Credential title */}
          <div>
            <label
              htmlFor="cred-title"
              className="font-display font-semibold text-[15px] block mb-2"
            >
              Credential / qualification name <span className="text-red-500">*</span>
            </label>
            <input
              id="cred-title"
              type="text"
              placeholder="e.g. Level 3 Electrical Installation Certificate"
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-[10px] border border-line focus:border-[#2F6D53] focus:outline-none text-[14.5px] bg-transparent"
            />
          </div>

          {/* Issuer */}
          <div>
            <label
              htmlFor="cred-issuer"
              className="font-display font-semibold text-[15px] block mb-2"
            >
              Issuing body / provider <span className="text-red-500">*</span>
            </label>
            <input
              id="cred-issuer"
              type="text"
              placeholder="e.g. City & Guilds, BTEC, Coursera"
              value={data.issuer}
              onChange={(e) => update("issuer", e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-[10px] border border-line focus:border-[#2F6D53] focus:outline-none text-[14.5px] bg-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="cred-issued-date"
                className="font-display font-semibold text-[15px] block mb-2"
              >
                Date issued <span className="text-red-500">*</span>
              </label>
              <input
                id="cred-issued-date"
                type="date"
                value={data.issued_date}
                onChange={(e) => update("issued_date", e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-[10px] border border-line focus:border-[#2F6D53] focus:outline-none text-[14.5px] bg-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="cred-expiry-date"
                className="font-display font-semibold text-[15px] block mb-2"
              >
                Expiry date
                <span className="text-[12px] font-normal text-ink-soft ml-1">(optional)</span>
              </label>
              <input
                id="cred-expiry-date"
                type="date"
                value={data.expiry_date}
                onChange={(e) => update("expiry_date", e.target.value)}
                className="w-full px-4 py-3.5 rounded-[10px] border border-line focus:border-[#2F6D53] focus:outline-none text-[14.5px] bg-transparent"
              />
            </div>
          </div>

          {/* External URL */}
          <div>
            <label
              htmlFor="cred-url"
              className="font-display font-semibold text-[15px] block mb-2"
            >
              Verification URL
              <span className="text-[12px] font-normal text-ink-soft ml-1">(optional)</span>
            </label>
            <input
              id="cred-url"
              type="url"
              placeholder="https://verify.example.com/credential/abc123"
              value={data.credential_url}
              onChange={(e) => update("credential_url", e.target.value)}
              className="w-full px-4 py-3.5 rounded-[10px] border border-line focus:border-[#2F6D53] focus:outline-none text-[14.5px] bg-transparent"
            />
            <p className="text-[12.5px] text-ink-soft mt-1.5">
              If your certificate has an online verification link, paste it here.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="p-4 rounded-[10px] bg-red-50 border border-red-200 text-[14px] text-red-700"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              id="upload-credential-submit-btn"
              disabled={!canSubmit() || saving}
              className="px-6 py-3 rounded-[10px] bg-[#2F6D53] text-white font-bold text-[14.5px] hover:bg-[#2F6D53]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Submitting…" : "Submit credential"}
            </button>
            <Link
              href="/career-support/training/my-courses"
              className="text-[14px] text-ink-soft hover:text-[#2F6D53] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
