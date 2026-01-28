# Predict Tool Build Specification (Updated)

**Created:** January 24, 2026  
**Updated:** January 24, 2026  
**Status:** Ready for Build  
**Context:** Minimal change to existing tool + Witness mode addition

---

## Executive Summary

Predict Self mode gets ONE new question added to Step 1. Everything else stays the same. AI output gains a new section that suggests anchor action + activities (which feeds into the separate Permission tool).

Predict Witness mode ("Why You'll Succeed") is a new addition parallel to Priority and Proof witness modes.

---

# PART 1: SELF MODE — Changes to Existing Flow

## Current Flow (Preserved)

| Step | Name | Questions |
|------|------|-----------|
| 1 | Basic Info | Title, Type (goal/challenge/experience), Description |
| 2 | Future Story | 6 FIRES questions about future + confidence ratings |
| 3 | Future Connections | Who will support you? |
| 4 | Past Story | 6 FIRES questions about past + alignment ratings |
| 5 | Past Connections | Who supported you before? |
| 6 | Review | Summary + submit |

## The ONE Change: Add North Star to Step 1

**Current Step 1:**
- What goal, challenge, or experience are you focused on? (title)
- What type is this? (goal/challenge/experience)
- Add more details (description)

**Updated Step 1:**
- **NEW: What do you want more of in your life right now?** (north star)
- What goal, challenge, or experience are you focused on? (title)
- What type is this? (goal/challenge/experience)
- Add more details (description)

---

## Database Change

**Table:** `predictions`

| Field | Type | Notes |
|-------|------|-------|
| `what_matters_most` | TEXT | **NEW** - The north star question |

**Migration:**
```sql
ALTER TABLE predictions 
ADD COLUMN what_matters_most TEXT;
```

---

## Type Change

**In `types/form.ts`:**

```typescript
export interface PredictionFormData {
  // Step 1: Basic Info
  what_matters_most: string  // NEW
  title: string
  type: PredictionType
  description: string
  
  // ... rest unchanged
}

export const INITIAL_FORM_DATA: PredictionFormData = {
  what_matters_most: '',  // NEW
  title: '',
  type: 'goal',
  description: '',
  // ... rest unchanged
}
```

---

## UI Change — Step1BasicInfo.tsx

Add one field before the title:

```tsx
{/* NEW: North Star Question */}
<div>
  <label htmlFor="what_matters_most" className="block text-sm font-medium text-gray-700 mb-2">
    What do you want more of in your life right now?
  </label>
  <textarea
    id="what_matters_most"
    value={data.what_matters_most}
    onChange={(e) => onChange({ what_matters_most: e.target.value })}
    placeholder="e.g., Freedom, connection, impact, peace of mind..."
    rows={2}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
  />
  <p className="text-xs text-gray-500 mt-1">
    This anchors everything that follows. What's the deeper thing you're after?
  </p>
</div>

{/* Existing title field continues below */}
```

---

## AI Output Change

The existing AI analysis adds a new section in its output:

**New output field:**
```json
{
  // ... existing predictability_score, fires_map, etc.
  
  "permission_suggestions": {
    "suggested_anchor_action": "Based on their north star + FIRES, suggest ONE anchor action",
    "suggested_activities": [
      "Activity 1 suggestion",
      "Activity 2 suggestion", 
      "Activity 3 suggestion"
    ],
    "rationale": "Why these suggestions fit their stated north star"
  }
}
```

**Where this appears:** On the Results page, after the FIRES visualization:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Suggested Daily Practice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on what you shared, here's how you might 
live "[what_matters_most]" each day:

ANCHOR ACTION
[suggested_anchor_action]

DAILY ACTIVITIES
• [Activity 1]
• [Activity 2]
• [Activity 3]

[rationale]

        [Set Up My Daily Practice →]
              (links to Permission tool)
