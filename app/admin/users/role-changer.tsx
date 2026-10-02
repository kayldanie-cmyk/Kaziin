"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";

export function RoleChanger({
  userId,
  currentRole,
  currentEmployerId,
  employers,
}: {
  userId: string;
  currentRole: string;
  currentEmployerId: string | null;
  employers: { id: string; name: string | null }[];
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [employerId, setEmployerId] = useState(currentEmployerId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsEmployer = role === "recruiter";
  const dirty = role !== currentRole || employerId !== (currentEmployerId ?? "");

  async function handleSave() {
    if (!dirty || saving) return;
    if (needsEmployer && !employerId) {
      setError("Choose an employer for recruiter access.");
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role,
        employer_id: needsEmployer ? employerId : null,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update access:", updateError);
      setError("Could not save access changes.");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="inline-flex flex-col items-end gap-2">
      <div className="flex justify-end gap-2 flex-wrap">
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={saving}
          className="w-36 text-[12px] font-data py-2 px-3 min-h-[34px]"
          aria-label="User role"
        >
          <option value="candidate">Candidate</option>
          <option value="global_candidate">Global candidate</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </Select>

        {needsEmployer ? (
          <Select
            value={employerId}
            onChange={(e) => setEmployerId(e.target.value)}
            disabled={saving || employers.length === 0}
            className="w-48 text-[12px] font-data py-2 px-3 min-h-[34px]"
            aria-label="Recruiter employer"
          >
            <option value="">Choose employer</option>
            {employers.map((employer) => (
              <option key={employer.id} value={employer.id}>
                {employer.name ?? "Unnamed employer"}
              </option>
            ))}
          </Select>
        ) : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving || (needsEmployer && !employerId)}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {saving ? "Saving" : "Save"}
        </button>
      </div>

      {error ? (
        <p className="max-w-[220px] text-right text-[11.5px] font-data text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
