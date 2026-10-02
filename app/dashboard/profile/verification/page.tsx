import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerificationClient } from "./verification-client";

export const metadata: Metadata = {
  title: "Trust & Verification Center",
};

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  // Fetch candidate's verification requests
  const { data: verifications } = await supabase
    .from("verifications")
    .select("*")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-[800px]">
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Verification Center</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-8">
        Upload documents to verify your identity, education, and credentials. Verified profiles get 3x more visibility to employers.
      </p>

      <VerificationClient initialVerifications={verifications ?? []} />
    </div>
  );
}