```

---

## What Stays Exactly The Same

- Step 2: Future Story (all 6 FIRES questions + confidence)
- Step 3: Future Connections
- Step 4: Past Story (all 6 FIRES questions + alignment)
- Step 5: Past Connections
- Step 6: Review
- Predictability Score calculation
- FIRES map visualization
- Zone placement
- All existing database fields

---

# PART 2: WITNESS MODE — "Why You'll Succeed"

This is a **new mode** added to Predict, parallel to Priority and Proof witness modes.

## Question Flow

| Step | Question | What It Extracts |
|------|----------|------------------|
| 1 | Who are you sending this to? (Name, email required) | Target |
| 2 | What goal or challenge are they facing? | Context |
| 3 | Why do you believe they'll succeed at this? | The belief |
| 4 | What have you seen them do that makes you believe this? | Evidence |
| 5 | What quality do they have that this will require? | Capability identification |

---

## AI Edge Function Spec

**Function:** `predict-witness-analyze`

**Input:**
```json
{
  "recipient_name": "string",
  "their_challenge": "string (Q2)",
  "why_believe": "string (Q3)",
  "evidence_seen": "string (Q4)",
  "quality_required": "string (Q5)"
}
```

**Output:**
```json
{
  "clarity_grade": "emerging | developing | grounded",
  "clarity_summary": "One sentence: what recipient will understand",
  
  "sender_fires": {
    "primary": "Element",
    "primary_insight": "What believing this reveals about YOU",
    "secondary": "Element",
    "secondary_insight": "Second insight"
  },
  
  "recipient_fires": {
    "primary": "Element",
    "primary_insight": "What this suggests about THEIR capability",
    "secondary": "Element", 
    "secondary_insight": "Second insight"
  },
  
  "belief_statement": {
    "core": "One-sentence distillation of WHY they'll succeed",
    "evidence_anchor": "The specific thing sender saw",
    "capability_named": "The quality this will require"
  },
  
  "go_deeper": {
    "question": "Question for recipient to explore",
    "why": "Why this question matters"
  }
}
```

---

## Database Fields — Witness Mode

**Table:** `predictions` (same table, with mode column)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `mode` | TEXT | System | **NEW** - 'self' or 'witness', default 'self' |
| `target_name` | TEXT | Q1 | For witness mode |
| `target_email` | TEXT | Q1 | For witness mode |
| `their_challenge` | TEXT | Q2 | For witness mode |
| `why_believe` | TEXT | Q3 | For witness mode |
| `evidence_seen` | TEXT | Q4 | For witness mode |
| `quality_required` | TEXT | Q5 | For witness mode |
| `clarity_grade` | TEXT | AI | emerging/developing/grounded |
| `clarity_summary` | TEXT | AI | One-line summary |
| `sender_fires` | JSONB | AI | Sender's FIRES analysis |
| `recipient_fires` | JSONB | AI | Recipient's FIRES analysis |
| `belief_statement` | JSONB | AI | `{core, evidence_anchor, capability_named}` |
| `go_deeper` | JSONB | AI | `{question, why}` |
| `share_id` | TEXT | Generated | UUID for share link |
| `shared_to_feed` | BOOLEAN | Default true | Campfire visibility |
| `viewed_at` | TIMESTAMP | Recipient action | When they opened |
| `thanked_at` | TIMESTAMP | Recipient action | When they clicked Thank |

---

## What Makes Witness Mode Different from Priority/Proof

| Tool | Time Orientation | What Recipient Gets |
|------|------------------|---------------------|
| Priority | Past (what happened) | Recognition of character |
| Proof | Past (how it happened) | Recipe (transferable process) |
| **Predict** | **Future (what's ahead)** | **Belief statement + external evidence for potential** |

---

## Recipient Experience

### Teaser (no login)
```
        [Sender] believes in your future.

┌─────────────────────────────────────────────┐
│    "[Time-based teaser]"                    │
│                        — [Sender name]      │
└─────────────────────────────────────────────┘

        Enter your email to see why.
```

### Full Reveal (after verification)
```
        [Sender] sent you a belief.

