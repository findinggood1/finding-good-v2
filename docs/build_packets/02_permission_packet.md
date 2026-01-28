# Permission Tool Build Packet

**Created:** January 26, 2026  
**For Session:** Session 2 (Permission Tool - NEW)  
**Confidence Rating:** 🟢 High

---

## 1. OVERVIEW

### What This Session Builds
- New Permission tool app at `apps/permission/` (or route within Together)
- Focus setup flow (Your Practice, Your Permission, Your Focus items)
- Daily check-in flow with engagement scoring
- Bridge question display after check-in
- Focus history tracking

### What This Session Does NOT Build
- AI suggestions for Permission/Practice (Future Enhancement)
- Backdating past check-ins (explicitly deferred)
- Integration with Campfire feed (Together session)
- Coach view of permission data (Dashboard session)

### Priority
- **P0 (Must Have):** Focus setup, daily check-in, bridge questions
- **P1 (Should Have):** "Something else emerged" tracking, focus history
- **P2 (Nice to Have):** Edit existing focus items, reorder focus

---

## 2. SCHEMA SLICE

### Tables This Tool READS

| Table | What It Reads |
|-------|---------------|
| `predictions` | Optional link to get goal context |
| `clients` | User identity |

### Tables This Tool WRITES

| Table | What It Writes |
|-------|----------------|
| `permissions` | Focus setup (practice, permission, focus items) |
| `daily_checkins` | Daily check-in entries |
| `focus_history` | When focus items change |

### Relevant Table Definitions

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  prediction_id UUID REFERENCES predictions(id),
  practice TEXT,           -- "Your Practice" (the theme)
  permission TEXT,         -- "Your Permission" (want more of)
  focus JSONB DEFAULT '[]'::jsonb,  -- [{name, linked_goal_id, order}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  permission_id UUID REFERENCES permissions(id),
  check_date DATE NOT NULL,
  focus_scores JSONB DEFAULT '[]'::jsonb,  -- [{focus_name, completed, engagement, emerged_text}]
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_email, check_date)
);

CREATE TABLE focus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  focus_name TEXT NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE,
  evolved_into TEXT,
  reason TEXT  -- 'paused' | 'evolved' | 'completed'
);
```

### Key Constraints
- One check-in per user per day (UNIQUE constraint)
- Focus items limited to 1-3 (enforced in UI, not DB)
- Practice and Permission are optional (nullable columns)

---

## 3. TYPES SLICE

```typescript
// From shared_types_v2.ts

/** Single focus item within permissions.focus JSONB */
export interface FocusItem {
  name: string;
  linked_goal_id?: string;  // Optional link to prediction
  order: number;
}

/** permissions table */
export interface Permission {
  id: string;
  client_email: string;
  prediction_id?: string | null;
  practice?: string | null;       // "Your Practice" - the theme
  permission?: string | null;     // "Your Permission" - what you want more of
  focus: FocusItem[];             // 1-3 daily focus items
  created_at: string;
  updated_at: string;
}

/** Focus score within daily check-in */
export interface FocusScore {
  focus_name: string;
  completed: boolean;
  engagement?: number | null;     // 1-5 scale, null if not completed
  emerged_text?: string | null;   // For "something else emerged"
}

/** daily_checkins table */
export interface DailyCheckin {
  id: string;
  client_email: string;
  permission_id?: string | null;
  check_date: string;             // DATE as ISO string
  focus_scores: FocusScore[];
  created_at: string;
}

/** focus_history table */
export interface FocusHistory {
  id: string;
  client_email: string;
  focus_name: string;
  started_at: string;             // DATE as ISO string
  ended_at?: string | null;
  evolved_into?: string | null;
  reason?: FocusEndReason | null;
}

export type FocusEndReason = 'paused' | 'evolved' | 'completed';

/** Bridge question after check-in */
export interface BridgeQuestion {
  trigger: 'highest' | 'lowest' | 'nothing' | 'emerged';
  focus_name?: string;
  engagement?: number;
  question: string;
}

