# Predict Tool Build Packet

**Created:** January 26, 2026  
**For Session:** Session 3 (Predict Updates)  
**Confidence Rating:** 🟢 High

---

## 1. OVERVIEW

### What This Session Builds
- Add `what_matters_most` question to Step 1 of Self mode
- Add "Discover Your Practice →" button on results page
- Add share_to_feed toggle on completion
- Preserve ALL existing functionality (assessment, connections, scores)

### What This Session Does NOT Build
- QuickPredict updates (separate scope, mark as P2)
- Witness mode ("Why You'll Succeed") — mark as P1
- AI suggestions for Permission (Future Enhancement)
- Campfire integration (Together session)
- Coach view of predictions (Dashboard session)

### Priority
- **P0 (Must Have):** what_matters_most field, share toggle, Discover Practice button
- **P1 (Should Have):** Witness mode enhancements
- **P2 (Nice to Have):** QuickPredict updates

---

## 2. SCHEMA SLICE

### Tables This Tool READS

| Table | What It Reads |
|-------|---------------|
| `predictions` | User's existing predictions |
| `snapshots` | Assessment scores and history |
| `prediction_connections` | Named connections |
| `clients` | User identity |

### Tables This Tool WRITES

| Table | What It Writes | New Columns Used |
|-------|----------------|------------------|
| `predictions` | Prediction records | `what_matters_most`, `share_to_feed` |
| `snapshots` | Assessment snapshots | (no changes) |
| `prediction_connections` | Named connections | (no changes) |

### Relevant Column Definitions (Already Exist in DB)

```sql
-- predictions table — V4 additions (ALREADY MIGRATED)
what_matters_most TEXT           -- User's Permission statement
share_to_feed BOOLEAN DEFAULT false  -- Whether to show in Campfire
```

### Key Constraints
- `what_matters_most` is OPTIONAL (nullable) — don't break existing flow
- `share_to_feed` defaults to false — user must opt-in

---

## 3. TYPES SLICE

### Types to Use (from @finding-good/shared)

