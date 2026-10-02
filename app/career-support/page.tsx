import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Career Support | Kaziin",
  description: "Build the career you want. Career tracking, training, and support through Kaziin.",
};

type CareerPlan = {
  career_goal: string | null;
  experience_area: string | null;
};

type Profile = {
  headline: string | null;
  skills: string[] | null;
  cv_uploaded: boolean | null;
};

export default async function CareerSupportDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [{ data: planData }, { data: profileData }, { data: assessmentData }, { data: trainingData }, { data: appsData }] = await Promise.all([
      supabase.from("career_plans").select("career_goal, experience_area").eq("candidate_id", user.id).eq("status", "active").limit(1).maybeSingle(),
      supabase.from("profiles").select("headline, skills, cv_uploaded").eq("id", user.id).maybeSingle(),
      supabase.from("career_assessments").select("id").eq("candidate_id", user.id).limit(1).maybeSingle(),
      supabase.from("training_enrollments").select("id").eq("candidate_id", user.id).limit(1).maybeSingle(),
      supabase.from("applications").select("id").eq("candidate_id", user.id).limit(1).maybeSingle(),
    ]);

    const plan = planData as CareerPlan | null;
    const profile = profileData as Profile | null;

    // Compute dynamic progress from real milestones
    const milestones = [
      { label: "Assessment completed", done: !!assessmentData },
      { label: "Career goal set", done: !!plan?.career_goal },
      { label: "CV uploaded", done: !!profile?.cv_uploaded },
      { label: "Skills added", done: (profile?.skills?.length ?? 0) > 0 },
      { label: "Training enrolled", done: !!trainingData },
      { label: "Job applied", done: !!appsData },
    ];
    const completedCount = milestones.filter(m => m.done).length;
    const progressPct = Math.round((completedCount / milestones.length) * 100);

    // Build dynamic recommendations from real profile data
    const skillsList = profile?.skills ?? [];
    const headline = profile?.headline ?? plan?.experience_area ?? "";
    const goalArea = plan?.experience_area ?? plan?.career_goal ?? headline;
    const recommendedPath = goalArea
      ? `${goalArea} Pathway`
      : "Complete your profile to get a personalised pathway";
    const recommendedTraining = skillsList.length > 0
      ? `Skills to develop: ${skillsList.slice(0, 2).join(", ")}`
      : "Complete the assessment to get training recommendations";

    return (
      <div className="max-w-[880px] mx-auto py-10 px-5">
        <h1 className="font-display font-bold text-[32px] text-ink mb-1">
          Career Support
        </h1>
        <p className="text-[15px] text-ink-soft mb-12">
          Build the career you want.
        </p>

        {/* MY CAREER JOURNEY */}
        <section className="mb-14">
          <h2 className="font-data text-[12px] uppercase tracking-wider font-semibold text-accent-dark mb-4">
            My Career Journey
          </h2>
          <div className="border border-line rounded-[16px] p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <span className="block text-[13px] font-semibold text-ink-soft mb-1">Current</span>
                <span className="block font-medium text-[16px] text-ink">
                  {plan?.experience_area || "Not specified"}
                </span>
              </div>
              <div>
                <span className="block text-[13px] font-semibold text-ink-soft mb-1">Goal</span>
                <span className="block font-medium text-[16px] text-ink">
                  {plan?.career_goal || "Not set"}
                </span>
              </div>
              <div>
                <span className="block text-[13px] font-semibold text-ink-soft mb-1">Progress</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-[#2F6D53] transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-[13px] font-medium text-[#2F6D53]">{progressPct}%</span>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {milestones.map(m => (
                    <div key={m.label} className="flex items-center gap-2 text-[12px]">
                      <span className={m.done ? "text-accent-dark" : "text-ink-soft/40"}>●</span>
                      <span className={m.done ? "text-ink" : "text-ink-soft"}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="block text-[11px] font-semibold text-accent-dark uppercase tracking-wider mb-1">
                  Next Step
                </span>
                <span className="block text-[14.5px] font-medium text-ink">
                  Take the Career Assessment to map your skills
                </span>
              </div>
              <Link
                href="/career-support/assessment"
                className="shrink-0 px-6 py-2.5 rounded-lg bg-[#2F6D53] text-white font-semibold text-[14px] hover:bg-[#1E4D39] transition-colors inline-flex items-center justify-center"
              >
                Continue My Journey
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT DO YOU WANT TO DO? */}
        <section className="mb-14" id="action-pathways">
          <h2 className="font-data text-[12px] uppercase tracking-wider font-semibold text-accent-dark mb-4">
            What do you want to do?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/career-support/plan" className="border border-line rounded-[12px] p-5 hover:border-[#2F6D53]/40 transition-colors">
              <span className="block font-semibold text-[15px] text-ink mb-1">Find My Career Path</span>
              <span className="block text-[13px] text-ink-soft leading-relaxed">Discover the exact roadmap to your dream job and unlock your true earning potential.</span>
            </Link>
            <Link href="/career-support/funding" className="border border-line rounded-[12px] p-5 hover:border-[#2F6D53]/40 transition-colors">
              <span className="block font-semibold text-[15px] text-ink mb-1">Find Funding</span>
              <span className="block text-[13px] text-ink-soft leading-relaxed">Stop letting costs hold you back. Secure the grants and scholarships you deserve today.</span>
            </Link>
            <Link href="/dashboard/jobs" className="border border-line rounded-[12px] p-5 hover:border-[#2F6D53]/40 transition-colors">
              <span className="block font-semibold text-[15px] text-ink mb-1">Find Work</span>
              <span className="block text-[13px] text-ink-soft leading-relaxed">Stop searching, start working. Get matched instantly with top employers actively hiring.</span>
            </Link>
          </div>

          {/* Apply for Career Support CTA */}
          <div className="mt-8 border border-line rounded-[16px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-accent-soft/30">
            <div>
              <span className="block font-semibold text-[16px] text-ink mb-1">Apply for Career Support</span>
              <span className="block text-[13.5px] text-ink-soft">Select the support type you need and we'll guide you through the application process.</span>
            </div>
            <Link
              href="/career-support/apply"
              className="shrink-0 px-6 py-2.5 rounded-lg bg-[#2F6D53] text-white font-semibold text-[14px] hover:bg-[#1E4D39] transition-colors inline-flex items-center justify-center"
            >
              Apply Now
            </Link>
          </div>
        </section>



        {/* RECOMMENDED FOR YOU */}
        <section>
          <h2 className="font-data text-[12px] uppercase tracking-wider font-semibold text-accent-dark mb-4">
            Recommended For You
          </h2>
          <div className="space-y-4">
            <div className="border border-line rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-accent-soft text-accent-dark font-data text-[10px] uppercase tracking-wider mb-2">Recommended Career Path</span>
                <span className="block font-semibold text-[15px] text-ink">{recommendedPath}</span>
                <span className="block text-[13.5px] text-ink-soft mt-1">
                  {goalArea ? "Based on your career goal and profile." : "Complete your profile to unlock personalised pathways."}
                </span>
              </div>
              <Link href="/career-support/plan" className="shrink-0 text-[13px] font-semibold text-[#2F6D53] hover:underline">
                {goalArea ? "View Pathway →" : "Set your goal →"}
              </Link>
            </div>

            <div className="border border-line rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-accent-soft text-accent-dark font-data text-[10px] uppercase tracking-wider mb-2">Recommended Training</span>
                <span className="block font-semibold text-[15px] text-ink">{recommendedTraining}</span>
                <span className="block text-[13.5px] text-ink-soft mt-1">Targeted at your current skill level.</span>
              </div>
              <Link href="/career-support/training" className="shrink-0 text-[13px] font-semibold text-[#2F6D53] hover:underline">View Training →</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // UNAUTHENTICATED VIEW
  return (
    <div className="min-h-screen">
      <section className="bg-[#2F6D53] py-20 max-md:py-14">
        <div className="max-w-[900px] mx-auto px-5">
          <span className="font-data text-[12px] block mb-3 text-white/70 uppercase tracking-widest font-semibold">
            Career Support
          </span>
          <h1 className="font-display font-bold text-white text-[46px] max-md:text-[32px] max-sm:text-[26px] leading-tight mb-4">
            Get the support your career needs.
          </h1>
          <p className="text-[17px] max-md:text-[15px] text-white/80 max-w-[580px] leading-relaxed">
            Whether you need to upskill in weeks or take your career to another country, Kaziin connects you to the right program.
          </p>
        </div>
      </section>

      <section className="py-16 max-md:py-10 bg-paper">
        <div className="max-w-[900px] mx-auto px-5">
          <h2 className="font-display font-bold text-[22px] text-ink mb-2">
            Choose your support pathway
          </h2>
          <p className="text-ink-soft text-[15px] mb-10">
            Select the program that best matches your goals. You can apply to both if needed.
          </p>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
            <div className="border border-line rounded-[16px] p-8 hover:border-[#2F6D53]/40 transition-colors flex flex-col">
              <span className="font-data text-[11px] text-accent-dark uppercase tracking-wider font-semibold mb-2">
                Skills &amp; Training
              </span>
              <h3 className="font-display font-bold text-[20px] text-[#2F6D53] mb-3 leading-snug">
                Apply for Career Skills Support
              </h3>
              <p className="text-[14.5px] text-ink-soft leading-relaxed flex-1 mb-8">
                For candidates who need help acquiring short-term skills — from 1 month to 1 year. Get matched with verified training providers and relevant funding to become employable or advance your current career.
              </p>
              <div className="space-y-2.5 mb-8">
                {["Identify your skills gap", "Matched training (1 month – 1 year)", "Funding &amp; grants where available", "Verified provider network"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                    <span className="text-[#2F6D53] font-bold">—</span>
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </div>
                ))}
              </div>
              <Link
                href="/auth/signup?role=global&next=/career-support/apply/skills"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors"
              >
                Apply for Skills Support
              </Link>
            </div>

            <div className="border border-line rounded-[16px] p-8 hover:border-[#2F6D53]/40 transition-colors flex flex-col">
              <span className="font-data text-[11px] text-accent-dark uppercase tracking-wider font-semibold mb-2">
                International Careers
              </span>
              <h3 className="font-display font-bold text-[20px] text-[#2F6D53] mb-3 leading-snug">
                Apply for Global Career Support
              </h3>
              <p className="text-[14.5px] text-ink-soft leading-relaxed flex-1 mb-8">
                For candidates ready to take their career to another country. Explore international roles, manage visa and relocation requirements, and apply for global mobility funding support.
              </p>
              <div className="space-y-2.5 mb-8">
                {["International job matching", "Visa &amp; relocation guidance", "Global mobility funding", "Career Passport for verification"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                    <span className="text-[#2F6D53] font-bold">—</span>
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </div>
                ))}
              </div>
              <Link
                href="/auth/signup?role=global&next=/global-dashboard"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-[#2F6D53] text-white font-bold text-[15px] hover:bg-[#1E4D39] transition-colors"
              >
                Apply for Global Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 max-md:py-10 border-t border-line bg-accent-soft/30">
        <div className="max-w-[900px] mx-auto px-5 flex items-center justify-between gap-8 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-[18px] text-[#2F6D53] mb-1">Not sure which pathway fits?</h3>
            <p className="text-ink-soft text-[14.5px] max-w-[480px]">
              Take the career assessment and we will recommend the best pathway based on your current situation and goals.
            </p>
          </div>
          <Link
            href="/auth/signup?role=global&next=/career-support/assessment"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#2F6D53] text-[#2F6D53] font-bold text-[14.5px] hover:bg-accent-soft hover:text-[#2F6D53] transition-colors"
          >
            Take the Career Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}
