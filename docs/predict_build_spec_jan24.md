# Predict Tool Build Specification

**Created:** January 24, 2026  
**Status:** Design Phase  
**Context:** Continues from priority_proof_build_spec_jan24.md + Framework V4 conversation

---

## Executive Summary

Predict serves **TWO distinct purposes** that the other tools don't:

1. **Entry Point (Self):** Defines "what matters most" + goals + anchor action + activities → feeds the entire ecosystem
2. **Witness Mode:** Tells someone WHY you believe they'll succeed → creates external evidence for their potential

This makes Predict the **foundation tool**—it creates the container that Priority and Proof fill with evidence.

---

## The Two Modes

| Mode | Name | Purpose | Frequency |
|------|------|---------|-----------|
| **Self** | Why This Matters | Define what's most important + how you'll live it | Entry point, refined over time |
| **Witness** | Why You'll Succeed | Tell someone why you believe in their future | Periodic / milestone moments |

---

# PART 1: SELF MODE — "Why This Matters"

## The Framework (Permission → Predict)

Before someone can meaningfully prioritize, they need **permission** to name what actually matters—not what they think *should* matter.

Predict Self mode IS the Permission layer. It captures:

```
ONE "What Matters Most" (north star)
    ↓
ONE Anchor Action (the theme that runs through everything)
    ↓
Up to 3 Activities (how anchor action shows up daily)
    ↓
Multiple Goals/Challenges (measurable outcomes)
    ↓
FIRES baseline (clarity + confidence assessment)
```

---

## Question Flow — Self Mode

| Step | Question | What It Captures |
|------|----------|------------------|
| 1 | What do you want more of in your life right now? | The north star (Permission) |
| 2 | If you could name ONE action that represents living that way, what would it be? | Anchor action |
| 3 | What are 1-3 specific things you can do each day that express that action? | Activities (populate daily check-in) |
| 4 | What goal or challenge are you focused on? (Can add multiple) | Goals tied to north star |
| 5 | What type is each? (Goal / Challenge / Experience) | Classification |
| 6 | Why does this matter now? What's at stake? | Stakes + motivation |
| 7 | When have you done something like this before? | Past evidence (FIRES: Resilience) |
| 8 | What will you be paying attention to as a signal it's working? | Success signals (FIRES: Feelings) |
| 9 | What do you bring to this that others might not? | Strengths |
| 10 | Who's counting on you? Who might help? | Support system |

**Note:** Steps 7-10 are the existing FIRES questions. Steps 1-6 are new Permission layer.

---

## AI Edge Function Spec — Self Mode

**Function:** `predict-self-analyze`

**Input:**
```json
{
  "what_matters_most": "string (Q1)",
  "anchor_action": "string (Q2)",
  "activities": ["string", "string", "string"],
  "goals": [
    {
      "title": "string",
      "type": "goal | challenge | experience",
      "why_now": "string"
    }
  ],
  "past_evidence": "string (Q7)",
  "success_signals": "string (Q8)",
  "strengths": "string (Q9)",
  "support_system": "string (Q10)"
}
```

**Output:**
```json
{
  "predictability_score": 0-100,
  
  "clarity_assessment": {
    "what_matters": "emerging | developing | grounded",
    "anchor_action": "emerging | developing | grounded",
    "goals": "emerging | developing | grounded"
  },
  
  "fires_map": {
    "feelings": { "clarity": 1-5, "confidence": 1-5, "insight": "string" },
    "influence": { "clarity": 1-5, "confidence": 1-5, "insight": "string" },
    "resilience": { "clarity": 1-5, "confidence": 1-5, "insight": "string" },
    "ethics": { "clarity": 1-5, "confidence": 1-5, "insight": "string" },
    "strengths": { "clarity": 1-5, "confidence": 1-5, "insight": "string" }
  },
  
  "alignment_check": {
    "activities_match_anchor": true | false,
    "goals_match_what_matters": true | false,
    "gap_identified": "string or null"
  },
  
  "focus_recommendation": {
    "priority_prompt": "Suggested first priority to capture",
    "proof_prompt": "What past evidence to document"
  }
}
```

---

## Database Fields — Self Mode

**Table:** `predictions`

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `what_matters_most` | TEXT | Q1 | **NEW** - The north star |
| `anchor_action` | TEXT | Q2 | **NEW** - The daily theme |
| `activities` | JSONB | Q3 | **NEW** - `[{name, description}]` |
| `title` | TEXT | Q4 | First/primary goal |
| `goals` | JSONB | Q4 | **NEW** - Multiple goals array |
| `type` | TEXT | Q5 | goal/challenge/experience |
| `description` | TEXT | Q6 | Why now / stakes |
| `past_evidence` | TEXT | Q7 | Existing field, may rename |
| `success_signals` | TEXT | Q8 | **NEW** |
| `strengths` | TEXT | Q9 | Existing or new |
| `support_system` | TEXT | Q10 | Existing or new |
| `predictability_score` | INT | AI | Existing |
| `fires_map` | JSONB | AI | Existing, enhanced |
| `clarity_assessment` | JSONB | AI | **NEW** |
| `alignment_check` | JSONB | AI | **NEW** |

