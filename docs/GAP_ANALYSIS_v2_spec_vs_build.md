# Gap Analysis: V2 Spec vs Current Build

**Created:** January 28, 2026  
**Source:** together_v2_complete_spec.md vs Phases A-F implementation  
**Purpose:** Identify what's missing, what changed intentionally, and what still needs building

---

## Overview

The V2 spec uses different navigation language (DAILY/GIVE/BUILD/DIRECTION) while the current build uses the **Four I's framework** (Impact/Improve/Inspire). Many changes are intentional design decisions, but several features from the spec remain unbuilt.

---

## Part 1: Navigation Structure

### V2 Spec (Old Language)
```
DAILY:     Home, Today
GIVE:      Recognize, Witness, Believe  
BUILD:     Priority, Proof
DIRECTION: Predict, Map 🔒, Chat 🔒
SETTINGS:  My Focus, Profile
           [?] Learn
```

### Current Build (Four I's)
```
PRIMARY:   Home, Campfire, Exchange
TOOLS:     Impact ▸ (Self | Others)
           Improve ▸ (Self | Others)
           Inspire ▸ (Self | Others)
DIRECTION: Map 🔒
UTILITY:   Profile, Learn
```

### Comparison

| V2 Spec | Current Build | Status |
|---------|---------------|--------|
| Home | Home | ✅ Different content (see below) |
| Today | — | ❌ **Merged into Home** (no separate page) |
| Recognize | Impact Others | ✅ Renamed |
| Witness | Improve Others | ✅ Renamed |
| Believe | Inspire Others | ✅ Renamed |
| Priority | Impact Self | ✅ Renamed |
| Proof | Improve Self | ✅ Renamed |
| Predict | Inspire Self | ✅ Renamed |
| Map 🔒 | Map 🔒 | ✅ Built (different content) |
| Chat 🔒 | — | ❌ **NOT BUILT** |
| My Focus | — | ⚠️ Embedded in Home as "Your Influence" |
| Profile | Profile | ⚠️ Basic only |
| Learn | Learn | ⚠️ Placeholder only |

---

## Part 2: Home Page

### V2 Spec Features

```
┌─────────────────────────────────────────┐
│ YOUR CIRCLE TODAY                       │  ← Who checked in
│   ✓ Sarah  ✓ David  ○ Elena  ○ Marcus  │
│                    [Inspire me] buttons │
├─────────────────────────────────────────┤
│ NOTIFICATIONS                    [Clear]│  ← Pending items
│   🔔 Sarah recognized your share...     │
│   📬 Elena is asking for perspective... │
├─────────────────────────────────────────┤
│ CAMPFIRE                                │  ← Social feed
│   [Feed items with 👏 Recognize buttons]│
│   [Recognition counts: "👏 3 recognized"]│
└─────────────────────────────────────────┘
```

### Current Build Features

```
┌─────────────────────────────────────────┐
│ YOUR INFLUENCE                          │  ← Permission, Practice, Focus
├─────────────────────────────────────────┤
│ TODAY'S CHECK-IN                        │  ← Focus checkboxes + engagement
├─────────────────────────────────────────┤
│ WHAT YOU'RE CREATING                    │  ← Predictions header
├─────────────────────────────────────────┤
│ THIS WEEK                               │  ← Beliefs + evidence counts
├─────────────────────────────────────────┤
│ RECENT ACTIVITY                         │  ← Sent/received
├─────────────────────────────────────────┤
│ INSIGHTS                                │  ← Rule-based messages
└─────────────────────────────────────────┘
```

### Gap Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| Circle tracker | ❌ NOT BUILT | Shows who in your circle checked in today |
| "Inspire me" buttons | ❌ NOT BUILT | Gentle nudge to circle members |
| Notifications section | ❌ NOT BUILT | Pending recognitions, asks, responses |
| Campfire on Home | ⚠️ SEPARATE | Moved to /campfire route |
| Recognition counts | ❌ NOT BUILT | "👏 3 recognized" on feed items |
| [👏 Recognize] buttons | ❌ NOT BUILT | One-click recognition on feed items |
| Your Influence | ✅ BUILT | Permission, Practice, Focus |
| Today's Check-in | ✅ BUILT | Focus checkboxes + engagement |
| Recent Activity | ✅ BUILT | Sent/received entries |
| Insights | ✅ BUILT | Rule-based contextual messages |

---

## Part 3: Today Page

### V2 Spec Features

- **Separate page** at `/today`
- Check-in with focus items + engagement scores (1-5)
- **Post-Done Bridge Question**: "What made [highest item] land?" → flows into Priority
- **Week history view** after check-in complete
- Calendar with ✓/○ indicators
- Weekly engagement averages per focus item

