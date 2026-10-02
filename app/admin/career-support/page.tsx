import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Support | Admin",
};

export default async function AdminCareerSupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin");

  const [{ count: assessmentCount }, { count: planCount }] = await Promise.all([
    supabase
      .from("career_assessments")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("career_plans")
      .select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Assessments", value: assessmentCount ?? 0, href: null },
    { label: "Career Plans", value: planCount ?? 0, href: null },
  ];

  return (
    <div>
      <div className="mb-8">
        <span className="font-data text-[12px] uppercase tracking-wider text-muted-label">Admin</span>
        <h1 className="font-display font-bold text-[28px] mt-1">Career Support</h1>
        <p className="text-ink-soft text-[15px] mt-1">
          Overview of career assessments, plans, and candidate journeys.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-line rounded-[12px] p-4">
            <div className="font-data text-[11.5px] text-muted-label uppercase tracking-wide">
              {stat.label}
            </div>
            <div className="font-display font-bold text-[26px] mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pathway links */}
      <h2 className="font-display font-semibold text-[18px] mb-4">Manage</h2>
      <div className="grid grid-cols-[1fr_1fr] max-md:grid-cols-1 gap-4">
        {[
          {
            title: "Career Assessments",
            description: "View submitted career assessments and goal breakdown.",
            href: "/admin/career-support/assessments",
          },
          {
            title: "Career Plans",
            description: "Active candidate career plans — goals, sectors, locations.",
            href: "/admin/career-support/plans",
          },
          {
            title: "Training",
            description: "Training providers, programs and credential verification.",
            href: "/admin/training",
          },
          {
            title: "Support & Funding",
            description: "Funding programs and candidate support applications.",
            href: "/admin/funding",
          },
          {
            title: "Global Careers",
            description: "International job interests, global employer relationships and mobility support.",
            href: "/admin/global",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block border border-line rounded-[12px] p-5 hover:border-[#2F6D53]/40 transition-colors"
          >
            <div className="font-display font-semibold text-[15px] text-[#2F6D53]">{item.title}</div>
            <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
