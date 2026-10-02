import { createClient } from "@/lib/supabase/server";
import {
  CandidateWorkHistory,
  CandidateEducationRecord,
  CandidateCertification,
  CandidateLicense,
  CandidateLanguage,
  CandidatePortfolioItem,
  CandidateCareerTarget
} from "@/types";

// ── Work History ───────────────────────────────────────────────

export async function getWorkHistory(candidateId: string): Promise<CandidateWorkHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_work_history")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching work history:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    title: row.title,
    company: row.company,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    current: row.current,
    description: row.description,
    employmentType: row.employment_type as any,
    verified: row.verified,
  }));
}

export async function upsertWorkHistory(item: Partial<CandidateWorkHistory> & { candidateId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_work_history")
    .upsert({
      id: item.id,
      candidate_id: item.candidateId,
      title: item.title,
      company: item.company,
      location: item.location,
      start_date: item.startDate,
      end_date: item.endDate,
      current: item.current,
      description: item.description,
      employment_type: item.employmentType,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkHistory(id: string, candidateId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate_work_history")
    .delete()
    .match({ id, candidate_id: candidateId });
  if (error) throw error;
}

// ── Education ──────────────────────────────────────────────────

export async function getEducation(candidateId: string): Promise<CandidateEducationRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_education")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching education:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    startDate: row.start_date,
    endDate: row.end_date,
    verified: row.verified,
  }));
}

// ── Certifications ─────────────────────────────────────────────

export async function getCertifications(candidateId: string): Promise<CandidateCertification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_certifications")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("date_obtained", { ascending: false });

  if (error) {
    console.error("Error fetching certifications:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    name: row.name,
    issuer: row.issuer,
    dateObtained: row.date_obtained,
    expiryDate: row.expiry_date,
    licenseNumber: row.license_number,
    verified: row.verified,
    verificationStatus: row.verification_status,
  }));
}

// ── Licenses ───────────────────────────────────────────────────

export async function getLicenses(candidateId: string): Promise<CandidateLicense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_licenses")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("expiry_date", { ascending: true });

  if (error) {
    console.error("Error fetching licenses:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    type: row.type,
    category: row.category,
    issuingAuthority: row.issuing_authority,
    licenseNumber: row.license_number,
    expiryDate: row.expiry_date,
    verified: row.verified,
    verificationStatus: row.verification_status as any,
  }));
}

// ── Languages ──────────────────────────────────────────────────

export async function getLanguages(candidateId: string): Promise<CandidateLanguage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_languages")
    .select("*")
    .eq("candidate_id", candidateId);

  if (error) {
    console.error("Error fetching languages:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    language: row.language,
    proficiency: row.proficiency,
  }));
}

// ── Portfolio ──────────────────────────────────────────────────

export async function getPortfolio(candidateId: string): Promise<CandidatePortfolioItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_portfolio")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching portfolio:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    title: row.title,
    type: row.type,
    url: row.url,
    description: row.description,
    filePath: row.file_path,
  }));
}

// ── Career Targets ─────────────────────────────────────────────

export async function getCareerTargets(candidateId: string): Promise<CandidateCareerTarget[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_career_targets")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("priority", { ascending: true });

  if (error) {
    console.error("Error fetching career targets:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    categoryId: row.category_id,
    familyId: row.family_id,
    roleId: row.role_id,
    priority: row.priority,
  }));
}

// ── Profile Completeness & Progressive Profiling ───────────────

export async function calculateProfileCompleteness(candidateId: string): Promise<number> {
  const supabase = await createClient();
  let score = 0;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("headline, location, cv_uploaded")
    .eq("id", candidateId)
    .single();
  if (profile?.headline) score += 5;
  if (profile?.location) score += 5;
  if (profile?.cv_uploaded) score += 10;
  
  const { count: workCount } = await supabase.from("candidate_work_history").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (workCount && workCount > 0) score += 25;
  
  const { count: eduCount } = await supabase.from("candidate_education").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (eduCount && eduCount > 0) score += 15;
  
  const { count: skillsCount } = await supabase.from("candidate_skills").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (skillsCount && skillsCount > 0) score += 15;
  
  const { count: targetCount } = await supabase.from("candidate_career_targets").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (targetCount && targetCount > 0) score += 15;
  
  const { count: langCount } = await supabase.from("candidate_languages").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (langCount && langCount > 0) score += 10;
  
  // Persist to profile
  await supabase.from("profiles").update({ profile_completeness: score }).eq("id", candidateId);
  
  return score;
}

export async function getProfilePrompts(candidateId: string) {
  const supabase = await createClient();
  const prompts = [];
  
  const { count: workCount } = await supabase.from("candidate_work_history").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (!workCount || workCount === 0) {
    prompts.push({
      id: "add_work",
      title: "Add your work experience",
      message: "Profiles with work history are 3× more likely to be matched with employers.",
      actionLabel: "Add Experience",
      actionUrl: "/dashboard/career-passport?tab=experience",
    });
  }
  
  const { count: targetCount } = await supabase.from("candidate_career_targets").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId);
  if (!targetCount || targetCount === 0) {
    prompts.push({
      id: "add_targets",
      title: "What are you looking for?",
      message: "Set your career targets so we can match you with the right opportunities.",
      actionLabel: "Set Targets",
      actionUrl: "/dashboard/career-passport?tab=goals",
    });
  }
  
  return prompts;
}
