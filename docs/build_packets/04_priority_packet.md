# Priority Tool Build Packet

**Created:** January 26, 2026  
**For Session:** Session 4 (Priority Updates)  
**Confidence Rating:** 🟢 High

---

## 1. OVERVIEW

### What This Session Builds
- Single-page redesign (all questions on one page)
- Two entry paths: from Daily Check-in (pre-populated) OR standalone
- Share to Campfire toggle
- Preserve FIRES extraction functionality

### What This Session Does NOT Build
- Bridge questions from daily check-in (Permission tool handles this)
- Campfire feed display (Together session)
- Coach view of priorities (Dashboard session)
- AI analysis enhancements (Future Enhancement)
- Witness/Ask mode changes (minimal updates only)

### Priority
- **P0 (Must Have):** Single-page Self mode, two entry paths, share toggle
- **P1 (Should Have):** Pre-populate from Focus item context
- **P2 (Nice to Have):** Field renaming (`fires_extracted` → `sender_fires`)

---

## 2. SCHEMA SLICE

### Tables This Tool READS

| Table | What It Reads |
|-------|---------------|
| `priorities` | Existing priority entries |
| `predictions` | For linking priority to goal |
| `permissions` | For Focus item context (when entering from check-in) |
| `daily_checkins` | For engagement score context |
| `clients` | User identity |

### Tables This Tool WRITES

| Table | What It Writes | Key Columns |
|-------|----------------|-------------|
| `priorities` | Priority entries | `responses`, `integrity_line`, `fires_extracted`, `share_to_feed`, `shared_at` |

### Relevant Column Definitions (Already Exist in DB)

```sql
-- priorities table — key columns
id UUID PRIMARY KEY
client_email TEXT NOT NULL
type TEXT NOT NULL              -- 'self' | 'ask' | 'witness'
responses JSONB                 -- Question answers
integrity_line TEXT             -- AI-generated summary line
fires_extracted JSONB           -- AI-detected FIRES elements
share_to_feed BOOLEAN DEFAULT false  -- Campfire visibility
shared_at TIMESTAMP             -- When shared
prediction_id UUID              -- Optional link to prediction
created_at TIMESTAMP
```

### Key Constraints
- `type` is required (self, ask, witness)
- `share_to_feed` defaults to false
- `prediction_id` is optional (priorities can exist without prediction)

---

## 3. TYPES SLICE

### Types to Use (from @finding-good/shared)

```typescript
// From shared types
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';
export type PriorityType = 'self' | 'ask' | 'witness';

// Priority interface
export interface Priority {
  id: string;
  client_email: string;
  event_code?: string;
  type: PriorityType;
  timeframe?: string;
  intensity?: string;
  fires_focus?: Record<FiresElement, boolean>;
  responses?: PriorityResponses;
  integrity_line?: string;
  ownership_signal?: string;
  clarity_signal?: string;
  interpretation?: string;
  evidence?: any;
  confidence_signal?: string;
  target_name?: string;
  target_email?: string;
  target_relationship?: string;
  impact_card?: any;
  share_id?: string;
  status?: 'draft' | 'sent' | 'completed';
  recipient_email?: string;
  recipient_responses?: any;
  recipient_completed_at?: string;
  recipient_skipped?: boolean;
  alignment?: any;
  shared_at?: string;
  sender_notified_at?: string;
  created_at: string;
  prediction_id?: string;
  share_to_feed?: boolean;      // ← For Campfire
  helper_framings?: any;
  fires_extracted?: FiresElement[];  // ← AI-detected FIRES
}

// Response structure for Self mode
export interface PriorityResponses {
  context?: string;           // What mattered most OR pre-populated focus
  what_went_well?: string;    // What went well?
  your_part?: string;         // What was your part?
  impact?: string;            // What impact did it have?
}

// Entry context for Priority (from daily check-in)
export interface PriorityEntryContext {
  focus_item?: string;        // The focus item name
  engagement_score?: number;  // Today's engagement (1-5)
  bridge_answer?: string;     // Answer from bridge question
  source: 'checkin' | 'standalone';
}
```

---

## 4. COMPONENT INVENTORY

### Already Exists in @finding-good/shared (USE THESE)