**New columns needed:** `what_matters_most`, `anchor_action`, `activities`, `goals`, `success_signals`, `clarity_assessment`, `alignment_check`

---

## Self Mode Results Screen

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Prediction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT MATTERS MOST
[Q1 answer]

YOUR ANCHOR ACTION
[Q2 answer]

DAILY ACTIVITIES
☐ [Activity 1]
☐ [Activity 2]  
☐ [Activity 3]

GOALS
• [Goal 1] — [Type]
• [Goal 2] — [Type]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Predictability Score: [XX]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FIRES visualization - existing]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Focus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

START WITH PRIORITY
[Suggested first priority to capture]

DOCUMENT THIS PROOF
[What past evidence to document]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    [Go to Campfire]    [Edit Prediction]

```

---

## How Self Mode Feeds the Ecosystem

```
PREDICT (Self Mode)
    │
    ├─→ Activities populate CAMPFIRE daily check-in
    │   "Did you do your most important things?"
    │   ☐ [Activity 1]  ☐ [Activity 2]  ☐ [Activity 3]
    │
    ├─→ Goals appear in PROOF as options
    │   "Which goal did you achieve?" [dropdown of their goals]
    │
    ├─→ What Matters Most appears in PRIORITY context
    │   "What mattered today?" (with their north star visible)
    │
    └─→ Anchor Action appears in DASHBOARD for coach
        "Brian's anchor: Connection"
