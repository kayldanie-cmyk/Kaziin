/**
 * Kaziin — Skills Taxonomy (Blueprint §18–19)
 *
 * Canonical skills with categories, aliases, and adjacency.
 * Used for matching, transferable skills, and career intelligence.
 */

export interface SkillNode {
  name: string;
  category: string;
  aliases: string[];
  children?: string[];
}

/** Core taxonomy (Blueprint §18) */
export const SKILLS_TAXONOMY: Record<string, SkillNode> = {
  // ── Technology ──
  javascript: { name: "JavaScript", category: "Technology", aliases: ["js"], children: ["react", "next.js", "node.js", "typescript", "vue", "angular"] },
  react: { name: "React", category: "Technology", aliases: ["reactjs", "react.js"] },
  "next.js": { name: "Next.js", category: "Technology", aliases: ["nextjs"] },
  "node.js": { name: "Node.js", category: "Technology", aliases: ["nodejs", "node"] },
  typescript: { name: "TypeScript", category: "Technology", aliases: ["ts"] },
  python: { name: "Python", category: "Technology", aliases: ["py"], children: ["django", "flask", "fastapi", "data science", "machine learning"] },
  django: { name: "Django", category: "Technology", aliases: [] },
  flask: { name: "Flask", category: "Technology", aliases: [] },
  fastapi: { name: "FastAPI", category: "Technology", aliases: [] },
  java: { name: "Java", category: "Technology", aliases: [], children: ["spring", "spring boot"] },
  sql: { name: "SQL", category: "Technology", aliases: ["structured query language"], children: ["postgresql", "mysql", "sqlite"] },
  postgresql: { name: "PostgreSQL", category: "Technology", aliases: ["postgres", "psql"] },
  aws: { name: "AWS", category: "Technology", aliases: ["amazon web services"], children: ["s3", "ec2", "lambda", "rds"] },
  docker: { name: "Docker", category: "Technology", aliases: ["containerization"] },
  git: { name: "Git", category: "Technology", aliases: ["github", "gitlab", "version control"] },

  // ── Marketing ──
  marketing: { name: "Marketing", category: "Marketing", aliases: ["digital marketing"], children: ["seo", "sem", "content marketing", "social media"] },
  seo: { name: "SEO", category: "Marketing", aliases: ["search engine optimization"] },
  sem: { name: "SEM", category: "Marketing", aliases: ["search engine marketing", "ppc", "paid search"] },
  "content marketing": { name: "Content Marketing", category: "Marketing", aliases: ["content strategy"] },
  "social media": { name: "Social Media", category: "Marketing", aliases: ["social media marketing", "smm"] },

  // ── Design ──
  "ui design": { name: "UI Design", category: "Design", aliases: ["user interface design", "ui"] },
  "ux design": { name: "UX Design", category: "Design", aliases: ["user experience design", "ux"] },
  figma: { name: "Figma", category: "Design", aliases: [] },
  "graphic design": { name: "Graphic Design", category: "Design", aliases: ["visual design"] },

  // ── Business ──
  "project management": { name: "Project Management", category: "Business", aliases: ["pm"] },
  agile: { name: "Agile", category: "Business", aliases: ["agile methodology"], children: ["scrum", "kanban"] },
  scrum: { name: "Scrum", category: "Business", aliases: ["scrum master"] },
  accounting: { name: "Accounting", category: "Finance", aliases: ["bookkeeping"] },
  "financial analysis": { name: "Financial Analysis", category: "Finance", aliases: ["finance"] },

  // ── Communication ──
  "public speaking": { name: "Public Speaking", category: "Communication", aliases: ["presentation skills"] },
  writing: { name: "Writing", category: "Communication", aliases: ["technical writing", "copywriting"] },
  "customer service": { name: "Customer Service", category: "Communication", aliases: ["customer support", "cs"] },

  // ── Trades ──
  electrical: { name: "Electrical", category: "Skilled Trades", aliases: ["electrician", "electrical work"] },
  plumbing: { name: "Plumbing", category: "Skilled Trades", aliases: ["plumber"] },
  carpentry: { name: "Carpentry", category: "Skilled Trades", aliases: ["carpenter", "woodwork"] },
  welding: { name: "Welding", category: "Skilled Trades", aliases: ["welder"] },
  driving: { name: "Driving", category: "Skilled Trades", aliases: ["driver", "commercial driving", "cdl"] },
};

