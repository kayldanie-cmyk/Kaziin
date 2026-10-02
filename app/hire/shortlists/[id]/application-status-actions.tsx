"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "screening", label: "Screening" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
] as const;

export function ApplicationStatusActions({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(nextStatus: string) {
    if (nextStatus === status || saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not update application.");
        return;
      }

      setStatus(nextStatus);
      router.refresh();
    } catch {
      setError("Could not update application.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <select
        value={status}
        onChange={(event) => handleStatusChange(event.target.value)}
        disabled={saving}
        className="border border-line rounded-lg px-2 py-1.5 text-[12px] font-data bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors disabled:opacity-50"
        aria-label="Application status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="max-w-[220px] text-right text-[11.5px] font-data text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
