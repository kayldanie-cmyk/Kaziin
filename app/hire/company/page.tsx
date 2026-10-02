import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = { title: "Company Profile" };

export default async function HireCompanyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("employer_id").eq("id", user.id).single();

  if (!profile?.employer_id) {
    return (
      <div className="max-w-[800px] py-12 text-center">
        <h1 className="font-display font-bold text-[28px] text-accent mb-2">Company Profile</h1>
        <p className="text-ink-soft text-[15px]">You must be associated with an employer account to view this page.</p>
      </div>
    );
  }

  const { data: employer } = await supabase.from("employers").select("*").eq("id", profile.employer_id).single();

  return (
    <div className="max-w-[800px]">
      <BackButton href="/hire" label="Back to Dashboard" className="mb-4" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-[28px] text-accent">Company Profile</h1>
          <p className="mt-1 text-ink-soft text-[15px]">Manage how your company appears to candidates across Kaziin.</p>
        </div>
        <button className={buttonVariants({ variant: "ghost" })}>Edit Profile</button>
      </div>
      <div className="flex flex-col">
        <div className="h-32 bg-accent/10 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 bg-paper border border-line flex items-center justify-center font-display font-bold text-[28px] text-accent-dark">{employer?.name?.charAt(0) ?? "C"}</div>
          </div>
        </div>
        <div className="px-8 pt-16 pb-8">
          <h2 className="font-display font-bold text-[24px]">{employer?.name ?? "Your Company"}</h2>
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-[16px] mb-2">About us</h3>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">{employer?.description ?? "Add a description to tell candidates about your mission."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="py-4 border-b border-line">
                <div className="font-data text-[12px] text-muted-label mb-1">Industry</div>
                <div className="font-medium text-[14.5px]">{employer?.industry ?? "Not specified"}</div>
              </div>
              <div className="py-4 border-b border-line">
                <div className="font-data text-[12px] text-muted-label mb-1">Size</div>
                <div className="font-medium text-[14.5px]">{employer?.size ?? "Not specified"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
