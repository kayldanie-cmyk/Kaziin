import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { PostTaskWizard } from "./post-task-wizard";

export const metadata: Metadata = {
  title: "Post a Task",
  description: "Describe what you need done and get matched to a nearby tasker on Kaziin.",
};

/* ============================================================
   Post a Task — session-aware entry point.
   Logged-in recruiters  → /hire/quick-tasks/new  (hire context)
   Logged-in candidates  → /dashboard/quick-tasks  (find work context)
   Unauthenticated users → show the public PostTaskWizard
   ============================================================ */

export default async function PostTaskPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? (user.user_metadata?.role as string) ?? "candidate";

    if (role === "recruiter" || role === "admin") {
      redirect("/hire/quick-tasks/new");
    } else {
      redirect("/dashboard/quick-tasks");
    }
  }

  // Unauthenticated — show the public wizard
  return (
    <>
      <PublicNav />
      <PostTaskWizard />
      <Footer />
    </>
  );
}
