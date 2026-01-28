# Phase F: Send Tools Build Plan

**Created:** January 28, 2026  
**Purpose:** Complete Impact Others and Improve Others flows (currently incomplete)  
**Reference:** priority_proof_build_spec_jan24.md, Tool_Changes_Priority_Proof_Predict_Jan17_2026.md  
**Status:** Ready for Build

---

## Current State

| Tool | Self Mode | Others Mode | Status |
|------|-----------|-------------|--------|
| Impact | ✅ Works | ❌ Just passes `mode="send"` flag | **Needs full wizard** |
| Improve | ✅ Works | ❌ Just passes `mode="send"` flag | **Needs full wizard** |
| Inspire | ✅ Works | ✅ Complete 5-step wizard | **Reference pattern** |

**Working Pattern (Inspire Others):**
- 5-step wizard: WHO → WHAT → WHY → PREVIEW → COMPLETE
- Saves to `inspire_others` table
- Generates share link: `/inspire/view/{shareId}`
- Recipient can view without auth

---

## Part 1: Impact Others ("Recognize Someone's Impact")

### Terminology Mapping (Old → New)

| Old Language | New Language (Four I's) |
|--------------|-------------------------|
| Priority | Impact |
| Recognize Someone | Impact Others |
| Send Impact | Impact Others |

### Question Flow (4 Questions)

```
Step 1: WHO
┌─────────────────────────────────────────────────────────────────┐
│  WHO ARE YOU RECOGNIZING?                                       │
│  ───────────────────────────────────────────────────────────── │
│  Name *                                                         │
│  [________________________]                                     │
│                                                                 │
│  Email *                                                        │
│  [________________________]                                     │
│                                                                 │
│  How do you know them? (optional)                               │
│  [________________________]                                     │
│                                                                 │
│  Helper: "This person will receive what you share."             │
│                                                         [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 2: WHAT (The Action)
┌─────────────────────────────────────────────────────────────────┐
│  WHAT DID [NAME] DO THAT MATTERED?                              │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   Describe a specific moment or action...                       │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "Focus on something concrete they did or said."        │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 3: MEANING (What It Showed)
┌─────────────────────────────────────────────────────────────────┐
│  WHAT DID THIS SHOW ABOUT THEM?                                 │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   What quality or character did this reveal...                  │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "What does this moment tell you about who they are?"   │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 4: IMPACT (Effect on You)
┌─────────────────────────────────────────────────────────────────┐
│  HOW DID IT AFFECT YOU?                                         │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   Describe the impact on you, others, or the situation...       │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "What changed because of what they did?"               │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 5: PREVIEW
┌─────────────────────────────────────────────────────────────────┐
│  HERE'S WHAT [NAME] WILL SEE                                    │
│  ───────────────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Sender] recognized you                                 │   │
│  │                                                          │   │
│  │  WHAT YOU DID                                            │   │
│  │  [Step 2 answer]                                         │   │
│  │                                                          │   │
│  │  WHAT IT SHOWED                                          │   │
│  │  [Step 3 answer]                                         │   │
│  │                                                          │   │
│  │  HOW IT AFFECTED ME                                      │   │
│  │  [Step 4 answer]                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ☐ Share to Campfire                                            │
│                                                                 │
│                                          [Back]   [Send →]      │
└─────────────────────────────────────────────────────────────────┘

Step 6: COMPLETE
┌─────────────────────────────────────────────────────────────────┐
│  ✓ RECOGNITION SENT                                             │
│  ───────────────────────────────────────────────────────────── │
│  [Name] will receive a link to see what you shared.             │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  What Noticing This Reveals About You                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  [AI-generated sender insight]                                  │
│                                                                 │
│  [FIRES Badge] [Primary insight about sender]                   │
│  [FIRES Badge] [Secondary insight about sender]                 │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Go Deeper                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  Ask [Name]:                                                    │
│  "[Generated follow-up question]"                               │
│                                                                 │
│  [Copy Link]                                     [Done]         │
└─────────────────────────────────────────────────────────────────┘
```

### Database Storage

**Table:** `priorities` (existing, with new columns)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `type` | TEXT | 'other' | Distinguishes from 'self' |
| `client_email` | TEXT | Auth | Sender |
| `recipient_name` | TEXT | Q1 | Required |
| `recipient_email` | TEXT | Q1 | Required |
| `relationship` | TEXT | Q1 | Optional |
| `responses` | JSONB | Form | `{what_they_did, what_it_showed, how_it_affected}` |
| `sender_fires` | JSONB | AI | Sender's FIRES analysis |
| `recipient_fires` | JSONB | AI | Recipient's FIRES analysis |
| `clarity_grade` | TEXT | AI | 'emerging' / 'developing' / 'grounded' |
| `go_deeper` | JSONB | AI | `{question, why}` |
| `share_id` | TEXT | Generated | UUID for share link |
| `share_to_feed` | BOOLEAN | User choice | Default false |
| `viewed_at` | TIMESTAMP | Recipient action | When they opened |
| `thanked_at` | TIMESTAMP | Recipient action | When they clicked Thank |

### Recipient View Page

**Route:** `/impact/view/{shareId}`

**Flow:**
1. Load by share_id
2. Show recognition card
3. Show recipient FIRES insights
4. Thank button (updates `thanked_at`)
5. CTA: "Create your own account"

---

## Part 2: Improve Others ("I Saw You Do This")

### Terminology Mapping (Old → New)

| Old Language | New Language (Four I's) |
|--------------|-------------------------|
| Proof | Improve |
| I Saw You Do This | Improve Others |
| Witness Mode | Improve Others |

### Question Flow (5 Questions)

```
Step 1: WHO
┌─────────────────────────────────────────────────────────────────┐
│  WHO DID YOU SEE DO SOMETHING?                                  │
│  ───────────────────────────────────────────────────────────── │
│  Name *                                                         │
│  [________________________]                                     │
│                                                                 │
│  Email *                                                        │
│  [________________________]                                     │
│                                                                 │
│  How do you know them? (optional)                               │
│  [________________________]                                     │
│                                                                 │
│  Helper: "This person will receive your observation."           │
│                                                         [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 2: WHAT (The Outcome)
┌─────────────────────────────────────────────────────────────────┐
│  WHAT OUTCOME DID YOU OBSERVE?                                  │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   What did they accomplish, handle, or create...                │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "Describe the result you witnessed."                   │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 3: HOW (The Process)
┌─────────────────────────────────────────────────────────────────┐
│  WHAT DID YOU NOTICE ABOUT HOW THEY DID IT?                     │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   What approach, method, or actions did they take...            │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "Focus on the process, not just the result."           │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 4: KEY MOVE (The Decision)
┌─────────────────────────────────────────────────────────────────┐
│  WHAT DECISION OR MOMENT STOOD OUT?                             │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   What was the pivotal choice or turning point...               │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "What made the difference between success and not?"    │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 5: IMPACT
┌─────────────────────────────────────────────────────────────────┐
│  WHAT IMPACT DID IT HAVE?                                       │
│  ───────────────────────────────────────────────────────────── │
│  [                                                              │
│   On the work, on others, on you...                             │
│                                                                 │
│  ]                                                              │
│                                                                 │
│  Helper: "What changed because of how they did it?"             │
│                                                                 │
│                                                [Back]   [Next]  │
└─────────────────────────────────────────────────────────────────┘

Step 6: PREVIEW
┌─────────────────────────────────────────────────────────────────┐
│  HERE'S WHAT [NAME] WILL SEE                                    │
│  ───────────────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Sender] observed how you work                          │   │
│  │                                                          │   │
│  │  WHAT YOU ACCOMPLISHED                                   │   │
│  │  [Step 2 answer]                                         │   │
│  │                                                          │   │
│  │  HOW YOU APPROACHED IT                                   │   │
│  │  [Step 3 answer]                                         │   │
│  │                                                          │   │
│  │  THE DECISION THAT STOOD OUT                             │   │
│  │  [Step 4 answer]                                         │   │
│  │                                                          │   │
│  │  THE IMPACT                                              │   │
│  │  [Step 5 answer]                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ☐ Share to Campfire                                            │
│                                                                 │
│                                          [Back]   [Send →]      │
└─────────────────────────────────────────────────────────────────┘

Step 7: COMPLETE
┌─────────────────────────────────────────────────────────────────┐
│  ✓ OBSERVATION SENT                                             │
│  ───────────────────────────────────────────────────────────── │
│  [Name] will receive a link to see your observation.            │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  What Noticing This Reveals About You                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  [AI-generated sender insight about what they notice]           │
│                                                                 │
│  [FIRES Badge] [Primary insight about sender]                   │
│  [FIRES Badge] [Secondary insight about sender]                 │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Go Deeper                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  Ask [Name]:                                                    │
│  "[Generated process-focused question]"                         │
│                                                                 │
│  [Copy Link]                                     [Done]         │
└─────────────────────────────────────────────────────────────────┘
```

### Database Storage

**Table:** `validations` (existing, with new columns)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `mode` | TEXT | 'send_observation' | New mode value |
| `client_email` | TEXT | Auth | Sender |
| `recipient_name` | TEXT | Q1 | Required |
| `recipient_email` | TEXT | Q1 | Required |
| `relationship` | TEXT | Q1 | Optional |
| `responses` | JSONB | Form | `{outcome, how_they_did_it, key_decision, impact}` |
| `sender_fires` | JSONB | AI | Sender's FIRES analysis |
| `recipient_fires` | JSONB | AI | Recipient's FIRES analysis |
| `recipe` | JSONB | AI | `{approach, key_move, why_it_worked}` |
| `observation_clarity` | TEXT | AI | 'emerging' / 'developing' / 'grounded' |
| `go_deeper` | JSONB | AI | `{question, why}` |
| `share_id` | TEXT | Generated | UUID for share link |
| `share_to_feed` | BOOLEAN | User choice | Default false |
| `viewed_at` | TIMESTAMP | Recipient action | When they opened |
| `thanked_at` | TIMESTAMP | Recipient action | When they clicked Thank |

### Recipient View Page

**Route:** `/improve/view/{shareId}`

**Flow:**
1. Load by share_id
2. Show observation card
3. Show "The Recipe They Saw" section
4. Show recipient FIRES insights
5. Thank button (updates `thanked_at`)
6. CTA: "Save to your library" / "Create account"

---

## Part 3: Build Checkpoints

### Checkpoint 0: Database Schema

**New columns for `priorities`:**
```sql
ALTER TABLE priorities
ADD COLUMN IF NOT EXISTS sender_fires JSONB,
ADD COLUMN IF NOT EXISTS clarity_grade TEXT,
ADD COLUMN IF NOT EXISTS go_deeper JSONB,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS thanked_at TIMESTAMP;
```

**New columns for `validations`:**
```sql
ALTER TABLE validations
ADD COLUMN IF NOT EXISTS sender_fires JSONB,
ADD COLUMN IF NOT EXISTS recipe JSONB,
ADD COLUMN IF NOT EXISTS observation_clarity TEXT,
ADD COLUMN IF NOT EXISTS go_deeper JSONB,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS thanked_at TIMESTAMP;
```

**Validation:**
- [ ] Columns exist
- [ ] No errors on migration

---

### Checkpoint 1: Impact Others Wizard

**Files:**
- `apps/together/src/pages/ImpactOthersPage.tsx` - REWRITE as 6-step wizard
- `apps/together/src/components/impact/` - wizard step components

**Steps:**
1. WHO - RecipientInputStep (name, email, relationship)
2. WHAT - WhatTheyDidStep (textarea)
3. MEANING - WhatItShowedStep (textarea)
4. IMPACT - HowItAffectedStep (textarea)
5. PREVIEW - PreviewStep (card preview, share toggle)
6. COMPLETE - CompleteStep (confirmation, sender insights, share link)

**Validation:**
- [ ] All 6 steps render
- [ ] Data persists between steps
- [ ] Saves to `priorities` table with `type='other'`
- [ ] Generates `share_id`
- [ ] Shows on Complete page

---

### Checkpoint 2: Impact View Page (Recipient)

**Files:**
- `apps/together/src/pages/ImpactViewPage.tsx` - NEW
- Route: `/impact/view/:shareId`

**Features:**
- Load recognition by share_id
- Display recognition card
- Display recipient FIRES (if AI generated)
- Thank button (updates thanked_at)
- Track viewed_at on load
- Works without authentication

**Validation:**
- [ ] Loads by share_id
- [ ] Displays recognition content
- [ ] Thank button works
- [ ] viewed_at updated

---

### Checkpoint 3: Improve Others Wizard

**Files:**
- `apps/together/src/pages/ImproveOthersPage.tsx` - REWRITE as 7-step wizard
- `apps/together/src/components/improve/` - wizard step components

**Steps:**
1. WHO - RecipientInputStep
2. WHAT - OutcomeStep (what they accomplished)
3. HOW - ProcessStep (how they did it)
4. KEY MOVE - DecisionStep (what stood out)
5. IMPACT - ImpactStep
6. PREVIEW - PreviewStep
7. COMPLETE - CompleteStep (with recipe display)

**Validation:**
- [ ] All 7 steps render
- [ ] Data persists between steps
- [ ] Saves to `validations` table with `mode='send_observation'`
- [ ] Generates `share_id`
- [ ] Shows on Complete page

---

### Checkpoint 4: Improve View Page (Recipient)

**Files:**
- `apps/together/src/pages/ImproveViewPage.tsx` - NEW
- Route: `/improve/view/:shareId`

**Features:**
- Load observation by share_id
- Display observation card
- Display "The Recipe They Saw" section
- Display recipient FIRES
- Thank button
- Track viewed_at

**Validation:**
- [ ] Loads by share_id
- [ ] Displays observation content
- [ ] Displays recipe section
- [ ] Thank button works
- [ ] viewed_at updated

---

### Checkpoint 5: Routes + Navigation

**App.tsx updates:**
- `/impact/view/:shareId` → ImpactViewPage
- `/improve/view/:shareId` → ImproveViewPage

**Validation:**
- [ ] All routes work
- [ ] Share links navigate correctly
- [ ] Back buttons work in wizards

---

## Part 4: AI Edge Functions (Phase F.5 - Future)

For now, wizards save without AI analysis. AI can be added later:

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `priority-recognition-analyze` | Analyze Impact Others | responses | sender_fires, recipient_fires, clarity_grade, go_deeper |
| `proof-observation-analyze` | Analyze Improve Others | responses | sender_fires, recipient_fires, recipe, observation_clarity, go_deeper |

---

## Part 5: Test Scenarios

### Marcus → Miguel (Impact Others)
1. Marcus opens Impact Others
2. Enters: Miguel, miguel@company.com, Direct report
3. What they did: "Stayed late three nights helping junior devs"
4. What it showed: "He's rebuilding trust one person at a time"
5. How it affected: "Made me realize trust rebuilds through small moments"
6. Preview → Send
7. Miguel receives link, sees recognition, clicks Thank

### Sarah → Elena (Improve Others)
1. Sarah opens Improve Others
2. Enters: Elena, elena@startup.com, Team lead
3. Outcome: "Closed the difficult client negotiation"
4. How: "Asked probing questions, found their real concern, reframed the offer"
5. Key decision: "Chose to pause and ask 'what's really worrying you?' instead of pushing"
6. Impact: "Client signed, and team learned a new approach"
7. Preview → Send
8. Elena sees observation + recipe, clicks Thank

---

## Part 6: Reference Pattern (Inspire Others)

**File:** `apps/together/src/pages/InspireOthersPage.tsx`

This is the working pattern to follow:
- 5-step wizard using useState for step tracking
- Local state for form data
- Saves to `inspire_others` table on complete
- Generates UUID share_id
- Displays share link on complete
- Helper text for each step

---

## Part 7: Files to Create/Modify

### Impact Others

| File | Action |
|------|--------|
| `apps/together/src/pages/ImpactOthersPage.tsx` | REWRITE |
| `apps/together/src/pages/ImpactViewPage.tsx` | CREATE |
| `apps/together/src/components/impact/RecipientStep.tsx` | CREATE |
| `apps/together/src/components/impact/WhatTheyDidStep.tsx` | CREATE |
| `apps/together/src/components/impact/WhatItShowedStep.tsx` | CREATE |
| `apps/together/src/components/impact/HowItAffectedStep.tsx` | CREATE |
| `apps/together/src/components/impact/ImpactPreviewStep.tsx` | CREATE |
| `apps/together/src/components/impact/ImpactCompleteStep.tsx` | CREATE |

### Improve Others

| File | Action |
|------|--------|
| `apps/together/src/pages/ImproveOthersPage.tsx` | REWRITE |
| `apps/together/src/pages/ImproveViewPage.tsx` | CREATE |
| `apps/together/src/components/improve/RecipientStep.tsx` | CREATE |
| `apps/together/src/components/improve/OutcomeStep.tsx` | CREATE |
| `apps/together/src/components/improve/ProcessStep.tsx` | CREATE |
| `apps/together/src/components/improve/DecisionStep.tsx` | CREATE |
| `apps/together/src/components/improve/ImpactStep.tsx` | CREATE |
| `apps/together/src/components/improve/ImprovePreviewStep.tsx` | CREATE |
| `apps/together/src/components/improve/ImproveCompleteStep.tsx` | CREATE |

---

## Part 8: Build Sequence

```
Phase F (Send Tools)
│
├── Checkpoint 0: Database schema updates
│   └── Add columns to priorities + validations
│
├── Checkpoint 1: Impact Others wizard
│   └── 6-step flow saving to priorities
│
├── Checkpoint 2: Impact View page
│   └── Recipient view + thank action
│
├── Checkpoint 3: Improve Others wizard  
│   └── 7-step flow saving to validations
│
├── Checkpoint 4: Improve View page
│   └── Recipient view + recipe + thank action
│
└── Checkpoint 5: Routes + navigation
    └── Wire up all routes in App.tsx
```

---

**End of Phase F Build Plan**
