"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Tab = "what-i-do" | "offers" | "skills" | "experience" | "education" | "certifications" | "languages" | "portfolio" | "preferences";

type WorkMode = "job-seeker" | "service-provider" | "errand-runner" | "item-plug";

const WORK_MODES: { id: WorkMode; emoji: string; label: string; description: string }[] = [
  { id: "job-seeker",       emoji: "\u200d", label: "Job Seeker",       description: "Looking for full-time, part-time, contract, or gig employment" },
  { id: "service-provider", emoji: "",          label: "Service Provider", description: "Freelancer, skilled trade, coach, tutor, or independent contractor" },
  { id: "errand-runner",    emoji: "",          label: "Errand Runner",    description: "Task-based work: grocery runs, pickups, pet sitting, local help" },
  { id: "item-plug",        emoji: "",          label: "Item / Deal Plug", description: "Selling items, reselling, marketplace listings, or deal sourcing" },
];

interface WorkEntry {
  id?: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
  employment_type: string;
}

interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
}

interface CertEntry {
  id?: string;
  name: string;
  issuer: string;
  date_obtained: string;
  expiry_date: string;
  license_number: string;
}

interface LangEntry {
  id?: string;
  language: string;
  proficiency: string;
}

interface PortfolioEntry {
  id?: string;
  title: string;
  type: string;
  url: string;
  description: string;
}

interface OfferEntry {
  id: string;
  title: string;
  category: "service" | "item" | "errand";
  description: string;
  rate: string;
  rate_type: "hourly" | "fixed" | "per-item" | "negotiable";
  available: boolean;
}

interface CareerTarget {
  id?: string;
  category_id: string;
  category_name: string;
  family_id: string;
  family_name: string;
}

const BLANK_OFFER: OfferEntry = { id: "", title: "", category: "service", description: "", rate: "", rate_type: "hourly", available: true };

interface TaxCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface TaxFamily {
  id: string;
  name: string;
  categoryId: string;
}

const PROFICIENCY_LEVELS = ["basic", "conversational", "proficient", "fluent", "native"];
const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "freelance", "temporary", "gig", "internship", "apprenticeship", "seasonal", "casual"];

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "what-i-do",  label: "What I Do",    icon: "🪄" },
  { id: "offers",     label: "My Offers",    icon: "️" },
  { id: "skills",     label: "Skills",       icon: "" },
  { id: "experience", label: "Experience",   icon: "" },
  { id: "education",  label: "Education",    icon: "" },
  { id: "certifications", label: "Licences", icon: "" },
  { id: "languages",  label: "Languages",    icon: "" },
  { id: "portfolio",  label: "Portfolio",    icon: "️" },
  { id: "preferences", label: "Preferences", icon: "️" },
];

