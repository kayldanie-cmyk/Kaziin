import type React from "react";
import { CandidateNav } from "@/components/navigation/candidate-nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName = "User";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("name, role").eq("id", user.id).maybeSingle();
    displayName = (profile?.name || (user.user_metadata?.name as string) || user.email || "User").split("@")[0].split(" ")[0];
  }

  const sessionUser = user ? { name: displayName, role: (user.user_metadata?.role as string) ?? "candidate" } : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-screen">
      <CandidateNav sessionUser={sessionUser} />
      <main className="px-4 py-6 md:p-sp-5 md:px-sp-4 md:pb-sp-8 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
