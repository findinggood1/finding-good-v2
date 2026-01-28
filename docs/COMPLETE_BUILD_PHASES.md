# Finding Good V2: Complete Build Phases (UPDATED)

**Created:** January 28, 2026  
**Purpose:** Capture ALL features from V2 spec that need building  
**Issue:** Navigation restructure (Jan 27) missed features from V2 spec (Jan 25)

---

## Current Status

```
COMPLETED:
Phase A: Navigation ············· ✅ COMPLETE
Phase B: Home/Influence ········· ✅ COMPLETE (partial - missing features)
Phase C: Tool Landing + Inspire · ✅ COMPLETE
Phase D: Exchange ··············· ✅ COMPLETE
Phase E: Dashboard ·············· ✅ COMPLETE

PLANNED:
Phase E.5: Sent/Received Data ··· 📋 PLANNED
Phase F: Send Tools ············· 📋 PLANNED (Impact/Improve Others)

MISSING (from V2 spec):
Phase G: Social Features ········ 📋 NEW
Phase H: Check-in Enhancement ··· 📋 NEW
Phase I: Chat Page ·············· 📋 NEW
Phase J: Profile & Settings ····· 📋 NEW
Phase K: Map AI Features ········ 📋 NEW (coached only)
```

---

## Phase E.5: Sent/Received Data (EXISTING PLAN)

**Purpose:** Show sent/received entries in Dashboard tabs

### Checkpoints
- [ ] Upload File → Notes tab
- [ ] Quick Prep sent/received counts
- [ ] Impact tab — sent/received sections
- [ ] Improve tab — sent/received sections
- [ ] Inspire tab — sent/received sections

---

## Phase F: Send Tools (EXISTING PLAN)

**Purpose:** Complete Impact Others and Improve Others wizards

### Checkpoints
- [ ] Database schema (sender_fires, recipient_fires, recipe columns)
- [ ] Impact Others wizard (6 steps)
- [ ] Impact View page (recipient)
- [ ] Improve Others wizard (7 steps)
- [ ] Improve View page (recipient + recipe)
- [ ] Routes + navigation

---

## Phase G: Social Features (NEW)

**Source:** V2 Spec Part 3 (Home Page)

**Purpose:** Circle tracker, notifications, recognition interactions

### Features from Spec

**Circle Tracker:**
```
YOUR CIRCLE TODAY
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Sarah              ✓ David             ○ Elena        ○ Marcus │
│   Rebuild trust        Lead authentically  Find balance   Scale  │
│                                            [Inspire me]  [Inspire]│
└─────────────────────────────────────────────────────────────────┘
```
- Shows who in your circle checked in today
- ✓ = checked in, ○ = not checked in
- Shows their Permission statement
- [Inspire me] button for those who haven't checked in

**Notifications Section:**
```
NOTIFICATIONS                                                [Clear]
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 Sarah recognized your share about team transparency          │
│ 🔔 David responded to your ask about delegation                 │
│ 📬 Elena is asking for your perspective on her client pitch     │
└─────────────────────────────────────────────────────────────────┘
```
- Shows: recognitions received, responses to asks, pending asks
- Click → scrolls to item in feed
- [Clear] button

**Recognition Interactions:**
- Recognition counts on feed items: "👏 3 recognized"
- [👏 Recognize] button on feed items
- No "recognize back" prompt (avoids obligation loop)

**"Inspire me" Requests:**
- Sends gentle nudge: "[Name] would like to be inspired by what you're working on today"
- Creates notification for recipient
- Tracked in `inspire_requests` table

### Database Tables Needed

```sql
-- Circle membership (who's in whose circle)
CREATE TABLE user_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  circle_member_email TEXT NOT NULL,
  relationship_type TEXT, -- sent_to, received_from, mutual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, circle_member_email)
);

-- Recognition counts
CREATE TABLE recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL, -- FK to priorities/validations/predictions
  share_type TEXT NOT NULL, -- priority, validation, prediction
  recognizer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(share_id, share_type, recognizer_email)
);

-- Inspire me requests
CREATE TABLE inspire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  message TEXT DEFAULT 'would like to be inspired by what you''re working on today',
  status TEXT DEFAULT 'pending', -- pending, acknowledged
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (aggregated)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  type TEXT NOT NULL, -- recognition, response, ask, inspire_request
  source_type TEXT, -- priority, validation, prediction, inspire_request
  source_id UUID,
  from_email TEXT,
  message TEXT,
  read_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Checkpoints

- [ ] CP0: Database tables (user_circles, recognitions, inspire_requests, notifications)
- [ ] CP1: Circle tracker component + hook
- [ ] CP2: Notifications section component + hook
- [ ] CP3: Recognition counts on feed items
- [ ] CP4: [👏 Recognize] button action
- [ ] CP5: "Inspire me" button + request flow
- [ ] CP6: Add to HomePage layout

---

## Phase H: Check-in Enhancement (NEW)

**Source:** V2 Spec Part 4 (Today Page)

**Purpose:** Bridge question, week history

### Features from Spec

**Bridge Question (Post Check-in):**
```
✓ Check-in saved

