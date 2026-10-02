import { MatchedJobsClient } from "@/components/jobs/matched-jobs-client";
import { getMatchedJobs } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Matches",
};

export default async function DashboardJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileData = null;
  let profileComplete = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("readiness_score, headline, summary, location, cv_uploaded, skills, work_preferences, employment_types")
      .eq("id", user.id)
      .maybeSingle();
      
    profileData = profile;

    profileComplete =
      Boolean(profile?.headline) &&
      Boolean(profile?.location) &&
      Boolean(profile?.cv_uploaded);
  }

  const matchedJobs = await getMatchedJobs(profileData);

  return (
    <div className="max-w-[1000px]">
      <MatchedJobsClient
        matchedJobs={matchedJobs}
        profileComplete={profileComplete}
      />
    </div>
  );
}

