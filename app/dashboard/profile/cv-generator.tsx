"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

/* ============================================================
   CvGenerator — ATS-compliant CV / Service Profile generator.
   Produces a clean, single-column, ATS-readable PDF via
   browser print. Design is intentionally minimal for ATS
   parsing compatibility.
   ============================================================ */

type ProfileType = "cv" | "service" | "gig";

interface WorkExperience {
  role: string;
  organisation: string;
  dates: string;
  bullets: string[];
}

interface EducationEntry {
  degree: string;
  institution: string;
  dates: string;
}

export interface CvData {
  name: string;
  headline: string;
  location: string;
  summary: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  skills?: string[];
  structuredExperience?: WorkExperience[];
  experience?: string[];           // legacy flat list — used if structuredExperience absent
  structuredEducation?: EducationEntry[];
  education?: string[];            // legacy flat list
  certifications?: string[];
  // For service profile / gig bio
  offersRaw?: string;              // free-text what they offer
  rateInfo?: string;               // e.g. "KES 800/hr · Negotiable"
  availability?: string;
}

const PROFILE_TYPES: { id: ProfileType; label: string; desc: string }[] = [
  { id: "cv",      label: "Professional CV",   desc: "Standard ATS-optimised resume for job applications" },
  { id: "service", label: "Service Profile",   desc: "One-pager highlighting what you offer, your rate, and how to hire you" },
  { id: "gig",     label: "Gig Bio",           desc: "Short, punchy profile for errand running, casual, or task-based work" },
];

