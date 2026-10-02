/**
 * Data access layer.
 *
 * Public job and employer views read from Supabase only. If Supabase is not
 * configured or a query fails, callers receive empty/not-found results.
 */
import type { Employer, Job } from "@/types";

type EmployerRow = {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string | null;
  logo_url?: string | null;
  verified: boolean | null;
  verification_status: Employer["verificationStatus"] | null;
  size: string | null;
  description: string | null;
};

type JobRow = {
  id: string;
  slug: string;
  title: string;
  employer: EmployerRow | EmployerRow[] | null;
  location: string;
  work_arrangement: Job["workArrangement"] | null;
  employment_type: Job["employmentType"] | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: "annual" | "monthly" | null;
  description: string;
  requirements: string[] | null;
  skills: string[] | null;
  benefits: string[] | null;
  experience_level: string | null;
  career_level: string | null;
  category_id: string | null;
  family_id: string | null;
  role_id: string | null;
  industry_id: string | null;
  hard_requirements: string[] | null;
  soft_requirements: string[] | null;
  languages_required: string[] | null;
  work_authorization: string | null;
  status: Job["status"] | null;
  posted_at: string | null;
  expires_at: string | null;
  applicant_count: number | null;
  verified: boolean | null;
};

function isSupabaseConfigured(): boolean {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey);
}

export async function getJobs(filter?: {
  workArrangement?: string;
  employmentType?: string;
  query?: string;
}): Promise<Job[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("jobs")
      .select("*, employer:employers(*)")
      .eq("status", "published")
      .order("posted_at", { ascending: false });

    if (filter?.workArrangement) {
      query = query.eq("work_arrangement", filter.workArrangement);
    }
    if (filter?.employmentType) {
      query = query.eq("employment_type", filter.employmentType);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return filterJobsByQuery(
      (data as JobRow[]).map(supabaseRowToJob).filter((job): job is Job => Boolean(job)),
      filter?.query
    );
  } catch {
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*, employer:employers(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;
    return supabaseRowToJob(data as JobRow);
  } catch {
    return null;
  }
}

export async function getEmployers(): Promise<Employer[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase.from("employers").select("*");
    if (error || !data) return [];

    return (data as EmployerRow[]).map(supabaseRowToEmployer);
  } catch {
    return [];
  }
}

function supabaseRowToJob(row: JobRow): Job | null {
  const employer = Array.isArray(row.employer) ? row.employer[0] ?? null : row.employer;
  if (!employer) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    employer: supabaseRowToEmployer(employer),
    location: row.location,
    workArrangement: row.work_arrangement ?? "onsite",
    employmentType: row.employment_type ?? "full-time",
    salary:
      row.salary_min && row.salary_max
        ? {
            min: row.salary_min,
            max: row.salary_max,
            currency: row.salary_currency ?? "USD",
            period: row.salary_period ?? "annual",
          }
        : undefined,
    description: row.description,
    requirements: row.requirements ?? [],
    hardRequirements: row.hard_requirements ?? [],
    softRequirements: row.soft_requirements ?? [],
    languagesRequired: row.languages_required ?? [],
    workAuthorization: row.work_authorization ?? undefined,
    skills: row.skills ?? [],
    experienceLevel: row.experience_level ?? "Not specified",
    careerLevel: (row.career_level as any) ?? "mid-level",
    categoryId: row.category_id ?? undefined,
    familyId: row.family_id ?? undefined,
    roleId: row.role_id ?? undefined,
    industryId: row.industry_id ?? undefined,
    status: row.status ?? "published",
    postedAt: row.posted_at?.slice(0, 10) ?? "",
    expiresAt: row.expires_at?.slice(0, 10),
    applicantCount: row.applicant_count ?? 0,
    verified: row.verified ?? false,
  };
}

function supabaseRowToEmployer(row: EmployerRow): Employer {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    location: row.location,
    website: row.website ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    verified: row.verified ?? false,
    verificationStatus: row.verification_status ?? "not_started",
    size: row.size ?? undefined,
    description: row.description ?? undefined,
  };
}

function filterJobsByQuery(jobs: Job[], query?: string) {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) return jobs;

  return jobs.filter((job) => {
    const searchable = [
      job.title,
      job.employer.name,
      job.employer.industry,
      job.location,
      job.workArrangement,
      job.employmentType,
      job.description,
      job.experienceLevel,
      ...job.requirements,
      ...job.skills,
      ...(job.benefits ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalized);
  });
}

/* ── Auto-matching ─────────────────────────────────────────── */

export interface CandidateProfileMatchData {
  readiness_score: number;
  location?: string | null;
  skills?: string[] | null;
  work_preferences?: string[] | null;
  employment_types?: string[] | null;
}

/**
 * Fetch published jobs and calculate match scores using the new AI Matching Engine.
 */
export async function getMatchedJobs(profile: CandidateProfileMatchData | null) {
  const jobs = await getJobs();
  const { calculateMatch } = await import("@/lib/matching-engine");
  
  return jobs
    .map(job => calculateMatch(job, profile))
    .sort((a, b) => b.score - a.score);
}
