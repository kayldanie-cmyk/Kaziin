"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";

/* ============================================================
   JobActions — dropdown to change job status or delete.
   ============================================================ */

export function JobActions({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === "delete") {
      if (!confirm("Are you sure you want to delete this job?")) return;
      setSaving(true);
      const supabase = createClient();
      await supabase.from("jobs").delete().eq("id", jobId);
      router.refresh();
      return;
    }

    if (newStatus === status) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (!error) {
      setStatus(newStatus);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <Select
      value={status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={saving}
      className="w-[110px] text-[12px] font-data py-1.5 px-2 min-h-[30px]"
    >
      <option value="published">Published</option>
      <option value="draft">Draft</option>
      <option value="paused">Paused</option>
      <option value="filled">Filled</option>
      <option value="expired">Expired</option>
      <option value="delete"> Delete</option>
    </Select>
  );
}
