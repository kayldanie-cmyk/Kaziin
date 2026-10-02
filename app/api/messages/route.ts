import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   /api/messages — Conversations & Messages API
   GET  /api/messages              → list user's conversations
   POST /api/messages              → create a new conversation
   GET  /api/messages?id=<conv_id> → get messages for a conversation
   POST /api/messages?id=<conv_id> → send a message to a conversation
   ============================================================ */

interface ConversationRow {
  id: string;
  subject: string | null;
  job_id: string | null;
  updated_at: string;
}

interface ParticipantRow {
  conversation_id: string;
  user_id: string;
  last_read_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const conversationId = request.nextUrl.searchParams.get("id");

    // ── Get messages for a specific conversation ──
    if (conversationId) {
      // Verify user is a participant
      const { data: participant } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle<ParticipantRow>();

      if (!participant) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }

      // Get messages
      const { data: messages, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200)
        .returns<MessageRow[]>();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get participant profiles for display names
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .returns<{ user_id: string }[]>();

      const participantIds = participants?.map((p) => p.user_id) ?? [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role")
        .in("id", participantIds);

      // Mark as read
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      return NextResponse.json({
        messages: messages ?? [],
        participants: profiles ?? [],
      });
    }

    // ── List all conversations ──
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id)
      .returns<ParticipantRow[]>();

    if (partError) {
      return NextResponse.json({ error: partError.message }, { status: 500 });
    }

    if (!participations || participations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const conversationIds = participations.map((p) => p.conversation_id);

    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("id, subject, job_id, updated_at")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false })
      .returns<ConversationRow[]>();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    // Get latest message for each conversation
    const enriched = await Promise.all(
      (conversations ?? []).map(async (conv) => {
        const { data: lastMessages } = await supabase
          .from("messages")
          .select("content, sender_id, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .returns<{ content: string; sender_id: string; created_at: string }[]>();

        const lastMessage = lastMessages?.[0] ?? null;

        // Get other participants
        const { data: otherParticipants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.id)
          .neq("user_id", user.id)
          .returns<{ user_id: string }[]>();

        const otherIds = otherParticipants?.map((p) => p.user_id) ?? [];
        const { data: otherProfiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, role")
          .in("id", otherIds);

        const participation = participations.find((p) => p.conversation_id === conv.id);
        const unread = lastMessage
          ? new Date(lastMessage.created_at) > new Date(participation?.last_read_at ?? 0)
          : false;

        return {
          ...conv,
          lastMessage,
          otherParticipants: otherProfiles ?? [],
          unread,
        };
      })
    );

    return NextResponse.json({ conversations: enriched });
  } catch {
    return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const conversationId = request.nextUrl.searchParams.get("id");
    const body = (await request.json()) as Record<string, unknown>;

    // ── Send a message to an existing conversation ──
    if (conversationId) {
      const content = typeof body.content === "string" ? body.content.trim() : "";

      if (!content || content.length > 5000) {
        return NextResponse.json(
          { error: "Message must be between 1 and 5000 characters." },
          { status: 400 }
        );
      }

      // Verify participation
      const { data: participant } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle<ParticipantRow>();

      if (!participant) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }

      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select("id, conversation_id, sender_id, content, created_at")
        .single<MessageRow>();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      // Update sender's read marker
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      return NextResponse.json({ message }, { status: 201 });
    }

    // ── Create a new conversation ──
    const recipientId = typeof body.recipientId === "string" ? body.recipientId : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const jobId = typeof body.jobId === "string" ? body.jobId : null;
    const initialMessage = typeof body.message === "string" ? body.message.trim() : "";

    if (!recipientId) {
      return NextResponse.json({ error: "recipientId is required." }, { status: 400 });
    }

    if (!initialMessage || initialMessage.length > 5000) {
      return NextResponse.json(
        { error: "Initial message must be between 1 and 5000 characters." },
        { status: 400 }
      );
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        subject: subject || null,
        job_id: jobId,
      })
      .select("id, subject, job_id, updated_at")
      .single<ConversationRow>();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Failed to create conversation." }, { status: 500 });
    }

    // Add participants
    const { error: partError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: recipientId },
      ]);

    if (partError) {
      // Cleanup conversation if participants fail
      await supabase.from("conversations").delete().eq("id", conversation.id);
      return NextResponse.json({ error: "Failed to add participants." }, { status: 500 });
    }

    // Send initial message
    const { error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: initialMessage,
      });

    if (msgError) {
      return NextResponse.json({ error: "Conversation created but message failed to send." }, { status: 500 });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
