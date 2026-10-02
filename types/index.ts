/* ============================================================
   KAZIIN — Domain Models
   All entity types used across the platform.
   Based on SKILL.md §50–51.
   ============================================================ */

/* ── Taxonomy & Structs ──────────────────────────────────── */

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

export interface JobFamily {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface JobRole {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export type QuestionType = "text" | "textarea" | "number" | "boolean" | "single_select" | "multi_select" | "date" | "file";

export interface ApplicationQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  categoryId?: string;
  familyId?: string;
  roleId?: string;
  validation: Record<string, any>;
  options: string[];
  conditionalRule?: {
    dependsOn: string;
    showWhen: any;
  };
  evidenceRequired: boolean;
  sortOrder: number;
}

export interface ApplicationAnswer {
  id?: string;
  applicationId?: string;
  questionId: string;
  answer: any;
}

export interface MatchExplanation {
  label: MatchLabel;
  matched: string[];
  gap: string[];
  transferable: string[];
}

/* ── Skills Graph (§10, §11) ─────────────────────────────── */

export type SkillType = "technical" | "soft" | "trade" | "language" | "tool";

export interface Skill {
  id: string;
  canonicalName: string;
  slug: string;
  description?: string;
  category?: string;
  skillType: SkillType;
  jobFamilies: string[];
  verified: boolean;
  sortOrder: number;
  aliases?: SkillAlias[];
  children?: SkillRelationship[];
  parents?: SkillRelationship[];
}

export interface SkillAlias {
  id: string;
  skillId: string;
  alias: string;
}

export interface SkillRelationship {
  id: string;
  parentSkillId: string;
  childSkillId: string;
  relationship: "specialization" | "related" | "prerequisite";
  parentSkill?: Pick<Skill, "id" | "canonicalName" | "slug">;
  childSkill?: Pick<Skill, "id" | "canonicalName" | "slug">;
}


/* ── Enums / State Types ─────────────────────────────────── */

export type JobStatus = "draft" | "published" | "paused" | "filled" | "expired";

export type ApplicationStatus =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "interview"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "failed"
  | "expired";

export type FundingStatus =
  | "not_started"
  | "assessment"
  | "pending"
  | "approved"
  | "declined"
  | "disbursed"
  | "repaying"
  | "completed";

export type GlobalJourneyStage =
  | "profile"
  | "eligibility"
  | "matched"
  | "verified"
  | "support_assessment"
  | "mobilization"
  | "employment"
  | "repayment"
  | "completed";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "temporary"
  | "gig"
  | "internship"
  | "apprenticeship"
  | "seasonal"
  | "casual";

export type WorkArrangement = "onsite" | "remote" | "hybrid" | "remote-first" | "travel-based" | "field-based";

export type CareerLevel = "entry" | "junior" | "mid-level" | "senior" | "lead" | "executive";

export type MatchLabel = "strong" | "good" | "potential" | "transferable" | "weak";

export type UserRole = "candidate" | "global_candidate" | "recruiter" | "admin";

export type ProfileVisibility =
  | "public"
  | "recruiters_only"
  | "verified_employers_only"
  | "private";

/* ── Core Entities ───────────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface CandidateSkill {
  id: string;
  name: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  verified: boolean;
}

/** Structured work history entry stored in candidate_work_history table. */
export interface CandidateWorkHistory {
  id: string;
  candidateId: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  employmentType: EmploymentType;
  verified: boolean;
}

/** Structured education record stored in candidate_education table. */
export interface CandidateEducationRecord {
  id: string;
  candidateId: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  verified: boolean;
}

/** Structured certification stored in candidate_certifications table. */
export interface CandidateCertification {
  id: string;
  candidateId: string;
  name: string;
  issuer?: string;
  dateObtained?: string;
  expiryDate?: string;
  licenseNumber?: string;
  verified: boolean;
  verificationStatus: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  verified: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained?: string;
  date?: string; // legacy support
  expiryDate?: string;
  licenseNumber?: string;
  verified: boolean;
  verificationStatus?: VerificationStatus;
}

export interface CandidateLicense {
  id: string;
  candidateId: string;
  type: string;
  category?: string;
  issuingAuthority?: string;
  licenseNumber?: string;
  expiryDate?: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
}

export interface CandidateLanguage {
  id: string;
  candidateId: string;
  language: string;
  proficiency: string;
}

export interface CandidatePortfolioItem {
  id: string;
  candidateId: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
  filePath?: string;
}

export interface CandidateCareerTarget {
  id: string;
  candidateId: string;
  categoryId?: string;
  familyId?: string;
  roleId?: string;
  priority: number;
}

export interface Verification {
  type: "identity" | "phone" | "email" | "education" | "certification" | "employment" | "references" | "skills" | "work_authorization";
  status: VerificationStatus;
  verifiedAt?: string;
  reason?: string;
}

/* ── Candidate ───────────────────────────────────────────── */

export interface CareerProfile {
  id: string;
  userId: string;
  headline: string;
  summary?: string;
  skills: CandidateSkill[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  verifications: Verification[];
  availability: string;
  location: string;
  workPreferences: WorkArrangement[];
  employmentTypes: EmploymentType[];
  salaryExpectation?: SalaryRange;
  readinessScore: number;
  profileCompleteness: number;
  careerLevel?: CareerLevel;
  visibility: ProfileVisibility;
  cvUploaded: boolean;
  portfolioUrl?: string;
  references: number;
  languages?: CandidateLanguage[];
  licenses?: CandidateLicense[];
  portfolioItems?: CandidatePortfolioItem[];
  careerTargets?: CandidateCareerTarget[];
}

export interface Candidate {
  id: string;
  user: User;
  profile: CareerProfile;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: "annual" | "monthly";
}

/* ── Employer & Recruiter ────────────────────────────────── */

export interface Employer {
  id: string;
  name: string;
  industry: string;
  location: string;
  website?: string;
  logoUrl?: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  size?: string;
  description?: string;
}

export interface Recruiter {
  id: string;
  user: User;
  employer: Employer;
  title: string;
  verified: boolean;
}

/* ── Job ─────────────────────────────────────────────────── */

export interface Job {
  id: string;
  slug: string;
  title: string;
  employer: Employer;
  location: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  salary?: SalaryRange;
  description: string;
  requirements: string[];
  hardRequirements?: string[];
  softRequirements?: string[];
  languagesRequired?: string[];
  workAuthorization?: string;
  benefits?: string[];
  skills: string[];
  experienceLevel: string;
  careerLevel?: CareerLevel;
  categoryId?: string;
  familyId?: string;
  roleId?: string;
  industryId?: string;
  status: JobStatus;
  postedAt: string;
  expiresAt?: string;
  applicantCount?: number;
  verified: boolean;
}

export interface JobMatch {
  job: Job;
  score: number;
  explanation: MatchExplanation[];
}

/* ── Application ─────────────────────────────────────────── */

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}

/* ── Shortlist ───────────────────────────────────────────── */

export interface ShortlistCandidate {
  candidate: Candidate;
  score: number;
  explanation: MatchExplanation[];
  featured?: boolean;
}

export interface Shortlist {
  id: string;
  jobId: string;
  job: Job;
  totalAnalyzed: number;
  qualified: number;
  strongMatches: number;
  recommended: number;
  candidates: ShortlistCandidate[];
}

/* ── Interview ───────────────────────────────────────────── */

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  duration: number; // minutes
  type: "phone" | "video" | "onsite";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
}

