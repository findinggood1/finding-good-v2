# Finding Good V2: Build Progress

**Last Updated:** January 28, 2026 (Added F.0, parallel build plan)  
**Purpose:** Track progress across all build phases  
**Rule:** Update this file at every checkpoint

**⚠️ IMPORTANT:** Check `docs/FEATURE_TRACKER.md` for complete feature list by phase.  
The tracker is the single source of truth — if it's not there, it doesn't exist.

---

## Overall Status

```
COMPLETED:
Phase A: Navigation Restructure ········· ✅ COMPLETE
Phase B: Home/Influence Page ············ ✅ COMPLETE (basics only)
Phase C: Tool Landing Pages + Inspire ··· ✅ COMPLETE
Phase D: Exchange ······················· ✅ COMPLETE
Phase E: Dashboard ······················ ✅ COMPLETE

COMPLETED:
Phase F.0: Terminology Rename ··········· ✅ COMPLETE (Impact→Impacts, Improve→Insights, Inspire→Inspirations)

NEXT (Parallel - after F.0):
├── Phase F: Send Tools ················· 📋 READY (Impacts/Insights Others wizards)
└── Phase H: Check-in Enhancement ······· 📋 READY (Bridge question, Week history)

AFTER PARALLEL:
Phase G: Social Features ················ 📋 PLANNED (Circle tracker, Notifications)

QUEUED:
Phase I: Chat Page ······················ 📋 PLANNED (AI self-discovery)
Phase J: Profile & Settings ············· 📋 PLANNED (Notifications, Privacy)
Phase K: Map AI Features ················ 📋 PLANNED (Themes, You vs Others, Thread)

OPTIONAL:
Phase E.5: Dashboard Sent/Received ······ ⏳ LOW PRIORITY (can defer)
```

---

## ISSUE: Features Lost from V2 Spec

**Found:** January 28, 2026  
**Cause:** Navigation restructure (Jan 27) created phases A-E but missed features from V2 spec (Jan 25)

| Feature | V2 Spec | Phase Plan | Status |
|---------|---------|------------|--------|
| Circle tracker | Part 3 | ❌ Missing | → Phase G |
| Notifications section | Part 3 | ❌ Missing | → Phase G |
| Recognition counts | Part 3 | ❌ Missing | → Phase G |
| [👏 Recognize] buttons | Part 3 | ❌ Missing | → Phase G |
| "Inspire me" requests | Part 3 | ❌ Missing | → Phase G |
| Bridge question | Part 4 | ❌ Missing | → Phase H |
| Week history view | Part 4 | ❌ Missing | → Phase H |
| Chat page | Part 7 | ❌ Nav only | → Phase I |
| Profile settings | Part 9 | ❌ Missing | → Phase J |
| Focus history | Part 8 | ❌ Missing | → Phase J |
| Map "What's Emerging" | Part 6 | ❌ Missing | → Phase K |
| Map "You vs Others" | Part 6 | ❌ Missing | → Phase K |
| Map "The Thread" | Part 6 | ❌ Missing | → Phase K |

---

## Phase F.0: Terminology Rename ✅ COMPLETE

**Purpose:** Rename tools to noun forms before building new features
**Completed:** January 28, 2026

### What Changed

| Old | New | Affects |
|-----|-----|---------|
| Impact | Impacts | Routes, nav, pages, components |
| Improve | Insights | Routes, nav, pages, components |
| Inspire | Inspirations | Routes, nav, pages, components |

### Checkpoints
- [x] CP1: File renames (10 page files renamed)
- [x] CP2: pages/index.ts exports updated
- [x] CP3: App.tsx routes + redirects
- [x] CP4: Sidebar.tsx navigation labels
- [x] CP5: Landing page content verified
- [x] CP6: All routes tested and working

### Files to Update
- `apps/together/src/App.tsx` (routes)
- `apps/together/src/components/Sidebar.tsx` (nav labels)
- `apps/together/src/pages/Impact*.tsx` → `Impacts*.tsx`
- `apps/together/src/pages/Improve*.tsx` → `Insights*.tsx`
- `apps/together/src/pages/Inspire*.tsx` → `Inspirations*.tsx`
- `apps/together/src/components/impact/` → `impacts/`
- `apps/together/src/components/improve/` → `insights/`
- `apps/together/src/components/inspire/` → `inspirations/`
- Landing page content (tool descriptions)
- Dashboard tabs if they reference old names

---

## Phase F: Send Tools 📋 READY

