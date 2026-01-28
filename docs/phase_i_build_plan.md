# Phase I Build Plan: Chat Page

**Created:** January 28, 2026  
**Source:** V2 Spec Part 7  
**Purpose:** AI self-discovery tool for coached clients  
**Estimated Time:** 2 sessions  
**Access:** Coached clients only (locked for free users)

---

## Objective

Build the Chat page where coached clients can ask questions about their data and get AI-driven insights that help them see patterns and prepare for coaching sessions.

---

## Design

### Full Chat Interface

```
CHAT                                                            🔒
────────────────────────────────────────────────────────────────────

Ask me anything about your journey...

Try:
• "What patterns do you see in my priorities?"
• "What are others seeing in me?"
• "What should I explore with my coach?"
• "When have I been most engaged this month?"
• "How does my past proof connect to my current challenge?"

────────────────────────────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────┐
│ You: What patterns do you see in my priorities?                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Finding Good: Looking at your last 15 priority entries, I      │
│ notice "transparency" appears 8 times. You often mention       │
│ showing up authentically even when it's uncomfortable.         │
│                                                                │
│ What's interesting is that Sarah and David both recognized     │
│ this in you too — they see your transparency as a strength.    │
│                                                                │
│ What draws you to being transparent in difficult moments?      │
└────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────

[Type your question...]                                    [Send]
```

### Free User Preview (Locked)

```
CHAT                                                            🔒
────────────────────────────────────────────────────────────────────

  This is where your data becomes conversation.

  Ask questions about your patterns, get insights about
  what you're building, prepare for coaching sessions.

  Reach out to inquire about access.

```

---

## Database Setup

```sql
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_email ON chat_conversations(client_email);

-- RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own conversations" ON chat_conversations
  FOR SELECT USING (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can insert own conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can update own conversations" ON chat_conversations
  FOR UPDATE USING (auth.jwt() ->> 'email' = client_email);
```

---

## Checkpoint 0: Database Table

**Goal:** Create chat_conversations table

### Tasks
1. Run SQL to create table
2. Verify RLS policies work
3. Test insert/select

### Done Criteria
- [ ] Table created
- [ ] RLS working
- [ ] Sample data works

---

## Checkpoint 1: Chat Page UI

**Goal:** Build the chat interface (no AI yet)

### Tasks

1. Create `apps/together/src/pages/ChatPage.tsx`
   - Suggested questions at top
   - Message history area
   - Input area with Send button
   - Locked state for non-coached users

2. Message component structure:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

3. Layout:
   - Scrollable message area
   - Fixed input at bottom
   - Messages aligned (user right, assistant left)

### Done Criteria
- [ ] Page renders correctly
- [ ] Messages display in correct positions
- [ ] Input captures text
- [ ] Send button works (no AI yet)
- [ ] Locked state for non-coached
- [ ] No TypeScript errors

---

## Checkpoint 2: Chat History Hook

**Goal:** Persist and load chat history

### Tasks

1. Create `apps/together/src/hooks/useChatHistory.ts`
   - Load conversation from database
   - Save messages to database
   - Create new conversation if none exists

2. Functions:
```typescript
interface UseChatHistory {
  messages: Message[];
  isLoading: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearHistory: () => void;
}
```

3. Auto-save on each message add

### Done Criteria
- [ ] Messages load from database
- [ ] New messages save to database
- [ ] History persists across sessions
- [ ] No TypeScript errors

---

## Checkpoint 3: Edge Function (chat-discovery)

**Goal:** Create AI endpoint that knows user's data

### Edge Function: `chat-discovery`

```typescript
// supabase/functions/chat-discovery/index.ts

// Input
interface ChatRequest {
  userEmail: string;
  message: string;
  conversationHistory: Message[];
}

// Output
interface ChatResponse {
  response: string;
}
```

### What AI Accesses

1. User's priorities (last 30 days)
2. User's validations (last 30 days)
3. User's predictions (active)
4. User's daily_reflections (last 14 days)
5. Recognition received (what others see)
6. Recognition sent (what user notices)

### AI Behavior Guidelines

- Finding Good style: draws out, doesn't tell
- Mix answers with questions back
- Connect patterns across entries
- Surface what others see that user doesn't mention
- Reference specific entries when relevant
- Encourage exploration, not prescription

### System Prompt

```
You are a Finding Good coach assistant helping a client discover patterns in their journey.

You have access to their:
- Priority entries (what mattered to them)
- Validation entries (how they've grown)
- Predictions (what they believe they can accomplish)
- Daily check-ins (engagement with their focus)
- Recognition from others (what others see in them)
- Recognition they gave (what they notice in others)

Your role:
- Help them see patterns they might miss
- Connect their past evidence to current challenges
- Surface what others see in them
- Ask questions that deepen self-awareness
- Prepare them for coaching conversations

Style:
- Warm but not effusive
- Curious, ask follow-up questions
- Reference specific entries when relevant
- Connect patterns across time
- Never prescribe, always draw out
```

### Tasks

1. Create edge function directory
2. Implement data fetching
3. Build context from user data
4. Call Claude API with context
5. Return response

### Done Criteria
- [ ] Edge function deploys
- [ ] Fetches user data correctly
- [ ] Returns relevant responses
- [ ] Follows Finding Good style
- [ ] Error handling works

---

## Checkpoint 4: Message Flow

**Goal:** Wire up UI to edge function

### Tasks

1. Update ChatPage to call edge function
2. Show loading state while waiting
3. Display response when received
4. Handle errors gracefully

### Flow:
1. User types message, clicks Send
2. Add user message to history
3. Show loading indicator
4. Call edge function
5. Add response to history
6. Save to database

### Done Criteria
- [ ] Send message calls edge function
- [ ] Loading state shows
- [ ] Response displays
- [ ] Errors handled gracefully
- [ ] History updates correctly

---

## Checkpoint 5: Access Control

**Goal:** Lock for non-coached users

### Tasks

1. Check user's coaching status
   - Has active coaching_engagement, OR
   - Has coach_id in clients table, OR
   - Has specific role

2. Show locked preview if not coached:
```
This is where your data becomes conversation.

Ask questions about your patterns, get insights about
what you're building, prepare for coaching sessions.

Reach out to inquire about access.
```

3. Add 🔒 icon to nav item for locked state

### Done Criteria
- [ ] Coached users see full chat
- [ ] Non-coached see locked preview
- [ ] Nav shows 🔒 for non-coached
- [ ] No way to bypass

---

## Checkpoint 6: Route & Navigation

**Goal:** Add to app routes

### Tasks

1. Add route in App.tsx:
```typescript
<Route path="/chat" element={<ChatPage />} />
```

2. Verify sidebar Chat link works
3. Test navigation

### Done Criteria
- [ ] /chat route works
- [ ] Sidebar link navigates correctly
- [ ] Access control applies on route
- [ ] Build passes

---

## Phase I Complete Checklist

- [ ] chat_conversations table created
- [ ] ChatPage UI complete
- [ ] useChatHistory hook working
- [ ] chat-discovery edge function deployed
- [ ] Message flow working
- [ ] Access control (locked for non-coached)
- [ ] Route added
- [ ] No TypeScript errors
- [ ] Build passes

---

## Files Summary

### Database
```sql
chat_conversations (NEW)
```

### Edge Function
```
supabase/functions/chat-discovery/index.ts (NEW)
```

### Components
```
apps/together/src/pages/ChatPage.tsx (NEW)
apps/together/src/hooks/useChatHistory.ts (NEW)
```

---

**End of Phase I Build Plan**
