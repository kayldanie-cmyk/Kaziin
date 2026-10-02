"use server";

/**
 * app/auth/signin/actions.ts
 * Server Action for sign-in.
 *
 * By handling authentication on the server:
 * - Cookies are set via HTTP Set-Cookie headers (100% reliable on all mobile browsers)
 * - No document.cookie timing races
 * - Works identically on iOS Safari, Android Chrome, and desktop
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toRecruiterEmail } from "@/lib/portal-email";

const PORTAL_DEFAULTS: Record<string, string> = {
  work: "/dashboard",
  global: "/career-support",
  hire: "/hire",
};

function getSafeRedirect(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export async function signInAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = ((formData.get("email") as string) ?? "").toLowerCase().trim();
  const password = (formData.get("password") as string) ?? "";
  const portal = (formData.get("portal") as string) ?? "work";
  const redirectTo = getSafeRedirect(
    formData.get("redirectTo") as string,
    PORTAL_DEFAULTS[portal] ?? "/dashboard"
  );

  const supabase = await createClient();

  // For the hire portal, the email is stored with a recruiter-specific suffix
  const authEmail = portal === "hire" ? toRecruiterEmail(email) : email;

  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) {
    return {
      error:
        portal === "hire"
          ? "Invalid email or password for Hire portal. If you haven't created your recruiter account yet, please sign up."
          : "Invalid email or password.",
    };
  }

  // redirect() from next/navigation throws a special error intercepted by Next.js.
  // The response includes Set-Cookie headers from the server Supabase client,
  // making auth cookies 100% reliable on all mobile browsers.
  redirect(redirectTo);
}
