import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TaxonomyCategoryManager } from "./taxonomy-category-manager";

export const metadata: Metadata = { title: "Taxonomy Manager | Admin" };

export default async function AdminTaxonomyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: categories } = await supabase
    .from("job_categories")
    .select(`*, families:job_families(count)`)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin → Taxonomy</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Taxonomy Manager</h1>
        <p className="text-ink-soft text-[15px] mt-1 max-w-[600px]">
          Manage the universal job taxonomy: categories, job types, and roles. Changes take effect immediately without a redeploy (Blueprint §43, §78).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-paper border border-line rounded-[14px] p-5">
          <div className="font-data text-[28px] font-bold text-accent">{categories?.length ?? 0}</div>
          <div className="text-ink-soft text-[14px] mt-1">Job Categories</div>
        </div>
        <Link href="/admin/questions" className="bg-paper border border-line rounded-[14px] p-5 hover:border-accent/40 transition-colors">
          <div className="font-data text-[28px] font-bold text-accent">Q&amp;A</div>
          <div className="text-ink-soft text-[14px] mt-1">Application Questions →</div>
        </Link>
        <div className="bg-paper border border-line rounded-[14px] p-5">
          <div className="font-data text-[12px] font-bold text-ink-soft uppercase tracking-wider mb-2">Quick Guide</div>
          <p className="text-[13px] text-ink-soft leading-relaxed">
            Categories → Job Types → Roles form a 3-level hierarchy. Candidates and jobs are tagged to this taxonomy for matching.
          </p>
        </div>
      </div>

      <TaxonomyCategoryManager initialCategories={categories ?? []} />
    </div>
  );
}