// Helper function
export function getBridgeQuestion(focusScores: FocusScore[]): BridgeQuestion | null;
```

---

## 4. COMPONENT INVENTORY

### Already Exists in @finding-good/shared (USE THESE)

| Component | Location | Use For |
|-----------|----------|---------|
| Button | components/ui/Button | Submit, navigation |
| Card | components/ui/Card | Content sections |
| Input | components/ui/Input | Focus item names |
| Textarea | components/ui/Textarea | Practice/Permission descriptions |
| PageContainer | components/layout/PageContainer | Page wrapper |
| TopBar | components/layout/TopBar | Header |
| ProtectedRoute | components/layout/ProtectedRoute | Auth check |
| LoadingSpinner | components/ui/LoadingSpinner | Loading states |

### Created in Foundation (USE THESE)

| Component | Location | Use For |
|-----------|----------|---------|
| EngagementIndicator | components/ui/EngagementIndicator | 1-5 score input |
| BridgeQuestionCard | components/exchange/BridgeQuestionCard | Post-checkin prompt |

### Needs to Be Created (This Session)

| Component | Purpose | Where It Goes |
|-----------|---------|---------------|
| FocusItemInput | Add/edit focus item with optional goal link | apps/permission/components/ |
| CheckinFocusRow | Single focus item in check-in with checkbox + engagement | apps/permission/components/ |
| SomethingElseRow | "Something else emerged" input row | apps/permission/components/ |
| FocusSetupForm | Full form for setting up Permission | apps/permission/components/ |
| DailyCheckinForm | Full check-in flow | apps/permission/components/ |

---

## 5. INTEGRATION POINTS

### Data Flow IN (What This Tool Reads)

| Source | Data | When |
|--------|------|------|
| `predictions` | Goal title, id | On focus setup (optional link) |
| `permissions` | Current focus setup | On load |
| `daily_checkins` | Today's check-in (if exists) | On load |

### Data Flow OUT (What This Tool Writes)

| Destination | Data | When |
|-------------|------|------|
| `permissions` | Focus setup | On save |
| `daily_checkins` | Check-in entry | On submit |
| `focus_history` | Focus changes | When focus items change |

### Events Triggered

| Event | Triggers | Handler Location |
|-------|----------|------------------|
| Check-in complete | Show bridge question | Permission tool |
| Bridge question answered | Navigate to Priority | Permission tool → Priority |
| Focus item changed | Create focus_history entry | Permission tool |

### Connects To

| Other Tool/App | How |
|----------------|-----|
| Priority | Bridge question navigates to Priority with context |
| Together | Check-in status appears in Circle view |
| Dashboard | Coach sees check-in patterns |
| Predict | Optional link from prediction to focus items |

---

## 6. UI SPEC

### Screens

| Screen | URL | Purpose |
|--------|-----|---------|
| Focus Setup | /focus or /permission/setup | Create/edit Permission |
| Daily Check-in | /today or /permission/checkin | Complete daily check-in |
| Focus History | /focus/history | View focus evolution |

### Screen 1: Focus Setup

```
┌─────────────────────────────────────────────────────────────┐
│ MY FOCUS                                              [Save]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ YOUR PERMISSION (optional)                                  │
│ What do you want more of?                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Build meaningful connections                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ YOUR PRACTICE (optional)                                    │
│ The theme that runs through your days                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Showing up authentically                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ YOUR FOCUS (1-3 items)                                      │
│ Specific things you're paying attention to daily            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Self-care              [Link to goal ▾] [✕]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 2. Business integrity     [Link to goal ▾] [✕]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3. Reach out              [Link to goal ▾] [✕]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [+ Add focus item]  (only shows if < 3 items)               │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ 💡 Don't know your Permission yet? That's OK.               │
│    Start with just your Focus items. What emerges           │
│    through daily check-ins will reveal your Practice.       │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: Daily Check-in

```
┌─────────────────────────────────────────────────────────────┐
│ TODAY                                              [✓ Done] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Where was your focus today?                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☐ Self-care                                             │ │
│ │     How engaged were you?                               │ │
│ │     ○ ○ ○ ○ ○  (shows only when checked)               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ Business integrity                                    │ │
│ │     How engaged were you?                               │ │
│ │     ● ● ● ● ○  (4/5)                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ Reach out                                             │ │
│ │     How engaged were you?                               │ │
│ │     ● ● ○ ○ ○  (2/5)                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☐ Something else emerged                                │ │
│ │     What? _______________________________ (shows when ☑)│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 💡 It's OK to check in with 0 items completed.              │
│    The check-in itself is the practice.                     │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3: After Check-in (Bridge Question)

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ CHECK-IN COMPLETE                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  You rated "Business integrity" a 4 today.              │ │
│ │                                                         │ │
│ │  "What made it land?"                                   │ │
│ │                                                         │ │
│ │  [Tell me more →]              [Skip for now]           │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                                             │
│ "Tell me more" → Opens Priority with context:               │
│ "Reflecting on: Business integrity (4/5 today)"             │
└─────────────────────────────────────────────────────────────┘
```

### Key Interactions

| User Action | System Response |
|-------------|-----------------|
| Checks focus item | Shows engagement indicator (1-5) |
| Selects engagement | Updates focus_scores array |
| Clicks "Done" | Saves check-in, shows bridge question |
| Clicks "Tell me more" | Navigates to Priority with pre-filled context |
| Clicks "Skip for now" | Returns to home |
| Checks "Something else emerged" | Shows text input |
| Adds focus item | Inserts into focus array (max 3) |
| Removes focus item | Creates focus_history entry with reason='paused' |