/**
 * Adjacency graph for transferable skills (Blueprint §19).
 * If a candidate has skill A, they may have transferable capability in related skills.
 */
export const SKILL_ADJACENCY: Record<string, string[]> = {
  react: ["vue", "angular", "svelte", "next.js"],
  vue: ["react", "angular", "nuxt"],
  angular: ["react", "vue"],
  "node.js": ["express", "fastify", "nestjs"],
  python: ["r", "julia"],
  django: ["flask", "fastapi", "rails"],
  salesforce: ["hubspot", "crm", "customer management"],
  hubspot: ["salesforce", "crm", "marketing automation"],
  "project management": ["product management", "program management"],
  agile: ["scrum", "kanban", "lean"],
  figma: ["sketch", "adobe xd", "invision"],
  postgresql: ["mysql", "sqlite", "sql server"],
  aws: ["azure", "gcp", "cloud"],
  docker: ["kubernetes", "containerization"],
  excel: ["google sheets", "data analysis"],
  accounting: ["bookkeeping", "financial analysis", "auditing"],
};

/**
 * Find the canonical name for a skill input.
 */
export function resolveSkill(input: string): string | null {
  const lower = input.toLowerCase().trim();

  // Direct match
  if (SKILLS_TAXONOMY[lower]) return SKILLS_TAXONOMY[lower].name;

  // Alias match
  for (const [, node] of Object.entries(SKILLS_TAXONOMY)) {
    if (node.aliases.some(a => a.toLowerCase() === lower)) return node.name;
    if (node.name.toLowerCase() === lower) return node.name;
  }

  return null;
}

/**
 * Detect transferable skills (Blueprint §17).
 * Returns skills the candidate may have transferable capability in.
 */
export function findTransferableSkills(
  candidateSkills: string[],
  targetSkills: string[]
): { skill: string; transferableFrom: string; type: "exact" | "transferable" | "inferred" }[] {
  const results: { skill: string; transferableFrom: string; type: "exact" | "transferable" | "inferred" }[] = [];
  const candidateLower = candidateSkills.map(s => s.toLowerCase());

  for (const target of targetSkills) {
    const targetLower = target.toLowerCase();

    // Exact match
    if (candidateLower.some(cs => cs === targetLower || cs.includes(targetLower) || targetLower.includes(cs))) {
      results.push({ skill: target, transferableFrom: target, type: "exact" });
      continue;
    }

    // Transferable match via adjacency
    const adjacent = SKILL_ADJACENCY[targetLower] ?? [];
    const transferableFrom = candidateLower.find(cs =>
      adjacent.some(adj => cs.includes(adj) || adj.includes(cs))
    );
    if (transferableFrom) {
      results.push({
        skill: target,
        transferableFrom: candidateSkills[candidateLower.indexOf(transferableFrom)] ?? transferableFrom,
        type: "transferable",
      });
      continue;
    }

    // Check category-level inference
    const targetNode = Object.values(SKILLS_TAXONOMY).find(
      n => n.name.toLowerCase() === targetLower
    );
    if (targetNode) {
      const sameCategory = candidateSkills.filter(cs => {
        const resolved = resolveSkill(cs);
        if (!resolved) return false;
        const node = Object.values(SKILLS_TAXONOMY).find(n => n.name === resolved);
        return node?.category === targetNode.category;
      });
      if (sameCategory.length >= 2) {
        results.push({ skill: target, transferableFrom: sameCategory[0], type: "inferred" });
      }
    }
  }

  return results;
}
