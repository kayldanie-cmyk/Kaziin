import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_TASKERS } from "@/lib/quick-tasks";

export const metadata: Metadata = { title: "Taskers | Admin Quick Tasks" };

export default function AdminQTTaskersPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link href="/admin/quick-tasks" className="text-[13px] text-ink-soft hover:text-ink">← Quick Tasks</Link>
        <h1 className="font-display font-bold text-[24px] text-[#2F6D53]">Taskers</h1>
      </div>
      <div className="flex flex-col gap-3">
        {DEMO_TASKERS.map(tasker => (
          <div key={tasker.id} className="border border-line rounded-[12px] p-5 bg-paper flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center font-display font-bold text-[16px] shrink-0">
                {tasker.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div className="font-display font-semibold text-[16px]">{tasker.name}</div>
                <div className="text-[13px] text-ink-soft mt-0.5">
                   {tasker.rating} · {tasker.completedTasks} tasks completed · {tasker.serviceArea}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tasker.categories.map(cat => (
                    <span key={cat} className="font-data text-[11px] bg-accent-soft text-accent-dark px-2 py-0.5 rounded">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tasker.verified ? (
                <span className="font-data text-[11px] font-semibold uppercase tracking-wider bg-accent-soft text-accent-dark px-2 py-0.5 rounded"> Verified</span>
              ) : (
                <span className="font-data text-[11px] font-semibold uppercase tracking-wider bg-muted-label-soft text-muted-label px-2 py-0.5 rounded">Unverified</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
