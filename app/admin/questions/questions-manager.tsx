"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

const QUESTION_TYPES = [
  "text", "textarea", "number", "date", "single_select", "multi_select",
  "boolean", "file", "location", "currency", "skill_picker",
  "license_picker", "certification_picker", "portfolio",
];

export function QuestionsManager({ initialQuestions, categories, families, roles }: any) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    question: "", type: "text", required: false,
    category_id: "", family_id: "", role_id: "",
    sort_order: "0", evidence_required: false
  });

  const resetForm = () => {
    setForm({
      question: "", type: "text", required: false,
      category_id: "", family_id: "", role_id: "",
      sort_order: "0", evidence_required: false
    });
    setShowAdd(false); setEditId(null); setError(null);
  };

  const startEdit = (q: any) => {
    setEditId(q.id);
    setForm({
      question: q.question, type: q.type, required: q.required,
      category_id: q.category_id || "", family_id: q.family_id || "", role_id: q.role_id || "",
      sort_order: String(q.sort_order), evidence_required: q.evidence_required || false
    });
    setShowAdd(false);
  };

  const handleSave = async () => {
    setLoading(true); setError(null);
    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        family_id: form.family_id || null,
        role_id: form.role_id || null,
        sort_order: parseInt(form.sort_order) || 0,
        ...(editId ? { id: editId } : {})
      };
      
      const res = await fetch("/api/admin/taxonomy/questions", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.refresh();
      // Since it's a Server Component doing the main fetch, reloading is best
      window.location.reload(); 
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await fetch("/api/admin/taxonomy/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      setQuestions((qs: any) => qs.map((q: any) => q.id === id ? { ...q, active } : q));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-[20px]">All Questions</h2>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg hover:bg-accent/90 transition-colors"
        >
          + Add Question
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13.5px] rounded-lg">{error}</div>}

      {(showAdd || editId) && (
        <div className="mb-6 p-5 border-2 border-accent/30 bg-accent/5 rounded-[14px]">
          <h3 className="font-semibold text-[16px] mb-4">{editId ? "Edit Question" : "New Question"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Question Prompt *</label>
              <input className="w-full border border-line rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-accent"
                value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="e.g. Do you have a valid driver's license?" />
            </div>

            <div>
              <Select className="w-full py-2"
                value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-ink-soft mb-1">Sort Order</label>
              <input type="number" className="w-full border border-line rounded-lg px-3 py-2 text-[14px] font-data focus:outline-none focus:border-accent"
                value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>

            <div className="md:col-span-2 p-4 border border-line/50 rounded-lg bg-white space-y-3">
              <h4 className="font-semibold text-[13px] text-ink-soft mb-2 uppercase tracking-wider">Taxonomy Scope (Optional)</h4>
              <p className="text-[12.5px] text-ink-soft mb-3">Leave blank for global questions. Select a category, job type, or role to restrict when this question is asked.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select className="w-full py-2"
                  value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value, family_id: "", role_id: "" }))}>
                  <option value="">Any Category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>

                <Select className="w-full py-2"
                  value={form.family_id} onChange={e => setForm(f => ({ ...f, family_id: e.target.value, role_id: "" }))} disabled={!form.category_id}>
                  <option value="">Any Job Type</option>
                  {families.filter((f: any) => f.category_id === form.category_id).map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>

                <Select className="w-full py-2"
                  value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))} disabled={!form.family_id}>
                  <option value="">Any Role</option>
                  {roles.filter((r: any) => r.family_id === form.family_id).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 text-[13.5px] cursor-pointer">
                <input type="checkbox" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} className="w-4 h-4 rounded text-accent focus:ring-accent" />
                Required Question
              </label>
              <label className="flex items-center gap-2 text-[13.5px] cursor-pointer">
                <input type="checkbox" checked={form.evidence_required} onChange={e => setForm(f => ({ ...f, evidence_required: e.target.checked }))} className="w-4 h-4 rounded text-accent focus:ring-accent" />
                Require Evidence (Document Upload)
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={loading || !form.question}
              className="px-5 py-2 bg-accent text-white font-semibold text-[13.5px] rounded-lg disabled:opacity-50 hover:bg-accent/90 transition-colors">
              {loading ? "Saving…" : editId ? "Update Question" : "Create Question"}
            </button>
            <button onClick={resetForm} className="px-5 py-2 border border-line rounded-lg text-[13.5px] hover:bg-paper transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="border border-line rounded-[14px] overflow-hidden">
        <div className="hidden md:grid grid-cols-[3fr_1.5fr_2fr_auto_auto] gap-4 px-5 py-3 bg-paper border-b border-line text-[12px] font-bold uppercase tracking-wider text-ink-soft">
          <div>Question</div>
          <div>Type</div>
          <div>Scope</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {questions.length === 0 && (
          <div className="px-5 py-10 text-center text-ink-soft text-[14.5px]">No questions yet.</div>
        )}
        {questions.map((q: any) => (
          <div key={q.id} className={`grid grid-cols-1 md:grid-cols-[3fr_1.5fr_2fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-line last:border-0 hover:bg-paper/50 ${!q.active ? 'opacity-60' : ''}`}>
            <div>
              <div className="font-semibold text-[14.5px]">{q.question}</div>
              <div className="flex gap-2 mt-1">
                {q.required && <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Required</span>}
                {q.evidence_required && <span className="text-[10px] uppercase font-bold text-accent-dark bg-accent-soft px-1.5 py-0.5 rounded">Evidence Req.</span>}
              </div>
            </div>
            <div className="font-data text-[13px]">{q.type}</div>
            <div className="text-[12.5px] text-ink-soft">
              {q.role?.name ? `Role: ${q.role.name}` :
               q.family?.name ? `Job Type: ${q.family.name}` :
               q.category?.name ? `Category: ${q.category.name}` :
               "Global"}
            </div>
            <div>
              <button 
                onClick={() => handleToggleActive(q.id, !q.active)}
                className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${q.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                {q.active ? "Active" : "Inactive"}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(q)} className="px-3 py-1.5 border border-line text-[12.5px] rounded-md hover:bg-paper transition-colors">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
