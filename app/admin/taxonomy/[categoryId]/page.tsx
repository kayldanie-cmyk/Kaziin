import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { FamilyManager } from "./family-manager";

export const metadata: Metadata = { title: "Job Types | Taxonomy Admin" };

export default async function AdminFamiliesPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: category } = await supabase
    .from("job_categories")
    .select("id, name, slug")
    .eq("id", categoryId)
    .single();

  if (!category) notFound();

  const { data: families } = await supabase
    .from("job_families")
    .select(`*, roles:job_roles(count)`)
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13.5px] text-ink-soft mb-6 font-data">
        <Link href="/admin/taxonomy" className="hover:text-ink transition-colors">Taxonomy</Link>
        <span>/</span>
        <span className="text-ink font-semibold">{category.name}</span>
      </div>

      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin → Taxonomy → Category</span>
        <h1 className="font-display font-bold text-[28px] mt-1">{category.name} — Job Types</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Job types group related roles within this category. Each job type contains specific job roles.
        </p>
      </div>

      <FamilyManager categoryId={categoryId} categoryName={category.name} initialFamilies={families ?? []} />
    </div>
  );
}
