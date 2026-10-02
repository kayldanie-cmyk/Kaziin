/**
 * Kaziin — Career DNA (Blueprint §11)
 *
 * Derives a structured representation of professional strengths
 * from actual profile data, experience, and skills.
 * Must be derived from real data — never present unsupported claims.
 */

export interface CareerDNADimension {
  dimension: string;
  score: number; // 0–100
  skills: string[];
}

export interface CareerDNAResult {
  dimensions: CareerDNADimension[];
  topStrength: string;
  summary: string;
}

/** Skill-to-dimension mapping */
const DIMENSION_MAP: Record<string, string[]> = {
  Technology: [
    "react", "typescript", "javascript", "python", "java", "node.js", "next.js",
    "html", "css", "sql", "postgresql", "mongodb", "aws", "azure", "gcp",
    "docker", "kubernetes", "git", "api", "rest", "graphql", "devops",
    "machine learning", "data science", "ai", "mobile", "ios", "android",
    "flutter", "swift", "kotlin", "c#", ".net", "php", "laravel", "django",
    "flask", "fastapi", "vue", "angular", "svelte", "tailwind", "figma",
    "software", "engineering", "development", "programming", "coding",
    "database", "backend", "frontend", "full-stack", "fullstack",
  ],
  Business: [
    "management", "strategy", "operations", "finance", "accounting",
    "budgeting", "forecasting", "business development", "sales",
    "marketing", "consulting", "project management", "agile", "scrum",
    "product management", "stakeholder", "negotiation", "procurement",
    "supply chain", "logistics", "crm", "erp", "sap", "excel",
    "business analysis", "reporting", "kpi", "roi", "p&l",
  ],
  Communication: [
    "communication", "writing", "presentation", "public speaking",
    "content", "copywriting", "editing", "journalism", "social media",
    "storytelling", "branding", "pr", "media", "translation", "language",
    "customer service", "support", "training", "teaching", "coaching",
    "facilitation", "mediation", "diplomacy",
  ],
  Design: [
    "design", "ui", "ux", "graphic design", "illustration", "photography",
    "video", "animation", "motion", "3d", "branding", "typography",
    "visual", "creative", "art direction", "adobe", "photoshop",
    "illustrator", "sketch", "figma", "canva", "wireframe", "prototype",
  ],
  Leadership: [
    "leadership", "management", "team lead", "director", "executive",
    "ceo", "cto", "cfo", "vp", "head of", "supervisor", "coordinator",
    "mentoring", "coaching", "strategic planning", "decision making",
    "conflict resolution", "change management", "organizational",
  ],
  Analytics: [
    "analytics", "data", "statistics", "research", "analysis",
    "reporting", "visualization", "tableau", "power bi", "excel",
    "r", "python", "spss", "quantitative", "qualitative", "insights",
    "metrics", "measurement", "testing", "experimentation", "a/b",
  ],
};

/**
 * Compute Career DNA from candidate profile data.
 * Returns scores derived purely from observable profile information.
 */
export function computeCareerDNA(
  skills: string[],
  experience: string[],
  certifications: string[],
  experienceYears: number
): CareerDNAResult {
  const allSignals = [
    ...skills.map(s => s.toLowerCase()),
    ...experience.map(e => e.toLowerCase()),
    ...certifications.map(c => c.toLowerCase()),
  ];

  const dimensions: CareerDNADimension[] = [];

  for (const [dimension, keywords] of Object.entries(DIMENSION_MAP)) {
    const matchedSkills = allSignals.filter(signal =>
      keywords.some(kw => signal.includes(kw) || kw.includes(signal))
    );

    // Unique matched keywords
    const uniqueMatches = [...new Set(matchedSkills)];

    if (uniqueMatches.length > 0) {
      // Score based on number of matching signals, capped at 98
      const rawScore = Math.min(uniqueMatches.length * 12 + 20, 98);
      // Apply experience multiplier
      const expMultiplier = Math.min(1 + experienceYears * 0.02, 1.3);
      const finalScore = Math.min(Math.round(rawScore * expMultiplier), 98);

      dimensions.push({
        dimension,
        score: finalScore,
        skills: uniqueMatches.slice(0, 6),
      });
    }
  }

  // Sort by score descending
  dimensions.sort((a, b) => b.score - a.score);

  const topStrength = dimensions[0]?.dimension ?? "General";
  const summary =
    dimensions.length > 0
      ? `Strongest in ${dimensions
          .slice(0, 3)
          .map(d => d.dimension)
          .join(", ")}`
      : "Add skills and experience to generate your Career DNA";

  return { dimensions, topStrength, summary };
}