```typescript
// From shared types — use these
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';

// Prediction interface — add new fields
export interface Prediction {
  id: string;
  client_email: string;
  title: string;
  description?: string;
  type?: 'goal' | 'challenge' | 'relationship' | 'habit';
  status: 'active' | 'achieved' | 'paused' | 'archived';
  rank?: number;
  current_predictability_score?: number;
  current_fires_map?: Record<FiresElement, number>;
  baseline_snapshot_id?: string;
  latest_snapshot_id?: string;
  priority_count?: number;
  proof_count?: number;
  connection_count?: number;
  history_summary?: string;
  question?: string;
  what_matters_most?: string;  // ← NEW: User's Permission statement
  share_to_feed?: boolean;     // ← NEW: Campfire visibility
  archived_at?: string;
  created_at: string;
  updated_at?: string;
}

// Snapshot interface (unchanged)
export interface Snapshot {
  id: string;
  client_email: string;
  prediction_id?: string;
  overall_score: number;
  zone_breakdown: {
    clarity: number;
    ownership: number;
    confidence: number;
  };
  fires_scores: Record<FiresElement, number>;
  event_code?: string;
  completed_at: string;
  created_at: string;
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
| ShareToggle | Toggle for share_to_feed | packages/shared/ (or in-app) |

### Existing in apps/predict (MODIFY)

| Component | Location | Change Needed |
|-----------|----------|---------------|
| PredictStepOne | src/pages/ or src/components/ | Add what_matters_most field |
| ResultsPage | src/pages/ | Add "Discover Your Practice" button, share toggle |

---

## 5. INTEGRATION POINTS

### Data Flow IN (What Predict Reads)

| Source | Data | Via |
|--------|------|-----|
| Supabase | Existing predictions | `@finding-good/shared` supabase client |
| Supabase | Snapshot history | Direct query |
| Auth | User email | AuthContext |

### Data Flow OUT (What Predict Produces)

| Destination | Data | When |
|-------------|------|------|
| `predictions` table | what_matters_most | Step 1 save |
| `predictions` table | share_to_feed | Results page toggle |
| Together Campfire | Shared prediction (via feed query) | When share_to_feed = true |
| Permission tool | Navigation link | "Discover Your Practice" button click |

### Connects To

| Other Tool/App | How |
|----------------|-----|
| Permission | "Discover Your Practice" button links to Permission tool |
| Together | Predictions with share_to_feed = true appear in Campfire |
| Dashboard | Coach sees prediction with Permission statement |
| Priority | Priorities can link to prediction_id for context |

---

## 6. UI SPEC

### Screen 1: Step 1 Update (Self Mode)

**Current flow:** Title → Description → Type  
**New flow:** Title → Description → Type → What Matters Most

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PREDICT: STEP 1                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ What would you like to predict?                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Title input]                                                       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Tell me more about this...                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [Description textarea]                                              │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ What type is this?                                                      │
│ [Goal] [Challenge] [Relationship] [Habit]                               │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ What do you want more of in your life right now?        (NEW FIELD)     │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [what_matters_most textarea - optional]                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ This helps surface your Permission — what you're giving yourself        │
│ permission to want more of.                                             │
│                                                                         │
│                                                      [Continue →]       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Field Details:**
- Label: "What do you want more of in your life right now?"
- Helper text: "This helps surface your Permission — what you're giving yourself permission to want more of."
- Optional — don't block flow if empty
- Saves to `predictions.what_matters_most`

---

### Screen 2: Results Page Update

**Add after results display:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ YOUR PREDICTION                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ [Existing results display - predictability score, FIRES map, etc.]      │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ WHAT'S NEXT                                                             │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Discover Your Practice                                           │ │
│ │                                                                     │ │
│ │ Turn this prediction into a daily practice that keeps you focused.  │ │
│ │                                                                     │ │
│ │                                    [Discover Your Practice →]       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ SHARE                                                                   │
│                                                                         │
│ [ ] Share this prediction to your Campfire                              │
│     Your connections can see and be inspired by your goal.              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Button Details:**
- "Discover Your Practice →" navigates to Permission tool
- If user came FROM Permission, hide this button
- Share toggle saves `share_to_feed` to database

---

## 7. TEST SCENARIOS

### Scenario: New Field Saves Correctly

**Happy Path (Marcus):**
1. Start new prediction in Self mode
2. Fill title: "Become a better delegator"
3. Fill what_matters_most: "Trust in my team"
4. Complete assessment
5. Check database: `what_matters_most = 'Trust in my team'`

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Leave what_matters_most empty | Saves as NULL, flow continues |
| Very long text (1000+ chars) | Saves successfully (TEXT field) |
| Special characters | Saves correctly |

### Scenario: Discover Practice Button Works

**Happy Path (Sarah):**
1. Complete prediction
2. See results page with "Discover Your Practice" button
3. Click button
4. Navigate to Permission tool (new tab or same)
5. Permission tool opens

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| User already has Permission | Still show button (they might want new one) |
| User came from Permission | Hide "Discover Your Practice" button |

### Scenario: Share Toggle Works

**Happy Path (Elena):**
1. Complete prediction
2. Toggle "Share to Campfire" ON
3. Check database: `share_to_feed = true`
4. Prediction appears in Campfire feed for connections

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Toggle OFF after ON | Updates to false |
| No connections | Toggle still works, just no viewers |

### Scenario: Existing Predictions Unaffected

**Happy Path:**
1. Query existing predictions
2. All existing data intact
3. `what_matters_most` is NULL for old records
4. `share_to_feed` is false for old records

---

## 8. DONE CRITERIA

### P0 — Must Complete

- [ ] Step 1 shows "What do you want more of?" field
- [ ] Field saves to `predictions.what_matters_most`
- [ ] Field is optional (empty allowed)
- [ ] Results page shows "Discover Your Practice" button
- [ ] Button navigates to Permission tool URL
- [ ] Share toggle appears on results page
- [ ] Toggle saves to `predictions.share_to_feed`
- [ ] Existing predictions still load and display correctly
- [ ] No TypeScript errors
- [ ] No console errors

### P1 — Should Complete If Time

- [ ] Witness mode stub (placeholder for future)
- [ ] Hide "Discover Practice" if user came from Permission

### P2 — Defer

- [ ] QuickPredict integration
- [ ] AI suggestions

---

## CRITICAL FLAGS

🟢 **No blockers identified**

🟡 **NOTE:** Database columns `what_matters_most` and `share_to_feed` already exist on `predictions` table. No migration needed.

🟡 **NOTE:** "Discover Your Practice" button should link to Permission tool. Confirm URL structure:
- If Permission is at `permission.findinggood.com` → external link
- If Permission is route in Together at `together.findinggood.com/permission` → router link

---

## FILES TO MODIFY

```
apps/predict/src/
├── pages/
│   ├── PredictStepOne.tsx (or component location)
│   │   └── ADD what_matters_most field
│   └── Results.tsx (or ResultsPage.tsx)
│       ├── ADD "Discover Your Practice" button
│       └── ADD share toggle
├── hooks/
│   └── usePrediction.ts (or data hooks)
│       └── UPDATE to save new fields
└── types/
    └── index.ts
        └── UPDATE Prediction interface (if local types exist)
```

---

## DATABASE QUERIES

### Save what_matters_most (in Step 1)

```typescript
const { error } = await supabase
  .from('predictions')
  .update({ what_matters_most: whatMattersMost })
  .eq('id', predictionId);
```

### Save share_to_feed (on results page)

```typescript
const { error } = await supabase
  .from('predictions')
  .update({ share_to_feed: isShared })
  .eq('id', predictionId);
```

### Load prediction with new fields

```typescript
const { data, error } = await supabase
  .from('predictions')
  .select('*, what_matters_most, share_to_feed')
  .eq('id', predictionId)
  .single();
```

---

**End of Predict Tool Build Packet**
