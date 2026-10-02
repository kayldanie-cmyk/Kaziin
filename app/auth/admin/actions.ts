"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function adminAuthAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const secret = formData.get("secret") as string;
  const isLogin = formData.get("isLogin") === "true";

  if (!email || !password || !secret) {
    return { error: "All fields are required." };
  }

  if (secret !== process.env.ADMIN_SECRET) {
    return { error: "Invalid Admin Secret Key." };
  }

  const supabase = await createClient();

  if (isLogin) {
    // Attempt Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Force role to admin if they successfully logged in and had the right secret
    await supabase.rpc('elevate_to_admin', { secret: secret });
  } else {
    // Attempt Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "admin" }, // Sets the default role via the trigger
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Force role to admin manually in case the trigger didn't pick it up
    if (data.user) {
      await supabase.rpc('elevate_to_admin', { secret: secret });
    }
  }

  redirect("/admin");
}
