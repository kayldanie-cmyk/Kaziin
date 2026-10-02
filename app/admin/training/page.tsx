import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Status } from "@/components/ui/status";

export const metadata: Metadata = {
  title: "Training Management | Admin",
};

type Program = {
  id: string;
  title: string;
  mode: string;
  industry: string | null;
  cost_amount: number | null;
  cost_currency: string | null;
  cost_subsidised: boolean;
  verified: boolean;
  active: boolean;
  created_at: string;
  training_providers: { name: string } | null;
};

type Credential = {
  id: string;
  title: string;
  issuer: string | null;
  verification_status: string;
  skills_applied: boolean;
  created_at: string;
  profiles: { name: string } | null;
};

export default async function AdminTrainingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const [providersResult, programsResult, credentialsResult, enrollmentsCountResult] =
    await Promise.all([
      supabase
        .from("training_providers")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("training_programs")
        .select(
          "id, title, mode, industry, cost_amount, cost_currency, cost_subsidised, verified, active, created_at, training_providers(name)"
        )
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("training_credentials")
        .select(
          "id, title, issuer, verification_status, skills_applied, created_at, profiles(name)"
        )
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("training_enrollments")
        .select("id", { count: "exact", head: true }),
    ]);

  const programs = (programsResult.data ?? []) as unknown as Program[];
  const credentials = (credentialsResult.data ?? []) as unknown as Credential[];
  const providerCount = providersResult.count ?? 0;
  const enrollmentCount = enrollmentsCountResult.count ?? 0;
  const pendingCredentials = credentials.filter(
    (c) => c.verification_status === "unverified" || c.verification_status === "pending_review"
  );

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">
          Admin → Career Support
        </span>
        <h1 className="font-display font-bold text-[28px] mt-1">Training</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Manage training providers, programs and candidate credential verification.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-4 mb-8">
        {[
          { label: "Providers", value: providerCount },
          { label: "Programs", value: programs.length },
          { label: "Enrollments", value: enrollmentCount },
          { label: "Pending credentials", value: pendingCredentials.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`border rounded-[12px] p-4 ${stat.label === "Pending credentials" && stat.value > 0 ? "border-amber-300 bg-amber-50" : "border-line"}`}
          >
            <div className="font-data text-[11.5px] text-muted-label uppercase tracking-wide">
              {stat.label}
            </div>
            <div
              className={`font-display font-bold text-[26px] mt-1 ${stat.label === "Pending credentials" && stat.value > 0 ? "text-amber-700" : ""}`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] max-md:grid-cols-1 gap-8">
        {/* Programs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[20px]">Programs</h2>
          </div>

          <div className="border border-line rounded-[12px] divide-y divide-line">
            {programs.length === 0 ? (
              <div className="p-8 text-center text-[14px] text-muted-label">
                No training programs configured.
              </div>
            ) : (
              programs.map((p) => (
                <div key={p.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14.5px] truncate">{p.title}</div>
                    <div className="text-[12.5px] text-muted-label mt-0.5">
                      {p.training_providers?.name ?? "No provider"} ·{" "}
                      {p.mode.replace("_", " ")}
                      {p.cost_subsidised
                        ? " · Subsidised"
                        : p.cost_amount
                        ? ` · ${p.cost_currency ?? ""} ${p.cost_amount.toLocaleString()}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Status status={p.active ? "published" : "draft"} />
                    {p.verified && (
                      <span className="font-data text-[11px] text-[#2F6D53]"> Verified</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending credentials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[20px]">Credentials to review</h2>
          </div>

          <div className="border border-line rounded-[12px] divide-y divide-line">
            {credentials.length === 0 ? (
              <div className="p-8 text-center text-[14px] text-muted-label">
                No credentials submitted yet.
              </div>
            ) : (
              credentials.map((cred) => {
                const isPending =
                  cred.verification_status === "unverified" ||
                  cred.verification_status === "pending_review";
                return (
                  <div key={cred.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[14px] truncate">{cred.title}</div>
                      <div className="text-[12.5px] text-muted-label mt-0.5">
                        {Array.isArray(cred.profiles)
                          ? cred.profiles[0]?.name
                          : cred.profiles?.name ?? "Candidate"}{" "}
                        · {cred.issuer ?? "Issuer unknown"}
                      </div>
                      {cred.skills_applied && (
                        <div className="font-data text-[11px] text-[#2F6D53] mt-0.5">
                          Skills applied 
                        </div>
                      )}
                    </div>
                    <div>
                      <span
                        className={`font-data text-[11.5px] px-2.5 py-1 rounded-full border ${
                          isPending
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : cred.verification_status === "verified"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {cred.verification_status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 p-4 bg-accent-soft border border-[#2F6D53]/20 rounded-[12px]">
            <div className="text-[13px] text-[#2F6D53] font-medium mb-1">
              Credential verification workflow
            </div>
            <p className="text-[12.5px] text-[#2F6D53]/70 leading-relaxed">
              When you set a credential to <strong>verified</strong> in Supabase, set{" "}
              <code className="bg-white px-1 rounded text-[11px]">skills_applied = true</code> to
              trigger the candidate's profile and matching update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}