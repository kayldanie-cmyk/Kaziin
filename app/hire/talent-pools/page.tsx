import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Talent Pools | Kaziin Hire",
};

export default async function TalentPoolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: pools } = await supabase
    .from("talent_pools")
    .select("*, members:talent_pool_members(count)")
    .eq("recruiter_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] text-accent">Talent Pools</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Curate groups of high-potential candidates for future opportunities.
          </p>
        </div>
        <button className="rounded-full bg-accent text-white text-[14px] font-medium px-5 py-2.5 hover:bg-accent-dark transition-colors">
          + Create Pool
        </button>
      </div>

      {(!pools || pools.length === 0) ? (
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            
          </div>
          <h3 className="font-display font-semibold text-[20px]">No talent pools yet</h3>
          <p className="mt-2 text-ink-soft text-[14.5px] max-w-[400px] mx-auto">
            Create pools to organize candidates for future roles. Add promising candidates from the Candidates page.
          </p>
          <button className="mt-6 rounded-full bg-accent text-white text-[14px] font-medium px-5 py-2.5 hover:bg-accent-dark transition-colors">
            Create your first pool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
          {(pools as any[]).map((pool) => {
            const memberCount = Array.isArray(pool.members) ? pool.members[0]?.count ?? 0 : 0;
            return (
              <div key={pool.id} className="py-5 border-b border-line last:border-0 hover:opacity-80 transition-opacity group cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent-dark text-[18px]">
                    
                  </div>
                  <span className="font-data text-[12px] text-muted-label">{memberCount} members</span>
                </div>
                <h3 className="font-display font-semibold text-[17px] mt-3 group-hover:text-accent-dark transition-colors">
                  {pool.name}
                </h3>
                {pool.description && (
                  <p className="mt-1.5 text-[13.5px] text-ink-soft line-clamp-2">{pool.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-line flex items-center gap-2">
                  <button className="text-[13px] font-medium text-accent-dark hover:underline">View pool</button>
                  <span className="text-muted-label">•</span>
                  <button className="text-[13px] font-medium text-muted-label hover:text-ink">Add candidates</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
