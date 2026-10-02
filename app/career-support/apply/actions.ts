"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitCareerApplication(type: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("career_support_applications").insert({
    type,
    candidate_id: user?.id || null,
    data,
  });

  if (error) {
    console.error("Failed to submit application:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
