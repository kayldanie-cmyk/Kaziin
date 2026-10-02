import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types";

export interface ATSApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  match_score: number;
  match_explanation: any;
  created_at: string;
  updated_at: string;
  candidate_profile: {
    id: string;
    name: string;
    headline: string | null;
    location: string | null;
  };
}

export async function getJobApplications(jobId: string): Promise<ATSApplication[]> {
  const supabase = await createClient();
  
  // We need applications for a specific job, and we join the profiles table
  // to get basic candidate info for the ATS cards.
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      candidate_id,
      status,
      match_score,
      match_explanation,
      created_at,
      updated_at,
      candidate_profile:profiles (
        id,
        name,
        headline,
        location
      )
    `)
    .eq("job_id", jobId)
    .eq("draft", false)
    .order("match_score", { ascending: false });

  if (error) {
    console.error("Error fetching job applications:", error);
    return [];
  }

  // Type assertion since postgrest doesn't type relationships perfectly when aliased
  return (data as unknown as ATSApplication[]) || [];
}

export async function getApplicationDetails(applicationId: string) {
  const supabase = await createClient();

  // Fetch application, submitted profile data, documents, match explanation, answers, and job info
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs (
        title,
        employer_id
      ),
      candidate:profiles (
        name,
        email,
        headline,
        location,
        avatar_url,
        phone,
        skills
      )
    `)
    .eq("id", applicationId)
    .single();

  if (error) {
    console.error("Error fetching application details:", error);
    return null;
  }
  
  // Fetch application answers separately to keep payload simple
  const { data: answers } = await supabase
    .from("application_answers")
    .select(`
      answer,
      question:application_questions (
        question,
        type
      )
    `)
    .eq("application_id", applicationId);

  return {
    ...data,
    answers: answers || []
  };
}
