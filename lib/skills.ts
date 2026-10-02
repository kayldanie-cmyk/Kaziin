/**
 * Kaziin — Universal Skills Data Layer (Blueprint §10, §11)
 * Functions for resolving skill aliases, finding related skills,
 * and supporting the Transferable Skills matching engine.
 */
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/types";

// ── Public: Resolve canonical skill from any alias ────────────
export async function resolveSkillByName(name: string): Promise<Skill | null> {
  const supabase = await createClient();
  const normalised = name.trim().toLowerCase();

  // Try canonical name first
  const { data: exact } = await supabase
    .from("skills")
    .select("*")
    .ilike("canonical_name", normalised)
    .maybeSingle();

  if (exact) return rowToSkill(exact);

  // Try alias lookup
  const { data: alias } = await supabase
    .from("skill_aliases")
    .select("skill_id, skills(*)")
    .ilike("alias", normalised)
    .maybeSingle();

  if (alias?.skills) return rowToSkill(alias.skills as any);

  return null;
}

// ── Public: Search skills for pickers ────────────────────────
export async function searchSkills(
  query: string,
  { limit = 20, skillType }: { limit?: number; skillType?: string } = {}
): Promise<Skill[]> {
  const supabase = await createClient();
  const q = query.trim();

  let dbQuery = supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (q) dbQuery = dbQuery.ilike("canonical_name", `%${q}%`);
  if (skillType) dbQuery = dbQuery.eq("skill_type", skillType);

  const { data: byName } = await dbQuery;

  // Also search aliases if query is short enough
  let byAlias: any[] = [];
  if (q.length >= 2) {
    const { data } = await supabase
      .from("skill_aliases")
      .select("skill_id, alias, skills(*)")
      .ilike("alias", `%${q}%`)
      .limit(limit);
    byAlias = data ?? [];
  }

  const seen = new Set<string>();
  const results: Skill[] = [];

  for (const row of byName ?? []) {
    if (!seen.has(row.id)) { seen.add(row.id); results.push(rowToSkill(row)); }
  }
  for (const row of byAlias) {
    if (row.skills && !seen.has((row.skills as any).id)) {
      seen.add((row.skills as any).id);
      results.push(rowToSkill(row.skills as any));
    }
  }

  return results;
}

// ── Public: Get all skills (paginated) ───────────────────────
export async function getAllSkills({
  page = 0,
  pageSize = 50,
  skillType,
  category,
  withAliases = false,
  withRelationships = false,
}: {
  page?: number;
  pageSize?: number;
  skillType?: string;
  category?: string;
  withAliases?: boolean;
  withRelationships?: boolean;
} = {}): Promise<{ skills: Skill[]; total: number }> {
  const supabase = await createClient();

  let select = "*";
  if (withAliases) select += ", aliases:skill_aliases(id, alias)";
  if (withRelationships) {
    select += ", children:skill_relationships!parent_skill_id(id, child_skill_id, relationship, childSkill:skills!child_skill_id(id, canonical_name, slug))";
    select += ", parents:skill_relationships!child_skill_id(id, parent_skill_id, relationship, parentSkill:skills!parent_skill_id(id, canonical_name, slug))";
  }

  let q = supabase.from("skills").select(select, { count: "exact" }).order("canonical_name");
  if (skillType) q = q.eq("skill_type", skillType);
  if (category) q = q.eq("category", category);
  q = q.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, count, error } = await q;
  if (error) throw error;

  return {
    skills: (data ?? []).map(rowToSkill),
    total: count ?? 0,
  };
}

// ── Public: Get transferable skills for a set of skill names ─
export async function getTransferableSkills(skillNames: string[]): Promise<{
  directSkills: Skill[];
  parentSkills: Skill[];
  siblingSkills: Skill[];
}> {
  if (!skillNames.length) return { directSkills: [], parentSkills: [], siblingSkills: [] };

  const supabase = await createClient();

  // Resolve canonical IDs from names + aliases
  const { data: byName } = await supabase
    .from("skills")
    .select("id")
    .in("canonical_name", skillNames);

  const { data: byAlias } = await supabase
    .from("skill_aliases")
    .select("skill_id")
    .in("alias", skillNames);

  const directIds = [
    ...new Set([
      ...(byName ?? []).map((r: any) => r.id),
      ...(byAlias ?? []).map((r: any) => r.skill_id),
    ]),
  ];

  if (!directIds.length) return { directSkills: [], parentSkills: [], siblingSkills: [] };

  // Get direct skill details
  const { data: directRows } = await supabase.from("skills").select("*").in("id", directIds);
  const directSkills = (directRows ?? []).map(rowToSkill);

  // Get parent skills
  const { data: parentRelRows } = await supabase
    .from("skill_relationships")
    .select("parent_skill_id, skills!parent_skill_id(*)")
    .in("child_skill_id", directIds);
  const parentSkills = [
    ...new Map((parentRelRows ?? []).map((r: any) => [r.parent_skill_id, rowToSkill(r.skills)])).values(),
  ] as Skill[];

  // Get siblings (other children of those parents)
  const parentIds = parentSkills.map((s) => s.id);
  const siblingSkills: Skill[] = [];
  if (parentIds.length) {
    const { data: siblingRelRows } = await supabase
      .from("skill_relationships")
      .select("child_skill_id, skills!child_skill_id(*)")
      .in("parent_skill_id", parentIds)
      .not("child_skill_id", "in", `(${directIds.join(",")})`);
    (siblingRelRows ?? []).forEach((r: any) => siblingSkills.push(rowToSkill(r.skills)));
  }

  return { directSkills, parentSkills, siblingSkills };
}

// ── Internal: DB row → Skill type ────────────────────────────
function rowToSkill(row: any): Skill {
  return {
    id: row.id,
    canonicalName: row.canonical_name,
    slug: row.slug,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    skillType: row.skill_type ?? "technical",
    jobFamilies: row.job_families ?? [],
    verified: row.verified ?? false,
    sortOrder: row.sort_order ?? 0,
    aliases: row.aliases ?? undefined,
    children: row.children ?? undefined,
    parents: row.parents ?? undefined,
  };
}
