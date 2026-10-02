"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { CvGenerator } from "./cv-generator";

/* ============================================================
   ProfileEditor — Client Component
   Editable Career Passport with CV upload to Supabase Storage.
   ============================================================ */

interface ProfileData {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  availability: string | null;
  readiness_score: number;
  cv_uploaded: boolean;
  avatar_url: string | null;
  skills?: string[] | null;
  experience?: string[] | null;
  education?: string[] | null;
  certifications?: string[] | null;
  portfolio_url?: string | null;
  work_preferences?: string[] | null;
  employment_types?: string[] | null;
}

const AVAILABILITY_OPTIONS = [
  { value: "open", label: "Open to offers" },
  { value: "immediately", label: "Available immediately" },
  { value: "2_weeks", label: "2 weeks notice" },
  { value: "1_month", label: "1 month notice" },
  { value: "not_looking", label: "Not currently looking" },
];

export function ProfileEditor({
  profile,
  userEmail,
}: {
  profile: ProfileData;
  userEmail: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(profile.name ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [availability, setAvailability] = useState(
    profile.availability ?? "open"
  );
  const [availableNow, setAvailableNow] = useState((profile as any).available_now ?? false);
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url ?? "");
  const [skills, setSkills] = useState(joinList(profile.skills));
  const [experience, setExperience] = useState(joinList(profile.experience));
  const [education, setEducation] = useState(joinList(profile.education));
  const [certifications, setCertifications] = useState(joinList(profile.certifications));
  const [workPreferences, setWorkPreferences] = useState<string[]>(
    profile.work_preferences?.length ? profile.work_preferences : ["remote"]
  );
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(
    profile.employment_types?.length ? profile.employment_types : ["full-time"]
  );
  // Contact / social links (for CV generator)
  const [phone, setPhone] = useState((profile as any).phone ?? "");
  const [linkedin, setLinkedin] = useState((profile as any).linkedin ?? "");
  const [github, setGithub] = useState((profile as any).github ?? "");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(profile.cv_uploaded);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Calculate readiness
  const readinessChecklist = [
    { label: "Name added", done: !!name.trim() },
    { label: "Headline added", done: !!headline.trim() },
    { label: "Location set", done: !!location.trim() },
    { label: "Summary written", done: !!summary.trim() },
    { label: "Skills added", done: parseList(skills).length > 0 },
    { label: "Experience added", done: parseList(experience).length > 0 },
    { label: "CV uploaded", done: cvUploaded },
  ];
  const readinessScore = Math.round(
    (readinessChecklist.filter((i) => i.done).length /
      readinessChecklist.length) *
      100
  );

  // Initials for avatar
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        headline: headline.trim() || null,
        summary: summary.trim() || null,
        location: location.trim() || null,
        availability,
        portfolio_url: portfolioUrl.trim() || null,
        skills: parseList(skills),
        experience: parseList(experience),
        education: parseList(education),
        certifications: parseList(certifications),
        work_preferences: workPreferences,
        employment_types: employmentTypes,
        readiness_score: readinessScore,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError("Failed to save profile. Please try again.");
      console.error(updateError);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const filePath = `${profile.id}/cv.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError("Failed to upload CV. Please try again.");
      console.error(uploadError);
      setUploading(false);
      return;
    }

    // Update profile to mark CV as uploaded
    await supabase
      .from("profiles")
      .update({ cv_uploaded: true })
      .eq("id", profile.id);

    setCvUploaded(true);
    setCvFileName(file.name);
    setUploading(false);
    router.refresh();
  }

  const inputClass =
    "w-full border border-line rounded-lg px-3 py-2.5 text-[15px] bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors";

  return (
    <>
      {/* Readiness */}
      <div className="mt-8 pb-8 border-b border-line flex items-center justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="font-data text-[13px] text-ink-soft mb-2.5">
            Career readiness
          </div>
          <div className="flex items-center gap-3">
            <ProgressBar value={readinessScore} className="flex-1" />
            <span className="font-data font-semibold text-[14px]">
              {readinessScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar (Gig Features) */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-paper/80 backdrop-blur border-b border-line mb-8 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={availableNow} onChange={(e) => setAvailableNow(e.target.checked)} />
            <div className={`w-11 h-6 rounded-full transition-colors ${availableNow ? "bg-accent-dark" : "bg-ink-soft/30"}`} />
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${availableNow ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <div>
            <div className="font-semibold text-[14px] leading-tight flex items-center gap-2">
              Available Now {availableNow && <span className="w-2 h-2 rounded-full bg-accent-dark animate-pulse" />}
            </div>
            <div className="text-[12px] text-ink-soft mt-0.5">Boost your profile for immediate local gigs</div>
          </div>
        </label>
        <button onClick={() => setShowQRModal(true)} className="flex items-center gap-1 sm:gap-2 bg-ink-soft/10 hover:bg-ink-soft/20 text-ink px-2.5 sm:px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-colors shrink-0">
          
          My QR Code
        </button>
      </div>

      {/* Identity Section */}
      <section className="pt-2 border-t border-line">
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-display font-semibold text-[18px]">Identity</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full border border-accent bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[24px]">
            {initials || "?"}
          </div>
          <div>
            <div className="font-semibold text-[16px]">
              {name || "Your Name"}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="verified">Verified</Badge>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-[13.5px] text-[#7a2c23]">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
              Full name
            </label>
            <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your full name" />
          </div>

          {/* Headline */}
          <div>
            <label htmlFor="profile-headline" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
              What do you do? (Main hustle)
            </label>
            <input id="profile-headline" type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} placeholder="e.g. Graphic Designer, Reliable Errand Runner, Plumber" />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="profile-phone" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
              WhatsApp / Phone number
            </label>
            <input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+254 700 000 000" />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="profile-location" className="block font-data text-[12.5px] text-ink-soft mb-1.5">
              Where are you based?
            </label>
            <input id="profile-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="e.g. Nairobi CBD & Westlands" />
          </div>


          {/* Availability */}
          <div>
            <label
              htmlFor="profile-availability"
              className="block font-data text-[12.5px] text-ink-soft mb-1.5"
            >
              Availability
            </label>
            <Select
              id="profile-availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className={inputClass}
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>


          {/* Summary */}
          <div>
            <label
              htmlFor="profile-summary"
              className="block font-data text-[12.5px] text-ink-soft mb-1.5"
            >
              Tell people a bit about yourself
            </label>
            <textarea
              id="profile-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="What are you good at? What kind of work are you looking for? (Keep it short and friendly)"
            />
          </div>
        </div>
      </section>

      <section className="mt-10 pt-10 border-t border-line">
        <h2 className="font-display font-semibold text-[18px] mb-4">
          Skills and Preferences
        </h2>
        <div className="space-y-5">
          <ListTextarea
            id="profile-skills"
            label="What are your key skills? (comma separated)"
            value={skills}
            onChange={setSkills}
            placeholder="e.g. Plumbing, Customer Support, Graphic Design, Driving"
          />

          <ToggleGroup
            label="Work preferences"
            options={["onsite", "hybrid", "remote"]}
            selected={workPreferences}
            onChange={setWorkPreferences}
          />

          <ToggleGroup
            label="Employment types"
            options={["full-time", "part-time", "contract", "freelance", "temporary", "gig", "internship", "errands"]}
            selected={employmentTypes}
            onChange={setEmploymentTypes}
          />
        </div>
      </section>

      <section className="mt-10 pt-10 border-t border-line">
        <h2 className="font-display font-semibold text-[18px] mb-4">
          Experience and Credentials
        </h2>
        <div className="space-y-5">
          <ListTextarea
            id="profile-experience"
            label="Experience"
            value={experience}
            onChange={setExperience}
            placeholder={"Frontend Developer at Acme - Built hiring dashboards\nOperations Associate at Local Co - Managed customer workflows"}
          />
          <ListTextarea
            id="profile-education"
            label="Education"
            value={education}
            onChange={setEducation}
            placeholder={"BSc Computer Science - University of Nairobi\nCertificate in Project Management"}
          />
          <ListTextarea
            id="profile-certifications"
            label="Certifications"
            value={certifications}
            onChange={setCertifications}
            placeholder={"AWS Cloud Practitioner\nGoogle UX Design Certificate"}
          />
        </div>
      </section>

      {/* CV Upload Section */}
      <section className="mt-10 pt-10 border-t border-line">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-display font-semibold text-[18px]">
            CV / Resume
          </h2>
        </div>

        {cvUploaded ? (
          <div className="flex items-center justify-between gap-4 p-4 border border-line rounded-lg bg-paper">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
                
              </div>
              <div>
                <div className="font-semibold text-[14px]">
                  {cvFileName ?? "cv.pdf"}
                </div>
                <div className="text-ink-soft text-[12px] font-data">
                  Uploaded successfully 
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-line rounded-[12px] p-8 text-center hover:border-accent/50 hover:bg-accent-soft/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <div className="text-[14px] text-ink-soft">Uploading...</div>
              </div>
            ) : (
              <>
                
                <div className="font-semibold text-[14px] mb-1">
                  Upload your CV
                </div>
                <div className="text-[13px] text-ink-soft">
                  PDF only · Max 5MB
                </div>
              </>
            )}
          </button>
        )}

        {!cvUploaded && !showGenerator && (
          <div className="mt-4 text-center">
            <span className="text-[13px] text-ink-soft">
              Don&apos;t have a CV?{" "}
            </span>
            <button
              onClick={() => setShowGenerator(true)}
              className="text-[13px] text-accent-dark font-medium hover:underline"
            >
              Generate one
            </button>
          </div>
        )}

        {showGenerator && (
          <div className="mt-6">
          <CvGenerator
              data={{
                name,
                headline,
                location,
                summary,
                email: userEmail,
                phone,
                linkedin,
                github,
                website: portfolioUrl,
                skills: parseList(skills),
                experience: parseList(experience),
                education: parseList(education),
                certifications: parseList(certifications),
              }}
              onClose={() => setShowGenerator(false)}
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleCvUpload}
          className="hidden"
        />
      </section>

      {/* Readiness Checklist */}
      <section className="mt-10 pt-10 border-t border-line">
        <h2 className="font-display font-semibold text-[18px] mb-4">
          Profile checklist
        </h2>
        <div className="flex flex-col gap-2">
          {readinessChecklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-[13.5px]"
            >
              <span className={item.done ? "text-ink" : "text-ink-soft"}>
                {item.label}
              </span>
              <span
                className={`font-data ${
                  item.done ? "text-accent-dark" : "text-ink-soft"
                }`}
              >
                {item.done ? "" : "○"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Save button */}
      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Save profile
        </Button>
        {saved && (
          <span className="text-[13px] text-accent-dark font-medium animate-in fade-in">
            Profile saved 
          </span>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-paper border border-line rounded-2xl p-8 max-w-sm w-full relative text-center shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-ink-soft hover:text-ink text-xl"></button>
            <div className="w-16 h-16 mx-auto bg-accent-soft rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-accent-dark">
              {initials || "?"}
            </div>
            <h3 className="font-display font-bold text-[20px] mb-1">{name || "Your Name"}</h3>
            <p className="text-ink-soft text-[14px] mb-6">{headline || "Kaziin Profile"}</p>
            
            <div className="bg-white p-4 rounded-xl border border-line inline-block mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://kaziin.com/p/${userEmail?.split("@")[0] || "user"}`} 
                alt="Profile QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <p className="text-[13px] text-ink-soft mb-6 px-4">
              Let clients scan this code to view your profile, offers, and hire you instantly.
            </p>
            <Button variant="primary" className="w-full" onClick={() => setShowQRModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function ListTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-data text-[12.5px] text-ink-soft mb-1.5">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full border border-line rounded-lg px-3 py-2.5 text-[15px] bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors resize-y"
        placeholder={placeholder}
      />
      <p className="mt-1.5 text-[12px] text-ink-soft">
        Add one item per line, or separate short skills with commas.
      </p>
    </div>
  );
}

function ToggleGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    onChange(next.length > 0 ? next : [option]);
  }

  return (
    <fieldset>
      <legend className="block font-data text-[12.5px] text-ink-soft mb-2">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-lg border px-3 py-2 text-[13px] font-data capitalize transition-colors ${
                active
                  ? "border-accent bg-accent-soft text-accent-dark"
                  : "border-line bg-paper text-ink-soft hover:text-ink"
              }`}
              aria-pressed={active}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function parseList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value: string[] | null | undefined) {
  return value?.join("\n") ?? "";
}