| Component | Location | Use For |
|-----------|----------|---------|
| Button | components/ui/Button.tsx | All buttons |
| Card | components/ui/Card.tsx | Content containers |
| Input | components/ui/Input.tsx | Text inputs |
| Textarea | components/ui/Textarea.tsx | Multi-line text |
| Badge | components/ui/Badge.tsx | FIRES badges |
| LoadingSpinner | components/ui/LoadingSpinner.tsx | Loading states |
| PageContainer | components/layout/PageContainer.tsx | Page wrapper |
| TopBar | components/layout/TopBar.tsx | Header navigation |
| ProtectedRoute | components/layout/ProtectedRoute.tsx | Auth wrapper |
| AuthContext | contexts/AuthContext.tsx | Auth state |
| supabase | lib/supabase.ts | DB client |

### Needs to Be Created (Foundation Session)

| Component | Purpose | Where It Goes |
|-----------|---------|---------------|
| FiresBadge | Display FIRES element with color | packages/shared/ |
| EngagementIndicator | Show 1-5 engagement visual | packages/shared/ |

### Existing in apps/priority (MODIFY/REPLACE)

| Component | Location | Change Needed |
|-----------|----------|---------------|
| PrioritySelf | src/pages/ or src/components/ | Redesign to single page |
| ContextChips | If exists | Update for standalone entry |

---

## 5. INTEGRATION POINTS

### Data Flow IN (What Priority Reads)

| Source | Data | Via |
|--------|------|-----|
| URL params | focus_item, engagement, source | `?focus=X&engagement=4&source=checkin` |
| Supabase | User's predictions | For linking |
| Supabase | User's permissions | For Focus item names |
| Auth | User email | AuthContext |

### Data Flow OUT (What Priority Produces)

| Destination | Data | When |
|-------------|------|------|
| `priorities` table | Priority entry | On save |
| Together Campfire | Shared priority (via feed query) | When share_to_feed = true |
| Dashboard | Priority entries for coach | Always |

### Connects To

| Other Tool/App | How |
|----------------|-----|
| Permission | Receives entry context via URL params |
| Together | Priorities with share_to_feed = true appear in Campfire |
| Dashboard | Coach sees all client priorities |
| Predict | Can link priority to prediction_id |

---

## 6. UI SPEC

### Entry Path 1: From Daily Check-in (Pre-populated)

**URL:** `priority.findinggood.com?focus=Self-care&engagement=4&source=checkin`

**Or within Together:** `together.findinggood.com/priority?focus=Self-care&engagement=4&source=checkin`

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRIORITY                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ REFLECTING ON                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Self-care                                           ⚡ 4/5 today    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What went well?                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Pre-populated if bridge answer provided, else empty]               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What was your part?                                                     │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Textarea]                                                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What impact did it have?                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Textarea]                                                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [✓] Share to Campfire                                                   │
│     Your connections can see and be inspired.                           │
│                                                                         │
│                                                      [Save Priority]    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Entry Path 2: Standalone (No Context)

**URL:** `priority.findinggood.com` (no params)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRIORITY                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ What mattered most today?                                               │
│                                                                         │
│ [🎯 Self-care] [👥 Team 1:1s] [📊 Strategic planning] [+ Other]         │
│                                                                         │
│ OR type your own:                                                       │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Free text input]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What went well?                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Textarea]                                                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What was your part?                                                     │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Textarea]                                                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What impact did it have?                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Textarea]                                                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [✓] Share to Campfire                                                   │
│                                                                         │
│                                                      [Save Priority]    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Chips Logic:**
- If user has active permissions.focus → show those as chips
- If no permissions → show generic chips or just text input
- User can always type their own

---

### Completion State

After save:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRIORITY SAVED                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ✓ Your priority has been saved.                                         │
│                                                                         │
│ [FIRES badges if extracted]                                             │
│ [F] [R] [S]                                                             │
│                                                                         │
│ "Your integrity line here..."                                           │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [Add Another]  [Go to Campfire]  [Done]                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. TEST SCENARIOS

### Scenario: Entry from Daily Check-in (Marcus)

**Happy Path:**
1. Marcus completes check-in with Self-care at 4/5
2. Bridge question: "What made Self-care land?"
3. He answers: "Made time for the gym"
4. Clicks "Continue to Priority"
5. Priority opens with:
   - "Reflecting on: Self-care" (pre-populated)
   - "⚡ 4/5 today" indicator
   - "What went well?" pre-filled with "Made time for the gym"
6. He completes remaining fields
7. Saves with share toggle ON
8. Entry appears in Campfire

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| No engagement score in URL | Show context without score indicator |
| No bridge answer | "What went well?" is empty |
| Focus item has special chars | Properly URL-decoded |

### Scenario: Standalone Entry (Sarah)

