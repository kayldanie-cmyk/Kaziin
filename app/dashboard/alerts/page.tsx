import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Job Alerts | Kaziin",
};

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: alerts } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("candidate_id", user.id);

  return (
    <div className="max-w-[800px]">
      <BackButton href="/dashboard" label="Back to Dashboard" className="mb-4" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Job Alerts</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Manage your notifications for new matching opportunities.
          </p>
        </div>
        <button className="rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white hover:bg-accent-dark transition-colors">
          Create Alert
        </button>
      </div>

      {!alerts || alerts.length === 0 ? (
        <div className="py-10 text-center">
          
          <h3 className="font-display font-semibold text-[18px]">No alerts set up</h3>
          <p className="mt-2 text-ink-soft text-[14.5px]">
            Create an alert to get notified when jobs matching your criteria are posted.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between py-5 border-b border-line last:border-0">
              <div>
                <h3 className="font-display font-semibold text-[16px]">{alert.name}</h3>
                <p className="text-[14px] text-ink-soft mt-1">
                  Active alert
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13.5px] font-medium text-[#2E7D32]">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
