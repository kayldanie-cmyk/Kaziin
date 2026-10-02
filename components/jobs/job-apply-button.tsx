"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function JobApplyButton({
  jobId,
  jobSlug,
  candidateId,
}: {
  jobId: string;
  jobSlug: string;
  candidateId?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "duplicate" | "error"
  >("idle");
  const router = useRouter();

  async function handleApply() {
    if (!candidateId) {
      router.push(`/auth/signin?callbackUrl=/jobs/${jobSlug}`);
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (response.status === 409) {
        setStatus("duplicate");
        return;
      }

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <Button
        variant="ghost"
        className="w-full mt-4 py-3.5 text-[15px] rounded-[9px] bg-accent-soft text-accent-dark pointer-events-none"
      >
        {status === "success" ? "Application submitted" : "Already applied"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        className="w-full mt-4 py-3.5 text-[15px] rounded-[9px]"
        onClick={handleApply}
        loading={status === "loading"}
      >
        Apply now
      </Button>
      {status === "error" && (
        <div className="text-[13px] text-danger mt-2 text-center">
          Failed to submit application. Please try again.
        </div>
      )}
    </>
  );
}
