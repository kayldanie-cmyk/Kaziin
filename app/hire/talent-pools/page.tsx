import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Talent Pools | Kaziin Hire" };

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
          <p className="mt-1 text-ink-soft text-[15px]">Curate groups of high-potential candidates for future opportunities.</p>
        </div>
        <button className="rounded-full bg-accent text-white text-[14px] font-medium px-5 py-2.5 hover:bg-accent-dark transition-colors">+ Create Pool</button>
      </div>
      {(!pools || pools.length === 0) ? (
        <div className="py-12 text-center">
          <h3 className="font-display font-semibold text-[20px]">No talent pools yet</h3>
          <p className="mt-2 text-ink-soft text-[14.5px] max-w-[400px] mx-auto">Create pools to organize candidates for future roles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
          {(pools as any[]).map((pool) => {
            const memberCount = Array.isArray(pool.members) ? pool.members[0]?.count ?? 0 : 0;
            return (
              <div key={pool.id} className="py-5 border-b border-line last:border-0">
                <h3 className="font-display font-semibold text-[17px]">{pool.name}</h3>
                <p className="font-data text-[12px] text-muted-label">{memberCount} members</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
