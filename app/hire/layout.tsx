import type React from "react";
import { createClient } from "@/lib/supabase/server";
import { HireNavClient } from "./hire-nav-client";

/* ============================================================
   Employer Dashboard Layout — Server Component
   Matches Find Work and Global Careers dashboard aesthetic.
   ============================================================ */

export default async function HireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let recruiterName = "Recruiter";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();
    recruiterName = (profile?.name || (user.user_metadata?.name as string) || user.email || "Recruiter").split("@")[0].split(" ")[0];
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-screen bg-paper">
      <HireNavClient recruiterName={recruiterName} />
      <main className="px-5 py-6 md:p-sp-5 md:px-sp-4 md:pb-sp-8">
        <div className="max-w-[1000px]">{children}</div>
      </main>
    </div>
  );
}
