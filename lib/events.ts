/**
 * Kaziin — Event Tracking (Blueprint §38)
 *
 * Centralized event recording for analytics and outcome tracking.
 * Events are written server-side. Client components call API routes.
 */

export type EventType =
  | "candidate_created"
  | "profile_completed"
  | "cv_uploaded"
  | "cv_processed"
  | "job_created"
  | "job_published"
  | "job_viewed"
  | "match_created"
  | "match_viewed"
  | "application_created"
  | "application_reviewed"
  | "candidate_shortlisted"
  | "interview_scheduled"
  | "offer_created"
  | "candidate_hired"
  | "search_performed"
  | "candidate_search"
  | "candidate_viewed"
  | "shortlisted"
  | "invite_sent"
  | "global_opportunity_viewed"
  | "global_application"
  | "funding_application"
  | "job_saved"
  | "alert_created";

export interface TrackEventParams {
  type: EventType;
  actorId: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record an event to the events table (server-side only).
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    await supabase.from("events").insert({
      type: params.type,
      actor_id: params.actorId,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Events are best-effort — failures should not break the user flow
    console.error("[events] Failed to track event:", params.type);
  }
}
