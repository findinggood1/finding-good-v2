# Predict Tool V2 - Session Changelog
## January 11, 2026

---

## Overview

This session focused on improving the Predict Tool's user experience through better output structure, educational content throughout the flow, and onboarding for new users. Changes span the edge function, frontend components, database constraints, and persona testing scripts.

---

## Phase 1: Results Page Restructure

### Edge Function (`supabase/functions/predict-analyze/index.ts`)

**Changed:** AI output format from single blob fields to structured fields

**Old format:**
```json
{
  "pattern_insight": "One long paragraph...",
  "edge_insight": "One long paragraph...",
  "network_insight": "One long paragraph..."
}
```

**New format:**
```json
{
  "pattern_name": "Creating order through direct confrontation",
  "pattern_quotes": ["exact quote 1", "exact quote 2"],
  "pattern_curiosity": "Where curiosity helps...",
  
  "edge_element": "feelings",
  "edge_why": "Why this matters for your goal...",
  "edge_gap_future": "Their future answer quoted",
  "edge_gap_past": "Their past answer quoted",
  "edge_meaning": "What the gap means...",
  "edge_question": "Reflective question",
  
  "network_summary": [
    {"name": "Lisa Huang", "role": "ground truth"},
    {"name": "Mike Torres", "role": "key player"}
  ],
  "network_why": "Why engaging them builds predictability...",
  "network_who_else": "Who else has seen you do this..."
}
```

**Backwards compatible:** Old narratives still render correctly.

---

### Results Page (`apps/predict/src/pages/ResultsPage.tsx`)

**Changes:**

1. **Score context added:**
   - Changed subtitle from "How ready you are to see where you're going" to "How clearly you can see your path forward"
   - Added: "Most people start between 55-70%"

2. **"What Your Stories Reveal" section restructured:**
   - **Your Pattern** — Short phrase naming what they do well
   - **In Your Words** — Exact quotes with left border styling
   - **Where Curiosity Helps** — One sentence opportunity

3. **"Your Edge" section restructured:**
   - **Why This Matters** — One sentence
   - **The Gap** — Shows future quote + past quote side by side
   - **What This Means** — Explanation connecting to their goal
   - **Question to Consider** — Reflective question

4. **"Who's In This With You" section restructured:**
   - **Supporters (X of 8)** — Grid list with name + role
   - **Why They Matter** — One sentence
   - **Who Else?** — Expansion prompt

---

### Hook Types (`apps/predict/src/hooks/usePrediction.ts`)

**Added to `AIResponse` interface:**
```typescript
// Pattern section (NEW v3 structured)
pattern_name?: string
pattern_quotes?: string[]
pattern_curiosity?: string

// Edge section (NEW v3 structured)
edge_element?: string
edge_why?: string
edge_gap_future?: string
edge_gap_past?: string
edge_meaning?: string

// Network section (NEW v3 structured)
network_summary?: NetworkSupporter[]
network_why?: string
network_who_else?: string
```

---

## Phase 2: Micro-Education in Flow

Each step now has a colored educational banner explaining the purpose and science.

### Step 1: Basic Info (`Step1BasicInfo.tsx`)
- **Color:** Brand teal
- **Content:** "Predict helps you see how ready you are to achieve something that matters. In about 10 minutes, you'll connect your future vision to past evidence..."

### Step 2: Future Story (`Step2FutureStory.tsx`)
- **Color:** Blue
- **Title:** "Future Story"
- **Content:** "Describe success as if it's already happened. Research shows that vividly imagining your outcome — then connecting it to reality — increases follow-through significantly."
- **Subtext:** "After each answer, rate your confidence. This helps reveal where you're clear vs. still exploring."

### Step 3: Future Connections (`Step3FutureConnections.tsx`)
- **Color:** Green
- **Title:** "Future Supporters"
- **Content:** "Who will be part of this journey? Goals shared with others are significantly more likely to be achieved. These aren't just helpers — they're witnesses to your priorities."

