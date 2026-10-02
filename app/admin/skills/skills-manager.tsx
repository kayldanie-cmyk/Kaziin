"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

const SKILL_TYPES = ["technical", "soft", "trade", "language", "tool"] as const;
type SkillType = typeof SKILL_TYPES[number];

const TYPE_COLORS: Record<SkillType, string> = {
  technical: "bg-accent-soft text-accent-dark border-[#2F6D53]/20",
  soft:      "bg-purple-50 text-purple-700 border-purple-200",
  trade:     "bg-amber-50 text-amber-700 border-amber-200",
  language:  "bg-green-50 text-green-700 border-green-200",
  tool:      "bg-rose-50 text-rose-700 border-rose-200",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface SkillRow {
  id: string;
  canonical_name: string;
  slug: string;
  description: string | null;
  category: string | null;
  skill_type: SkillType;
  verified: boolean;
  sort_order: number;
  aliases: { id: string; alias: string }[];
}

export function SkillsManager({
  initialSkills, total, page, pageSize, filterQ, filterType,
}: {
  initialSkills: SkillRow[];
  total: number;
  page: number;
  pageSize: number;
  filterQ: string;
  filterType: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [skills, setSkills] = useState<SkillRow[]>(initialSkills);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAlias, setNewAlias] = useState("");
  const [aliasSkillId, setAliasSkillId] = useState<string | null>(null);

  const [form, setForm] = useState({
    canonical_name: "", slug: "", description: "", category: "", skill_type: "technical" as SkillType, sort_order: "0",
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/admin/skills?${params.toString()}`);
  };

  const resetForm = () => {
    setForm({ canonical_name: "", slug: "", description: "", category: "", skill_type: "technical", sort_order: "0" });
    setShowAdd(false); setEditId(null); setError(null);
  };

  const startEdit = (s: SkillRow) => {
    setEditId(s.id);
    setForm({ canonical_name: s.canonical_name, slug: s.slug, description: s.description ?? "", category: s.category ?? "", skill_type: s.skill_type, sort_order: String(s.sort_order) });
    setShowAdd(false);
  };

  const handleSave = async () => {
    setLoading(true); setError(null);
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0, ...(editId ? { id: editId } : {}) };
      const res = await fetch("/api/admin/skills", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.refresh(); resetForm();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete skill "${name}"? This will also remove all its aliases and relationships.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSkills((s) => s.filter((x) => x.id !== id));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleAddAlias = async (skillId: string) => {
    if (!newAlias.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills/aliases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: skillId, alias: newAlias.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { alias } = await res.json();
      setSkills((s) => s.map((x) => x.id === skillId ? { ...x, aliases: [...x.aliases, alias] } : x));
      setNewAlias("");
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleRemoveAlias = async (aliasId: string, skillId: string) => {
    try {
      await fetch(`/api/admin/skills/aliases?id=${aliasId}`, { method: "DELETE" });
      setSkills((s) => s.map((x) => x.id === skillId ? { ...x, aliases: x.aliases.filter((a) => a.id !== aliasId) } : x));
    } catch (e: any) { setError(e.message); }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent w-[240px]"
          placeholder="Search skills…"
          defaultValue={filterQ}
          onChange={(e) => updateFilter("q", e.target.value)}
        />
        <Select
          className="w-[180px] py-2"
          defaultValue={filterType}
          onChange={(e) => updateFilter("type", e.target.value)}
        >
          <option value="">All Types</option>
          {SKILL_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </Select>
        <div className="ml-auto">
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg hover:bg-accent/90 transition-colors"
          >
            + Add Skill
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="text-[13px] text-ink-soft mb-4">{total} skill{total !== 1 ? "s" : ""} total</div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13.5px] rounded-lg">{error}</div>}

      {/* Add / Edit Form */}
      {(showAdd || editId) && (
        <div className="mb-6 p-5 border-2 border-accent/30 bg-accent/5 rounded-[14px]">
          <h3 className="font-semibold text-[16px] mb-4">{editId ? "Edit Skill" : "New Skill"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Canonical Name *</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.canonical_name}
                onChange={(e) => setForm((f) => ({ ...f, canonical_name: e.target.value, slug: editId ? f.slug : slugify(e.target.value) }))}
                placeholder="e.g. Microsoft Excel" />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Slug *</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Skill Type *</label>
              <Select className="w-full py-2"
                value={form.skill_type} onChange={(e) => setForm((f) => ({ ...f, skill_type: e.target.value as SkillType }))}>
                {SKILL_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Category (broad)</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Technology & IT, General" />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Sort Order</label>
              <input type="number" className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Description</label>
              <textarea className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent resize-none"
                rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={loading || !form.canonical_name || !form.slug}
              className="px-5 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg disabled:opacity-50 hover:bg-accent/90 transition-colors">
              {loading ? "Saving…" : editId ? "Update Skill" : "Create Skill"}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-line rounded-lg text-[13.5px] hover:bg-paper transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Skills Table */}
      <div className="border border-line rounded-[14px] overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-paper border-b border-line text-[12px] font-bold uppercase tracking-wider text-ink-soft">
          <div>Canonical Name</div>
          <div>Type</div>
          <div>Aliases</div>
          <div>Verified</div>
          <div>Actions</div>
        </div>

        {skills.length === 0 && (
          <div className="px-5 py-10 text-center text-ink-soft text-[14.5px]">No skills found. Add your first one or run the migration.</div>
        )}

        {skills.map((skill) => (
          <div key={skill.id}>
            <div
              className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-line last:border-0 hover:bg-paper/50 transition-colors cursor-pointer"
              onClick={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
            >
              <div>
                <div className="font-semibold text-[15px]">{skill.canonical_name}</div>
                <div className="font-data text-[12px] text-ink-soft">{skill.slug}</div>
                {skill.category && <div className="text-[12px] text-ink-soft mt-0.5">{skill.category}</div>}
              </div>
              <div>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${TYPE_COLORS[skill.skill_type]}`}>
                  {skill.skill_type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {skill.aliases.slice(0, 3).map((a) => (
                  <span key={a.id} className="text-[11px] bg-paper border border-line px-1.5 py-0.5 rounded">{a.alias}</span>
                ))}
                {skill.aliases.length > 3 && (
                  <span className="text-[11px] text-ink-soft">+{skill.aliases.length - 3}</span>
                )}
              </div>
              <div className="text-center">
                {skill.verified
                  ? <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full"> Verified</span>
                  : <span className="text-[11px] text-ink-soft">—</span>
                }
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => startEdit(skill)} className="px-3 py-1.5 border border-line text-[12.5px] rounded-md hover:bg-paper transition-colors">Edit</button>
                <button onClick={() => handleDelete(skill.id, skill.canonical_name)} className="px-3 py-1.5 border border-red-200 text-red-600 text-[12.5px] rounded-md hover:bg-red-50 transition-colors">Del</button>
              </div>
            </div>

            {/* Expanded: Alias Manager */}
            {expandedId === skill.id && (
              <div className="px-8 py-4 bg-paper/60 border-b border-line" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-semibold text-[13.5px] mb-3">Aliases for <span className="text-accent">{skill.canonical_name}</span></h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skill.aliases.map((a) => (
                    <span key={a.id} className="flex items-center gap-1.5 text-[13px] bg-white border border-line px-2.5 py-1 rounded-lg">
                      {a.alias}
                      <button onClick={() => handleRemoveAlias(a.id, skill.id)} className="text-red-400 hover:text-red-700 font-bold text-[12px]">×</button>
                    </span>
                  ))}
                  {skill.aliases.length === 0 && <span className="text-[13px] text-ink-soft">No aliases yet.</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    className="border border-line rounded-lg px-3 py-1.5 text-[13.5px] focus:outline-none focus:border-accent w-[200px]"
                    placeholder="Add alias (e.g. MS Excel)"
                    value={aliasSkillId === skill.id ? newAlias : ""}
                    onChange={(e) => { setAliasSkillId(skill.id); setNewAlias(e.target.value); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAlias(skill.id)}
                  />
                  <button
                    onClick={() => handleAddAlias(skill.id)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-accent text-white text-[12.5px] font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-[13px] text-ink-soft">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => updateFilter("page", String(page - 1))}
              className="px-3 py-1.5 border border-line rounded-lg text-[13.5px] disabled:opacity-40 hover:bg-paper transition-colors"
            >← Prev</button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => updateFilter("page", String(page + 1))}
              className="px-3 py-1.5 border border-line rounded-lg text-[13.5px] disabled:opacity-40 hover:bg-paper transition-colors"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
