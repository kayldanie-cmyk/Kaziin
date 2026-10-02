import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./profile-editor";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Career Profile",
};

/* ============================================================
   Career Passport / Profile — Server Component
   Reads the user's profile from Supabase and passes it to
   the client-side ProfileEditor for interactive editing.
   ============================================================ */

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist yet (edge case), create a minimal one
  const profileData = profile ?? {
    id: user.id,
    name: user.user_metadata?.name ?? user.email ?? "",
    role: "candidate",
    headline: "",
    summary: "",
    location: "",
    availability: "open",
    readiness_score: 0,
    cv_uploaded: false,
    avatar_url: null,
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    portfolio_url: null,
    work_preferences: [],
    employment_types: [],
  };

  return (
    <div className="max-w-[800px]">
      <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Work Profile</h1>
      <p className="mt-1 text-ink-soft text-[15px]">
        Your universal identity for any type of work — from formal employment to gigs, errands, services, and everything in between.
      </p>

      <ProfileEditor profile={profileData} userEmail={user.email ?? ""} />
    </div>
  );
}