**Build Plan:** `docs/phase_f_build_plan.md` (note: uses old terminology, will build with new)  
**Reference:** `priority_proof_build_spec_jan24.md`, `Finding_Good_V2_Social_Features_Spec.md`  
**Estimated Time:** 2-3 sessions  
**Depends On:** Phase F.0 (terminology rename)

### Purpose
Complete Impacts Others and Insights Others wizards (currently just pass a flag)

### What's Being Built

**Impacts Others ("Recognize Someone's Impact"):**
- 6-step wizard: WHO → WHAT → MEANING → IMPACT → PREVIEW → COMPLETE
- Recipient view page with Thank button
- FIRES insights for both sender and recipient

**Insights Others ("Witness Someone's Growth"):**
- 7-step wizard: WHO → OUTCOME → PROCESS → KEY MOVE → IMPACT → PREVIEW → COMPLETE
- Recipe output (approach, key_move, why_it_worked)
- Recipient view page with Thank button

### Checkpoints
- [ ] CP0: Database schema updates
- [ ] CP1: Impacts Others wizard
- [ ] CP2: Impacts View page (recipient)
- [ ] CP3: Insights Others wizard  
- [ ] CP4: Insights View page (recipient + recipe)
- [ ] CP5: Routes + navigation

---

## Phase G: Social Features 📋 READY

**Source:** V2 Spec Part 3 (Home Page)  
**Estimated Time:** 2 sessions

### Purpose
Circle tracker, notifications, recognition interactions

### What's Being Built

**Circle Tracker:**
```
YOUR CIRCLE TODAY
┌────────────────────────────────────────────────────────────┐
│ ✓ Sarah           ✓ David           ○ Elena      ○ Marcus  │
│   Rebuild trust     Lead well         [Inspire]   [Inspire]│
└────────────────────────────────────────────────────────────┘
```
- Shows exchange partners who checked in today
- ✓ = checked in, ○ = not checked in
- [Inspire me] button for those who haven't

**Notifications Section:**
```
NOTIFICATIONS                                          [Clear]
┌────────────────────────────────────────────────────────────┐
│ 🔔 Sarah recognized your share about team transparency     │
│ 🔔 David responded to your ask about delegation            │
│ 📬 Elena is asking for your perspective                    │
└────────────────────────────────────────────────────────────┘
```
- Recognitions received, responses to asks, pending asks
- Click → scrolls to item in feed

**Recognition on Feed:**
- Recognition counts: "👏 3 recognized"
- [👏 Recognize] button on feed items

### Database Tables
```sql
CREATE TABLE user_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  circle_member_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, circle_member_email)
);

CREATE TABLE recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL,
  share_type TEXT NOT NULL, -- priority, validation, prediction
  recognizer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(share_id, share_type, recognizer_email)
);

CREATE TABLE inspire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  source_type TEXT,
  source_id UUID,
  from_email TEXT,
  message TEXT,
  read_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Checkpoints
- [ ] CP0: Database tables
- [ ] CP1: Circle tracker component + hook
- [ ] CP2: Notifications section component + hook
- [ ] CP3: Recognition counts on feed items
- [ ] CP4: [👏 Recognize] button action
- [ ] CP5: "Inspire me" request flow
- [ ] CP6: Add to HomePage layout

---

## Phase H: Check-in Enhancement 📋 PLANNED

**Source:** V2 Spec Part 4 (Today Page)  
**Estimated Time:** 1 session

### Purpose
Bridge question flow, week history view

### What's Being Built

**Bridge Question (Post Check-in):**
```
✓ Check-in saved

┌────────────────────────────────────────────────────────────┐
│  Self-care landed today (5/5).                             │
│                                                            │
│  What made it land?                                        │
│                                                            │
│  [Text area...]                                            │
│                                                            │
│                        [Skip]  [Continue to Priority →]    │
└────────────────────────────────────────────────────────────┘
```

**Bridge Logic:**
| Condition | Question |
|-----------|----------|
| Highest score (4-5) | "What made [item] land?" |
| Lowest score (1-2) | "What became more important?" |
| Nothing checked | "What got your attention today?" |

**Week History View:**
```
THIS WEEK
┌────────────────────────────────────────────────────────────┐
│ Mon   Tue   Wed   Thu   Fri   Sat   Sun                    │
│  ✓     ✓     ✓     ○     ✓     -     ●                     │
│ 3/3   2/3   3/3         2/3         (today)                │
└────────────────────────────────────────────────────────────┘

