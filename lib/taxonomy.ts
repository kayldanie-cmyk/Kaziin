import { createClient } from "@/lib/supabase/server";
import { 
  JobCategory, 
  JobFamily, 
  JobRole, 
  Industry, 
  ApplicationQuestion 
} from "@/types";

/**
 * Get all job categories, ordered by sort_order.
 */
export async function getJobCategories(): Promise<JobCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching job categories:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sort_order,
  }));
}

/**
 * Get job families. If categoryId is provided, filters by category.
 */
export async function getJobFamilies(categoryId?: string): Promise<JobFamily[]> {
  const supabase = await createClient();
  let query = supabase.from("job_families").select("*");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching job families:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

/**
 * Get job roles. If familyId is provided, filters by family.
 */
export async function getJobRoles(familyId?: string): Promise<JobRole[]> {
  const supabase = await createClient();
  let query = supabase.from("job_roles").select("*");

  if (familyId) {
    query = query.eq("family_id", familyId);
  }

  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching job roles:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    familyId: row.family_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
  }));
}

/**
 * Get all industries.
 */
export async function getIndustries(): Promise<Industry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("industries")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching industries:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  }));
}

/**
 * Get application questions for a specific job category, family, and/or role.
 * Fetches questions for the full hierarchy (global + category + family + role).
 */
export async function getApplicationQuestions(
  categoryId?: string,
  familyId?: string,
  roleId?: string
): Promise<ApplicationQuestion[]> {
  const supabase = await createClient();
  
  let orQuery = "category_id.is.null";
  if (categoryId) orQuery += `,category_id.eq.${categoryId}`;
  if (familyId) orQuery += `,family_id.eq.${familyId}`;
  if (roleId) orQuery += `,role_id.eq.${roleId}`;

  const { data, error } = await supabase
    .from("application_questions")
    .select("*")
    .or(orQuery)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching application questions:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    question: row.question,
    type: row.type as any,
    required: row.required,
    categoryId: row.category_id,
    familyId: row.family_id,
    roleId: row.role_id,
    validation: row.validation || {},
    options: Array.isArray(row.options) ? row.options : [],
    conditionalRule: row.conditional_rule ? {
      dependsOn: row.conditional_rule.depends_on,
      showWhen: row.conditional_rule.show_when,
    } : undefined,
    evidenceRequired: row.evidence_required,
    sortOrder: row.sort_order,
  }));
}
