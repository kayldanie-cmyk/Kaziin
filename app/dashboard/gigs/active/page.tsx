"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ============================================================
   Active Gig Tracker — /dashboard/gigs/active
   Shows gigs a worker has accepted.
   "Mark Complete" triggers a rating prompt for both parties.
   ============================================================ */

type ActiveGig = {
  id: string;
  category: string;
  title: string;
  location: string;
  budget: string;
  currency: string;
  contactName: string;
  contactPhone: string;
  acceptedAt: string;
  gigStatus: "active" | "completed" | "rated";
};

const CATEGORY_ICONS: Record<string, string> = {
  delivery: "", cleaning: "", moving: "", shopping: "️",
  repairs: "", tutoring: "", cooking: "️", security: "️",
  gardening: "", other: "",
};

export default function ActiveGigsPage() {
  const [gigs, setGigs] = useState<ActiveGig[]>([]);
  const [ratingGig, setRatingGig] = useState<ActiveGig | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("kaziin_active_gigs") || "[]") as ActiveGig[];
    setGigs(stored);
  }, []);

  function markComplete(gig: ActiveGig) {
    setRatingGig(gig);
    setRating(0);
    setRatingNote("");
    setRatingSubmitted(false);
  }

  function submitRating() {
    if (!ratingGig) return;
    const updated = gigs.map(g =>
      g.id === ratingGig.id ? { ...g, gigStatus: "rated" as const } : g
    );
    setGigs(updated);
    localStorage.setItem("kaziin_active_gigs", JSON.stringify(updated));
    setRatingSubmitted(true);
  }

  function closeRating() {
    setRatingGig(null);
    setRating(0);
    setRatingNote("");
    setRatingSubmitted(false);
  }

  const activeGigs = gigs.filter(g => g.gigStatus === "active");
  const completedGigs = gigs.filter(g => g.gigStatus === "rated" || g.gigStatus === "completed");

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">My Active Gigs</h1>
          <p className="mt-1 text-ink-soft text-[15px]">Track tasks you&apos;ve accepted and mark them complete.</p>
        </div>
        <Link href="/dashboard/gigs" className="text-[13.5px] text-accent-dark font-medium hover:underline">
          ← Browse more gigs
        </Link>
      </div>

      {gigs.length === 0 ? (
        <div className="py-16 text-center border border-line rounded-[14px]">
          <div className="text-[15px] font-semibold text-ink mb-2">No active gigs yet</div>
          <p className="text-ink-soft text-[14px] mb-6 max-w-[360px] mx-auto">Browse the gig feed and accept tasks to see them here.</p>
          <Link href="/dashboard/gigs" className="inline-block px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors">
            Browse Gig Feed
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Active */}
          {activeGigs.length > 0 && (
            <div>
              <h2 className="font-data text-[12px] uppercase tracking-wider font-semibold text-accent-dark mb-4">In Progress</h2>
              <div className="flex flex-col gap-4">
                {activeGigs.map(gig => (
                  <div key={gig.id} className="border border-line rounded-[14px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[18px]">{CATEGORY_ICONS[gig.category] ?? ""}</span>
                          <span className="font-data text-[11px] bg-accent-soft text-accent-dark px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <h3 className="font-display font-semibold text-[15px] text-ink mb-1">{gig.title}</h3>
                        <div className="text-[13px] text-ink-soft mb-3">{gig.location}</div>
                        <div className="flex gap-3">
                          <a href={`https://wa.me/${gig.contactPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-lg border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors">
                            
                            Chat with client
                          </a>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {gig.budget && (
                          <div className="font-display font-bold text-[17px] text-[#2F6D53] mb-3">{gig.currency} {Number(gig.budget).toLocaleString()}</div>
                        )}
                        <button onClick={() => markComplete(gig)}
                          className="px-5 py-2 rounded-lg border border-[#2F6D53] text-[#2F6D53] font-semibold text-[13px] hover:bg-accent-soft transition-colors">
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedGigs.length > 0 && (
            <div>
              <h2 className="font-data text-[12px] uppercase tracking-wider font-semibold text-ink-soft mb-4">Completed</h2>
              <div className="flex flex-col gap-3">
                {completedGigs.map(gig => (
                  <div key={gig.id} className="border border-line rounded-[12px] p-4 flex items-center justify-between gap-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <span className="text-[16px]">{CATEGORY_ICONS[gig.category] ?? ""}</span>
                      <div>
                        <div className="font-semibold text-[14px]">{gig.title}</div>
                        <div className="text-[12px] text-ink-soft">{gig.location}</div>
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-accent-dark"> Rated</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Modal */}
      {ratingGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-paper border border-line rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={closeRating} className="absolute top-4 right-4 text-ink-soft hover:text-ink text-xl"></button>
            {ratingSubmitted ? (
              <div className="text-center">
                <div className="text-4xl mb-4"></div>
                <h3 className="font-display font-bold text-[20px] text-[#2F6D53] mb-2">Gig complete!</h3>
                <p className="text-ink-soft text-[14px] mb-6">Thank you for your rating. Your reputation grows with every completed task.</p>
                <button onClick={closeRating} className="w-full px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display font-bold text-[18px] mb-1">Rate this gig</h3>
                <p className="text-ink-soft text-[14px] mb-6">{ratingGig.title}</p>
                <div className="mb-6">
                  <label className="block font-data text-[12.5px] text-ink-soft mb-3">How was the client?</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(star)}
                        className={`text-[28px] transition-transform hover:scale-110 ${star <= rating ? "opacity-100" : "opacity-30"}`}>
                        
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="rating-note" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
                    Any comments? <span className="text-ink-soft/60">(optional)</span>
                  </label>
                  <textarea id="rating-note" value={ratingNote} onChange={e => setRatingNote(e.target.value)} rows={3}
                    className="w-full border border-line rounded-[9px] px-3 py-2.5 text-[14px] focus:outline-none focus:border-accent resize-none"
                    placeholder="Was the client clear, fair, and punctual?" />
                </div>
                <button onClick={submitRating} disabled={rating === 0}
                  className="w-full px-6 py-3 rounded-xl bg-[#2F6D53] text-white font-bold text-[14px] hover:bg-[#1E4D39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Submit Rating
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
