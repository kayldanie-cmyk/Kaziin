"use server";

/**
 * app/auth/signup/actions.ts
 * Server Action for sign-up.
 *
 * By handling authentication on the server:
 * - Cookies are set via HTTP Set-Cookie headers (100% reliable on all mobile browsers)
 * - No document.cookie timing races
 * - Works identically on iOS Safari, Android Chrome, and desktop
 * - Bypasses the need for the separate complete-signup API route
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toRecruiterEmail } from "@/lib/portal-email";

const ROLE_DASHBOARDS: Record<string, string> = {
  candidate: "/dashboard",
  global_candidate: "/career-support",
  recruiter: "/hire",
};

export async function signUpAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = ((formData.get("email") as string) ?? "").toLowerCase().trim();
  const password = (formData.get("password") as string) ?? "";
  const firstName = (formData.get("firstName") as string) ?? "";
  const lastName = (formData.get("lastName") as string) ?? "";
  const selectedRole = (formData.get("role") as string) ?? "work";

  const supabase = await createClient();

  // For the hire portal, the email is stored with a recruiter-specific suffix
  const authEmail = selectedRole === "hire" ? toRecruiterEmail(email) : email;

  // Determine standard role string
  let roleToAssign: "candidate" | "global_candidate" | "recruiter" = "candidate";
  if (selectedRole === "global") roleToAssign = "global_candidate";
  if (selectedRole === "hire") roleToAssign = "recruiter";

  // 1. Create the user in Supabase Auth
  const { data: signUpData, error: authError } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: roleToAssign,
      },
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes("user already registered")) {
      if (selectedRole === "hire") {
        return { error: "A recruiter account already exists for this email. Please log in to your recruiter account." };
      } else {
        return { error: "A candidate account already exists for this email. You can use it for both Find Work and Career Support." };
      }
    }
    return { error: authError.message };
  }

  // 2. Create the profile and employer records
  if (signUpData?.user) {
    const userId = signUpData.user.id;
    const name = `${firstName} ${lastName}`.trim();
    let employerId: string | null = null;

    // For recruiters: create an employer org row first
    if (roleToAssign === "recruiter") {
      const { data: emp, error: empError } = await supabase
        .from("employers")
        .insert({
          name: `${name}'s Organization`,
          industry: "General",
          location: "Global",
          verified: false,
        })
        .select("id")
        .single();

      if (empError) {
        console.error("[signup-action] employer insert error:", empError.message);
      } else if (emp?.id) {
        employerId = emp.id;
      }
    }

    // Upsert the profile row
    const profilePayload: Record<string, unknown> = {
      id: userId,
      name,
      role: roleToAssign,
    };
    if (employerId) {
      profilePayload.employer_id = employerId;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      console.error("[signup-action] profile upsert error:", profileError.message);
    }
  }

  // If Supabase requires email confirmation, session won't exist yet
  if (signUpData?.user && !signUpData.session) {
    redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
  }

  // redirect() from next/navigation throws a special error intercepted by Next.js.
  // The response includes Set-Cookie headers from the server Supabase client,
  // making auth cookies 100% reliable on all mobile browsers.
  const dashboardHref = ROLE_DASHBOARDS[roleToAssign] || "/dashboard";
  redirect(dashboardHref);
}
