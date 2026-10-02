import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documents | Global Careers",
};

export default async function GlobalDocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  return (
    <div className="max-w-[900px]">
      <div className="mb-8">
        <nav className="font-data text-[12px] text-ink-soft mb-2">
          <Link href="/career-support" className="hover:text-ink">Career Support</Link> /
          Documents
        </nav>
        <h1 className="font-display font-bold text-[28px] text-[#2F6D53]">Document Center</h1>
        <p className="mt-1 text-ink-soft text-[15px]">
          Securely manage your passport, visas, and compliance documents for international roles.
        </p>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-line rounded-[16px] p-10 text-center hover:border-[#2F6D53]/40 transition-colors mb-6">
        <p className="text-ink-soft text-[15px] mb-3">Drag and drop files here, or</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2F6D53] text-white font-semibold text-[14px] cursor-pointer hover:bg-[#1E4D39] transition-colors">
          Browse Files
          <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        </label>
        <p className="text-ink-soft text-[12px] mt-3">PDF, JPG, PNG, DOC — up to 10 MB each</p>
      </div>

      {/* Document categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Identity Documents", desc: "Passport, national ID, driver's license", count: 0 },
          { title: "Qualifications", desc: "Degrees, certificates, diplomas", count: 0 },
          { title: "Work Authorization", desc: "Visas, work permits, right-to-work", count: 0 },
        ].map((cat) => (
          <div key={cat.title} className="border border-line rounded-[14px] p-5 hover:border-[#2F6D53]/30 transition-colors">
            <h3 className="font-display font-semibold text-[15px] text-ink mb-1">{cat.title}</h3>
            <p className="text-ink-soft text-[13px] mb-3">{cat.desc}</p>
            <span className="font-data text-[12px] text-accent-dark">{cat.count} documents</span>
          </div>
        ))}
      </div>
    </div>
  );
}
