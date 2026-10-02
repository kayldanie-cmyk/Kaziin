import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessagesClient } from "@/components/messaging/messages-client";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  return (
    <div>
      <h1 className="font-display font-bold text-[26px] text-[#2F6D53]">Messages</h1>
      <p className="mt-1 text-ink-soft text-[15px] mb-6">
        Conversations with employers and Kaziin support.
      </p>
      <MessagesClient userId={user.id} />
    </div>
  );
}
