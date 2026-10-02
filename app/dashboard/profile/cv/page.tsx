import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CvGenerator } from "../cv-generator";

export const metadata: Metadata = {
  title: "CV Studio | Kaziin",
};

export default async function CvStudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const cvData = {
    name: profile?.name || user.email || "Candidate",
    headline: profile?.headline || "Professional",
    location: profile?.location || "Not specified",
    summary: profile?.summary || "",
    email: user.email || "",
    portfolioUrl: profile?.portfolio_url || "",
    skills: (profile?.skills || []).map((s: any) => s.name || s),
    experience: (profile?.experience || []).map((e: any) => `${e.title} at ${e.company}`),
    education: (profile?.education || []).map((e: any) => `${e.degree} from ${e.institution}`),
    certifications: (profile?.certifications || []).map((c: any) => c.name),
  };

  return (
    <div className="max-w-[1000px]">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">CV Studio</h1>
        <p className="mt-1 text-ink-soft text-[15px]">
          Generate an ATS-friendly CV automatically from your Career Passport.
        </p>
      </div>

      <div className="bg-transparent rounded-xl border border-line overflow-hidden">
        <CvGenerator data={cvData} onClose={() => {}} />
      </div>
    </div>
  );
}
