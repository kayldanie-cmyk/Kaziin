import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { RoleManager } from "./role-manager";

export const metadata: Metadata = { title: "Job Roles | Taxonomy Admin" };

export default async function AdminRolesPage({ params }: { params: Promise<{ categoryId: string, familyId: string }> }) {
  const { categoryId, familyId } = await params;
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

  const { data: family } = await supabase
    .from("job_families")
    .select("id, name, slug")
    .eq("id", familyId)
    .single();

  if (!category || !family) notFound();

  const { data: roles } = await supabase
    .from("job_roles")
    .select("*")
    .eq("family_id", familyId)
    .order("sort_order", { ascending: true });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13.5px] text-ink-soft mb-6 font-data">
        <Link href="/admin/taxonomy" className="hover:text-ink transition-colors">Taxonomy</Link>
        <span>/</span>
        <Link href={`/admin/taxonomy/${categoryId}`} className="hover:text-ink transition-colors">{category.name}</Link>
        <span>/</span>
        <span className="text-ink font-semibold">{family.name}</span>
      </div>

      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin → Taxonomy → Roles</span>
        <h1 className="font-display font-bold text-[28px] mt-1">{family.name} — Job Roles</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Specific job roles within the {family.name} job type. These map directly to job postings.
        </p>
      </div>

      <RoleManager familyId={familyId} familyName={family.name} initialRoles={roles ?? []} />
    </div>
  );
}
