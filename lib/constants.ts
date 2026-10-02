/* ============================================================
   KAZIIN — App Constants
   ============================================================ */

export const SITE_NAME = "Kaziin";
export const SITE_TAGLINE = "Find work. Go global. Hire talent.";
export const SITE_DESCRIPTION =
  "A smarter way to connect people with opportunity — locally, remotely and across borders.";

export const MAX_WIDTH = 1360;

/** Employment type labels for display. */
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  temporary: "Temporary",
  gig: "Gig",
  internship: "Internship",
  apprenticeship: "Apprenticeship",
  seasonal: "Seasonal",
  casual: "Casual",
};

/** Work arrangement labels. */
export const WORK_ARRANGEMENT_LABELS: Record<string, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
  "remote-first": "Remote-first",
  "travel-based": "Travel-based (e.g. Driver)",
  "field-based": "Field-based (e.g. Construction)",
};

/** Career levels. */
export const CAREER_LEVEL_LABELS: Record<string, string> = {
  entry: "Entry-level",
  junior: "Junior",
  "mid-level": "Mid-level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
};

/** Match labels display text. */
export const MATCH_LABELS: Record<string, string> = {
  strong: "Strong Match",
  good: "Good Match",
  potential: "Potential Match",
  transferable: "Transferable Skills",
  weak: "Weak Match",
};

/** Question types for application forms. */
export const QUESTION_TYPES: Record<string, string> = {
  text: "Short Answer",
  textarea: "Long Answer",
  number: "Number",
  boolean: "Yes/No",
  single_select: "Single Choice",
  multi_select: "Multiple Choice",
  date: "Date",
  file: "File Upload",
};

/** Verification levels. */
export const VERIFICATION_LEVELS = {
  unverified: "Unverified",
  self_declared: "Self-declared",
  document_uploaded: "Document uploaded",
  source_verified: "Source verified (e.g. University)",
};

/** Career readiness checklist items. */
export const READINESS_CHECKLIST = [
  { key: "cv", label: "CV uploaded", icon: "file" },
  { key: "phone", label: "Phone verified", icon: "phone" },
  { key: "skills", label: "Skills added", icon: "star" },
  { key: "experience", label: "Experience added", icon: "briefcase" },
  { key: "assessment", label: "Assessment completed", icon: "check" },
  { key: "portfolio", label: "Portfolio added", icon: "image" },
  { key: "references", label: "References added", icon: "users" },
] as const;

/** Global journey stage labels. */
export const JOURNEY_STAGE_LABELS: Record<string, string> = {
  profile: "Profile",
  eligibility: "Eligibility",
  matched: "Match",
  verified: "Verification",
  support_assessment: "Support assessment",
  mobilization: "Mobilization",
  employment: "Employment",
  repayment: "Repayment",
  completed: "Completed",
};
