import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminVerificationClient } from "./admin-verification-client";

export const metadata: Metadata = {
  title: "Verification Queue | Admin",
};

export default async function AdminVerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  // Fetch verifications with candidate profile details
  const { data: verifications } = await supabase
    .from("verifications")
    .select("*, candidate:profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin → Trust</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Verification Queue</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Review and approve candidate identity, education, and credentials (Blueprint §29).
        </p>
      </div>

      <AdminVerificationClient initialVerifications={verifications ?? []} />
    </div>
  );
}
