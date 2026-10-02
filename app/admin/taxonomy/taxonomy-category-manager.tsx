"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  families?: { count: number }[];
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function TaxonomyCategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", sort_order: "0" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: editId ? f.slug : slugify(name) }));
  };

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", icon: "", sort_order: "0" });
    setShowAdd(false);
    setEditId(null);
    setError(null);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "", icon: cat.icon ?? "", sort_order: String(cat.sort_order) });
    setShowAdd(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0, ...(editId ? { id: editId } : {}) };
      const res = await fetch("/api/admin/taxonomy/categories", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.refresh();
      resetForm();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}" and all its job types and roles? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/taxonomy/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setCategories(c => c.filter(x => x.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-[20px]">Job Categories</h2>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg hover:bg-accent/90 transition-colors"
        >
          + Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13.5px] rounded-lg">{error}</div>
      )}

      {/* Add / Edit Form */}
      {(showAdd || editId) && (
        <div className="mb-6 p-5 border-2 border-accent/30 bg-accent/5 rounded-[14px]">
          <h3 className="font-semibold text-[16px] mb-4">{editId ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Name *</label>
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Technology & IT"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Slug *</label>
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="e.g. technology-it"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Icon (emoji or SVG path)</label>
              <input
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="e.g. "
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Sort Order</label>
              <input
                type="number"
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Description</label>
              <textarea
                className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent resize-none"
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={loading || !form.name || !form.slug}
              className="px-5 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg disabled:opacity-50 hover:bg-accent/90 transition-colors"
            >
              {loading ? "Saving…" : editId ? "Update Category" : "Create Category"}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-line rounded-lg text-[13.5px] hover:bg-paper transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="border border-line rounded-[14px] overflow-hidden">
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-paper border-b border-line text-[12px] font-bold uppercase tracking-wider text-ink-soft">
          <div>Icon</div>
          <div>Name / Slug</div>
          <div>Description</div>
          <div>Job Types</div>
          <div>Actions</div>
        </div>
        {categories.length === 0 && (
          <div className="px-5 py-10 text-center text-ink-soft text-[14.5px]">
            No categories yet. Add your first one above.
          </div>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-line last:border-0 hover:bg-paper/50 transition-colors">
            <div className="text-[22px]">{cat.icon || ""}</div>
            <div>
              <div className="font-semibold text-[15px]">{cat.name}</div>
              <div className="font-data text-[12px] text-ink-soft">{cat.slug}</div>
            </div>
            <div className="text-[13.5px] text-ink-soft line-clamp-2">{cat.description || "—"}</div>
            <div className="font-data text-[14px] text-center">
              {cat.families?.[0]?.count ?? 0}
              <span className="text-ink-soft text-[11px] block">job types</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/taxonomy/${cat.id}`}
                className="px-3 py-1.5 bg-accent text-white text-[12.5px] font-semibold rounded-md hover:bg-accent/90 transition-colors"
              >
                Manage →
              </Link>
              <button
                onClick={() => startEdit(cat)}
                className="px-3 py-1.5 border border-line text-[12.5px] rounded-md hover:bg-paper transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="px-3 py-1.5 border border-red-200 text-red-600 text-[12.5px] rounded-md hover:bg-red-50 transition-colors"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
