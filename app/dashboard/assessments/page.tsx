import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Assessments | Kaziin",
};

const ASSESSMENTS = [
  {
    title: "Technical Skills",
    desc: "Verify your proficiency in programming, data analysis, or IT infrastructure.",
    duration: "15–30 min",
    level: "All levels",
  },
  {
    title: "Soft Skills",
    desc: "Demonstrate communication, leadership, teamwork, and problem-solving abilities.",
    duration: "10–20 min",
    level: "All levels",
  },
  {
    title: "Industry Knowledge",
    desc: "Prove domain expertise in finance, healthcare, construction, or other sectors.",
    duration: "20–40 min",
    level: "Intermediate+",
  },
  {
    title: "Language Proficiency",
    desc: "Certify your reading, writing, and speaking abilities in English and other languages.",
    duration: "25–45 min",
    level: "All levels",
  },
];

export default function AssessmentsPage() {
  return (
    <div className="max-w-[800px]">
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Assessments</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-8">
        Take assessments to verify your skills and improve your match scores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ASSESSMENTS.map((item) => (
          <div
            key={item.title}
            className="border border-line rounded-[14px] p-6 hover:border-[#2F6D53]/30 transition-colors flex flex-col"
          >
            <h3 className="font-display font-semibold text-[16px] text-ink mb-1">{item.title}</h3>
            <p className="text-ink-soft text-[14px] leading-relaxed flex-1 mb-4">{item.desc}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <span className="font-data text-[11px] text-accent-dark bg-accent-soft px-2 py-0.5 rounded">
                  {item.duration}
                </span>
                <span className="font-data text-[11px] text-ink-soft bg-paper px-2 py-0.5 rounded">
                  {item.level}
                </span>
              </div>
              <Link
                href="/dashboard/assessments"
                className="text-[13px] font-semibold text-[#2F6D53] hover:underline"
              >
                Start →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