export interface Offer {
  id: string;
  applicationId: string;
  salary: SalaryRange;
  startDate: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

/* ── Messaging ───────────────────────────────────────────── */

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

/* ── Global Careers ──────────────────────────────────────── */

export interface GlobalOpportunity {
  id: string;
  slug: string;
  title: string;
  employer: Employer;
  country: string;
  location: string;
  salary?: SalaryRange;
  accommodationProvided: boolean;
  transportProvided: boolean;
  contractDuration?: string;
  experienceRequired: string;
  requirements: string[];
  verified: boolean;
  verificationStatus: VerificationStatus;
  eligibilityScore?: number;
  supportEligible: boolean;
}

export interface FundingProgram {
  id: string;
  provider: string;
  maxSupport: number;
  currency: string;
  eligibleExpenses: string[];
  fees: string;
  repaymentDuration: string;
  repaymentStructure: string;
  terms: string;
}

export interface FundingApplication {
  id: string;
  candidateId: string;
  programId: string;
  program: FundingProgram;
  requestedAmount: number;
  status: FundingStatus;
  repaymentPeriod?: string;
  estimatedInstalment?: number;
  totalRepayment?: number;
  appliedAt: string;
  updatedAt: string;
}

export interface SupportCase {
  id: string;
  candidateId: string;
  opportunityId: string;
  fundingApplicationId?: string;
  journeyStage: GlobalJourneyStage;
  stages: {
    stage: GlobalJourneyStage;
    status: "completed" | "current" | "upcoming";
    completedAt?: string;
  }[];
}

export interface RepaymentPlan {
  id: string;
  fundingApplicationId: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  instalments: number;
  paidInstalments: number;
  nextDueDate?: string;
  nextAmount?: number;
}

/* ── Notification ────────────────────────────────────────── */

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

/* ── Search / Filter ─────────────────────────────────────── */

export interface SearchFilter {
  key: string;
  label: string;
  value: string;
}

export interface FunnelData {
  label: string;
  count: number;
  percentage: number;
}