ENGAGEMENT THIS WEEK
Self-care: ⚡4.2 avg
Team 1:1s: 3.1 avg
Strategic planning: ⚠️2.1 avg
```

### Checkpoints
- [ ] CP1: Bridge question logic + component
- [ ] CP2: Bridge → Priority pre-fill flow
- [ ] CP3: Week history calendar component
- [ ] CP4: Weekly engagement averages
- [ ] CP5: Integrate into DailyCheckin

---

## Phase I: Chat Page 📋 PLANNED

**Source:** V2 Spec Part 7  
**Estimated Time:** 2 sessions  
**Access:** Coached clients only

### Purpose
AI self-discovery tool

### What's Being Built

```
CHAT                                                    🔒
─────────────────────────────────────────────────────────

Ask me anything about your journey...

Try:
• "What patterns do you see in my priorities?"
• "What are others seeing in me?"
• "What should I explore with my coach?"
• "When have I been most engaged this month?"

─────────────────────────────────────────────────────────

[Chat history]

─────────────────────────────────────────────────────────

[Type your question...]                           [Send]
```

**AI Accesses:**
- Priority entries, Proof entries, Predict data
- Daily check-ins
- Recognition received (what others see)
- Recognition sent (what user notices)

**AI Behavior:**
- Mix of answers and questions back
- Finding Good style: draws out, doesn't tell
- Connects patterns across entries

### Database
```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function
`chat-discovery` — Takes user context + message, returns AI response

### Checkpoints
- [ ] CP0: Database table
- [ ] CP1: ChatPage component (UI)
- [ ] CP2: useChatHistory hook
- [ ] CP3: Edge function (chat-discovery)
- [ ] CP4: Message send/receive flow
- [ ] CP5: Lock for non-coached users
- [ ] CP6: Route + navigation

---

## Phase J: Profile & Settings 📋 PLANNED

**Source:** V2 Spec Part 9  
**Estimated Time:** 1 session

### Purpose
Complete profile page with all settings

### What's Being Built

**Coach Connection:**
```
COACH CONNECTION
┌────────────────────────────────────────────────────────────┐
│ Connected to: Brian Fretwell                               │
│ Since: January 15, 2026                                    │
│ Week 6 of 12                                      [Manage] │
└────────────────────────────────────────────────────────────┘
```

**Notification Preferences:**
```
NOTIFICATIONS
┌────────────────────────────────────────────────────────────┐
│ ☑ Email when someone recognizes me                         │
│ ☑ Email when someone asks for my perspective               │
│ ☑ Daily check-in reminder (6:00 PM)               [Change] │
│ ☐ Weekly summary email                                     │
└────────────────────────────────────────────────────────────┘
```

**Privacy Controls:**
```
PRIVACY
┌────────────────────────────────────────────────────────────┐
│ What my coach can see:                                     │
│ ☑ My check-ins and engagement                              │
│ ☑ My priority entries                                      │
│ ☑ My proof entries                                         │
│ ☑ Recognition I send and receive                           │
└────────────────────────────────────────────────────────────┘
```

**Focus History:**
```
FOCUS HISTORY
┌────────────────────────────────────────────────────────────┐
│ • Daily journaling (Jan 1-15) → evolved into Self-care     │
│ • Morning routine (Jan 1-10) → paused                      │
└────────────────────────────────────────────────────────────┘
```

