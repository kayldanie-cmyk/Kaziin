import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SkillsManager } from "./skills-manager";

export const metadata: Metadata = { title: "Skills Graph | Admin" };

const SKILL_TYPES = ["technical", "soft", "trade", "language", "tool"] as const;

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const q = params.q ?? "";
  const skillType = params.type ?? "";
  const page = parseInt(params.page ?? "0");
  const pageSize = 50;

  let query = supabase
    .from("skills")
    .select("*, aliases:skill_aliases(id, alias)", { count: "exact" })
    .order("canonical_name")
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (q) query = query.ilike("canonical_name", `%${q}%`);
  if (skillType) query = query.eq("skill_type", skillType);

  const { data: skills, count } = await query;

  // Stats
  const { data: stats } = await supabase
    .from("skills")
    .select("skill_type")
    .then(({ data }) => {
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r) => { counts[r.skill_type] = (counts[r.skill_type] ?? 0) + 1; });
      return { data: counts };
    });

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin → Skills</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Skills Graph</h1>
        <p className="text-ink-soft text-[15px] mt-1 max-w-[650px]">
          Manage the canonical skills database (Blueprint §10 &amp; §11). Skills can have aliases (e.g. "Excel" = "Microsoft Excel") to ensure consistent matching across the platform.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {SKILL_TYPES.map((type) => (
          <div key={type} className="bg-paper border border-line rounded-[12px] p-4 text-center">
            <div className="font-data text-[22px] font-bold text-accent">{(stats as any)?.[type] ?? 0}</div>
            <div className="text-ink-soft text-[12px] mt-0.5 capitalize">{type}</div>
          </div>
        ))}
      </div>

      <SkillsManager
        initialSkills={skills ?? []}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        filterQ={q}
        filterType={skillType}
      />
    </div>
  );
}