### Current Build

- **Embedded** in HomePage as "TODAY'S CHECK-IN"
- No bridge question
- No week history view
- No calendar

### Gap Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| Separate Today page | ⚠️ DESIGN DECISION | Merged into Home |
| Bridge question | ❌ NOT BUILT | "What made it land?" → Priority pre-fill |
| Week history | ❌ NOT BUILT | Calendar + engagement trends |
| Weekly averages | ❌ NOT BUILT | Per-focus engagement stats |

---

## Part 4: Tool Structure (Priority/Proof/Predict)

### V2 Spec Pattern

Each tool has **two tabs**:
```
┌─────────────────────────────────────────┐
│ PRIORITY                       [? Help] │
├─────────────────────────────────────────┤
│ [My Entries]  [Send to Someone]         │  ← Tab navigation
├─────────────────────────────────────────┤
│ (content based on selected tab)         │
└─────────────────────────────────────────┘
```

- GIVE nav items → "Send to Someone" tab
- BUILD nav items → "My Entries" tab

### Current Build Pattern

Each tool has **landing page** with two cards:
```
┌─────────────────────────────────────────┐
│ IMPACT                                  │
├─────────────────────────────────────────┤
│ ┌───────────────┐  ┌───────────────┐   │
│ │  Record Your  │  │  Recognize    │   │
│ │  Impact       │  │  Someone's    │   │
│ │  [Start →]    │  │  Impact       │   │
│ │               │  │  [Start →]    │   │
│ └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────┘
```

- Landing pages at `/impact`, `/improve`, `/inspire`
- Self pages at `/impact/self`, etc.
- Others pages at `/impact/others`, etc.

### Gap Analysis

| Aspect | Status | Notes |
|--------|--------|-------|
| Tool organization | ⚠️ DESIGN DECISION | Landing pages vs tabs — different UX, same destination |
| Navigation mapping | ✅ EQUIVALENT | Four I's dropdowns achieve same routing |

---

## Part 5: Map Page (Coached Only)

### V2 Spec Features

```
YOUR PERMISSION, YOUR PRACTICE
YOUR FOCUS THIS WEEK (engagement scores with ⚡/⚠️)
YOUR ACTIVITY (check-ins: 34, priorities: 28, proofs: 6...)
WHAT'S EMERGING (AI themes: "🔥 Transparency - showing up 8x")
WHAT YOU MENTION vs WHAT OTHERS SEE (FIRES comparison chart)
THE THREAD (AI synthesis of patterns)
```

### Current Build Features

- Predictability card
- FIRES grid
- Some analytics components

### Gap Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| Permission/Practice display | ⚠️ PARTIAL | Moved to Home |
| Focus with engagement | ⚠️ PARTIAL | On Home, not Map |
| Activity counts | ⚠️ PARTIAL | Some built |
| "What's Emerging" | ❌ NOT BUILT | AI-detected themes/patterns |
| "You vs Others" FIRES | ❌ NOT BUILT | Comparison chart |
| "The Thread" | ❌ NOT BUILT | AI narrative synthesis |

**This is significant** — the Map page's differentiating features (AI synthesis, you vs others comparison) aren't built.

---

## Part 6: Chat Page (Coached Only)

### V2 Spec Features

- AI self-discovery tool that knows user's data
- Suggested questions ("What patterns do you see?", "What are others seeing?")
- Chat history persistence
- Drawing out patterns, not telling

### Current Build

❌ **NOT BUILT AT ALL**

### Gap Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| Chat page | ❌ NOT BUILT | /chat route doesn't exist |
| AI integration | ❌ NOT BUILT | Would need edge function |
| Chat history | ❌ NOT BUILT | `chat_conversations` table not created |

---

## Part 7: My Focus Page

### V2 Spec Features

- **Separate page** at `/focus`
- Links to Predict goal ("Supporting: [goal]")
- Permission, Practice, Focus with engagement stats
- **Focus history** (evolved into, paused, completed)
- Add/edit/remove focus items

### Current Build

- **Embedded** in HomePage as "YOUR INFLUENCE" section
- Inline editing
- No focus history

### Gap Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| Separate page | ⚠️ DESIGN DECISION | Merged into Home |
| Link to Predict goal | ❌ NOT BUILT | "Supporting your goal" connection |
| Focus history | ❌ NOT BUILT | Track evolution over time |
| Engagement stats per focus | ⚠️ PARTIAL | Basic display only |

---

## Part 8: Profile Page

### V2 Spec Features

```
ACCOUNT (email, password)
COACH CONNECTION (connected to X, since Y, week Z of 12)
NOTIFICATIONS (email preferences)
PRIVACY (what coach can see, hide individual entries)
```