---

## 7. TEST SCENARIOS

### Persona: Marcus Chen (Executive Rebuilding Trust)

**Setup Path:**
1. Marcus has completed Predict, knows his goal
2. Opens Focus Setup
3. Enters Permission: "Rebuild trust through transparency"
4. Enters Practice: "Owning my space"
5. Adds 3 Focus items: "Team check-ins", "Share decisions openly", "Ask before telling"
6. Links "Share decisions openly" to his prediction
7. Saves

**Daily Check-in:**
1. Opens Today at end of workday
2. Checks "Share decisions openly" (4/5)
3. Checks "Ask before telling" (2/5)
4. Leaves "Team check-ins" unchecked
5. Clicks Done
6. Sees bridge question: "What made 'Share decisions openly' land?"
7. Clicks "Tell me more" → Opens Priority with context

### Persona: Sarah Park (Scaling Founder)

**Alternate Path (no Predict yet):**
1. Sarah hasn't done Predict
2. Opens Focus Setup
3. Skips Permission and Practice fields
4. Adds Focus items: "Delegate one thing", "Leave office by 6pm", "Trust the team"
5. Saves

**Daily Check-in Edge Case:**
1. Opens Today
2. Checks none of her focus items
3. Checks "Something else emerged"
4. Types "Had a breakthrough conversation with my COO"
5. Clicks Done
6. Sees bridge question: "Tell me about what emerged"
7. Clicks "Tell me more" → Opens Priority without pre-filled context

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No focus items set | Redirect to Focus Setup |
| Already checked in today | Show readonly view with "Already checked in" |
| All 0 engagement | Bridge question: "What got your attention today?" |
| Only "emerged" checked | Bridge question: "Tell me about what emerged" |
| Try to add 4th focus | Button disabled, tooltip: "Maximum 3 focus items" |
| Deleting last focus | Warning: "You need at least 1 focus item" |
| Network error on save | Show error, don't lose form data |

---

## 8. DONE CRITERIA

### Focus Setup
- [ ] Can enter Permission (optional text)
- [ ] Can enter Practice (optional text)
- [ ] Can add 1-3 focus items
- [ ] Can optionally link focus to prediction
- [ ] Can remove focus items
- [ ] Saves to `permissions` table
- [ ] Creates `focus_history` entries when items change

### Daily Check-in
- [ ] Shows current focus items as checkboxes
- [ ] Engagement selector appears when item checked
- [ ] "Something else emerged" option works
- [ ] Respects one-per-day constraint
- [ ] Saves to `daily_checkins` table
- [ ] Shows bridge question after submit
- [ ] Bridge question logic matches spec (highest first)

### Navigation
- [ ] "Tell me more" navigates to Priority with context
- [ ] "Skip for now" returns to home
- [ ] Can access from sidebar (Together integration)

### Edge Cases Handled
- [ ] No focus setup → redirect to setup
- [ ] Already checked in → readonly view
- [ ] Empty check-in (0 items) → allowed with bridge question

---

## CRITICAL FLAGS

🟢 **No blockers identified**

🟡 **NOTE:** The "Link to goal" dropdown requires fetching user's predictions. If no predictions exist, hide the dropdown entirely.

🟡 **NOTE:** Bridge question logic (`getBridgeQuestion` helper) should be in shared types, not duplicated here.

🟡 **NOTE:** Today's date should be server-side (UTC) to prevent timezone issues with the UNIQUE constraint.

---

## DATABASE QUERIES

### Get Current Permission
```sql
SELECT * FROM permissions 
WHERE client_email = $1 
ORDER BY updated_at DESC 
LIMIT 1;
```

### Get Today's Check-in
```sql
SELECT * FROM daily_checkins 
WHERE client_email = $1 
AND check_date = CURRENT_DATE;
```

### Save Check-in
```sql
INSERT INTO daily_checkins (client_email, permission_id, check_date, focus_scores)
VALUES ($1, $2, CURRENT_DATE, $3)
ON CONFLICT (client_email, check_date) 
DO UPDATE SET focus_scores = $3;
```

### Get User's Predictions (for linking)
```sql
SELECT id, title FROM predictions 
WHERE client_email = $1 
AND status = 'active'
ORDER BY created_at DESC;
```

### Create Focus History Entry
```sql
INSERT INTO focus_history (client_email, focus_name, started_at, ended_at, evolved_into, reason)
VALUES ($1, $2, $3, $4, $5, $6);
```

---

**End of Permission Tool Build Packet**