export function CvGenerator({ data, onClose }: { data: CvData; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [profileType, setProfileType] = useState<ProfileType>("cv");

  // Merge legacy flat list into structured experience if needed
  const workItems: WorkExperience[] = data.structuredExperience?.length
    ? data.structuredExperience
    : (data.experience ?? []).map(e => ({ role: e, organisation: "", dates: "", bullets: [] }));

  const eduItems: EducationEntry[] = data.structuredEducation?.length
    ? data.structuredEducation
    : (data.education ?? []).map(e => ({ degree: e, institution: "", dates: "" }));

  // ── State for user-editable fields in generator ──
  const [phone, setPhone] = useState(data.phone ?? "");
  const [linkedin, setLinkedin] = useState(data.linkedin ?? "");
  const [github, setGithub] = useState(data.github ?? "");
  const [website, setWebsite] = useState(data.website ?? "");
  const [offersText, setOffersText] = useState(data.offersRaw ?? "");
  const [rateText, setRateText] = useState(data.rateInfo ?? "");

  function buildContactLine() {
    const parts: string[] = [];
    if (data.email) parts.push(data.email);
    if (phone) parts.push(phone);
    if (data.location) parts.push(data.location);
    if (linkedin) parts.push(linkedin.replace(/^https?:\/\/(www\.)?/, ""));
    if (github) parts.push(github.replace(/^https?:\/\/(www\.)?/, ""));
    if (website) parts.push(website.replace(/^https?:\/\/(www\.)?/, ""));
    return parts.join(" | ");
  }

  function buildPrintHtml(): string {
    const esc = (s: string) => s
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    const contactLine = esc(buildContactLine());
    const name = esc(data.name || "Your Name");
    const headline = esc(data.headline || "");
    const summary = esc(data.summary || "");

    // Shared ATS base styles — single column, no decorative CSS, semantic hierarchy
    const baseStyles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
        max-width: 720px;
        margin: 0 auto;
        padding: 36px 40px;
      }
      h1 { font-size: 22pt; font-weight: bold; margin-bottom: 2px; }
      h2 { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;
           border-bottom: 1px solid #000; margin: 18px 0 8px; padding-bottom: 2px; }
      h3 { font-size: 11pt; font-weight: bold; margin-bottom: 0; }
      p { margin-bottom: 8px; }
      ul { margin: 4px 0 8px 18px; }
      li { margin-bottom: 2px; }
      .contact { font-size: 10pt; color: #333; margin: 4px 0 2px; }
      .sub-headline { font-size: 12pt; margin-bottom: 6px; }
      .entry { margin-bottom: 12px; }
      .entry-meta { font-size: 10pt; color: #555; margin-bottom: 2px; }
      .skills-line { margin-bottom: 6px; }
      @media print {
        body { padding: 20px; }
        @page { margin: 15mm; }
      }
    `;

    if (profileType === "cv") {
      // Work experience section
      const expHtml = workItems.length ? `
        <h2>Work Experience</h2>
        ${workItems.map(w => `
          <div class="entry">
            <h3>${esc(w.role)}${w.organisation ? ` &mdash; ${esc(w.organisation)}` : ""}</h3>
            ${w.dates ? `<div class="entry-meta">${esc(w.dates)}</div>` : ""}
            ${w.bullets.length ? `<ul>${w.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          </div>
        `).join("")}
      ` : "";

      const eduHtml = eduItems.length ? `
        <h2>Education</h2>
        ${eduItems.map(e => `
          <div class="entry">
            <h3>${esc(e.degree)}${e.institution ? ` &mdash; ${esc(e.institution)}` : ""}</h3>
            ${e.dates ? `<div class="entry-meta">${esc(e.dates)}</div>` : ""}
          </div>
        `).join("")}
      ` : "";

      const skillsHtml = data.skills?.length ? `
        <h2>Skills</h2>
        <p class="skills-line">${data.skills.map(esc).join(" &bull; ")}</p>
      ` : "";

      const certsHtml = data.certifications?.length ? `
        <h2>Certifications</h2>
        <ul>${data.certifications.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
      ` : "";

      return `<!DOCTYPE html><html lang="en">
      <head><meta charset="UTF-8"><title>${name} - CV</title><style>${baseStyles}</style></head>
      <body>
        <h1>${name}</h1>
        ${headline ? `<p class="sub-headline">${headline}</p>` : ""}
        <p class="contact">${contactLine}</p>
        ${summary ? `<h2>Professional Summary</h2><p>${summary}</p>` : ""}
        ${expHtml}${eduHtml}${skillsHtml}${certsHtml}
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`;
    }

    if (profileType === "service") {
      const offersHtml = offersText
        ? offersText.split("\n").filter(Boolean).map(l => `<li>${esc(l)}</li>`).join("")
        : "";

      return `<!DOCTYPE html><html lang="en">
      <head><meta charset="UTF-8"><title>${name} - Service Profile</title><style>${baseStyles}</style></head>
      <body>
        <h1>${name}</h1>
        ${headline ? `<p class="sub-headline">${headline}</p>` : ""}
        <p class="contact">${contactLine}</p>
        ${rateText ? `<p><strong>Rate:</strong> ${esc(rateText)}</p>` : ""}
        <h2>About Me</h2>
        <p>${summary || "Independent service provider."}</p>
        ${offersHtml ? `<h2>What I Offer</h2><ul>${offersHtml}</ul>` : ""}
        ${data.skills?.length ? `<h2>Skills &amp; Tools</h2><p class="skills-line">${data.skills.map(esc).join(" &bull; ")}</p>` : ""}
        ${data.certifications?.length ? `<h2>Certifications</h2><ul>${data.certifications.map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`;
    }

    // Gig Bio — single short page
    return `<!DOCTYPE html><html lang="en">
    <head><meta charset="UTF-8"><title>${name} - Gig Bio</title><style>${baseStyles} body { max-width: 560px; }</style></head>
    <body>
      <h1>${name}</h1>
      <p class="contact">${contactLine}</p>
      ${rateText ? `<p><strong>Rate / Availability:</strong> ${esc(rateText)}</p>` : ""}
      <h2>About</h2>
      <p>${summary || "Available for task-based and gig work."}</p>
      ${offersHtml(offersText, esc)}
      ${data.skills?.length ? `<h2>Skills</h2><p>${data.skills.slice(0, 8).map(esc).join(", ")}</p>` : ""}
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`;
  }

  function offersHtml(text: string, esc: (s: string) => string) {
    if (!text) return "";
    const lines = text.split("\n").filter(Boolean).map(l => `<li>${esc(l)}</li>`).join("");
    return lines ? `<h2>What I Do</h2><ul>${lines}</ul>` : "";
  }

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) { setPrinting(false); return; }
      printWindow.document.write(buildPrintHtml());
      printWindow.document.close();
      setPrinting(false);
    }, 100);
  }

  const inputClass = "w-full border border-line rounded-lg px-3 py-2 text-[14px] bg-paper focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block font-data text-[11.5px] text-ink-soft mb-1 uppercase tracking-wider";

  return (
    <div className="flex flex-col mt-10 pt-10 border-t border-line">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-line">
        <h3 className="font-display font-semibold text-[16px]">CV &amp; Profile Generator</h3>
        <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors text-[20px] leading-none">×</button>
      </div>

      {/* Profile Type Selector */}
      <div className="mt-6">
        <div className="font-data text-[12px] text-ink-soft mb-3 uppercase tracking-wider">What to generate</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROFILE_TYPES.map(pt => (
            <button
              key={pt.id}
              onClick={() => setProfileType(pt.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                profileType === pt.id
                  ? "border-accent bg-accent-soft/20 text-ink"
                  : "border-line text-ink-soft hover:border-accent/40"
              }`}
            >
              <div className="font-semibold text-[14px] mb-1">{pt.label}</div>
              <div className="text-[12px] leading-snug opacity-75">{pt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Fields */}
      <div className="mt-6 p-5 border border-line rounded-xl">
        <div className="font-display font-semibold text-[14px] mb-4">Contact Details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email (from profile)</label>
            <input className={`${inputClass} opacity-60`} value={data.email} disabled />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input className={inputClass} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname" />
          </div>
          <div>
            <label className={labelClass}>{profileType === "cv" ? "GitHub / Portfolio" : "Website / Social"}</label>
            <input className={inputClass} value={profileType === "cv" ? github : website}
              onChange={e => profileType === "cv" ? setGithub(e.target.value) : setWebsite(e.target.value)}
              placeholder="github.com/yourname" />
          </div>
        </div>
      </div>

      {/* Service / Gig specific fields */}
      {(profileType === "service" || profileType === "gig") && (
        <div className="mt-4 p-5 border border-line rounded-xl space-y-4">
          <div className="font-display font-semibold text-[14px] mb-1">Offer Details</div>
          <div>
            <label className={labelClass}>What I Offer (one per line)</label>
            <textarea className={`${inputClass} resize-none`} rows={4} value={offersText}
              onChange={e => setOffersText(e.target.value)}
              placeholder={"Grocery shopping & delivery within 5km\nPet sitting & dog walking\nLaundry & ironing"} />
          </div>
          <div>
            <label className={labelClass}>Rate / Pricing Info</label>
            <input className={inputClass} value={rateText} onChange={e => setRateText(e.target.value)}
              placeholder="e.g. KES 500/errand · Negotiable for bulk" />
          </div>
        </div>
      )}

      {/* ATS note for CV type */}
      {profileType === "cv" && (
        <div className="mt-4 p-4 border border-line rounded-xl bg-accent-soft/10">
          <div className="font-semibold text-[13px] mb-1"> ATS-Optimised Output</div>
          <p className="text-[12.5px] text-ink-soft leading-relaxed">
            The downloaded PDF uses a clean single-column layout with standard heading hierarchy (H1/H2/H3),
            plain Arial font, and no decorative tables, columns, or images — making it readable by all major
            Applicant Tracking Systems (Greenhouse, Workday, Lever, iCIMS).
          </p>
        </div>
      )}

      {/* Preview (in-app) */}
      <div className="mt-6 border border-line rounded-xl p-6 bg-paper" ref={printRef}>
        <div className="font-display font-bold text-[22px]">{data.name || "Your Name"}</div>
        {data.headline && <div className="text-[15px] text-ink-soft mt-0.5">{data.headline}</div>}
        <div className="text-[12.5px] text-ink-soft font-data mt-1">{buildContactLine()}</div>
        {rateText && (profileType !== "cv") && (
          <div className="text-[13px] mt-1"><span className="font-semibold">Rate:</span> {rateText}</div>
        )}

        {data.summary && (
          <div className="mt-4">
            <div className="font-data text-[10px] uppercase tracking-widest text-ink-soft mb-1 pb-1 border-b border-line">
              {profileType === "cv" ? "Professional Summary" : "About"}
            </div>
            <p className="text-[13px] text-ink-soft leading-relaxed">{data.summary}</p>
          </div>
        )}

        {offersText && profileType !== "cv" && (
          <div className="mt-4">
            <div className="font-data text-[10px] uppercase tracking-widest text-ink-soft mb-1 pb-1 border-b border-line">What I Offer</div>
            <ul className="text-[13px] text-ink-soft space-y-0.5 pl-4 list-disc">
              {offersText.split("\n").filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}

        {profileType === "cv" && workItems.length > 0 && (
          <div className="mt-4">
            <div className="font-data text-[10px] uppercase tracking-widest text-ink-soft mb-2 pb-1 border-b border-line">Work Experience</div>
            <div className="space-y-3">
              {workItems.map((w, i) => (
                <div key={i}>
                  <div className="font-semibold text-[13px]">{w.role}{w.organisation ? ` — ${w.organisation}` : ""}</div>
                  {w.dates && <div className="text-[11.5px] text-ink-soft">{w.dates}</div>}
                  {w.bullets.length > 0 && (
                    <ul className="pl-4 list-disc text-[12.5px] text-ink-soft space-y-0.5 mt-1">
                      {w.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {profileType === "cv" && data.skills && data.skills.length > 0 && (
          <div className="mt-4">
            <div className="font-data text-[10px] uppercase tracking-widest text-ink-soft mb-1 pb-1 border-b border-line">Skills</div>
            <p className="text-[13px] text-ink-soft">{data.skills.join(" · ")}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5">
        <Button variant="primary" onClick={handlePrint} loading={printing}>
          Download as PDF
        </Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
      <p className="text-[12px] text-ink-soft mt-3 font-data">
        In the print dialog, select &quot;Save as PDF&quot; as the printer destination.
      </p>
    </div>
  );
}
