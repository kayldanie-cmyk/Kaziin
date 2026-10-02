/**
 * Kaziin — Matching Engine (Blueprint §7–9)
 *
 * Weighted, explainable candidate-to-job and job-to-candidate matching.
 * Hard eligibility filters run first; soft signals produce a weighted score.
 * Each match includes human-readable explanation factors.
 */

export type MatchLabel = "strong" | "good" | "potential" | "ineligible";

export interface MatchFactor {
  factor: string;
  matched: boolean;
  weight: number;
  detail?: string;
  type: "hard" | "soft";
}

export interface MatchResult {
  score: number;
  label: MatchLabel;
  eligible: boolean;
  factors: MatchFactor[];
  scoreComponents: Record<string, number>;
}

/** Default weights from Blueprint §8 */
export const DEFAULT_WEIGHTS = {
  relevant_skills: 0.30,
  experience: 0.20,
  semantic_similarity: 0.20,
  location_work_mode: 0.10,
  salary_compatibility: 0.10,
  availability: 0.05,
  education_certification: 0.05,
} as const;

export interface CandidateData {
  skills: string[];
  experienceYears: number;
  location: string;
  workPreferences: string[];
  employmentTypes: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  availability: string;
  certifications: string[];
  education: string[];
}

export interface JobData {
  title: string;
  skills: string[];
  experienceLevel: string;
  location: string;
  workArrangement: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  requirements: string[];
  mandatoryCertifications?: string[];
  mandatorySkills?: string[];
  mandatoryExperience?: number;
  mandatoryLocation?: string;
  mandatoryAuthorization?: string;
}

/**
 * Parse experience level strings into numeric years.
 */