### Database
```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notification_preferences JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS privacy_settings JSONB;

CREATE TABLE focus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  focus_name TEXT NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE,
  evolved_into TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Checkpoints
- [ ] CP1: Coach connection display
- [ ] CP2: Notification preferences UI + save
- [ ] CP3: Privacy controls UI + save
- [ ] CP4: Focus history tracking + display
- [ ] CP5: Database columns/tables

---

## Phase K: Map AI Features 📋 PLANNED

**Source:** V2 Spec Part 6  
**Estimated Time:** 2 sessions  
**Access:** Coached clients only

### Purpose
AI synthesis features for Map page

### What's Being Built

**"What's Emerging":**
```
WHAT'S EMERGING
┌────────────────────────────────────────────────────────────┐
│ 🔥 Transparency - showing up 8x in your entries            │
│ 🔥 Team trust - mentioned 6x, trending up                  │
│ 📈 Strategic planning engagement increasing (2.1 → 3.4)    │
│                                                            │
│ 💡 Self-care keeps landing. What makes it stick?           │
└────────────────────────────────────────────────────────────┘
```

**"You vs Others" FIRES:**
```
WHAT YOU MENTION vs WHAT OTHERS SEE
┌────────────────────────────────────────────────────────────┐
│                      You    Others                         │
│ Feelings    ████░░░░  3.2   ████████  4.5  ← Others see + │
│ Influence   ██████░░  4.1   █████░░░  3.4                 │
│ Resilience  ████████  4.8   ████████  4.6                 │
│ Ethics      █████░░░  3.6   ██████░░  4.0                 │
│ Strengths   ███░░░░░  2.8   ██████░░  4.2  ← Others see + │
│                                                            │
│ 💡 "Others see Feelings and Strengths in you more than    │
│    you mention them. What might that mean?"               │
└────────────────────────────────────────────────────────────┘
```

**"The Thread":**
```
THE THREAD
┌────────────────────────────────────────────────────────────┐
│ "You're rebuilding trust through transparency - the same   │
│  approach that worked when you turned around the team      │
│  5 years ago. Others see this even when you doubt it."     │
│                                                            │
│ 💡 "What would it look like to trust this pattern?"        │
└────────────────────────────────────────────────────────────┘
```

### Edge Functions
- `map-themes-extract` — Finds recurring themes
- `map-fires-compare` — Compares self vs others-observed FIRES
- `map-thread-generate` — Creates narrative synthesis

### Checkpoints
- [ ] CP1: What's Emerging component + hook
- [ ] CP2: You vs Others FIRES comparison chart
- [ ] CP3: The Thread component + hook
- [ ] CP4: Edge functions
- [ ] CP5: Integrate into MapPage

---

## COMPLETED PHASES

### Phase A: Navigation ✅ COMPLETE

- NavDropdown component
- Sidebar restructured (Four I's framework)
- Routes wired up
- Placeholder pages created

### Phase B: Home/Influence ✅ COMPLETE (basics)

Built:
- YOUR INFLUENCE section (Permission, Practice, Focus)
- TODAY'S CHECK-IN (Focus checkboxes, engagement, question)
- THIS WEEK section (Beliefs + evidence counts)
- RECENT ACTIVITY section (Sent/received)
- INSIGHTS section (Rule-based messages)

Missing (moved to later phases):
- Circle tracker → Phase G
- Notifications section → Phase G
- Bridge question → Phase H
- Week history → Phase H

### Phase C: Tool Landing + Inspire Others ✅ COMPLETE

- ToolLandingPage component
- Impact/Improve/Inspire landing pages
- Inspire Others 5-step wizard
- Inspire recipient view + Thank button
- `inspire_others` database table

### Phase D: Exchange ✅ COMPLETE

- Exchange partnerships system
- Invite → Accept/Decline flow
- Partnership detail view
- Mutual activity display
- `exchange_partnerships` table

### Phase E: Dashboard ✅ COMPLETE

- V2 naming (Impact/Improve/Inspire)
- YOUR INFLUENCE section for clients
- Quick Prep section
- Engagement indicators
- Activity feed updates
- UI refinement

---

## Build Sequence

```
IMMEDIATE:
├── Phase F (Send Tools) ······ 🎯 Impact/Improve Others
└── Phase G (Social) ·········· 🎯 Circle tracker, Notifications

THEN:
├── Phase H (Check-in) ········ Bridge question, Week history
├── Phase I (Chat) ············ AI self-discovery (coached)
├── Phase J (Profile) ········· Settings, Notifications, Privacy
└── Phase K (Map AI) ·········· Themes, You vs Others (coached)

AFTER ALL PHASES:
└── Big Test & Refine ········· Full persona testing
```

---

## Quick Reference

### Build Plans
```
docs/
├── phase_a_build_plan.md ✅
├── phase_b_build_plan.md ✅
├── phase_c_build_plan.md ✅
├── phase_d_build_plan.md ✅
├── phase_e_build_plan.md ✅
├── phase_f_build_plan.md 📋
├── phase_g_build_plan.md (NEEDS CREATION)
├── phase_h_build_plan.md (NEEDS CREATION)
├── phase_i_build_plan.md (NEEDS CREATION)
├── phase_j_build_plan.md (NEEDS CREATION)
└── phase_k_build_plan.md (NEEDS CREATION)
```

### V2 Spec Reference
```
together_v2_complete_spec.md
├── Part 3: Home Page ········· Circle, Notifications, Feed
├── Part 4: Today Page ········ Bridge question, Week history
├── Part 6: Map Page ·········· AI features (coached)
├── Part 7: Chat Page ········· AI discovery (coached)
├── Part 8: My Focus ·········· Focus history
└── Part 9: Profile ··········· Settings, Privacy
```

---

**Update this file at every checkpoint.**
