import { createClient } from "@/lib/supabase/server";
import { PublicNavClient } from "./public-nav-client";

export async function PublicNav() {
  const supabase = await createClient();

  let sessionUser = null;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = user
      ? await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };

    sessionUser = user
      ? {
          name: (user.user_metadata?.name as string) ?? user.email ?? "User",
          role: normalizeRole(profile?.role),
        }
      : null;
  }

  return <PublicNavClient sessionUser={sessionUser} />;
}

function normalizeRole(value: unknown) {
  if (
    value === "global_candidate" ||
    value === "recruiter" ||
    value === "admin"
  ) {
    return value;
  }

  return "candidate";
}