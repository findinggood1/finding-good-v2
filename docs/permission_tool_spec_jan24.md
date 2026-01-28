# Permission Tool Build Specification

**Created:** January 24, 2026  
**Status:** Design Phase — Ready for Persona Testing  
**Context:** Separate tool that receives suggestions from Predict, refines through coaching

---

## Executive Summary

Permission is where "what matters most" becomes "what I do daily."

Predict gives clarity on WHAT matters (north star + goals). Permission translates that into HOW you'll live it (anchor action + activities). They inform each other but serve different moments.

**Key insight:** Permission is the coaching conversation tool. It's where refinement happens, where the coach and client discover together what the anchor action really is, and what activities actually represent it.

---

## The Role of Permission

```
PREDICT
    │
    ├─→ Defines: What matters most (north star)
    ├─→ Defines: Goals/challenges
    ├─→ Surfaces: FIRES signals
    └─→ Suggests: Anchor action + activities
           │
           ↓
PERMISSION
    │
    ├─→ Confirms or refines: Anchor action
    ├─→ Defines: Up to 3 daily activities
    ├─→ Coaching conversation: "Is this really it?"
    └─→ Outputs to: Daily check-in in Campfire
           │
           ↓
DAILY CHECK-IN
    │
    └─→ "Did you do your most important things?"
        ☐ [Activity 1]
        ☐ [Activity 2]
        ☐ [Activity 3]
```

---

## Entry Points

Users arrive at Permission from:

1. **Predict Results** — "Set Up My Daily Practice" button after seeing AI suggestions
2. **Campfire** — "Define your daily practice" prompt if they have a Prediction but no Permission
3. **Direct link** — Coach sends client to refine their Permission
4. **Edit mode** — Returning to change anchor action or activities

---

## Question Flow

| Step | Question | Purpose |
|------|----------|---------|
| 1 | Context display | Show their north star + Predict suggestions (if any) |
| 2 | What's your anchor action? | ONE action that represents living aligned |
| 3 | How does this show up in your day? | Up to 3 specific activities |
| 4 | Confirmation | Review what will appear in daily check-in |

---

## Step-by-Step Design

### Step 1: Context Display

**If coming from Predict (has suggestions):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Foundation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT MATTERS MOST
"[what_matters_most from Predict]"

YOUR GOALS
• [Goal 1]
• [Goal 2]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Suggested Daily Practice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on what you shared in your prediction, 
here's a starting point:

ANCHOR ACTION
[suggested_anchor_action]

ACTIVITIES
• [suggested_activity_1]
• [suggested_activity_2]
• [suggested_activity_3]

You can use these as-is or customize them.

                              [Continue →]
```

**If no Predict yet (standalone entry):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Define Your Daily Practice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before we can track what matters, we need to 
name it.

This works best if you've completed a Prediction 
first — it helps clarify what you're aiming for.

        [Create a Prediction First]
        
        [I know what matters — continue →]
```

---

### Step 2: Anchor Action

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Anchor Action
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's the ONE action that, if you did it daily, 
would keep you connected to what matters most?

This isn't a task — it's a theme. A way of being 
that shows up across different situations.

┌─────────────────────────────────────────────┐
│                                             │
│  [Pre-filled with suggestion or blank]      │
│                                             │
└─────────────────────────────────────────────┘

EXAMPLES
• "Connection" — showing up for others and self
• "Creation" — making something each day
• "Movement" — physical action that clears the mind
• "Presence" — being fully where I am

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Why This Matters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Research shows that having ONE anchor habit 
creates a cascade effect — other good behaviors 
tend to follow.

                              [Continue →]
```

---

### Step 3: Daily Activities

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How Does "[anchor_action]" Show Up Daily?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name 1-3 specific things you can do each day 
that express your anchor action.

These should be:
• Specific enough to check off
• Flexible enough to fit different days
• Connected to your goals

┌─────────────────────────────────────────────┐
│  Activity 1                                 │
│  [Pre-filled or blank]                      │
│                                             │
│  Which goal does this support? [dropdown]   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Activity 2 (optional)                      │
│  [Pre-filled or blank]                      │
│                                             │
│  Which goal does this support? [dropdown]   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Activity 3 (optional)                      │
│  [Pre-filled or blank]                      │
│                                             │
│  Which goal does this support? [dropdown]   │
└─────────────────────────────────────────────┘

                              [Continue →]
```

---

### Step 4: Confirmation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Daily Check-In
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each day, you'll be asked:

"Did you do your most important things?"

☐ [Activity 1]
☐ [Activity 2]
☐ [Activity 3]

Your anchor: [anchor_action]
Connected to: [what_matters_most]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What Happens Next
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Daily prompt arrives (email/text/notification)
• Check off what you did
• See who else in your circle completed theirs
• Over time, patterns emerge about how you show up

You can always come back here to refine these.

        [Save & Go to Campfire]
```

---

## AI Analysis (Optional Enhancement)

If the user creates activities without coming from Predict suggestions, AI can analyze alignment:

**Function:** `permission-analyze`

**Input:**
```json
{
  "what_matters_most": "string (from linked Prediction)",
  "goals": ["goal 1", "goal 2"],
  "anchor_action": "string",
  "activities": [
    { "name": "string", "linked_goal": "string or null" }
  ]
}
```

**Output:**
```json
{
  "alignment_check": {
    "anchor_matches_north_star": true | false,
    "activities_match_anchor": true | false,
    "gap_identified": "string or null",
    "suggestion": "string or null"
  }
}
```

**Where this appears:** Subtle feedback on confirmation screen if misalignment detected:

```
⚠️ Your activities seem focused on [X], but your 
   anchor action is [Y]. Want to adjust?
   
   [Adjust Activities]  [Keep As-Is]