### Current Build

- Basic profile exists
- Sign out works

### Gap Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| Account settings | ⚠️ BASIC | Exists |
| Coach connection display | ❌ NOT BUILT | "Week 6 of 12" progress |
| Notification preferences | ❌ NOT BUILT | Email toggles |
| Privacy controls | ❌ NOT BUILT | What coach sees |

---

## Part 9: Database Tables

### V2 Spec New Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `permissions` | Permission, Practice, Focus | ❌ Uses `clients` table instead |
| `daily_checkins` | Check-in data | ✅ Built as `daily_reflections` |
| `user_circles` | Circle members | ❌ NOT BUILT |
| `inspiration_shares` | Feed content | ❌ NOT BUILT (inline queries) |
| `recognitions` | Recognition counts | ❌ NOT BUILT |
| `inspire_requests` | "Inspire me" nudges | ❌ NOT BUILT |
| `chat_conversations` | Chat history | ❌ NOT BUILT |
| `focus_history` | Focus evolution | ❌ NOT BUILT |

### Tables Actually Built

| Table | Purpose | Phase |
|-------|---------|-------|
| `daily_reflections` | Check-in data | Phase B |
| `inspire_others` | Inspire send flow | Phase C |
| `exchange_partnerships` | Exchange feature | Phase D |

---

## Part 10: Features by Priority

### P0 — Critical Missing Features

| Feature | Impact | Effort | Phase Suggestion |
|---------|--------|--------|------------------|
| **Impact Others wizard** | Users can't recognize | Medium | Phase F ✅ PLANNED |
| **Improve Others wizard** | Users can't witness | Medium | Phase F ✅ PLANNED |

### P1 — Important Missing Features

| Feature | Impact | Effort | Notes |
|---------|--------|--------|-------|
| Circle tracker | Social engagement | Medium | Needs `user_circles` table |
| Notifications section | User awareness | Medium | Needs notification aggregation |
| Bridge question flow | Check-in → Priority | Small | Question + pre-fill |
| Recognition counts | Social proof | Small | Add counter to feed items |
| Week history view | Engagement tracking | Small | Calendar + stats |

### P2 — Coached Features (Future)

| Feature | Impact | Effort | Notes |
|---------|--------|--------|-------|
| Chat page | Self-discovery | Large | Full AI integration |
| "What's Emerging" | AI patterns | Medium | Edge function needed |
| "You vs Others" FIRES | Comparison insight | Medium | Aggregation + chart |
| "The Thread" | AI synthesis | Large | Complex edge function |
| Focus history | Evolution tracking | Small | New table + UI |

### P3 — Nice to Have

| Feature | Impact | Effort | Notes |
|---------|--------|--------|-------|
| "Inspire me" buttons | Gentle nudge | Small | Send notification |
| [👏 Recognize] on feed | One-click action | Small | Creates recognition |
| Notification preferences | User control | Small | Profile section |
| Privacy controls | Coach visibility | Medium | Toggles + RLS |

---

## Part 11: Recommended Next Phases

### Phase F: Send Tools ✅ ALREADY PLANNED
- Impact Others wizard
- Improve Others wizard
- Recipient view pages

### Phase G: Social Features (Suggested)
- Circle tracker (user_circles table)
- Notifications section
- Recognition counts on feed
- [👏 Recognize] buttons
- "Inspire me" requests

### Phase H: Check-in Enhancement (Suggested)
- Bridge question after check-in
- Week history view
- Calendar display
- Engagement averages

### Phase I: Coached Features (Suggested)
- Chat page (AI self-discovery)
- Map "What's Emerging"
- Map "You vs Others" FIRES
- Map "The Thread"

### Phase J: Settings & Polish (Suggested)
- Profile notification preferences
- Profile privacy controls
- Profile coach connection display
- Focus history tracking
- Learn page content

---

## Summary Table

| Category | Spec Features | Built | Gap |
|----------|---------------|-------|-----|
| Navigation | 12 items | 10 | Today, Chat |
| Home Page | 6 sections | 6 | Different content |
| Today Page | 4 features | 1 | Bridge, history |
| Tools | Tab pattern | Landing pattern | Design decision |
| Map Page | 6 features | 2 | AI features |
| Chat Page | 4 features | 0 | Not started |
| My Focus | 5 features | 3 | History, goal link |
| Profile | 4 sections | 1 | Most not built |
| Database | 8 new tables | 3 | 5 not built |

**Overall:** ~60% of V2 spec features are built, with key gaps in:
1. Social features (circle, notifications, recognition counts)
2. AI features (Chat, Map synthesis)
3. Check-in enhancement (bridge question, history)
4. Profile/settings features

---

**End of Gap Analysis**