┌─────────────────────────────────────────────┐
│  YOUR CHALLENGE                             │
│  [Q2 answer]                                │
│                                             │
│  WHY THEY BELIEVE YOU'LL SUCCEED            │
│  [Q3 answer]                                │
│                                             │
│  WHAT THEY'VE SEEN                          │
│  [Q4 answer]                                │
│                                             │
│  THE QUALITY THIS REQUIRES                  │
│  [Q5 answer]                                │
│                                             │
│                        — [Sender name]      │
└─────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Belief
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "[Core belief statement - AI synthesis]"

Based on: [Evidence anchor]
The quality you'll use: [Capability named]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What This Suggests About You
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [Element 🎨] 
  [What this suggests about recipient's capability]

  [Element 🎨]
  [Second insight]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          [♥ Thank [Sender]]       

      [Start Your Own Prediction →]
```

**Recipient CTA:** "Start Your Own Prediction" pulls them into Self mode.

---

## Homepage Layout (Updated)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     What brings you here today?                         │
│                                                         │
│     ┌───────────────────────────────────────────────┐   │
│     │  🎯  CREATE A PREDICTION                      │   │
│     │      Define a goal and see how ready you are  │   │
│     │                              [Start →]         │   │
│     └───────────────────────────────────────────────┘   │
│                                                         │
│     ┌───────────────────────────┐ ┌─────────────────┐   │
│     │  💫 WHY THEY'LL SUCCEED   │ │ 📊 MY           │   │
│     │  Tell someone you believe │ │ PREDICTIONS     │   │
│     │  in them                  │ │ View & update   │   │
│     │        [Start →]          │ │    [View →]     │   │
│     └───────────────────────────┘ └─────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Go Deeper Question Rules — Witness Mode

1. Probe the challenge, not the relationship
2. Draw from recipient's capability (Q5)
3. Reference something specific from the evidence (Q4)

**Templates by element:**

| FIRES Element | Question Template |
|---------------|-------------------|
| Resilience | "What will you do when [challenge] gets hard?" |
| Influence | "Who else needs to believe this for it to happen?" |
| Ethics | "What are you protecting by pursuing [challenge]?" |
| Feelings | "What will tell you it's working?" |
| Strengths | "How will you use [capability] when it matters most?" |

---

# PART 3: SUMMARY OF ALL CHANGES

## Database Migration

```sql
-- Self mode addition
ALTER TABLE predictions 
ADD COLUMN what_matters_most TEXT;

-- Witness mode additions
ALTER TABLE predictions 
ADD COLUMN mode TEXT DEFAULT 'self',
ADD COLUMN target_name TEXT,
ADD COLUMN target_email TEXT,
ADD COLUMN their_challenge TEXT,
ADD COLUMN why_believe TEXT,
ADD COLUMN evidence_seen TEXT,
ADD COLUMN quality_required TEXT,
ADD COLUMN clarity_grade TEXT,
ADD COLUMN clarity_summary TEXT,
ADD COLUMN sender_fires JSONB,
ADD COLUMN recipient_fires JSONB,
ADD COLUMN belief_statement JSONB,
ADD COLUMN go_deeper JSONB,
ADD COLUMN share_id TEXT,
ADD COLUMN shared_to_feed BOOLEAN DEFAULT true,
ADD COLUMN viewed_at TIMESTAMP,
ADD COLUMN thanked_at TIMESTAMP;

-- Index for share links
CREATE INDEX idx_predictions_share_id ON predictions(share_id) WHERE share_id IS NOT NULL;
```

## New Edge Functions

| Function | Purpose |
|----------|---------|
| `predict-witness-analyze` | Analyze witness mode submission |
| `predict-suggest-permission` | Generate anchor action + activities suggestions from self mode |

## New Pages/Components

| Component | Purpose |
|-----------|---------|
| WitnessFormPage | 5-question witness mode flow |
| WitnessResultsPage | Sender results with FIRES + belief |
| RecipientTeaserPage | Pre-login mystery state |
| RecipientRevealPage | Full belief + FIRES for recipient |
| PermissionSuggestion | Results page component showing suggested daily practice |

---

**End of Predict Specification**
