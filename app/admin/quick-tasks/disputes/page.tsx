import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Disputes | Admin Quick Tasks" };

export default function AdminQTDisputesPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link href="/admin/quick-tasks" className="text-[13px] text-ink-soft hover:text-ink">← Quick Tasks</Link>
        <h1 className="font-display font-bold text-[24px] text-[#2F6D53]">Disputes</h1>
      </div>
      <div className="py-16 text-center border border-dashed border-line rounded-[14px] bg-paper">
        <div className="text-[15px] font-semibold text-ink mb-2">No open disputes</div>
        <p className="text-ink-soft text-[14px]">All Quick Task disputes will appear here for admin review.</p>
      </div>
    </div>
  );
}
