"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ============================================================
   Gig Feed — /dashboard/gigs
   Workers browse open tasks posted by clients.
   Reads from localStorage (same store as /hire/gig/new).
   ============================================================ */

type Gig = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  budget: string;
  currency: string;
  urgency: string;
  contactName: string;
  contactPhone: string;
  postedAt: string;
  status: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  delivery: "", cleaning: "", moving: "", shopping: "️",
  repairs: "", tutoring: "", cooking: "️", security: "️",
  gardening: "", other: "",
};

const URGENCY_LABELS: Record<string, string> = {
  now: "Right now", today: "Today", tomorrow: "Tomorrow",
  thisweek: "This week", flexible: "Flexible",
};

const DEMO_GIGS: Gig[] = [
  { id: "demo1", category: "delivery", title: "Deliver documents from Kilimani to Karen", description: "A4 envelope, handle with care. Address will be shared on WhatsApp.", location: "Kilimani → Karen, Nairobi", budget: "400", currency: "KES", urgency: "today", contactName: "Sarah", contactPhone: "+254711000001", postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "open" },
  { id: "demo2", category: "cleaning", title: "House cleaning — 3-bedroom apartment", description: "Deep clean needed. Cleaning supplies provided.", location: "Westlands, Nairobi", budget: "1500", currency: "KES", urgency: "tomorrow", contactName: "James", contactPhone: "+254711000002", postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: "open" },
  { id: "demo3", category: "repairs", title: "Plumber needed — kitchen sink leak", description: "Pipe under the sink is dripping. Should be a quick fix.", location: "South B, Nairobi", budget: "800", currency: "KES", urgency: "now", contactName: "Mike", contactPhone: "+254711000003", postedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: "open" },
  { id: "demo4", category: "shopping", title: "Grocery run — Nakumatt list", description: "List of 15 items from the supermarket. Reimbursement + fee.", location: "Ngong Road, Nairobi", budget: "300", currency: "KES", urgency: "today", contactName: "Amina", contactPhone: "+254711000004", postedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: "open" },
  { id: "demo5", category: "tutoring", title: "Maths tutor for Form 2 student", description: "2 hours per week, 4 weeks. Algebra and geometry focus.", location: "Lavington, Nairobi", budget: "2000", currency: "KES", urgency: "thisweek", contactName: "Grace", contactPhone: "+254711000005", postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: "open" },
];

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function GigFeedPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("kaziin_gigs") || "[]") as Gig[];
    const accepted = JSON.parse(localStorage.getItem("kaziin_accepted_gigs") || "[]") as string[];
    setGigs([...DEMO_GIGS, ...stored]);
    setAcceptedIds(new Set(accepted));
  }, []);

  function acceptGig(gig: Gig) {
    const accepted = JSON.parse(localStorage.getItem("kaziin_accepted_gigs") || "[]") as string[];
    if (!accepted.includes(gig.id)) {
      accepted.push(gig.id);
      localStorage.setItem("kaziin_accepted_gigs", JSON.stringify(accepted));
      const activeGigs = JSON.parse(localStorage.getItem("kaziin_active_gigs") || "[]");
      activeGigs.push({ ...gig, acceptedAt: new Date().toISOString(), gigStatus: "active" });
      localStorage.setItem("kaziin_active_gigs", JSON.stringify(activeGigs));
      setAcceptedIds(prev => new Set([...prev, gig.id]));
    }
  }

  const categories = ["all", ...Array.from(new Set(gigs.map(g => g.category)))];
  const filtered = filter === "all" ? gigs : gigs.filter(g => g.category === filter);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Gig Feed</h1>
          <p className="mt-1 text-ink-soft text-[15px]">Browse tasks posted near you. Accept to get the client&apos;s contact.</p>
        </div>
        {acceptedIds.size > 0 && (
          <Link href="/dashboard/gigs/active" className="text-[13.5px] text-accent-dark font-medium hover:underline">
            My active gigs ({acceptedIds.size}) →
          </Link>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6 pb-6 border-b border-line">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${filter === cat ? "bg-accent-soft border-accent/30 text-accent-dark" : "border-line text-ink-soft hover:border-accent/30"}`}>
            {cat === "all" ? "All tasks" : `${CATEGORY_ICONS[cat] ?? ""} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Gig cards */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-line rounded-[14px]">
          <p className="text-ink-soft text-[15px]">No tasks found in this category yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(gig => {
            const isAccepted = acceptedIds.has(gig.id);
            return (
              <div key={gig.id} className="border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[18px]">{CATEGORY_ICONS[gig.category] ?? ""}</span>
                      <span className="font-data text-[11px] text-ink-soft">{timeAgo(gig.postedAt)}</span>
                      {gig.urgency === "now" && (
                        <span className="font-data text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Urgent</span>
                      )}
                    </div>
                    <h2 className="font-display font-semibold text-[16px] text-ink mb-1">{gig.title}</h2>
                    {gig.description && <p className="text-[13.5px] text-ink-soft leading-relaxed mb-3 line-clamp-2">{gig.description}</p>}
                    <div className="flex flex-wrap gap-3 text-[13px] text-ink-soft">
                      <span className="flex items-center gap-1">
                        
                        {gig.location}
                      </span>
                      <span className="flex items-center gap-1">
                        
                        {URGENCY_LABELS[gig.urgency] ?? gig.urgency}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {gig.budget && (
                      <div className="font-display font-bold text-[17px] text-[#2F6D53]">{gig.currency} {Number(gig.budget).toLocaleString()}</div>
                    )}
                    <div className="mt-3">
                      {isAccepted ? (
                        <div className="flex flex-col gap-2 items-end">
                          <span className="text-[12px] font-semibold text-accent-dark"> Accepted</span>
                          <a href={`https://wa.me/${gig.contactPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-lg border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors">
                            
                            Chat
                          </a>
                        </div>
                      ) : (
                        <button onClick={() => acceptGig(gig)}
                          className="px-5 py-2 rounded-lg bg-[#2F6D53] text-white font-semibold text-[13px] hover:bg-[#1E4D39] transition-colors">
                          Accept Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
