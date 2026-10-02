"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ============================================================
   VerifyToggle — toggle employer verification status.
   ============================================================ */

export function VerifyToggle({
  employerId,
  verified,
}: {
  employerId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(verified);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);
    const supabase = createClient();
    const newVal = !isVerified;

    const { error } = await supabase
      .from("employers")
      .update({
        verified: newVal,
        verification_status: newVal ? "verified" : "not_started",
      })
      .eq("id", employerId);

    if (!error) {
      setIsVerified(newVal);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        isVerified ? "bg-accent" : "bg-line"
      }`}
      aria-label={isVerified ? "Revoke verification" : "Verify employer"}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          isVerified ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