```

---

# PART 2: WITNESS MODE — "Why You'll Succeed"

## The Pattern (Same as Priority + Proof)

1. Sender answers questions about someone else
2. AI extracts FIRES insights for BOTH parties
3. Sender sees what believing this reveals about themselves
4. Recipient sees external evidence for their potential
5. Both get a "Go Deeper" question
6. Exchange feeds into Campfire

---

## Question Flow — Witness Mode

| Step | Question | What It Extracts |
|------|----------|------------------|
| 1 | Who are you sending this to? (Name, email required) | Target |
| 2 | What goal or challenge are they facing? | Context |
| 3 | Why do you believe they'll succeed at this? | The belief |
| 4 | What have you seen them do that makes you believe this? | Evidence |
| 5 | What quality do they have that this will require? | Capability identification |

**Design rationale:** Separates BELIEF from EVIDENCE from CAPABILITY. Gives recipient three distinct data points about why someone believes in them.

---

## AI Edge Function Spec — Witness Mode

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
    "secondary_insight": "Second insight",
    "observation": "Brief summary of what you see in others"
  },
  
  "recipient_fires": {
    "primary": "Element",
    "primary_insight": "What this suggests about THEIR capability",
    "secondary": "Element", 
    "secondary_insight": "Second insight",
    "observation": "Brief summary of the belief"
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

## What Makes Witness Mode Different

| Tool | What Sender Captures | What Recipient Gets |
|------|---------------------|---------------------|
| Priority | WHAT they did + MEANING | Recognition of character |
| Proof | HOW they did it + DECISION | Recipe (transferable process) |
| **Predict** | WHY they'll succeed + EVIDENCE | Belief statement (future-oriented) |

**Priority looks backward:** "You did this, and it mattered."
**Proof looks backward:** "Here's HOW you did it."  
**Predict looks forward:** "Here's WHY you'll succeed at what's ahead."

---

## Recipient CTA Difference

**Key difference:** Recipient CTA is "Start Your Own Prediction" — this pulls them into the Self mode flow, creating their own what matters most + goals.

---

## Go Deeper Question Rules — Witness Mode

1. **Probe the challenge**, not the relationship
2. **Draw from recipient's capability** (Q5)
3. **Reference something specific from the evidence** (Q4)

**Templates by element:**

| FIRES Element | Question Template |
|---------------|-------------------|
| Resilience | "What will you do when [challenge] gets hard?" |
| Influence | "Who else needs to believe this for it to happen?" |
| Ethics | "What are you protecting by pursuing [challenge]?" |
| Feelings | "What will tell you it's working?" |
| Strengths | "How will you use [capability] when it matters most?" |

---

## Homepage Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     What brings you here today?                         │
│                                                         │
│     ┌───────────────────────────────────────────────┐   │
│     │  🎯  WHY THIS MATTERS                         │   │
│     │      Define what's most important to you       │   │
│     │                              [Start →]         │   │
│     └───────────────────────────────────────────────┘   │
│                                                         │
│     ┌───────────────────────────┐ ┌─────────────────┐   │
│     │  💫 WHY THEY'LL SUCCEED   │ │ 📊 VIEW MY      │   │
│     │  Tell someone you believe │ │ PREDICTION      │   │
│     │  in them                  │ │ See your goals  │   │
│     │        [Start →]          │ │    [View →]     │   │
│     └───────────────────────────┘ └─────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# PART 3: INTEGRATION WITH DAILY CHECK-IN

## The Daily Loop (from Framework V4)

1. **Notification arrives:** "Did you do your most important things today?"
2. **User sees their activities from Predict Self mode:**
   ```
   ☐ [Activity 1]
   ☐ [Activity 2]
   ☐ [Activity 3]
   ```
3. **Tap to confirm** → data logged
4. **Prompt appears based on response:**
   - All done → "Nice. Want to capture what went well?" → Priority
   - Some done → "What got in the way?" → Priority with reflection
   - None done → "Tomorrow's another day. Want to adjust your activities?"
5. **See connections' status:** "3 people in your circle completed theirs"
6. **Ping others:** "Ask [Name] if they did their most important things"

---

## New Table: daily_checkins

```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  prediction_id UUID REFERENCES predictions(id),
  check_date DATE NOT NULL,
  activities_completed JSONB,  -- [{activity_name, completed: bool}]
  reflection TEXT,  -- Optional note
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(client_email, check_date)  -- One check-in per day
);
```

---

# PART 4: COMPARISON — ALL THREE TOOLS

| Aspect | Priority | Proof | Predict |
|--------|----------|-------|---------|
| **Witness Mode Name** | Recognize Impact | I Saw You Do This | Why You'll Succeed |
| **Core Focus** | WHAT + MEANING | HOW + DECISION | WHY + EVIDENCE |
| **Time Orientation** | Past (what happened) | Past (how it happened) | Future (what's ahead) |
| **Questions** | 4 | 5 | 5 |
| **Unique Output** | — | Recipe | Belief Statement |
| **Sender Learns** | What you value | What you notice about process | What potential you see |
| **Recipient Learns** | Character recognition | Transferable process | External evidence for future |
| **Cadence** | Anytime | Weekly/monthly | Milestone moments |
| **Recipient CTA** | Thank + Reflect | Thank + Save Recipe | Thank + Start Own Prediction |

**Self Mode (Predict only):**
| Aspect | Predict Self |
|--------|--------------|
| **Name** | Why This Matters |
| **Purpose** | Define what's most important + how to live it |
| **Output** | Activities for daily check-in + goals for tracking |
| **Feeds** | Campfire, Priority context, Proof goal list, Dashboard |

---

# PART 5: QUESTIONS FOR BRIAN

1. **Self Mode entry:** Is this the ONLY way to create a prediction now, or can someone still do a quick goal without the full Permission layer?

2. **Witness Mode trigger:** When would someone send a "Why You'll Succeed"? After someone shares a goal? When assigning a challenge? Spontaneous?

3. **Daily check-in frequency:** Coaching clients = daily. Self-guided users = daily prompt but optional response?

4. **Activities update:** When someone completes a goal, do activities reset? Or do activities stay stable while goals change?

5. **Belief + Prediction link:** If Marcus sends Elena a belief about the migration, should it create a Prediction draft for Elena? Or just inspire her to create one?

---

# PART 6: CONTINUATION PROMPT

```
I'm continuing work on Finding Good tool changes. This is session [X] of a multi-session design process.

**What we're building:** Three tools, each with a "Witness" mode, plus Predict has a "Self" mode:

- Priority: "Recognize Someone's Impact" ✅ COMPLETE
- Proof: "I Saw You Do This" ✅ COMPLETE  
- Predict: "Why This Matters" (Self) + "Why You'll Succeed" (Witness) ✅ COMPLETE

**Documents created:**
- priority_proof_build_spec_jan24.md (Priority + Proof complete specs)
- predict_build_spec_jan24.md (This document - Predict specs)
- FRAMEWORK_V4_January2026.md (Permission layer + daily loop)
- GAP_ANALYSIS_January2026.md (Current vs target state)

**Key insight from Framework V4:**
Predict Self mode IS the Permission layer. It captures:
- What matters most (north star)
- Anchor action (daily theme)
- Activities (populate daily check-in)
- Goals (tied to north star)

This makes Predict the foundation—Priority and Proof fill the container it creates.

**Next steps:**
1. Daily check-in component in Campfire
2. Unified navigation (Campfire as hub)
3. Dashboard updates (show anchor action + daily streaks)
4. Notification system (email → SMS for coaching clients)

**Process:** Use personas (Marcus, Sarah, David, Elena) to gut-check all UX decisions.
```

---

**End of Document**
