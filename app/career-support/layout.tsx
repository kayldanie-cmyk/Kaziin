import type React from "react";
import { GlobalNav } from "@/components/navigation/global-nav";
import { PublicNav } from "@/components/navigation/public-nav";
import { Footer } from "@/components/navigation/footer";
import { createClient } from "@/lib/supabase/server";

export default async function CareerSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const sessionUser = user
    ? {
        name: ((user.user_metadata?.name as string) ?? user.email ?? "User").split("@")[0].split(" ")[0],
        role: (user.user_metadata?.role as string) ?? "candidate",
      }
    : null;

  if (!sessionUser) {
    return (
      <>
        <PublicNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-screen">
      <GlobalNav sessionUser={sessionUser} />
      <main className="px-4 py-6 md:p-sp-5 md:px-sp-4 md:pb-sp-8 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