### Step 4: Past Story (`Step4PastStory.tsx`)
- **Color:** Purple
- **Title:** "Past Story"
- **Content:** "Now connect your future to something you've already done. Your belief that you can succeed comes primarily from remembering similar wins. This isn't just reflection — it's building your own evidence."

### Step 5: Past Connections (`Step5PastConnections.tsx`)
- **Color:** Purple
- **Title:** "Past Supporters"
- **Content:** "Who helped you succeed before? Recognizing the people who were part of your past wins helps you see patterns in who supports you best."

### Step 6: Review (`Step6Alignment.tsx`)
- **Color:** Amber
- **Title:** "Almost There"
- **Content:** "You've connected your future vision to past evidence."
- **Added:** "What Happens Next" section listing what they'll receive

---

## Phase 3: Onboarding & About Page

### Welcome Screen (`apps/predict/src/components/WelcomeScreen.tsx`)

**New component** — 5-step onboarding flow for first-time users

| Step | Title | Content |
|------|-------|---------|
| 1 | See Where You're Going | What Predict is, core promise |
| 2 | What You'll Do | Future Story → Past Story → Network |
| 3 | What You'll Get | Score preview, pattern, edge, question |
| 4 | Why It Works | Mental Contrasting, Self-Efficacy, Social Accountability |
| 5 | The Finding Good Philosophy | Narrative Integrity, Clarity/Confidence/Alignment |

**Features:**
- Progress dots (clickable)
- Skip button
- Back/Continue navigation
- Stores completion in localStorage (`predict_onboarding_complete`)
- Only shows once per browser

---

### Home Page (`apps/predict/src/pages/HomePage.tsx`)

**Changes:**
1. Added onboarding check on mount
2. Shows `WelcomeScreen` for first-time users
3. Added info icon (ⓘ) in header linking to `/about`

---

### About Page (`apps/predict/src/pages/AboutPage.tsx`)

**New page** — Accessible at `/about` (public route)

**Sections:**
1. **See Where You're Going** — What Predict is
2. **What You Do** — Future Story, Past Story, Network
3. **What You Get** — Score, pattern, edge, question
4. **Why It Works** — The science:
   - Mental Contrasting (Oettingen)
   - Self-Efficacy (Bandura)
   - Social Accountability
   - The Generation Effect
5. **The Finding Good Philosophy** — Narrative Integrity, Clarity/Confidence/Alignment
6. **The Finding Good Ecosystem** — Priority Builder, Prove Tool, Predict Tool

---

### App Router (`apps/predict/src/App.tsx`)

**Added route:**
```tsx
<Route path="/about" element={<AboutPage />} />
```

---

### Component Exports

**`apps/predict/src/components/index.ts`:**
```typescript
export { WelcomeScreen } from './WelcomeScreen'
```

**`apps/predict/src/pages/index.ts`:**
```typescript
export { AboutPage } from './AboutPage'
```

---

## Database Changes

### CASCADE DELETE Constraints

**Added via Supabase SQL Editor:**

```sql
ALTER TABLE snapshots 
ADD CONSTRAINT snapshots_prediction_id_fkey 
FOREIGN KEY (prediction_id) 
REFERENCES predictions(id) 
ON DELETE CASCADE;

ALTER TABLE prediction_connections 
ADD CONSTRAINT prediction_connections_prediction_id_fkey 
FOREIGN KEY (prediction_id) 
REFERENCES predictions(id) 
ON DELETE CASCADE;
```

**Effect:** Deleting a prediction now automatically deletes all related snapshots and connections.

---

## Persona Script Updates

### `scripts/insert-persona.js`

**Changes:**

1. **Added confidence ratings to Future Story:**
```javascript
future_story: {
  fs1: 'text...',
  fs1_confidence: 4,  // NEW: 1-4 rating
  fs2: 'text...',
  fs2_confidence: 3,
  // ... etc
}
```

2. **Added alignment ratings to Past Story:**
```javascript
past_story: {
  ps1: 'text...',
  ps1_alignment: 4,  // NEW: 1-4 rating
  ps2: 'text...',
  ps2_alignment: 3,
  // ... etc
}
```

