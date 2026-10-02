"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/badge";

export function AdminVerificationClient({ initialVerifications }: { initialVerifications: any[] }) {
  const router = useRouter();
  const [verifications, setVerifications] = useState(initialVerifications);
  const [loading, setLoading] = useState<string | null>(null);

  const pendingCount = verifications.filter(v => v.status === "pending").length;

  const handleUpdate = async (id: string, status: string) => {
    setLoading(id);
    try {
      const notes = prompt(`Enter notes for ${status} (optional):`) ?? "";
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { verification } = await res.json();
      
      setVerifications(verifications.map(v => v.id === id ? { ...v, status, notes } : v));
      router.refresh();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {pendingCount > 0 && (
        <div className="mb-6 rounded-[12px] bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <span className="text-[22px]">️</span>
          <p className="text-[14px] font-medium text-amber-800">
            {pendingCount} verification{pendingCount > 1 ? "s" : ""} pending review
          </p>
        </div>
      )}

      <div className="border border-line rounded-xl divide-y divide-line overflow-hidden bg-white">
        {verifications.length === 0 ? (
          <div className="px-6 py-10 text-center text-ink-soft text-[14px]">
            No verifications submitted yet.
          </div>
        ) : (
          verifications.map((v) => (
            <div key={v.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-medium text-[14.5px] capitalize flex items-center gap-2">
                  {v.type} Verification
                  <StatusBadge status={v.status} />
                </div>
                <div className="text-[13px] text-ink-soft mt-1">
                  Candidate: {v.candidate?.name || "Unknown"} ({v.candidate?.email || "No email"})
                </div>
                <div className="text-[13px] text-ink-soft mt-0.5">
                  Submitted: {new Date(v.created_at).toLocaleString()}
                </div>
                {v.document_urls && v.document_urls.length > 0 && (
                  <div className="mt-2">
                    <a href={v.document_urls[0]} target="_blank" rel="noreferrer" className="text-[12.5px] font-medium text-accent hover:underline">
                      View Document ↗
                    </a>
                  </div>
                )}
                {v.notes && <div className="text-[12.5px] text-ink-soft italic mt-2">Notes: "{v.notes}"</div>}
              </div>
              
              <div className="flex items-center gap-2">
                {v.status === "pending" && (
                  <>
                    <button 
                      onClick={() => handleUpdate(v.id, "verified")}
                      disabled={loading === v.id}
                      className="px-3 py-1.5 text-[12.5px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
                    >
                      {loading === v.id ? "..." : "Approve"}
                    </button>
                    <button 
                      onClick={() => handleUpdate(v.id, "failed")}
                      disabled={loading === v.id}
                      className="px-3 py-1.5 text-[12.5px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                    >
                      {loading === v.id ? "..." : "Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
