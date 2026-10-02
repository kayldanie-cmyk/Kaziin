import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuestionsManager } from "./questions-manager";

export const metadata: Metadata = { title: "Questions Manager | Admin" };

export default async function AdminQuestionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  // Fetch taxonomies for the picker
  const { data: categories } = await supabase.from("job_categories").select("id, name").order("sort_order");
  const { data: families } = await supabase.from("job_families").select("id, name, category_id").order("sort_order");
  const { data: roles } = await supabase.from("job_roles").select("id, name, family_id").order("sort_order");

  // Fetch all questions
  const { data: questions } = await supabase
    .from("application_questions")
    .select(`
      *,
      category:job_categories(name),
      family:job_families(name),
      role:job_roles(name)
    `)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin → Taxonomy</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Application Questions Manager</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Manage dynamic application questions. Scope them to a specific category, job type, or role to have them automatically appear when candidates apply to matching jobs (Blueprint §8).
        </p>
      </div>

      <QuestionsManager 
        initialQuestions={questions ?? []} 
        categories={categories ?? []}
        families={families ?? []}
        roles={roles ?? []}
      />
    </div>
  );
}
