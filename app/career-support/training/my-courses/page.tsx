import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Courses | Career Support | Kaziin",
  description: "Track your enrolled training courses, upload credentials and update your career profile.",
};

type Enrollment = {
  id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  training_programs: {
    id: string;
    title: string;
    certification: string | null;
    duration_weeks: number | null;
    training_providers: { name: string } | null;
  } | null;
};

type Credential = {
  id: string;
  title: string;
  issuer: string | null;
  issued_date: string | null;
  verification_status: string;
  skills_applied: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  enrolled: { label: "Enrolled", color: "bg-accent-soft text-accent-dark border-[#2F6D53]/20" },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-50 text-gray-500 border-gray-200" },
  failed: { label: "Did not complete", color: "bg-red-50 text-red-600 border-red-200" },
};

const VERIFICATION_CONFIG: Record<string, { label: string; color: string }> = {
  unverified: { label: "Not verified", color: "text-ink-soft" },
  pending_review: { label: "Under review", color: "text-amber-600" },
  verified: { label: "Verified ", color: "text-[#2F6D53]" },
  rejected: { label: "Could not verify", color: "text-red-600" },
};

export default async function MyCoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?next=/career-support/training/my-courses");
  }

  const [enrollmentsResult, credentialsResult] = await Promise.all([
    supabase
      .from("training_enrollments")
      .select(
        "id, status, enrolled_at, completed_at, training_programs(id, title, certification, duration_weeks, training_providers(name))"
      )
      .eq("candidate_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("training_credentials")
      .select("id, title, issuer, issued_date, verification_status, skills_applied")
      .eq("candidate_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const enrollments = (enrollmentsResult.data ?? []) as unknown as Enrollment[];
  const credentials = (credentialsResult.data ?? []) as unknown as Credential[];

  const completedCount = enrollments.filter((e) => e.status === "completed").length;
  const verifiedCount = credentials.filter((c) => c.verification_status === "verified").length;

  return (
    <div className="min-h-screen py-16 max-md:py-10">
      <div className="max-w-[820px] mx-auto px-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-ink-soft mb-8">
          <Link href="/career-support" className="hover:text-[#2F6D53] transition-colors">
            Career Support
          </Link>
          <span>/</span>
          <Link href="/career-support/training" className="hover:text-[#2F6D53] transition-colors">
            Training
          </Link>
          <span>/</span>
          <span className="text-ink">My Courses</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div>
            <span className="font-data text-[12px] text-accent-dark uppercase tracking-wider">
              My Training
            </span>
            <h1 className="font-display font-bold text-[34px] max-sm:text-[26px] text-[#2F6D53] mt-1">
              My Courses
            </h1>
          </div>
          <Link
            href="/career-support/training"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Browse training
          </Link>
        </div>

        {/* Stats */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10 max-sm:grid-cols-1">
            {[
              { label: "Enrolled", value: enrollments.length },
              { label: "Completed", value: completedCount },
              { label: "Verified credentials", value: verifiedCount },
            ].map((stat) => (
              <div key={stat.label} className="border border-line rounded-[12px] p-4">
                <div className="font-display font-bold text-[28px] text-[#2F6D53]">{stat.value}</div>
                <div className="text-[13px] text-ink-soft mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Enrollments */}
        <div className="mb-12">
          <h2 className="font-display font-semibold text-[20px] text-[#2F6D53] mb-5">
            Enrolled courses
          </h2>

          {enrollments.length === 0 ? (
            <div className="py-10 text-center border border-line rounded-[14px]">
              <div className="text-[15px] font-semibold text-[#2F6D53] mb-2">No courses yet</div>
              <p className="text-[14px] text-ink-soft mb-4">
                Browse our training catalog and enroll in a course relevant to your career goal.
              </p>
              <Link href="/career-support/training" className={buttonVariants({ size: "sm" })}>
                Browse training
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {enrollments.map((enrollment) => {
                const program = enrollment.training_programs;
                const statusCfg = STATUS_CONFIG[enrollment.status] ?? {
                  label: enrollment.status,
                  color: "bg-gray-50 text-gray-600 border-gray-200",
                };

                return (
                  <div
                    key={enrollment.id}
                    className="border border-line rounded-[12px] p-5 flex items-start justify-between gap-4 max-sm:flex-col"
                  >
                    <div className="flex-1">
                      {program?.training_providers && (
                        <div className="text-[12.5px] text-ink-soft mb-1">
                          {program.training_providers.name}
                        </div>
                      )}
                      <div className="font-display font-semibold text-[15.5px]">
                        {program?.title ?? "Untitled course"}
                      </div>
                      {program?.certification && (
                        <div className="text-[13px] text-accent-dark mt-0.5">
                           {program.certification}
                        </div>
                      )}
                      <div className="font-data text-[12px] text-ink-soft mt-2">
                        Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString("en-GB")}
                        {enrollment.completed_at &&
                          ` · Completed ${new Date(enrollment.completed_at).toLocaleDateString("en-GB")}`}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 max-sm:items-start">
                      <span
                        className={`font-data text-[11.5px] px-2.5 py-1 rounded-full border ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                      {enrollment.status === "completed" && (
                        <Link
                          href="/career-support/training/upload-credential"
                          className="text-[12.5px] text-accent-dark font-medium hover:underline"
                        >
                          Upload credential →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Credentials */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-display font-semibold text-[20px] text-[#2F6D53]">
              My credentials
            </h2>
            <Link
              href="/career-support/training/upload-credential"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Upload credential
            </Link>
          </div>

          {credentials.length === 0 ? (
            <div className="py-8 text-center border border-line rounded-[14px]">
              <div className="text-[14px] text-ink-soft mb-1">No credentials uploaded yet</div>
              <p className="text-[13px] text-ink-soft max-w-[380px] mx-auto leading-relaxed">
                Once you complete training, upload your certificate. After verification, your profile
                and job matches update automatically.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {credentials.map((cred) => {
                const verifyCfg = VERIFICATION_CONFIG[cred.verification_status] ?? {
                  label: cred.verification_status,
                  color: "text-ink-soft",
                };

                return (
                  <div
                    key={cred.id}
                    className="border border-line rounded-[12px] p-5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-display font-semibold text-[15px]">{cred.title}</div>
                      {cred.issuer && (
                        <div className="text-[13px] text-ink-soft mt-0.5">{cred.issuer}</div>
                      )}
                      {cred.issued_date && (
                        <div className="font-data text-[12px] text-ink-soft mt-1">
                          Issued {new Date(cred.issued_date).toLocaleDateString("en-GB")}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-[13px] font-medium ${verifyCfg.color}`}>
                        {verifyCfg.label}
                      </div>
                      {cred.skills_applied && (
                        <div className="font-data text-[11.5px] text-[#2F6D53] mt-1">
                          Profile updated 
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* How it works */}
          <div className="mt-6 p-4 rounded-[12px] border border-line bg-paper">
            <div className="font-display font-semibold text-[14px] mb-2">
              How credential verification works
            </div>
            <div className="flex flex-col gap-2">
              {[
                "Upload your certificate or enter your credential details",
                "Our team reviews and verifies the credential",
                "Your skills and career profile are updated automatically",
                "Job matching recalculates to reflect your new qualification",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-[13px] text-ink-soft">
                  <span className="font-data text-[11px] text-accent-dark shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
