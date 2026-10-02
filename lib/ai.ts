/**
 * Kaziin AI Service Stubs
 * 
 * This file contains functional stubs for the AI integrations defined in the blueprint.
 * In a production environment, these would connect to OpenAI, Anthropic, or an internal ML model.
 */

import type { CandidateData, JobData } from "./matching";

export interface AIServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── 1. CV/Resume Parsing ────────────────────────────────────────────────

export interface ParsedCV {
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  inferredRole: string;
}

export async function parseCVContent(text: string): Promise<AIServiceResponse<ParsedCV>> {
  // Stub implementation
  // Simulates an LLM extracting structured data from unstructured text
  
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate latency

  return {
    success: true,
    data: {
      skills: ["React", "TypeScript", "Communication", "Agile"],
      experienceYears: 4,
      educationLevel: "Bachelor's Degree",
      inferredRole: "Frontend Developer"
    }
  };
}

// ── 2. Fraud Detection & Trust Scoring ──────────────────────────────────

export interface TrustAssessment {
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  confidenceScore: number;
}

export async function assessJobPostingRisk(title: string, description: string, salary: string): Promise<AIServiceResponse<TrustAssessment>> {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Basic heuristic stub
  const suspiciousKeywords = ["western union", "wire transfer", "cash only", "guaranteed income"];
  const lowerDesc = description.toLowerCase();
  
  let risk: "low" | "medium" | "high" = "low";
  const flags: string[] = [];

  for (const word of suspiciousKeywords) {
    if (lowerDesc.includes(word)) {
      flags.push(`Suspicious keyword found: ${word}`);
      risk = "high";
    }
  }

  if (salary && salary.includes("unlimited")) {
    flags.push("Unrealistic salary claim");
    risk = risk === "low" ? "medium" : risk;
  }

  return {
    success: true,
    data: {
      riskLevel: risk,
      flags,
      confidenceScore: 0.85
    }
  };
}

export async function assessCandidateProfileRisk(profileData: any): Promise<AIServiceResponse<TrustAssessment>> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    success: true,
    data: {
      riskLevel: "low",
      flags: [],
      confidenceScore: 0.95
    }
  };
}

// ── 3. Profile Readiness & DNA Computation ──────────────────────────────

export function calculateReadinessScore(profile: any): number {
  let score = 20; // Base score for having an account
  
  if (profile.headline) score += 10;
  if (profile.location) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 20;
  if (profile.experience && profile.experience.length > 0) score += 25;
  if (profile.cv_uploaded) score += 15;
  
  return Math.min(100, score);
}

// ── 4. Generative Match Explanation ─────────────────────────────────────

export async function generateMatchExplanation(candidate: CandidateData, job: JobData, score: number): Promise<string> {
  // Simulates an LLM generating a human-readable explanation of why a candidate matches a job
  
  if (score >= 80) {
    return `Strong match! Your ${candidate.skills.slice(0, 2).join(" and ")} skills align perfectly with the core requirements of this role.`;
  } else if (score >= 60) {
    return `Good potential. You meet the baseline requirements, but brushing up on ${job.skills.find(s => !candidate.skills.includes(s)) || "certain specialized tools"} would make you a stronger fit.`;
  } else {
    return `This role requires specific experience in ${job.skills.slice(0, 2).join(" and ")} which isn't highlighted in your profile yet.`;
  }
}
