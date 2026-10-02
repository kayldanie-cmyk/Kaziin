/**
 * Kaziin — Notifications (Blueprint §53)
 *
 * Create and manage in-app notifications.
 */

export type NotificationType =
  | "strong_match"
  | "profile_view"
  | "application_update"
  | "interview_scheduled"
  | "candidate_recommendation"
  | "connection_update"
  | "verification_update"
  | "support_case_update"
  | "system";

export interface CreateNotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message?: string;
  actionUrl?: string;
  channel?: "in_app" | "email" | "sms" | "push";
}

/**
 * Create an in-app notification (server-side only).
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    await supabase.from("notifications").insert({
      recipient_id: params.recipientId,
      type: params.type,
      title: params.title,
      message: params.message ?? null,
      action_url: params.actionUrl ?? null,
      channel: params.channel ?? "in_app",
    });
  } catch {
    console.error("[notifications] Failed to create notification:", params.type);
  }
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
  } catch {
    console.error("[notifications] Failed to mark read:", notificationId);
  }
}