**Happy Path:**
1. Sarah opens Priority directly (no URL params)
2. Sees "What mattered most today?" with chips
3. Clicks "Team 1:1s" chip
4. Fills in all fields
5. Saves with share toggle OFF
6. Entry saved, not in Campfire

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| No permissions/focus set | Show generic chips or just text input |
| User types custom context | Saves to responses.context |
| Clicks chip then types | Typed text overrides chip |

### Scenario: FIRES Extraction Still Works

**Happy Path:**
1. Complete priority with rich responses
2. On save, FIRES extraction runs (existing flow)
3. `fires_extracted` populated
4. FIRES badges display on completion

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Very short responses | May not extract FIRES (that's fine) |
| Extraction fails | Entry still saves, fires_extracted is null |

### Scenario: Share Toggle Works

**Happy Path:**
1. Complete priority
2. Toggle share ON
3. Save
4. Check DB: `share_to_feed = true`, `shared_at` = now()

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Toggle OFF | share_to_feed = false, shared_at = null |
| Edit later, change toggle | Updates values |

---

## 8. DONE CRITERIA

### P0 — Must Complete

- [ ] Single-page layout renders (all questions visible)
- [ ] Entry path 1: URL params populate context correctly
- [ ] Entry path 2: Standalone shows "What mattered most?" with chips
- [ ] Chips show user's Focus items if available
- [ ] Free text input always available
- [ ] All four fields work (context, went_well, your_part, impact)
- [ ] Share toggle visible and functional
- [ ] Toggle saves to `share_to_feed` column
- [ ] `shared_at` timestamp set when share_to_feed = true
- [ ] FIRES extraction still works
- [ ] Entry saves to `priorities` table
- [ ] Existing priorities still load and display
- [ ] No TypeScript errors
- [ ] No console errors

### P1 — Should Complete If Time

- [ ] Pre-populate "What went well?" from bridge answer
- [ ] Link to prediction (optional dropdown)
- [ ] Display engagement indicator (⚡ 4/5)

### P2 — Defer

- [ ] Rename `fires_extracted` → `sender_fires`
- [ ] Ask mode updates
- [ ] Witness mode updates

---

## CRITICAL FLAGS

🟢 **No blockers identified**

🟡 **NOTE:** `share_to_feed` and `shared_at` columns already exist on `priorities` table. No migration needed.

🟡 **NOTE:** Chips should pull from `permissions.focus` if user has set up Permission. Query:
```sql
SELECT focus FROM permissions WHERE client_email = ? ORDER BY updated_at DESC LIMIT 1
```

🟡 **NOTE:** FIRES extraction is handled by existing AI call. Preserve this flow — just trigger it on save.

---

## FILES TO MODIFY

```
apps/priority/src/
├── pages/
│   └── PrioritySelf.tsx (or SelfMode.tsx)
│       ├── REDESIGN to single-page layout
│       ├── ADD URL param parsing
│       ├── ADD chips from permissions.focus
│       └── ADD share toggle
├── hooks/
│   └── usePriority.ts (or data hooks)
│       └── UPDATE to handle new fields
├── components/
│   ├── ContextChips.tsx (create if needed)
│   └── ShareToggle.tsx (or use shared)
└── types/
    └── index.ts
        └── UPDATE PriorityResponses interface
```

---

## DATABASE QUERIES

### Parse URL params (on load)

```typescript
const searchParams = new URLSearchParams(window.location.search);
const focusItem = searchParams.get('focus');
const engagement = searchParams.get('engagement');
const source = searchParams.get('source'); // 'checkin' or null
const bridgeAnswer = searchParams.get('answer');
```

### Get user's Focus items (for chips)

```typescript
const { data: permission } = await supabase
  .from('permissions')
  .select('focus')
  .eq('client_email', userEmail)
  .order('updated_at', { ascending: false })
  .limit(1)
  .single();

const focusItems = permission?.focus || [];
// focusItems = [{ name: 'Self-care', order: 1 }, ...]
```

### Save priority with share

```typescript
const { error } = await supabase
  .from('priorities')
  .insert({
    client_email: userEmail,
    type: 'self',
    responses: {
      context: contextValue,
      what_went_well: wentWellValue,
      your_part: yourPartValue,
      impact: impactValue,
    },
    share_to_feed: isShared,
    shared_at: isShared ? new Date().toISOString() : null,
    prediction_id: selectedPredictionId || null,
  });
```

### Update share toggle on existing entry

```typescript
const { error } = await supabase
  .from('priorities')
  .update({
    share_to_feed: isShared,
    shared_at: isShared ? new Date().toISOString() : null,
  })
  .eq('id', priorityId);
```

---

**End of Priority Tool Build Packet**
