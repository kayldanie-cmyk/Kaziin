import type { Job, MatchLabel, MatchExplanation } from "@/types";
import { CandidateProfileMatchData } from "@/lib/data";

// Extends Job to include the generated score and explanation
export interface MatchedJob {
  job: Job;
  score: number;
  explanation: MatchExplanation;
}

// Configurable weights for different components of the match score
const WEIGHTS = {
  skills: 0.30,
  experience: 0.20,
  locationWorkMode: 0.20,
  salary: 0.10,
  availability: 0.05,
  readiness: 0.15,
};

// Simple semantic similarity mapping (in a real app, this would use embeddings or a robust taxonomy DB)
const TRANSFERABLE_MAPPINGS: Record<string, string[]> = {
  "customer service": ["retail assistant", "receptionist", "call centre agent", "sales assistant"],
  "sales assistant": ["customer service", "retail assistant", "cashier"],
  "cashier": ["customer service", "retail assistant", "pos"],
  "data entry": ["administrative assistant", "filing clerk"],
  "administrative assistant": ["office administrator", "receptionist", "data entry"],
  "driver": ["delivery driver", "chauffeur", "courier", "truck driver"],
  "delivery driver": ["driver", "courier"],
  "chef": ["cook", "kitchen assistant", "sous chef"],
  "cook": ["kitchen assistant", "chef"],
};

export function calculateMatch(job: Job, profile: CandidateProfileMatchData | null): MatchedJob {
  if (!profile) {
    return {
      job,
      score: 45,
      explanation: {
        label: "potential",
        matched: [],
        gap: ["Complete your profile to see accurate match details"],
        transferable: [],
      },
    };
  }

  let score = 0;
  const matched: string[] = [];
  const gap: string[] = [];
  const transferable: string[] = [];

  // --- 1. Skills Matching (30%) ---
  let skillsScore = 0;
  const jobSkills = job.skills || [];
  const profileSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
  
  if (jobSkills.length > 0) {
    let directMatches = 0;
    let transferableMatches = 0;
    
    jobSkills.forEach(reqSkill => {
      const rsLower = reqSkill.toLowerCase().trim();
      
      if (profileSkills.includes(rsLower)) {
        directMatches++;
        matched.push(reqSkill);
      } else {
        // Check transferable
        const related = TRANSFERABLE_MAPPINGS[rsLower] || [];
        const hasTransferable = related.some(r => profileSkills.includes(r));
        
        if (hasTransferable) {
          transferableMatches++;
          transferable.push(`Relevant experience for ${reqSkill}`);
        } else {
          gap.push(reqSkill);
        }
      }
    });

    const totalSkills = jobSkills.length;
    // Direct matches get full points, transferable get half points
    const skillPercentage = (directMatches + (transferableMatches * 0.5)) / totalSkills;
    skillsScore = skillPercentage * 100 * WEIGHTS.skills;
    score += skillsScore;
  } else {
    // If job has no skills specified, give full points for this section
    score += 100 * WEIGHTS.skills;
  }

  // --- 2. Location & Work Mode (20%) ---
  const wantsRemote = profile.work_preferences?.includes("remote") || profile.work_preferences?.includes("remote-first");
  
  if (job.workArrangement === "remote" || job.workArrangement === "remote-first") {
    if (wantsRemote) {
      score += 100 * WEIGHTS.locationWorkMode;
      matched.push("Remote work arrangement");
    } else {
      score += 50 * WEIGHTS.locationWorkMode; // Not ideal, but remote is flexible
      gap.push("You prefer on-site/hybrid, this is remote");
    }
  } else {
    // Onsite or hybrid requires location match
    if (profile.location && job.location && profile.location.toLowerCase() === job.location.toLowerCase()) {
      score += 100 * WEIGHTS.locationWorkMode;
      matched.push(`Location (${job.location})`);
    } else if (wantsRemote) {
      // Candidate wants remote, job is onsite
      gap.push(`Requires on-site presence in ${job.location}`);
    } else if (!profile.location) {
      gap.push("Location not specified in profile");
    } else {
      gap.push(`Location mismatch (${job.location})`);
    }
  }

  // --- 3. Experience & Career Level (20%) ---
  // In a real app, this would compare years of experience. For now, we'll use a simplified check.
  // We'll give baseline points if profile is somewhat complete.
  if ((profile.readiness_score || 0) > 40) {
    score += 80 * WEIGHTS.experience;
    if (job.experienceLevel && job.experienceLevel !== "Not specified") {
      matched.push(`Experience level (${job.experienceLevel})`);
    }
  } else {
    score += 30 * WEIGHTS.experience;
    gap.push("Experience details need expansion");
  }

  // --- 4. Readiness & Completeness (15%) ---
  score += (profile.readiness_score || 0) * WEIGHTS.readiness;

  // --- 5. Salary (10%) & Availability (5%) ---
  // Simplified for demo - assumes generic alignment unless strictly mismatched
  score += 80 * (WEIGHTS.salary + WEIGHTS.availability); 
  
  // Ensure we don't return crazy numbers
  const finalScore = Math.min(Math.max(Math.round(score), 45), 98);

  // --- Determine Match Label ---
  let label: MatchLabel = "weak";
  if (finalScore >= 85) label = "strong";
  else if (finalScore >= 70) label = "good";
  else if (finalScore >= 55) label = "potential";
  else if (transferable.length > 0 && finalScore >= 50) label = "transferable";

  return {
    job,
    score: finalScore,
    explanation: {
      label,
      matched: matched.slice(0, 4), // Cap UI display list
      gap: gap.slice(0, 3),
      transferable: transferable.slice(0, 2),
    },
  };
}
