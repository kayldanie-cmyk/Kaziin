"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

export function VerificationClient({ initialVerifications }: { initialVerifications: any[] }) {
  const router = useRouter();
  const [verifications, setVerifications] = useState(initialVerifications);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "identity", documentUrl: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, documentUrl would be set via a file upload to Supabase Storage.
      // We simulate it here as a text input for the URL.
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      const { verification } = await res.json();
      setVerifications([verification, ...verifications]);
      setShowForm(false);
      setForm({ type: "identity", documentUrl: "", notes: "" });
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-semibold text-[18px]">Your Verifications</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg hover:bg-accent/90"
        >
          {showForm ? "Cancel" : "+ Request Verification"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 border border-line rounded-xl bg-paper">
          <h3 className="font-semibold mb-4 text-[15px]">Submit Document</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink-soft mb-1">Type</label>
              <Select 
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px]"
                value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              >
                <option value="identity">Identity (ID/Passport)</option>
                <option value="education">Education (Degree/Transcript)</option>
                <option value="certification">Certification</option>
                <option value="license">Professional License</option>
              </Select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-ink-soft mb-1">Document URL (Simulation)</label>
              <input 
                required type="url"
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px]"
                placeholder="https://example.com/doc.pdf"
                value={form.documentUrl} onChange={e => setForm({...form, documentUrl: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-ink-soft mb-1">Notes (Optional)</label>
              <textarea 
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px]"
                rows={2}
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="mt-2 px-4 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      )}

      {verifications.length === 0 ? (
        <div className="text-center py-10 border border-line rounded-xl bg-paper">
          <p className="text-ink-soft text-[14.5px]">No verifications submitted yet.</p>
        </div>
      ) : (
        <div className="border border-line rounded-xl divide-y divide-line overflow-hidden">
          {verifications.map(v => (
            <div key={v.id} className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-[15px] capitalize">{v.type} Verification</h4>
                <p className="text-[13px] text-ink-soft mt-1">
                  Submitted {new Date(v.created_at).toLocaleDateString()}
                </p>
                {v.notes && <p className="text-[13px] text-ink-soft italic mt-1">"{v.notes}"</p>}
              </div>
              <div>
                <StatusBadge status={v.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