┌─────────────────────────────────────────────────────────────────┐
│  Self-care landed today (5/5).                                  │
│                                                                 │
│  What made it land?                                             │
│                                                                 │
│  [Text area...]                                                 │
│                                                                 │
│                                    [Skip]  [Continue to Priority →]│
└─────────────────────────────────────────────────────────────────┘
```

**Bridge Question Logic:**
| Condition | Question |
|-----------|----------|
| Highest score (4-5) | "What made [item] land?" |
| Lowest score (1-2) | "What became more important?" |
| Nothing checked | "What got your attention today?" |
| "Something else emerged" only | "Tell me about what emerged" |

**Continue to Priority:** Pre-fills answer in Priority entry

**Week History View:**
```
THIS WEEK
┌─────────────────────────────────────────────────────────────────┐
│ Mon   Tue   Wed   Thu   Fri   Sat   Sun                         │
│  ✓     ✓     ✓     ○     ✓     -     ●                          │
│ 3/3   2/3   3/3         2/3         (today)                     │
└─────────────────────────────────────────────────────────────────┘

ENGAGEMENT THIS WEEK
Self-care: ⚡4.2 avg
Team 1:1s: 3.1 avg
Strategic planning: ⚠️2.1 avg
```

### Checkpoints

- [ ] CP1: Bridge question logic + component
- [ ] CP2: Bridge → Priority pre-fill flow
- [ ] CP3: Week history calendar component
- [ ] CP4: Weekly engagement averages display
- [ ] CP5: Integrate into DailyCheckin component

---

## Phase I: Chat Page (NEW)

**Source:** V2 Spec Part 7

**Purpose:** AI self-discovery tool for coached clients

### Features from Spec

```
CHAT                                                        🔒
───────────────────────────────────────────────────────────────

Ask me anything about your journey...

Try:
• "What patterns do you see in my priorities?"
• "What are others seeing in me?"
• "What should I explore with my coach?"
• "When have I been most engaged this month?"
• "How does my past proof connect to my current challenge?"

─────────────────────────────────────────────────────────────────

[Chat history appears here]

─────────────────────────────────────────────────────────────────

[Type your question...]                                   [Send]
```

**What Chat Accesses:**
- Priority entries
- Proof/Validation entries
- Predict data (goals, FIRES)
- Daily check-ins
- Recognition received (what others see)
- Recognition sent (what user notices)

**AI Behavior:**
- Mix of direct answers and questions back
- Finding Good style: draws out, doesn't tell
- Connects patterns across entries
- Surfaces what others see that user doesn't mention

**Free User Preview:**
```
This is where your data becomes conversation.

Ask questions about your patterns, get insights about
what you're building, prepare for coaching sessions.

