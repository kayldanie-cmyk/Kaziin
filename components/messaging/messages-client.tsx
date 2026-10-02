"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

/* ============================================================
   MessagesClient — Real-time-like messaging UI.
   Fetches conversations and messages via the /api/messages route.
   ============================================================ */

interface Participant {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
}

interface ConversationPreview {
  id: string;
  subject: string | null;
  job_id: string | null;
  updated_at: string;
  lastMessage: { content: string; sender_id: string; created_at: string } | null;
  otherParticipants: Participant[];
  unread: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function MessagesClient({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load conversations ────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      const data = (await res.json()) as { conversations?: ConversationPreview[] };
      setConversations(data.conversations ?? []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages for active conversation ─────────────────
  useEffect(() => {
    if (!activeConv) return;

    async function loadMessages() {
      const res = await fetch(`/api/messages?id=${activeConv}`);
      const data = (await res.json()) as {
        messages?: Message[];
        participants?: Participant[];
      };
      setMessages(data.messages ?? []);
      setParticipants(data.participants ?? []);
    }

    loadMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  // ── Auto-scroll on new messages ───────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeConv || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages?id=${activeConv}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });

      if (res.ok) {
        const data = (await res.json()) as { message: Message };
        setMessages((prev) => [...prev, data.message]);
        setDraft("");
        loadConversations(); // Refresh sidebar
      }
    } catch {
      // Silently fail
    } finally {
      setSending(false);
    }
  }

  function getParticipantName(senderId: string) {
    if (senderId === userId) return "You";
    const p = participants.find((p) => p.id === senderId);
    return p?.name ?? "Unknown";
  }

  function getInitials(name: string | null) {
    return (
      name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?"
    );
  }

  const activeConversation = conversations.find((c) => c.id === activeConv);

  if (loading) {
    return (
      <div className="border border-line rounded-[14px] bg-paper min-h-[500px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div
        className="border border-line rounded-[14px] bg-paper min-h-[500px] flex items-center justify-center px-6 py-12 text-center"
        role="status"
      >
        <div className="max-w-[420px]">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            
          </div>
          <h2 className="font-display font-semibold text-[18px]">No conversations yet</h2>
          <p className="mt-2 text-[14.5px] text-ink-soft">
            When you apply for a job or a recruiter contacts you, conversations will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-[14px] bg-paper overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px] max-h-[calc(100vh-180px)]">
      {/* ── Sidebar (conversation list) ── */}
      {/* On mobile: hidden when a conversation is active */}
      <aside
        className={`w-full md:w-[280px] lg:w-[320px] border-b md:border-b-0 md:border-r border-line flex flex-col bg-paper shrink-0 ${
          activeConv ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-4 py-3 border-b border-line">
          <div className="font-data text-[12px] text-ink-soft uppercase tracking-wider">
            Conversations
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const other = conv.otherParticipants[0];
            const active = conv.id === activeConv;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full text-left px-4 py-3.5 border-b border-line transition-colors ${
                  active
                    ? "bg-accent-soft/40"
                    : "hover:bg-paper"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[13px] shrink-0">
                    {getInitials(other?.name ?? null)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[14px] truncate ${conv.unread ? "font-bold" : "font-medium"}`}>
                        {other?.name ?? "Unknown"}
                      </span>
                      {conv.unread && (
                        <span className="w-2 h-2 rounded-full bg-accent-dark shrink-0" />
                      )}
                    </div>
                    {conv.subject && (
                      <div className="text-[12px] text-ink-soft truncate mt-0.5">
                        {conv.subject}
                      </div>
                    )}
                    {conv.lastMessage && (
                      <div className="text-[12px] text-ink-soft truncate mt-0.5">
                        {conv.lastMessage.content}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Message Area ── */}
      {/* On mobile: hidden when no conversation is active */}
      <main
        className={`flex-1 flex flex-col min-w-0 ${
          activeConv ? "flex" : "hidden md:flex"
        }`}
      >
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <h3 className="font-display font-semibold text-[17px] text-ink-soft">
                Select a conversation
              </h3>
              <p className="mt-1 text-[13.5px] text-ink-soft">
                Choose a thread from the sidebar to view messages.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header with mobile back button */}
            <header className="px-4 md:px-5 py-3 md:py-3.5 border-b border-line bg-paper flex items-center gap-3 shrink-0">
              {/* Mobile back button */}
              <button
                type="button"
                onClick={() => setActiveConv(null)}
                className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-accent-soft/30 transition-colors shrink-0"
                aria-label="Back to conversations"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4l-6 6 6 6" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-display font-bold text-[12px] shrink-0">
                {getInitials(activeConversation?.otherParticipants[0]?.name ?? null)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] truncate">
                  {activeConversation?.otherParticipants[0]?.name ?? "Conversation"}
                </div>
                {activeConversation?.subject && (
                  <div className="text-[12px] text-ink-soft truncate">
                    {activeConversation.subject}
                  </div>
                )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === userId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3.5 md:px-4 py-2.5 ${
                        isOwn
                          ? "bg-accent text-white rounded-br-md"
                          : "bg-paper border border-line rounded-bl-md"
                      }`}
                    >
                      {!isOwn && (
                        <div className="font-data text-[11px] font-semibold text-accent-dark mb-1">
                          {getParticipantName(msg.sender_id)}
                        </div>
                      )}
                      <div className="text-[14px] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0 [&>h1]:font-display [&>h1]:font-bold [&>h1]:text-[18px] [&>h1]:mb-2 [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-[16px] [&>h2]:mb-2 [&>h3]:font-display [&>h3]:font-semibold [&>h3]:text-[15px] [&>h3]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ul:last-child]:mb-0 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>ol:last-child]:mb-0 [&>li]:mb-1 [&>a]:text-[#2F6D53] [&>a]:underline hover:[&>a]:text-[#1E4D39] [&_strong]:font-semibold [&_em]:italic [&_code]:font-mono [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded break-words">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <div
                        className={`text-[10.5px] font-data mt-1 ${
                          isOwn ? "text-white/70" : "text-ink-soft"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="border-t border-line px-3 md:px-4 py-3 flex items-end gap-2 md:gap-3 bg-paper shrink-0"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none border border-line rounded-xl px-3 md:px-4 py-2.5 text-[14px] bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
                style={{ minHeight: "42px", maxHeight: "120px" }}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={sending}
                className="rounded-xl px-4 md:px-5 shrink-0"
              >
                Send
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