3. **Updated zone calculation:**
```javascript
function calculateZone(confidence, alignment) {
  const combined = (confidence || 0) + (alignment || 0)
  if (combined <= 2) return 'Exploring'
  if (combined <= 4) return 'Discovering'
  if (combined <= 6) return 'Performing'
  return 'Owning'
}
```

4. **Passes ratings to edge function:**
```javascript
confidence_ratings: { fs1: 4, fs2: 3, ... },
alignment_ratings: { ps1: 4, ps2: 3, ... }
```

5. **Updated all 5 personas with appropriate ratings:**
   - Marcus (Skeptical Executive): High confidence/alignment
   - Rachel (Over-Thinker): Mixed, lower confidence
   - David (Crisis Arrival): Lower scores reflecting uncertainty
   - Simone (Enterprise Evaluator): High across the board
   - Terry (Surface Enthusiast): Mixed, moderate scores

---

## Files Modified

```
apps/predict/src/
├── App.tsx                              # Added /about route
├── components/
│   ├── index.ts                         # Export WelcomeScreen
│   ├── WelcomeScreen.tsx                # NEW: 5-step onboarding
│   └── form-steps/
│       ├── Step1BasicInfo.tsx           # Added intro
│       ├── Step2FutureStory.tsx         # Added intro
│       ├── Step3FutureConnections.tsx   # Added intro
│       ├── Step4PastStory.tsx           # Added intro
│       ├── Step5PastConnections.tsx     # Added intro
│       └── Step6Alignment.tsx           # Added intro + What Happens Next
├── hooks/
│   └── usePrediction.ts                 # Added new narrative types
└── pages/
    ├── index.ts                         # Export AboutPage
    ├── AboutPage.tsx                    # NEW: Philosophy & science
    ├── HomePage.tsx                     # Added onboarding + about link
    └── ResultsPage.tsx                  # Restructured sections

supabase/functions/
└── predict-analyze/
    └── index.ts                         # New structured output format

scripts/
└── insert-persona.js                    # Added confidence/alignment ratings
```

---

## Deployment Checklist

- [ ] Deploy edge function: `supabase functions deploy predict-analyze`
- [ ] Push code changes to repo
- [ ] Test onboarding flow (clear localStorage or use incognito)
- [ ] Test results page with new structured format
- [ ] Verify cascade delete works (delete a prediction, confirm related data removed)

---

## Design Rationale

### Why Structured Output?

Persona feedback indicated the old format was hard to scan. Structured output allows:
- **Your Pattern** to stand out as a memorable phrase
- **In Your Words** to show users their actual language was heard
- **The Gap** to clearly show future vs. past side by side
- Each section to be visually distinct and skimmable

### Why Micro-Education?

Users didn't understand *why* they were being asked these questions. Adding context:
- Reduces form abandonment
- Increases response quality (they know what matters)
- Builds trust through transparency about the science

### Why Onboarding?

First-time users landed on the home page with no context. The 5-step flow:
- Sets expectations
- Explains the value proposition
- Introduces the science (builds credibility)
- Connects to the Finding Good philosophy

---

## Science References (for About page content)

1. **Mental Contrasting** — Gabriele Oettingen, 20+ years of research, 2-3x follow-through increase
2. **Self-Efficacy** — Albert Bandura, strongest predictor of behavior change
3. **Implementation Intentions** — Peter Gollwitzer, meta-analysis of 94 studies (d = 0.65)
4. **Narrative Coherence** — Dan McAdams, life narrative research
5. **Social Accountability** — Multiple studies on goal sharing
6. **Generation Effect** — Slamecka & Graf, active generation beats passive reception
7. **Metacognition** — Self-rating as thinking about thinking

---

## Next Steps (Future Sessions)

- Score trajectory over time ("↑ from 72%")
- "Add another supporter" button on results page
- Export/share functionality for enterprise users
- Run full persona test suite with new format
- Update Priority Builder and Prove Tool with similar patterns