function parseExperienceYears(level: string): number {
  const lower = level.toLowerCase();
  if (lower.includes("entry") || lower.includes("junior") || lower.includes("intern")) return 0;
  if (lower.includes("mid")) return 3;
  if (lower.includes("senior")) return 5;
  if (lower.includes("lead") || lower.includes("principal")) return 8;
  if (lower.includes("director") || lower.includes("executive")) return 10;
  const match = lower.match(/(\d+)\+?\s*year/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

/**
 * Check hard eligibility requirements (Blueprint §9).
 * If a candidate fails any hard requirement, they are normally excluded.
 */
function checkHardRequirements(candidate: CandidateData, job: JobData): MatchFactor[] {
  const factors: MatchFactor[] = [];

  // Mandatory certification
  if (job.mandatoryCertifications && job.mandatoryCertifications.length > 0) {
    const candidateCerts = candidate.certifications.map(c => c.toLowerCase());
    const hasCerts = job.mandatoryCertifications.every(cert =>
      candidateCerts.some(cc => cc.includes(cert.toLowerCase()))
    );
    factors.push({
      factor: "Required certification",
      matched: hasCerts,
      weight: 0,
      detail: hasCerts
        ? `Has ${job.mandatoryCertifications.join(", ")}`
        : `Missing ${job.mandatoryCertifications.join(", ")}`,
      type: "hard",
    });
  }

  // Mandatory minimum experience
  if (job.mandatoryExperience && job.mandatoryExperience > 0) {
    const hasExp = candidate.experienceYears >= job.mandatoryExperience;
    factors.push({
      factor: "Minimum experience",
      matched: hasExp,
      weight: 0,
      detail: hasExp
        ? `${candidate.experienceYears} years (${job.mandatoryExperience} required)`
        : `${candidate.experienceYears} years (${job.mandatoryExperience} required)`,
      type: "hard",
    });
  }

  // Mandatory skills
  if (job.mandatorySkills && job.mandatorySkills.length > 0) {
    const candidateSkills = candidate.skills.map(s => s.toLowerCase());
    const hasSkills = job.mandatorySkills.every(skill =>
      candidateSkills.some(cs => cs.includes(skill.toLowerCase()))
    );
    factors.push({
      factor: "Required skills",
      matched: hasSkills,
      weight: 0,
      detail: hasSkills
        ? `Has all mandatory skills`
        : `Missing required skills`,
      type: "hard",
    });
  }

  // Mandatory location
  if (job.mandatoryLocation) {
    const locationMatch =
      job.workArrangement === "remote" ||
      candidate.location.toLowerCase().includes(job.mandatoryLocation.toLowerCase());
    factors.push({
      factor: "Required location",
      matched: locationMatch,
      weight: 0,
      detail: locationMatch ? candidate.location : `Not in ${job.mandatoryLocation}`,
      type: "hard",
    });
  }

  return factors;
}

/**
 * Compute soft-signal weighted score (Blueprint §8).
 */
function computeSoftScore(
  candidate: CandidateData,
  job: JobData,
  weights: Record<string, number> = DEFAULT_WEIGHTS
): { score: number; factors: MatchFactor[]; components: Record<string, number> } {
  const factors: MatchFactor[] = [];
  const components: Record<string, number> = {};
  let totalScore = 0;

  // 1. Relevant skills (30%)
  const w1 = weights.relevant_skills ?? DEFAULT_WEIGHTS.relevant_skills;
  if (job.skills.length > 0) {
    const candidateSkills = candidate.skills.map(s => s.toLowerCase());
    const matchedSkills = job.skills.filter(s =>
      candidateSkills.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
    );
    const ratio = matchedSkills.length / job.skills.length;
    const skillScore = ratio * w1 * 100;
    totalScore += skillScore;
    components.relevant_skills = Math.round(skillScore);

    factors.push({
      factor: `${matchedSkills.length}/${job.skills.length} required skills`,
      matched: ratio >= 0.5,
      weight: w1,
      detail: matchedSkills.length > 0 ? matchedSkills.join(", ") : undefined,
      type: "soft",
    });

    // List individual matched skills
    job.skills.forEach(skill => {
      const isMatched = candidateSkills.some(cs =>
        cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
      );
      factors.push({
        factor: skill,
        matched: isMatched,
        weight: 0,
        type: "soft",
      });
    });
  } else {
    totalScore += w1 * 50; // partial credit if job doesn't specify skills
    components.relevant_skills = Math.round(w1 * 50);
  }

  // 2. Experience (20%)
  const w2 = weights.experience ?? DEFAULT_WEIGHTS.experience;
  const requiredYears = parseExperienceYears(job.experienceLevel);
  if (requiredYears > 0) {
    const ratio = Math.min(candidate.experienceYears / requiredYears, 1.5);
    const expScore = Math.min(ratio, 1) * w2 * 100;
    totalScore += expScore;
    components.experience = Math.round(expScore);

    factors.push({
      factor: `${candidate.experienceYears} years relevant experience`,
      matched: candidate.experienceYears >= requiredYears,
      weight: w2,
      detail: `${requiredYears}+ years required`,
      type: "soft",
    });
  } else {
    totalScore += w2 * 70;
    components.experience = Math.round(w2 * 70);
  }

  // 3. Semantic similarity (20%) — placeholder until embeddings
  const w3 = weights.semantic_similarity ?? DEFAULT_WEIGHTS.semantic_similarity;
  // TODO: Replace with actual embedding similarity when pgvector is enabled
  const semanticBase = 60;
  totalScore += w3 * semanticBase;
  components.semantic_similarity = Math.round(w3 * semanticBase);

  // 4. Location / work mode (10%)
  const w4 = weights.location_work_mode ?? DEFAULT_WEIGHTS.location_work_mode;
  const wantsRemote = candidate.workPreferences.includes("remote");
  const locationMatch =
    job.workArrangement === "remote" && wantsRemote
      ? true
      : candidate.location.toLowerCase().includes(job.location.toLowerCase()) ||
        job.location.toLowerCase().includes(candidate.location.toLowerCase());

  const arrangementMatch = candidate.workPreferences.includes(job.workArrangement);
  const locationScore = ((locationMatch ? 60 : 0) + (arrangementMatch ? 40 : 0)) * w4;
  totalScore += locationScore;
  components.location_work_mode = Math.round(locationScore);

  factors.push({
    factor: locationMatch ? `${job.location} compatible` : `Location: ${job.location}`,
    matched: locationMatch,
    weight: w4,
    detail: `${job.workArrangement}`,
    type: "soft",
  });

  // 5. Salary compatibility (10%)
  const w5 = weights.salary_compatibility ?? DEFAULT_WEIGHTS.salary_compatibility;
  if (job.salaryMin && candidate.salaryMin) {
    const compatible = candidate.salaryMin <= (job.salaryMax ?? job.salaryMin * 1.5);
    const salaryScore = compatible ? w5 * 100 : w5 * 20;
    totalScore += salaryScore;
    components.salary_compatibility = Math.round(salaryScore);

    factors.push({
      factor: "Salary compatible",
      matched: compatible,
      weight: w5,
      type: "soft",
    });
  } else {
    totalScore += w5 * 60;
    components.salary_compatibility = Math.round(w5 * 60);
  }

  // 6. Availability (5%)
  const w6 = weights.availability ?? DEFAULT_WEIGHTS.availability;
  const isAvailable = candidate.availability === "immediate" || candidate.availability === "open";
  const availScore = isAvailable ? w6 * 100 : w6 * 40;
  totalScore += availScore;
  components.availability = Math.round(availScore);

  factors.push({
    factor: isAvailable ? "Available immediately" : `Availability: ${candidate.availability}`,
    matched: isAvailable,
    weight: w6,
    type: "soft",
  });

  // 7. Education / certification (5%)
  const w7 = weights.education_certification ?? DEFAULT_WEIGHTS.education_certification;
  const hasCerts = candidate.certifications.length > 0 || candidate.education.length > 0;
  const certScore = hasCerts ? w7 * 80 : w7 * 30;
  totalScore += certScore;
  components.education_certification = Math.round(certScore);

  return {
    score: Math.round(Math.min(Math.max(totalScore, 0), 98)),
    factors: factors.filter(f => f.factor && f.type === "soft" && f.weight > 0 || (f.type === "soft" && f.weight === 0 && f.factor.length < 30)),
    components,
  };
}

/**
 * Score label from Blueprint §8
 */
function getMatchLabel(score: number, eligible: boolean): MatchLabel {
  if (!eligible) return "ineligible";
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  return "potential";
}

export const MATCH_LABELS: Record<MatchLabel, string> = {
  strong: "Strong Match",
  good: "Good Match",
  potential: "Potential Match",
  ineligible: "Not Currently Eligible",
};

/**
 * Full match computation (Blueprint §7).
 * Runs hard filters first, then weighted soft scoring, returns explainable result.
 */
export function computeMatch(
  candidate: CandidateData,
  job: JobData,
  weights?: Record<string, number>
): MatchResult {
  // 1. Hard eligibility filters
  const hardFactors = checkHardRequirements(candidate, job);
  const eligible = hardFactors.every(f => f.matched);

  // 2. Soft weighted scoring
  const { score, factors: softFactors, components } = computeSoftScore(candidate, job, weights);

  // Combine factors
  const allFactors = [...hardFactors, ...softFactors];

  // Adjust score if ineligible
  const finalScore = eligible ? score : Math.min(score, 40);
  const label = getMatchLabel(finalScore, eligible);

  return {
    score: finalScore,
    label,
    eligible,
    factors: allFactors,
    scoreComponents: components,
  };
}