```

---

## Database Schema

**Table:** `permissions`

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `client_email` | TEXT | User |
| `prediction_id` | UUID | Links to their Prediction (optional) |
| `anchor_action` | TEXT | The ONE action |
| `activities` | JSONB | `[{name, linked_goal_id, order}]` |
| `alignment_check` | JSONB | AI analysis (optional) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Migration:**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  prediction_id UUID REFERENCES predictions(id),
  anchor_action TEXT NOT NULL,
  activities JSONB NOT NULL DEFAULT '[]',
  alignment_check JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- One active permission per user (can have history)
CREATE INDEX idx_permissions_client ON permissions(client_email);
CREATE INDEX idx_permissions_prediction ON permissions(prediction_id);
```

---

## How Permission Feeds Other Tools

### → Daily Check-In (Campfire)

```typescript
// Fetch user's active permission
const { data: permission } = await supabase
  .from('permissions')
  .select('anchor_action, activities')
  .eq('client_email', userEmail)
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

// Display in check-in
<DailyCheckin 
  anchorAction={permission.anchor_action}
  activities={permission.activities}
/>
```

### → Dashboard (Coach View)

Coach sees:
- Client's anchor action
- Their activities
- Daily check-in streak
- When Permission was last updated

### → Priority Tool (Context)

When capturing a priority, show context:
```
Your anchor: [anchor_action]
Today's activities: [activity 1], [activity 2], [activity 3]

What went well today?
```

---

## Coaching Use Case

**The coaching conversation:**

Coach: "You said you want more freedom. But your anchor action is 'productivity.' Does productivity give you freedom, or does it keep you busy?"

Client: "Hmm. Maybe the anchor should be 'intentional choices' — that's what freedom actually means to me."

Coach: "Let's update your Permission. What activities represent intentional choices?"

Client: "Saying no to one thing each day. Blocking focus time. Asking 'is this necessary?' before starting something."

**This conversation happens IN Permission, not Predict.** Predict set up the north star. Permission is where it becomes real.

---

## Edit Mode

When returning to Permission:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Current Practice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANCHOR ACTION
[current anchor]                    [Edit]

ACTIVITIES
☐ [Activity 1]                      [Edit]
☐ [Activity 2]                      [Edit]
☐ [Activity 3]                      [Edit]

Last updated: [date]
Check-in streak: [X] days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is connected to your prediction:
"[what_matters_most]"

        [View Prediction]  [Update Practice]
```

---

## Notification Integration

Once Permission is set up:

1. **Daily prompt** (configurable time):
   - Email: "Did you do your most important things today?"
   - SMS (coaching clients): Same
   - Push (if PWA): Same

2. **Prompt links directly to Campfire** with check-in visible

3. **If no check-in by end of day:**
   - No shame message
   - Just resets for tomorrow

---

## Persona Test Scenarios

### Scenario 1: Marcus (VP Engineering)

**From Predict:**
- What matters most: "Building trust after the layoffs"
- Goals: Rebuild team morale, Ship Q1 roadmap
- Suggested anchor: "Visibility"
- Suggested activities: Daily standup presence, 1:1s with directs, Public wins recognition

**In Permission:**
- Does "visibility" feel right? Or is it really "listening"?
- Are standups the right activity, or is it "office hours"?
- Coach helps Marcus realize his anchor is "being available" not "being visible"

### Scenario 2: Sarah (New Manager)

**From Predict:**
- What matters most: "Proving I belong in this role"
- Goals: First performance review, Team trusts me
- Suggested anchor: "Asking questions"
- Suggested activities: Daily curiosity moment, One new conversation, Document what I learned

**In Permission:**
- Sarah pushes back: "Asking questions makes me look weak"
- Coach: "What if the anchor is 'learning visibly'? That's strength, not weakness"
- Activities become: Share one thing I learned, Ask one clarifying question in a meeting, Thank someone who taught me something

### Scenario 3: Brian (Testing his own system)

**From Predict:**
- What matters most: "Lead a purposeful life"
- Goals: Health, Sustainable business, Community
- Suggested anchor: "Connection"
- Suggested activities: Connect with self (workout), Integrity in business (calls/creation), Reaching out to others

**In Permission:**
- Activities map to all three goal areas
- The anchor "Connection" shows up differently each day
- Daily check-in becomes: ☐ Self-care ☐ Business integrity ☐ Reach out

---

## Questions for Brian

1. **History:** When someone updates their Permission, do we keep the old version? (For tracking evolution over time)

2. **One vs many:** Can someone have multiple active Permissions (one per Prediction), or just one global Permission?

3. **Coach assignment:** Can a coach suggest activities for a client, or does the client always define their own?

4. **Notification timing:** Default time for daily prompt? User-configurable?

5. **Minimum activities:** Is 1 activity enough, or should we require at least 2?

---

## Continuation Prompt

```
I'm continuing work on the Permission tool for Finding Good.

**What Permission does:**
- Receives suggestions from Predict (anchor action + activities)
- User confirms or refines through coaching conversation
- Outputs to daily check-in in Campfire

**Key insight:** Permission is where "what matters most" becomes "what I do daily." It's the coaching conversation tool.

**Documents to reference:**
- permission_tool_spec_jan24.md (this document)
- predict_build_spec_jan24_v2.md (how Predict feeds into Permission)
- priority_proof_build_spec_jan24.md (witness mode patterns)

**The flow:**
Predict → Permission → Daily Check-in → Priority/Proof

**Ready to test with personas:**
- Marcus: "Visibility" vs "Being Available"
- Sarah: "Asking Questions" vs "Learning Visibly"
- Brian: "Connection" across three life areas

**Process:** Walk through each persona's journey from Predict suggestions through Permission refinement.
```

---

**End of Permission Specification**
