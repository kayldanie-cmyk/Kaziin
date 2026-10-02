import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNavClient } from "./admin-nav-client";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Kaziin" },
};

/* ============================================================
   Admin Layout — sidebar + main content
   Only accessible to users with role = 'admin'
   ============================================================ */



export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  const adminName = (profile?.name ?? user.email ?? "Admin").split("@")[0].split(" ")[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-screen bg-paper">
      <AdminNavClient adminName={adminName} />
      <main className="flex-1 px-5 py-6 md:px-10 md:py-8 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