Reach out to inquire about access.
```

### Database Tables

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  messages JSONB DEFAULT '[]', -- [{role, content, timestamp}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function

**`chat-discovery`** — Takes user context + message, returns AI response

### Checkpoints

- [ ] CP0: Database table (chat_conversations)
- [ ] CP1: ChatPage component (UI only)
- [ ] CP2: useChatHistory hook
- [ ] CP3: Edge function (chat-discovery)
- [ ] CP4: Message send/receive flow
- [ ] CP5: Lock for non-coached users
- [ ] CP6: Route + navigation

---

## Phase J: Profile & Settings (NEW)

**Source:** V2 Spec Part 9

**Purpose:** Complete profile page with all settings

### Features from Spec

**Account Section:**
- Email display + change
- Password change

**Coach Connection:**
```
COACH CONNECTION
┌─────────────────────────────────────────────────────────────────┐
│ Connected to: Brian Fretwell                                    │
│ Since: January 15, 2026                                         │
│ Week 6 of 12                                                    │
│                                                          [Manage]│
└─────────────────────────────────────────────────────────────────┘
```

**Notification Preferences:**
```
NOTIFICATIONS
┌─────────────────────────────────────────────────────────────────┐
│ ☑ Email when someone recognizes me                              │
│ ☑ Email when someone asks for my perspective                    │
│ ☑ Daily check-in reminder (6:00 PM)                    [Change] │
│ ☐ Weekly summary email                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Privacy Controls:**
```
PRIVACY
┌─────────────────────────────────────────────────────────────────┐
│ What my coach can see:                                          │
│ ☑ My check-ins and engagement                                   │
│ ☑ My priority entries                                           │
│ ☑ My proof entries                                              │
│ ☑ Recognition I send and receive                                │
│                                                                 │
│ Note: You can hide individual entries from your coach           │
│ using the 👁️ icon on any entry.                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Database Columns

```sql
-- Add to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_on_recognition": true,
  "email_on_ask": true,
  "daily_reminder": true,
  "daily_reminder_time": "18:00",
  "weekly_summary": false
}';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "coach_sees_checkins": true,
  "coach_sees_priorities": true,
  "coach_sees_proofs": true,
  "coach_sees_recognition": true
}';
```

### Checkpoints

- [ ] CP1: Account section (email, password)
- [ ] CP2: Coach connection display
- [ ] CP3: Notification preferences UI + save
- [ ] CP4: Privacy controls UI + save
- [ ] CP5: Database columns
- [ ] CP6: Hide individual entries (👁️ icon)

---

## Phase K: Map AI Features (NEW - Coached Only)

**Source:** V2 Spec Part 6

**Purpose:** AI synthesis features for Map page

### Features from Spec

**"What's Emerging":**
```
WHAT'S EMERGING
┌─────────────────────────────────────────────────────────────────┐
│ 🔥 Transparency - showing up 8x in your entries                 │
│ 🔥 Team trust - mentioned 6x, trending up                       │
│ 📈 Strategic planning engagement increasing (2.1 → 3.4)         │
│                                                                 │
│ 💡 Self-care keeps landing. What makes it stick when other      │
│    things don't?                                                │
└─────────────────────────────────────────────────────────────────┘
```

**"You vs Others" FIRES Comparison:**
```
WHAT YOU MENTION vs WHAT OTHERS SEE
┌─────────────────────────────────────────────────────────────────┐
│                        You    Others                            │
│ Feelings      ████░░░░  3.2   ████████  4.5  ← Others see more │
│ Influence     ██████░░  4.1   █████░░░  3.4                    │
│ Resilience    ████████  4.8   ████████  4.6                    │
│ Ethics        █████░░░  3.6   ██████░░  4.0                    │
│ Strengths     ███░░░░░  2.8   ██████░░  4.2  ← Others see more │
│                                                                 │
│ 💡 "Others see Feelings and Strengths in you more than you     │
│    mention them. What might that mean?"                        │
└─────────────────────────────────────────────────────────────────┘
```

**"The Thread":**
```
THE THREAD
┌─────────────────────────────────────────────────────────────────┐
│ "You're rebuilding trust through transparency - the same        │
│  approach that worked when you turned around the engineering    │
│  team 5 years ago. Others see this in you even when you doubt  │
│  it."                                                           │
│                                                                 │
│ 💡 "What would it look like to trust this pattern?"            │
└─────────────────────────────────────────────────────────────────┘
```

### Edge Functions Needed

- `map-themes-extract` — Finds recurring themes in entries
- `map-fires-compare` — Compares self-mentioned vs others-observed FIRES
- `map-thread-generate` — Creates narrative synthesis

### Checkpoints

- [ ] CP1: What's Emerging component + hook
- [ ] CP2: You vs Others FIRES comparison chart
- [ ] CP3: The Thread component + hook
- [ ] CP4: Edge functions (themes, compare, thread)
- [ ] CP5: Integrate into MapPage

---

## Phase Sequence

```
Current:
├── Phase A (Nav) ············· ✅ COMPLETE
├── Phase B (Home) ············ ✅ COMPLETE (partial)
├── Phase C (Tools + Inspire) · ✅ COMPLETE
├── Phase D (Exchange) ········ ✅ COMPLETE
└── Phase E (Dashboard) ······· ✅ COMPLETE

Next Priority:
├── Phase F (Send Tools) ······ 🎯 Impact/Improve Others wizards
└── Phase G (Social) ·········· 🎯 Circle tracker, notifications

Then:
├── Phase H (Check-in) ········ Bridge question, week history
├── Phase I (Chat) ············ AI self-discovery page
├── Phase J (Profile) ········· Settings, notification prefs
└── Phase K (Map AI) ·········· Coached features

Parallel Options:
├── Phase E.5 (Dashboard Data) · Can run with F
└── Phase H (Check-in) ········· Can run with G
```

---

## Summary: What Was Lost

| Feature | V2 Spec Section | Why Lost |
|---------|-----------------|----------|
| Circle tracker | Part 3 | Nav restructure focused on Four I's, missed social features |
| Notifications section | Part 3 | Same — not in Phase B plan |
| Recognition counts/buttons | Part 3 | Same |
| "Inspire me" requests | Part 3 | Same |
| Bridge question | Part 4 | Phase B only built check-in, not bridge flow |
| Week history | Part 4 | Same |
| Chat page | Part 7 | Only nav placeholder, no build plan |
| Focus history | Part 8 | My Focus merged into Home without history |
| Profile features | Part 9 | Profile page minimal, no settings |
| Map AI features | Part 6 | Map exists but AI synthesis not built |

---

## Test & Refine Plan

After all phases complete:

1. **Persona Testing:**
   - Marcus flow: Check-in → Bridge → Priority → Share → Recognition
   - Sarah flow: Inspire someone → They receive → Thank
   - David flow: Exchange invite → Accept → View influence
   - Elena flow: Chat discovery → Pattern exploration

2. **Integration Testing:**
   - Data flows between tools
   - Notifications trigger correctly
   - Circle updates on activity
   - Recognition counts update

3. **Coaching Flow:**
   - Client check-in visible to coach
   - Coach sees Map AI features
   - Privacy controls work

---

**End of Complete Build Phases**
