"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GLOBAL_DESTINATIONS,
  GLOBAL_PROFESSIONS,
  GLOBAL_SUPPORT_NEEDS,
} from "@/lib/global-interest";

export default function GlobalInterestRequestPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [supportNeeds, setSupportNeeds] = useState<string[]>([]);
  const [consentToReview, setConsentToReview] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleSupportNeed(value: string) {
    setSupportNeeds((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/global-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          profession,
          otherProfession,
          supportNeeds,
          consentToReview,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to save your funding application.");
        return;
      }

      router.push("/global-dashboard/applications");
      router.refresh();
    } catch {
      setError("Unable to save your funding application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-[700px] mx-auto py-4">
      {/* Career Support breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-ink-soft mb-6">
        <Link href="/career-support" className="hover:text-[#2F6D53] transition-colors">
          Career Support
        </Link>
        <span>/</span>
        <Link href="/career-support/funding" className="hover:text-[#2F6D53] transition-colors">
          Support & Funding
        </Link>
        <span>/</span>
        <span className="text-ink">Apply</span>
      </div>

      <div className="mb-8">
        <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
          Global Careers — Funding Application
        </span>
        <h1 className="font-display font-bold text-[28px] max-sm:text-[24px] text-[#2F6D53] mt-1">
          What career outcome are you working towards?
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Tell us where you want to work and what support may help. Fill out this form to submit your
          global application. Our team will explain the available support options before
          you commit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="pt-8 border-t border-line mt-8 space-y-6">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-[13.5px] text-[#7a2c23]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="destination" className="block text-[14px] font-semibold mb-2">
            Target destination <span className="text-accent-dark">*</span>
          </label>
          <select
            id="destination"
            required
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="w-full bg-paper border border-line rounded-[10px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="">Select a region</option>
            {GLOBAL_DESTINATIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="profession" className="block text-[14px] font-semibold mb-2">
            Current profession or industry <span className="text-accent-dark">*</span>
          </label>
          <select
            id="profession"
            required
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
            className="w-full bg-paper border border-line rounded-[10px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="">Select an industry</option>
            {GLOBAL_PROFESSIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {profession === "other" && (
          <div>
            <label htmlFor="other-profession" className="block text-[14px] font-semibold mb-2">
              Profession or industry <span className="text-accent-dark">*</span>
            </label>
            <input
              id="other-profession"
              required
              maxLength={120}
              value={otherProfession}
              onChange={(event) => setOtherProfession(event.target.value)}
              placeholder="For example, graphic designer"
              className="w-full bg-paper border border-line rounded-[10px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        )}

        <fieldset>
          <legend className="block text-[14px] font-semibold mb-2">Support you may need</legend>
          <div className="space-y-3">
            {GLOBAL_SUPPORT_NEEDS.map((need) => (
              <label key={need.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportNeeds.includes(need.value)}
                  onChange={() => toggleSupportNeed(need.value)}
                  className="h-4 w-4 accent-[#2F6D53]"
                />
                <span className="text-[14px] text-ink-soft">{need.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-start gap-3 cursor-pointer border-t border-line pt-6">
          <input
            type="checkbox"
            required
            checked={consentToReview}
            onChange={(event) => setConsentToReview(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#2F6D53]"
          />
          <span className="text-[13px] text-ink-soft leading-relaxed">
            I understand this is an application for global support. The team will review my application and explain the available options before I make a commitment.
          </span>
        </label>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Submit application
          </Button>
        </div>
      </form>
    </div>
  );
}
