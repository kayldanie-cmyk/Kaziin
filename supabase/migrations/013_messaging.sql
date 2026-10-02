-- ============================================================
-- Kaziin — Messaging Schema
-- Run AFTER 011_blueprint_schema.sql
-- Enables conversations between candidates and recruiters.
-- ============================================================

-- ── Conversations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id        UUID REFERENCES jobs(id) ON DELETE SET NULL,
  subject       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Conversation Participants ────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- ── Messages ─────────────────────────────────────────────────
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can read
DROP POLICY IF EXISTS "Participants can read conversations" ON conversations;
CREATE POLICY "Participants can read conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Participants: users can see their own memberships
DROP POLICY IF EXISTS "Users can see own participation" ON conversation_participants;
CREATE POLICY "Users can see own participation"
  ON conversation_participants FOR SELECT
  USING (auth.uid() = user_id);

-- Messages: participants can read messages in their conversations
DROP POLICY IF EXISTS "Participants can read messages" ON messages;
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Messages: participants can send messages
DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Admin full access
DROP POLICY IF EXISTS "Admins manage conversations" ON conversations;
CREATE POLICY "Admins manage conversations" ON conversations FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage participants" ON conversation_participants;
CREATE POLICY "Admins manage participants" ON conversation_participants FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage messages" ON messages;
CREATE POLICY "Admins manage messages" ON messages FOR ALL USING (public.is_admin());

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
