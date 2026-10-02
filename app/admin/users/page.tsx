import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RoleChanger } from "./role-changer";

export const metadata: Metadata = { title: "Users" };

type AdminUser = {
  id: string;
  name: string | null;
  role: string;
  employer_id: string | null;
  location: string | null;
  headline: string | null;
  created_at: string | null;
};

type AdminEmployerOption = {
  id: string;
  name: string | null;
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const [{ data: users }, { data: employers }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, role, employer_id, location, headline, created_at, cv_uploaded")
      .order("created_at", { ascending: false }),
    supabase
      .from("employers")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const userRows: AdminUser[] = users ?? [];
  const employerOptions: AdminEmployerOption[] = employers ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display font-bold text-[26px]">Users</h1>
          <p className="mt-1 text-ink-soft text-[15px]">
            Manage all platform users and their workspace access.
          </p>
        </div>
        <div className="font-data text-[13px] text-ink-soft">
          {userRows.length} total users
        </div>
      </div>

      <div className="flex flex-col">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_minmax(220px,auto)] gap-4 py-4 border-b border-line font-data text-[12.5px] text-ink-soft">
          <div>Name</div>
          <div>Role</div>
          <div>Location</div>
          <div>Joined</div>
          <div className="text-right">Access</div>
        </div>

        {userRows.length === 0 ? (
          <div className="p-10 text-center text-ink-soft text-[14px]">
            No users found.
          </div>
        ) : (
          userRows.map((user, i) => (
            <div
              key={user.id}
              className={`flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_minmax(220px,auto)] md:items-center gap-3 py-4 border-b border-line last:border-0 hover:opacity-80 transition-opacity`}
            >
              <div className="min-w-0">
                <div className="font-display font-semibold text-[15px] truncate">
                  {user.name ?? "Unnamed user"}
                </div>
                <div className="text-[13px] text-ink-soft truncate font-data">
                  {user.headline || "No headline"}
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-data font-semibold px-2.5 py-1 rounded-full ${
                  user.role === "admin"
                    ? "bg-danger-soft text-danger"
                    : user.role === "recruiter"
                    ? "bg-accent-soft text-accent-dark"
                    : "bg-accent-soft text-accent-dark"
                }`}>
                  {user.role}
                </span>
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {user.location || "-"}
              </div>

              <div className="font-data text-[13px] text-ink-soft">
                {user.created_at?.slice(0, 10) ?? "-"}
              </div>

              <div className="text-right">
                <RoleChanger
                  userId={user.id}
                  currentRole={user.role}
                  currentEmployerId={user.employer_id}
                  employers={employerOptions}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
