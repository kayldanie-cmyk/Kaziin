import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeCareerDNA } from "@/lib/career-dna";
import { CareerDNA } from "@/components/candidates/career-dna";

export const metadata: Metadata = {
  title: "Career DNA | Kaziin",
};

export default async function CareerDNAPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("skills, experience, certifications")
    .eq("id", user.id)
    .single();

  const dna = computeCareerDNA(
    profile?.skills ?? [],
    profile?.experience ?? [],
    profile?.certifications ?? [],
    3 // Assumed experience for now until we parse it fully
  );

  return (
    <div className="max-w-[800px]">
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Career DNA</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-8">
        Your professional strengths mapped across key dimensions based on your verified skills and experience.
      </p>

      <CareerDNA dna={dna} showDetails={true} />
    </div>
  );
}