export default function CareerPassportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get("tab") as Tab) || "what-i-do");
  const [saving, setSaving] = useState(false);
  const [completeness, setCompleteness] = useState(0);
  const [workModes, setWorkModes] = useState<WorkMode[]>([]);
  const [offers, setOffers] = useState<OfferEntry[]>([]);
  const [editingOffer, setEditingOffer] = useState<OfferEntry | null>(null);

  // Data state
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [families, setFamilies] = useState<TaxFamily[]>([]);
  const [careerTargets, setCareerTargets] = useState<CareerTarget[]>([]);
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [certifications, setCertifications] = useState<CertEntry[]>([]);
  const [languages, setLanguages] = useState<LangEntry[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  
  // Form state
  const [editingWork, setEditingWork] = useState<WorkEntry | null>(null);
  const [editingEdu, setEditingEdu] = useState<EducationEntry | null>(null);
  const [editingCert, setEditingCert] = useState<CertEntry | null>(null);
  const [newLang, setNewLang] = useState({ language: "", proficiency: "conversational" });
  const [newPortfolio, setNewPortfolio] = useState<PortfolioEntry>({ title: "", type: "link", url: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategorySearch, setSelectedCategorySearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedFamilySearch, setSelectedFamilySearch] = useState("");
  const [availFamilies, setAvailFamilies] = useState<TaxFamily[]>([]);

  // Fetch taxonomy on mount
  useEffect(() => {
    fetch("/api/taxonomy?type=categories")
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
    fetch("/api/taxonomy?type=families")
      .then(r => r.json())
      .then(setFamilies)
      .catch(() => {});
  }, []);

  // Load work modes and offers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kaziin_work_modes");
      if (stored) setWorkModes(JSON.parse(stored));
      const storedOffers = localStorage.getItem("kaziin_offers");
      if (storedOffers) setOffers(JSON.parse(storedOffers));
    } catch {}
  }, []);

  function toggleWorkMode(mode: WorkMode) {
    setWorkModes(prev => {
      const next = prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode];
      localStorage.setItem("kaziin_work_modes", JSON.stringify(next));
      return next;
    });
  }

  // Fetch section data when tab changes
  useEffect(() => {
    const sectionMap: Record<Tab, string> = {
      "what-i-do": "targets",
      offers: "",
      skills: "",
      experience: "experience",
      education: "education",
      certifications: "certifications",
      languages: "languages",
      portfolio: "portfolio",
      preferences: "",
    };
    const section = sectionMap[activeTab];
    if (!section) return;

    fetch(`/api/career-passport/${section}`)
      .then(r => r.json())
      .then(data => {
        if (activeTab === "what-i-do") setCareerTargets(data.map((d: any) => ({
          id: d.id,
          category_id: d.category_id,
          category_name: categories.find(c => c.id === d.category_id)?.name || "",
          family_id: d.family_id || "",
          family_name: families.find(f => f.id === d.family_id)?.name || "",
        })));
        else if (activeTab === "experience") setWorkHistory(data.map((d: any) => ({
          id: d.id, title: d.title, company: d.company, location: d.location || "",
          start_date: d.start_date, end_date: d.end_date || "", current: d.current,
          description: d.description || "", employment_type: d.employment_type || "full-time",
        })));
        else if (activeTab === "education") setEducation(data.map((d: any) => ({
          id: d.id, institution: d.institution, degree: d.degree,
          field: d.field || "", start_date: d.start_date || "", end_date: d.end_date || "",
        })));
        else if (activeTab === "certifications") setCertifications(data.map((d: any) => ({
          id: d.id, name: d.name, issuer: d.issuer || "",
          date_obtained: d.date_obtained || "", expiry_date: d.expiry_date || "",
          license_number: d.license_number || "",
        })));
        else if (activeTab === "languages") setLanguages(data.map((d: any) => ({
          id: d.id, language: d.language, proficiency: d.proficiency,
        })));
        else if (activeTab === "portfolio") setPortfolio(data.map((d: any) => ({
          id: d.id, title: d.title, type: d.type, url: d.url || "", description: d.description || "",
        })));
      })
      .catch(() => {});
  }, [activeTab, categories, families]);

  // Update available families when category changes
  useEffect(() => {
    if (selectedCategory) {
      setAvailFamilies(families.filter(f => f.categoryId === selectedCategory));
    } else {
      setAvailFamilies([]);
    }
  }, [selectedCategory, families]);

  // Sync category search string to actual ID
  useEffect(() => {
    const matchedCategory = categories.find(c => c.name.toLowerCase() === selectedCategorySearch.toLowerCase());
    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);
    } else {
      setSelectedCategory("");
    }
  }, [selectedCategorySearch, categories]);

  // Sync family search string to actual ID
  useEffect(() => {
    const matchedFamily = families.find(f => f.name.toLowerCase() === selectedFamilySearch.toLowerCase() && f.categoryId === selectedCategory);
    if (matchedFamily) {
      setSelectedFamily(matchedFamily.id);
    } else {
      setSelectedFamily("");
    }
  }, [selectedFamilySearch, families, selectedCategory]);

  const saveSection = useCallback(async (section: string, method: "POST" | "PUT" | "DELETE", data: any) => {
    setSaving(true);
    try {
      const url = method === "DELETE" ? `/api/career-passport/${section}?id=${data.id}` : `/api/career-passport/${section}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(data) : undefined,
      });
      if (!res.ok) throw new Error("Failed to save");
      return await res.json();
    } finally {
      setSaving(false);
    }
  }, []);

  const handleAddTarget = async () => {
    if (!selectedCategory) return;
    const cat = categories.find(c => c.id === selectedCategory);
    const fam = families.find(f => f.id === selectedFamily);
    const result = await saveSection("targets", "POST", {
      category_id: selectedCategory,
      family_id: selectedFamily || null,
      priority: careerTargets.length + 1,
    });
    setCareerTargets(prev => [...prev, {
      id: result.id,
      category_id: selectedCategory,
      category_name: cat?.name || "",
      family_id: selectedFamily,
      family_name: fam?.name || "",
    }]);
    setSelectedCategory("");
    setSelectedCategorySearch("");
    setSelectedFamily("");
    setSelectedFamilySearch("");
  };

  const handleDeleteTarget = async (id: string) => {
    await saveSection("targets", "DELETE", { id });
    setCareerTargets(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveWork = async () => {
    if (!editingWork) return;
    const method = editingWork.id ? "PUT" : "POST";
    const result = await saveSection("experience", method, {
      ...editingWork,
      start_date: editingWork.start_date,
      end_date: editingWork.current ? null : editingWork.end_date,
    });
    if (method === "POST") setWorkHistory(prev => [{ ...editingWork, id: result.id }, ...prev]);
    else setWorkHistory(prev => prev.map(w => w.id === editingWork.id ? editingWork : w));
    setEditingWork(null);
  };

  const handleDeleteWork = async (id: string) => {
    await saveSection("experience", "DELETE", { id });
    setWorkHistory(prev => prev.filter(w => w.id !== id));
  };

  const handleSaveEdu = async () => {
    if (!editingEdu) return;
    const method = editingEdu.id ? "PUT" : "POST";
    const result = await saveSection("education", method, editingEdu);
    if (method === "POST") setEducation(prev => [{ ...editingEdu, id: result.id }, ...prev]);
    else setEducation(prev => prev.map(e => e.id === editingEdu.id ? editingEdu : e));
    setEditingEdu(null);
  };

  const handleSaveCert = async () => {
    if (!editingCert) return;
    const method = editingCert.id ? "PUT" : "POST";
    const result = await saveSection("certifications", method, editingCert);
    if (method === "POST") setCertifications(prev => [{ ...editingCert, id: result.id }, ...prev]);
    else setCertifications(prev => prev.map(c => c.id === editingCert.id ? editingCert : c));
    setEditingCert(null);
  };

  const handleAddLanguage = async () => {
    if (!newLang.language.trim()) return;
    const result = await saveSection("languages", "POST", newLang);
    setLanguages(prev => [...prev, { ...newLang, id: result.id }]);
    setNewLang({ language: "", proficiency: "conversational" });
  };

  const handleDeleteLanguage = async (id: string) => {
    await saveSection("languages", "DELETE", { id });
    setLanguages(prev => prev.filter(l => l.id !== id));
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolio.title.trim()) return;
    const result = await saveSection("portfolio", "POST", newPortfolio);
    setPortfolio(prev => [{ ...newPortfolio, id: result.id }, ...prev]);
    setNewPortfolio({ title: "", type: "link", url: "", description: "" });
  };

  const handleDeletePortfolio = async (id: string) => {
    await saveSection("portfolio", "DELETE", { id });
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  const blankWork: WorkEntry = { title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "", employment_type: "full-time" };
  const blankEdu: EducationEntry = { institution: "", degree: "", field: "", start_date: "", end_date: "" };
  const blankCert: CertEntry = { name: "", issuer: "", date_obtained: "", expiry_date: "", license_number: "" };

  return (
    <div className="career-passport-page">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-header-content">
          <div>
            <h1 className="cp-title">Career Passport</h1>
            <p className="cp-subtitle">Build your universal professional profile. Your passport to any opportunity.</p>
          </div>
          <div className="cp-completeness-ring">
            
            <div className="ring-label">
              <span className="ring-pct">{completeness}%</span>
              <span className="ring-sub">complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cp-layout">
        {/* Sidebar tabs */}
        <nav className="cp-sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`cp-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                router.push(`/dashboard/career-passport?tab=${tab.id}`, { scroll: false });
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && <span className="tab-indicator" />}
            </button>
          ))}
        </nav>

        {/* Main panel */}
        <main className="cp-main">
          {saving && (
            <div className="cp-saving-toast">
              <span className="saving-dot" /> Saving…
            </div>
          )}

          {/* ── What I Do ── */}
          {activeTab === "what-i-do" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>What I Do</h2>
                <p>Start by selecting your primary industry, then choose how you want to work to ensure you're matched to all types of opportunities.</p>
              </div>

              <div className="cp-card">
                <h3 className="cp-card-title">1. Select your Industry / Category</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", marginBottom: "1rem" }}>Which fields or industries are you targeting?</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Industry / Category</label>
                    <input
                      list="categories-list"
                      className="form-input"
                      value={selectedCategorySearch}
                      onChange={(e) => setSelectedCategorySearch(e.target.value)}
                      placeholder="Type to search industries..."
                    />
                    <datalist id="categories-list">
                      {categories.map(c => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  {availFamilies.length > 0 && (
                    <div className="form-group">
                      <label>Specialisation (optional)</label>
                      <input
                        list="families-list"
                        className="form-input"
                        value={selectedFamilySearch}
                        onChange={(e) => setSelectedFamilySearch(e.target.value)}
                        placeholder="Type to search specialisations..."
                      />
                      <datalist id="families-list">
                        {availFamilies.map(f => (
                          <option key={f.id} value={f.name} />
                        ))}
                      </datalist>
                    </div>
                  )}
                </div>
                <button className="btn-primary" onClick={handleAddTarget} disabled={!selectedCategory}>+ Add Target</button>
                {careerTargets.length > 0 && (
                  <div className="cp-list" style={{ marginTop: "1rem" }}>
                    {careerTargets.map(target => (
                      <div key={target.id} className="cp-list-item">
                        <div className="list-item-content">
                          <span className="item-badge">{target.category_name}</span>
                          {target.family_name && <span className="item-sub">→ {target.family_name}</span>}
                        </div>
                        <button className="btn-icon-danger" onClick={() => handleDeleteTarget(target.id!)}></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cp-card" style={{ marginTop: "2rem" }}>
                <h3 className="cp-card-title">2. How do you want to work?</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", marginBottom: "1rem" }}>Select the types of work you are open to. You can pick more than one.</p>
                <div className="work-mode-grid">
                  {WORK_MODES.map(mode => (
                    <button
                      key={mode.id}
                      className={`work-mode-card ${workModes.includes(mode.id) ? "selected" : ""}`}
                      onClick={() => toggleWorkMode(mode.id)}
                    >
                      <div className="wm-check">{workModes.includes(mode.id) ? "" : ""}</div>
                      <div className="wm-emoji">{mode.emoji}</div>
                      <div className="wm-label">{mode.label}</div>
                      <div className="wm-desc">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── My Offers ── */}
          {activeTab === "offers" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>My Offers</h2>
                <p>List the specific services, items, or tasks you offer. This is your shopfront — the more detail, the better your matches.</p>
              </div>

              {editingOffer === null ? (
                <button className="btn-primary" onClick={() => setEditingOffer({ ...BLANK_OFFER })}>+ Add Offer</button>
              ) : (
                <div className="cp-card">
                  <h3 className="cp-card-title">{editingOffer.id ? "Edit" : "New"} Offer</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Title *</label>
                      <input className="form-input" value={editingOffer.title} onChange={e => setEditingOffer(p => p && { ...p, title: e.target.value })} placeholder="e.g. Grocery Runs, Logo Design, iPhone 14 Pro Max…" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-select" value={editingOffer.category} onChange={e => setEditingOffer(p => p && { ...p, category: e.target.value as any })}>
                        <option value="service"> Service</option>
                        <option value="errand"> Errand / Task</option>
                        <option value="item"> Item / Product</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label>Description</label>
                    <textarea className="form-textarea" rows={3} value={editingOffer.description} onChange={e => setEditingOffer(p => p && { ...p, description: e.target.value })} placeholder="What exactly do you offer? Be specific — area covered, tools/skills used, turnaround time…" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Rate / Price</label>
                      <input className="form-input" value={editingOffer.rate} onChange={e => setEditingOffer(p => p && { ...p, rate: e.target.value })} placeholder="e.g. KES 500, $20, Free quote" />
                    </div>
                    <div className="form-group">
                      <label>Pricing Type</label>
                      <select className="form-select" value={editingOffer.rate_type} onChange={e => setEditingOffer(p => p && { ...p, rate_type: e.target.value as any })}>
                        <option value="hourly">Per Hour</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="per-item">Per Item / Unit</option>
                        <option value="negotiable">Negotiable</option>
                      </select>
                    </div>
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={editingOffer.available} onChange={e => setEditingOffer(p => p && { ...p, available: e.target.checked })} />
                    Currently available for this offer
                  </label>
                  <div className="form-actions">
                    <button className="btn-ghost" onClick={() => setEditingOffer(null)}>Cancel</button>
                    <button className="btn-primary" disabled={!editingOffer.title.trim()} onClick={() => {
                      if (!editingOffer) return;
                      const isNew = !editingOffer.id;
                      const withId = isNew ? { ...editingOffer, id: Date.now().toString() } : editingOffer;
                      setOffers(prev => isNew ? [...prev, withId] : prev.map(o => o.id === withId.id ? withId : o));
                      try { localStorage.setItem("kaziin_offers", JSON.stringify(isNew ? [...offers, withId] : offers.map(o => o.id === withId.id ? withId : o))); } catch {}
                      setEditingOffer(null);
                    }}>Save Offer</button>
                  </div>
                </div>
              )}

              <div className="cp-list" style={{ marginTop: "1.5rem" }}>
                {offers.map(offer => (
                  <div key={offer.id} className="cp-list-item">
                    <div className="exp-icon">{offer.category === "item" ? "" : offer.category === "errand" ? "" : ""}</div>
                    <div className="list-item-content">
                      <strong>{offer.title}</strong>
                      <span className="item-sub">{offer.rate} · {offer.rate_type.replace("-", " ")}</span>
                      {offer.description && <p className="item-desc">{offer.description}</p>}
                      <span className={`item-meta ${offer.available ? "" : "expired"}`}>{offer.available ? " Available" : "Currently unavailable"}</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={() => setEditingOffer(offer)}>️</button>
                      <button className="btn-icon-danger" onClick={() => {
                        setOffers(prev => prev.filter(o => o.id !== offer.id));
                        try { localStorage.setItem("kaziin_offers", JSON.stringify(offers.filter(o => o.id !== offer.id))); } catch {}
                      }}></button>
                    </div>
                  </div>
                ))}
                {offers.length === 0 && editingOffer === null && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.3)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>️</div>
                    <p style={{ margin: 0 }}>No offers yet. Add one to get discovered.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Experience ── */}
          {activeTab === "experience" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Work Experience</h2>
                <p>Add your work history to demonstrate your background to employers.</p>
              </div>

              {!editingWork ? (
                <button className="btn-primary" onClick={() => setEditingWork(blankWork)}>
                  + Add Experience
                </button>
              ) : (
                <div className="cp-card">
                  <h3 className="cp-card-title">{editingWork.id ? "Edit" : "Add"} Experience</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Job Title *</label>
                      <input className="form-input" value={editingWork.title} onChange={e => setEditingWork(p => p && { ...p, title: e.target.value })} placeholder="e.g. Software Engineer" />
                    </div>
                    <div className="form-group">
                      <label>Organisation / Client <span style={{color:"rgba(255,255,255,0.3)",fontWeight:400}}>(optional)</span></label>
                      <input className="form-input" value={editingWork.company} onChange={e => setEditingWork(p => p && { ...p, company: e.target.value })} placeholder="e.g. Acme Ltd, Self-employed, Private Client…" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Location</label>
                      <input className="form-input" value={editingWork.location} onChange={e => setEditingWork(p => p && { ...p, location: e.target.value })} placeholder="e.g. London, UK" />
                    </div>
                    <div className="form-group">
                      <label>Employment Type</label>
                      <select className="form-select" value={editingWork.employment_type} onChange={e => setEditingWork(p => p && { ...p, employment_type: e.target.value })}>
                        {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input type="date" className="form-input" value={editingWork.start_date} onChange={e => setEditingWork(p => p && { ...p, start_date: e.target.value })} />
                    </div>
                    {!editingWork.current && (
                      <div className="form-group">
                        <label>End Date</label>
                        <input type="date" className="form-input" value={editingWork.end_date} onChange={e => setEditingWork(p => p && { ...p, end_date: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={editingWork.current} onChange={e => setEditingWork(p => p && { ...p, current: e.target.checked })} />
                    I currently work here
                  </label>
                  <div className="form-group" style={{ marginTop: "1rem" }}>
                    <label>Description</label>
                    <textarea className="form-textarea" rows={4} value={editingWork.description} onChange={e => setEditingWork(p => p && { ...p, description: e.target.value })} placeholder="Describe your responsibilities and achievements…" />
                  </div>
                  <div className="form-actions">
                    <button className="btn-ghost" onClick={() => setEditingWork(null)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveWork} disabled={!editingWork.title || !editingWork.start_date}>Save</button>
                  </div>
                </div>
              )}

              <div className="cp-list">
                {workHistory.map(job => (
                  <div key={job.id} className="cp-list-item experience-item">
                    <div className="exp-icon"></div>
                    <div className="list-item-content">
                      <strong>{job.title}</strong>
                      <span className="item-sub">{job.company} · {job.location}</span>
                      <span className="item-meta">{job.start_date?.slice(0, 7)} – {job.current ? "Present" : job.end_date?.slice(0, 7)}</span>
                      {job.description && <p className="item-desc">{job.description}</p>}
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={() => setEditingWork(job)}>️</button>
                      <button className="btn-icon-danger" onClick={() => handleDeleteWork(job.id!)}></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Education ── */}
          {activeTab === "education" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Education</h2>
                <p>Add your academic qualifications and degrees.</p>
              </div>

              {!editingEdu ? (
                <button className="btn-primary" onClick={() => setEditingEdu(blankEdu)}>+ Add Education</button>
              ) : (
                <div className="cp-card">
                  <h3 className="cp-card-title">{editingEdu.id ? "Edit" : "Add"} Education</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Institution *</label>
                      <input className="form-input" value={editingEdu.institution} onChange={e => setEditingEdu(p => p && { ...p, institution: e.target.value })} placeholder="e.g. University of Lagos" />
                    </div>
                    <div className="form-group">
                      <label>Degree *</label>
                      <input className="form-input" value={editingEdu.degree} onChange={e => setEditingEdu(p => p && { ...p, degree: e.target.value })} placeholder="e.g. BSc Computer Science" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Field of Study</label>
                      <input className="form-input" value={editingEdu.field} onChange={e => setEditingEdu(p => p && { ...p, field: e.target.value })} placeholder="e.g. Computer Science" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" className="form-input" value={editingEdu.start_date} onChange={e => setEditingEdu(p => p && { ...p, start_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" className="form-input" value={editingEdu.end_date} onChange={e => setEditingEdu(p => p && { ...p, end_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-ghost" onClick={() => setEditingEdu(null)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveEdu} disabled={!editingEdu.institution || !editingEdu.degree}>Save</button>
                  </div>
                </div>
              )}

              <div className="cp-list">
                {education.map(edu => (
                  <div key={edu.id} className="cp-list-item">
                    <div className="exp-icon"></div>
                    <div className="list-item-content">
                      <strong>{edu.degree}</strong>
                      <span className="item-sub">{edu.institution}{edu.field ? ` · ${edu.field}` : ""}</span>
                      <span className="item-meta">{edu.start_date?.slice(0, 7)} – {edu.end_date?.slice(0, 7) || "Present"}</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={() => setEditingEdu(edu)}>️</button>
                      <button className="btn-icon-danger" onClick={async () => { await saveSection("education", "DELETE", { id: edu.id }); setEducation(p => p.filter(e => e.id !== edu.id)); }}></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Certifications ── */}
          {activeTab === "certifications" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Certifications & Licences</h2>
                <p>Add professional certifications, trade licences, and credentials.</p>
              </div>

              {!editingCert ? (
                <button className="btn-primary" onClick={() => setEditingCert(blankCert)}>+ Add Certification</button>
              ) : (
                <div className="cp-card">
                  <h3 className="cp-card-title">{editingCert.id ? "Edit" : "Add"} Certification</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Certification Name *</label>
                      <input className="form-input" value={editingCert.name} onChange={e => setEditingCert(p => p && { ...p, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" />
                    </div>
                    <div className="form-group">
                      <label>Issued By</label>
                      <input className="form-input" value={editingCert.issuer} onChange={e => setEditingCert(p => p && { ...p, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date Obtained</label>
                      <input type="date" className="form-input" value={editingCert.date_obtained} onChange={e => setEditingCert(p => p && { ...p, date_obtained: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="date" className="form-input" value={editingCert.expiry_date} onChange={e => setEditingCert(p => p && { ...p, expiry_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Licence/Certificate Number</label>
                    <input className="form-input" value={editingCert.license_number} onChange={e => setEditingCert(p => p && { ...p, license_number: e.target.value })} placeholder="e.g. CERT-12345" />
                  </div>
                  <div className="form-actions">
                    <button className="btn-ghost" onClick={() => setEditingCert(null)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveCert} disabled={!editingCert.name}>Save</button>
                  </div>
                </div>
              )}

              <div className="cp-list">
                {certifications.map(cert => (
                  <div key={cert.id} className="cp-list-item">
                    <div className="exp-icon"></div>
                    <div className="list-item-content">
                      <strong>{cert.name}</strong>
                      {cert.issuer && <span className="item-sub">{cert.issuer}</span>}
                      {cert.expiry_date && <span className={`item-meta ${new Date(cert.expiry_date) < new Date() ? "expired" : ""}`}>Expires: {cert.expiry_date}</span>}
                      {cert.license_number && <span className="item-meta">Ref: {cert.license_number}</span>}
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={() => setEditingCert(cert)}>️</button>
                      <button className="btn-icon-danger" onClick={() => { saveSection("certifications", "DELETE", { id: cert.id }); setCertifications(p => p.filter(c => c.id !== cert.id)); }}></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Languages ── */}
          {activeTab === "languages" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Languages</h2>
                <p>Languages you speak can unlock more opportunities, especially for international roles.</p>
              </div>

              <div className="cp-card">
                <h3 className="cp-card-title">Add a Language</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Language</label>
                    <input className="form-input" value={newLang.language} onChange={e => setNewLang(p => ({ ...p, language: e.target.value }))} placeholder="e.g. Spanish, French, Yoruba…" />
                  </div>
                  <div className="form-group">
                    <label>Proficiency</label>
                    <select className="form-select" value={newLang.proficiency} onChange={e => setNewLang(p => ({ ...p, proficiency: e.target.value }))}>
                      {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAddLanguage} disabled={!newLang.language.trim()}>+ Add Language</button>
              </div>

              <div className="lang-chips">
                {languages.map(lang => (
                  <div key={lang.id} className="lang-chip">
                    <span className="chip-lang"> {lang.language}</span>
                    <span className="chip-level">{lang.proficiency}</span>
                    <button className="chip-del" onClick={() => handleDeleteLanguage(lang.id!)}></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Portfolio ── */}
          {activeTab === "portfolio" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Portfolio & Work Samples</h2>
                <p>Add links to your work, projects, GitHub, Behance, or any evidence of your skills.</p>
              </div>

              <div className="cp-card">
                <h3 className="cp-card-title">Add Portfolio Item</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input className="form-input" value={newPortfolio.title} onChange={e => setNewPortfolio(p => ({ ...p, title: e.target.value }))} placeholder="e.g. My GitHub Profile" />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select className="form-select" value={newPortfolio.type} onChange={e => setNewPortfolio(p => ({ ...p, type: e.target.value }))}>
                      <option value="link">Link / URL</option>
                      <option value="github">GitHub</option>
                      <option value="behance">Behance</option>
                      <option value="website">Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input className="form-input" type="url" value={newPortfolio.url} onChange={e => setNewPortfolio(p => ({ ...p, url: e.target.value }))} placeholder="https://…" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input className="form-input" value={newPortfolio.description} onChange={e => setNewPortfolio(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" />
                </div>
                <button className="btn-primary" onClick={handleAddPortfolio} disabled={!newPortfolio.title.trim()}>+ Add Item</button>
              </div>

              <div className="cp-list">
                {portfolio.map(item => (
                  <div key={item.id} className="cp-list-item">
                    <div className="exp-icon"></div>
                    <div className="list-item-content">
                      <strong>{item.title}</strong>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-link">{item.url}</a>}
                      {item.description && <span className="item-sub">{item.description}</span>}
                    </div>
                    <button className="btn-icon-danger" onClick={() => handleDeletePortfolio(item.id!)}></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Skills (placeholder linking to existing skills section) ── */}
          {activeTab === "skills" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Skills</h2>
                <p>Manage your skills and proficiency levels.</p>
              </div>
              <div className="cp-card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}></div>
                <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                  Skills are managed in your main profile. Click below to update them.
                </p>
                <a href="/dashboard/profile" className="btn-primary" style={{ display: "inline-block" }}>
                  Manage Skills
                </a>
              </div>
            </section>
          )}

          {/* ── Preferences (placeholder) ── */}
          {activeTab === "preferences" && (
            <section className="cp-section">
              <div className="cp-section-header">
                <h2>Work Preferences</h2>
                <p>Tell us how and where you want to work.</p>
              </div>
              <div className="cp-card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>️</div>
                <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                  Work preferences are managed in your main profile settings.
                </p>
                <a href="/dashboard/profile" className="btn-primary" style={{ display: "inline-block" }}>
                  Edit Preferences
                </a>
              </div>
            </section>
          )}
        </main>
      </div>

      <style>{`
        .work-mode-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .work-mode-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 2px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem 1.25rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .work-mode-card:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.06);
        }

        .work-mode-card.selected {
          border-color: #2F6D53;
          background: rgba(47,109,83,0.12);
        }

        .wm-check {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #2F6D53;
          background: transparent;
          font-weight: 700;
          transition: all 0.2s;
        }

        .work-mode-card.selected .wm-check {
          background: #2F6D53;
          border-color: #2F6D53;
          color: white;
        }

        .wm-emoji { font-size: 2rem; line-height: 1; margin-bottom: 0.25rem; }
        .wm-label { font-size: 1rem; font-weight: 600; color: #f1f5f9; }
        .wm-desc { font-size: 0.8rem; color: rgba(255,255,255,0.45); line-height: 1.4; }

        .career-passport-page {
          min-height: 100vh;
          background: var(--bg-primary, #0f0f1a);
          color: var(--text-primary, #f1f5f9);
        }

        .cp-header {
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 2rem 2.5rem;
        }

        .cp-header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cp-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.25rem;
        }

        .cp-subtitle {
          color: rgba(255,255,255,0.55);
          font-size: 0.9rem;
          margin: 0;
        }

        .cp-completeness-ring {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .ring-svg {
          width: 80px;
          height: 80px;
          transform: rotate(-90deg);
        }

        .ring-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: rotate(0);
        }

        .ring-pct {
          font-size: 1.1rem;
          font-weight: 700;
          color: #a78bfa;
          line-height: 1;
        }

        .ring-sub {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cp-layout {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 2rem;
          padding: 2rem 2.5rem;
        }

        @media (max-width: 768px) {
          .cp-layout { grid-template-columns: 1fr; padding: 1rem; }
          .cp-header { padding: 1.5rem 1rem; }
          .cp-sidebar { display: flex; flex-wrap: wrap; gap: 0.5rem; }
          .cp-tab-btn { padding: 0.5rem 0.75rem; }
          .tab-label { font-size: 0.8rem; }
        }

        .cp-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          height: fit-content;
          position: sticky;
          top: 1rem;
        }

        .cp-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 500;
          text-align: left;
          transition: all 0.2s;
          position: relative;
          width: 100%;
        }

        .cp-tab-btn:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
        }

        .cp-tab-btn.active {
          background: rgba(167,139,250,0.12);
          color: #a78bfa;
        }

        .tab-icon { font-size: 1rem; flex-shrink: 0; }
        .tab-indicator {
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 3px;
          background: linear-gradient(to bottom, #a78bfa, #38bdf8);
          border-radius: 0 4px 4px 0;
        }

        .cp-main {
          position: relative;
          min-height: 400px;
        }

        .cp-saving-toast {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: rgba(30, 27, 75, 0.95);
          border: 1px solid rgba(167,139,250,0.3);
          color: #a78bfa;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 100;
          backdrop-filter: blur(8px);
        }

        .saving-dot {
          width: 8px; height: 8px;
          background: #a78bfa;
          border-radius: 50%;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }

        .cp-section {}

        .cp-section-header {
          margin-bottom: 1.5rem;
        }

        .cp-section-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.4rem;
        }

        .cp-section-header p {
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
          margin: 0;
        }

        .cp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .cp-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .form-input, .form-select, .form-textarea {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          color: #f1f5f9;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: rgba(167,139,250,0.5);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
        }

        .form-select option { background: #1e1b4b; }
        .form-textarea { resize: vertical; }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(124,58,237,0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          color: #f1f5f9;
        }

        .btn-icon {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.35rem 0.5rem;
          cursor: pointer;
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .btn-icon:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }

        .btn-icon-danger {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 0.35rem 0.5rem;
          cursor: pointer;
          color: rgba(239,68,68,0.7);
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .btn-icon-danger:hover {
          background: rgba(239,68,68,0.2);
          color: #f87171;
        }

        .cp-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cp-list-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          transition: border-color 0.2s;
        }

        .cp-list-item:hover { border-color: rgba(167,139,250,0.2); }

        .exp-icon {
          font-size: 1.4rem;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .list-item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .list-item-content strong { color: #f1f5f9; font-size: 0.95rem; }

        .item-sub { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .item-meta { color: rgba(255,255,255,0.35); font-size: 0.8rem; }
        .item-meta.expired { color: #f87171; }
        .item-desc { color: rgba(255,255,255,0.55); font-size: 0.85rem; margin: 0.25rem 0 0; line-height: 1.5; }
        .item-link { color: #38bdf8; font-size: 0.82rem; text-decoration: none; word-break: break-all; }
        .item-link:hover { text-decoration: underline; }

        .item-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }

        .item-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(167,139,250,0.12);
          color: #a78bfa;
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 20px;
          padding: 0.2rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .lang-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .lang-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px;
          padding: 0.4rem 0.75rem 0.4rem 0.9rem;
          font-size: 0.85rem;
        }

        .chip-lang { color: #f1f5f9; font-weight: 500; }
        .chip-level { color: rgba(255,255,255,0.4); font-size: 0.78rem; }
        .chip-del {
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          padding: 0;
          font-size: 0.8rem;
          line-height: 1;
          margin-left: 0.2rem;
          transition: color 0.2s;
        }
        .chip-del:hover { color: #f87171; }
      `}</style>
    </div>
  );
}
