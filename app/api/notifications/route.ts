import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   /api/notifications — Notifications API
   GET   → list user's notifications (optionally filter unread)
   PATCH → mark specific notification as read
   PUT   → mark all notifications as read
   ============================================================ */

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

    let query = supabase
      .from("notifications")
      .select("id, type, title, message, read, action_url, created_at")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error } = await query.returns<NotificationRow[]>();

    if (error) {
      console.error("Notifications GET error:", error);
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const unreadCount = (data ?? []).filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: data ?? [],
      unreadCount,
    });
  } catch (err) {
    console.error("Notifications GET exception:", err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    let body: { id?: string } = {};
    try {
      body = (await request.json()) as { id?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const notificationId = typeof body.id === "string" ? body.id : "";

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("recipient_id", user.id);

    if (error) {
      console.error("Notification PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notification PATCH exception:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}
