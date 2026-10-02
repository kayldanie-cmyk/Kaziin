import type { Metadata } from "next";
import { CareerAssessmentForm } from "./assessment-form";

export const metadata: Metadata = {
  title: "Career Assessment | Kaziin",
  description:
    "Take the Kaziin career assessment to build your personal career plan. Understand where you are, where you want to go, and what steps to take next.",
};

import { createClient } from "@/lib/supabase/server";

export default async function CareerAssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.name?.split(" ")[0] || "Candidate";

  return <CareerAssessmentForm userName={userName} />;
}
