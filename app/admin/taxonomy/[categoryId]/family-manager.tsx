"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Family {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  roles?: { count: number }[];
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function FamilyManager({
  categoryId, categoryName, initialFamilies,
}: {
  categoryId: string; categoryName: string; initialFamilies: Family[];
}) {
  const [families, setFamilies] = useState<Family[]>(initialFamilies);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", sort_order: "0" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resetForm = () => { setForm({ name: "", slug: "", description: "", sort_order: "0" }); setShowAdd(false); setEditId(null); setError(null); };
  const startEdit = (f: Family) => { setEditId(f.id); setForm({ name: f.name, slug: f.slug, description: f.description ?? "", sort_order: String(f.sort_order) }); setShowAdd(false); };

  const handleSave = async () => {
    setLoading(true); setError(null);
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0, category_id: categoryId, ...(editId ? { id: editId } : {}) };
      const res = await fetch("/api/admin/taxonomy/families", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.refresh(); resetForm();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete job type "${name}" and all its roles?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/taxonomy/families?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setFamilies(f => f.filter(x => x.id !== id));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-[20px]">Job Types in <span className="text-accent">{categoryName}</span></h2>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg hover:bg-accent/90 transition-colors"
        >
          + Add Job Type
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13.5px] rounded-lg">{error}</div>}

      {(showAdd || editId) && (
        <div className="mb-6 p-5 border-2 border-accent/30 bg-accent/5 rounded-[14px]">
          <h3 className="font-semibold text-[16px] mb-4">{editId ? "Edit Job Type" : "New Job Type"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Name *</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editId ? f.slug : slugify(e.target.value) }))} placeholder="e.g. Software Development" />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Slug *</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Sort Order</label>
              <input type="number" className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Description</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={loading || !form.name || !form.slug}
              className="px-5 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg disabled:opacity-50 hover:bg-accent/90 transition-colors">
              {loading ? "Saving…" : editId ? "Update" : "Create Job Type"}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-line rounded-lg text-[13.5px] hover:bg-paper transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="border border-line rounded-[14px] overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-paper border-b border-line text-[12px] font-bold uppercase tracking-wider text-ink-soft">
          <div>Name / Slug</div><div>Description</div><div>Roles</div><div>Actions</div>
        </div>
        {families.length === 0 && (
          <div className="px-5 py-10 text-center text-ink-soft text-[14.5px]">No job types yet. Add your first one.</div>
        )}
        {families.map(fam => (
          <div key={fam.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-line last:border-0 hover:bg-paper/50">
            <div>
              <div className="font-semibold text-[15px]">{fam.name}</div>
              <div className="font-data text-[12px] text-ink-soft">{fam.slug}</div>
            </div>
            <div className="text-[13.5px] text-ink-soft">{fam.description || "—"}</div>
            <div className="font-data text-[14px] text-center">{fam.roles?.[0]?.count ?? 0}<span className="text-ink-soft text-[11px] block">roles</span></div>
            <div className="flex gap-2">
              <Link href={`/admin/taxonomy/${categoryId}/${fam.id}`}
                className="px-3 py-1.5 bg-accent text-white text-[12.5px] font-semibold rounded-md hover:bg-accent/90 transition-colors">Roles →</Link>
              <button onClick={() => startEdit(fam)} className="px-3 py-1.5 border border-line text-[12.5px] rounded-md hover:bg-paper transition-colors">Edit</button>
              <button onClick={() => handleDelete(fam.id, fam.name)} className="px-3 py-1.5 border border-red-200 text-red-600 text-[12.5px] rounded-md hover:bg-red-50 transition-colors">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
