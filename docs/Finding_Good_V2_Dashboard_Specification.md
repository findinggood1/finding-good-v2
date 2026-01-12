# Finding Good V2: Dashboard ("Together") Specification

**Created:** January 11, 2026  
**Status:** Ready to Build  
**Purpose:** Complete specification for the Together Dashboard

---

## Executive Summary

**Together** is the home base for Finding Good — where users see the clarity they're building, first in themselves, then amplified through connection with others.

### One-Sentence Purpose

> "Together shows you the clarity you're building — first in yourself, then amplified by others."

### Core Philosophy

The Dashboard is NOT a social media feed. It's a space for **confirmation and commitment**:
- **Confirmation:** Seeing your priorities and others' reinforces focus on what matters
- **Commitment:** Sharing makes it real — when others see what you're working on, it becomes harder to abandon
- **Proof of what's possible:** Others' evidence shows what can be done; yours shows what you've already done

### The Progression: Self → Self + Others

| Stage | User State | What They Feel |
|-------|------------|----------------|
| **Self-Awareness** | Building alone | "I'm getting clear on what matters" |
| **Witness** | First connections | "Others are doing this too" |
| **Amplification** | Active connections | "My clarity deepens when shared" |

**Critical:** The Dashboard feels complete at Stage 1. Users with predictions, priorities, and no connections should feel progress — not like they're missing something.

---

## User Types & Experiences

### Free User
**Gets:** Clarity + Confidence

| Feature | What It Provides |
|---------|------------------|
| Predictions (3 active) | Know what you're working on |
| Feed (yours + connections) | Confirmation of priorities, proof of what's possible |
| Connections | Who's in this with you |
| Integrity Map (auto-generated) | Weekly synthesis of clarity and confidence |
| Basic scores | Clarity, Confidence trending |

**The free experience is complete.** Self-awareness and beginning to see the power of connection.

---

### Coached Client
**Gets:** Everything above + Influence Discovery

| Additional Feature | What It Unlocks |
|--------------------|-----------------|
| AI interaction with data | "Ask your data" — patterns, insights, questions |
| Coach connection visible | Accountability relationship in the system |
| Enhanced Integrity Map | Coach layer from sessions, transcripts, notes |
| More/Less Markers | Tracking what matters most over time |
| Richer patterns | Cross-prediction insights, longer-term trends |

**Coaching tagline:** *"When you're ready to really discover your influence."*

Coaching is depth, not rescue. You're not broken without it — you're ready to go further.

---

### Coach
**Gets:** Client-centered operational view + their own journey

| Feature | Purpose |
|---------|---------|
| Client list by prediction | "What is each client working on?" |
| Activity summaries | Recent priorities, proofs, connections |
| FIRES signals | Where each client is strong/struggling |
| Session tools | Notes, transcripts, map generation |
| AI: Prepare for sessions | Questions, patterns, watch-fors |
| AI: Coaching practice analysis | Patterns across clients, blind spots, growth areas |
| My Journey toggle | Coach's own predictions, feed, connections |
| Admin | Cross-app activity, data health, usage |

---

## Screen Specifications

### Navigation Structure

**Free User / Coached Client:**
```
Bottom Nav: [Home] [Campfire] [Connections] [Maps]
Settings: Accessible from Home (gear icon or profile tap)
```

**Coach:**
```
Bottom Nav: [Clients] [Prepare] [My Practice] [Admin]
```

---

### Screen 1: Home

**Layout:**
```
┌─────────────────────────────────────────────┐
│  PREDICTIONS (persistent header)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Pred 1  │ │ Pred 2  │ │ + Add   │       │
│  │ Score   │ │ Score   │ │         │       │
│  └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────┤
│  FEED                                       │
│  ┌─────────────────────────────────────┐   │
│  │ Your Priority (today)               │   │
│  │ "I prioritized deep work on..."     │   │
│  │ 🟢 Ethics  🔵 Influence              │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Sarah's Proof (yesterday)           │   │
│  │ "I proved I could handle..."        │   │
│  │ 🟡 Resilience                        │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Your Proof (2 days ago)             │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [Home]  [Campfire]  [Connections]  [Maps]  │
└─────────────────────────────────────────────┘
```

**Predictions Header:**
- Shows 1-3 active predictions as compact cards
- Each shows: Title + Predictability Score
- Tapping → Prediction Detail screen
- "+ Add" appears if fewer than 3 active

**Feed:**
- Your priorities, your proofs, connections' shares — interleaved chronologically
- Each card: Who + Type + Preview text + FIRES badges + Timestamp
- Your cards: Tap expands inline to show original responses
- Others' cards: Tap shows which of YOUR predictions it's linked to (future)

**For solo users:** Feed shows only their own activity. Feels like a journal of clarity being built. Complete.

**As connections grow:** Others' shares appear in same stream. Feed gets richer naturally.

---

### Screen 2: Prediction Detail

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ← Back                                     │
├─────────────────────────────────────────────┤
│  "Launch the product successfully"          │
│  Goal · Active · #1                         │
├─────────────────────────────────────────────┤
│  PREDICTABILITY: 78                         │
│                                             │
│  14 Priorities · 3 Proofs · 4 Connections   │
├─────────────────────────────────────────────┤
│  PEOPLE IN THIS WITH ME                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Sarah│ │ Mike │ │ Jen  │ │ + Ask│      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
├─────────────────────────────────────────────┤
│  ACTIVITY                                   │
│  [Filtered feed for this prediction]        │
├─────────────────────────────────────────────┤
│  [Add Priority]  [Add Proof]                │
│                                             │
│  🔵 Ready to practice predicting            │
└─────────────────────────────────────────────┘
```

**Sections:**

| Section | Content |
|---------|---------|
| **Header** | Title, type (goal/challenge/experience), status, rank |
| **Predictability** | Simple number (score changes episodically) |
| **Counts** | Priorities, Proofs, Connections |
| **People** | Connections linked to this prediction; tap shows quick popup |
| **Activity** | Feed filtered to this prediction only |
| **Actions** | Add Priority, Add Proof buttons |
| **Badge** | "Ready to practice predicting" appears after ~10 priorities |

**Tap person:** Quick popup with recent activity from them.

**Badge tap:** Goes to Predict Tool for new snapshot of this prediction.

---

### Screen 3: Campfire

**Layout:**
```
┌─────────────────────────────────────────────┐
│  CAMPFIRE                                   │
│  "What's alive in your circle"              │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Sarah's Priority (today)            │   │
│  │ "I prioritized having the hard..."  │   │
│  │ 🟢 Ethics  🔵 Influence              │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Mike's Proof (yesterday)            │   │
│  │ "I proved I could stay calm..."     │   │
│  │ 🟡 Resilience  🔴 Feelings           │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [Home]  [Campfire]  [Connections]  [Maps]  │
└─────────────────────────────────────────────┘
```

**What appears:**
- Only connections' shares (not your own)
- Priorities and Proofs they've opted to share
- Each card: Name + Type + Share text + FIRES badges + Timestamp

**Philosophy:**
> "Their declaration of what matters helps me stay focused on and declare what matters to me."

This is mutual reinforcement of commitment — the campfire effect.

**Primary view:** Chronological (most recent first)

**Future view:** Grouped by YOUR prediction ("Helping with: Launch the product")

**Future feature:** On prediction completion → "These people's declarations helped you get here. Send thanks?"

**Empty state:**
```
🔥

Your campfire is warming up.

As you share priorities and ask others for their proof, 
their reflections will appear here.

[Invite Someone to Share]
```

---

### Screen 4: Connections

**Layout:**
```
┌─────────────────────────────────────────────┐
│  YOUR CIRCLE                                │
│  "People you've shared with and who have    │
│   shared with you"                          │
├─────────────────────────────────────────────┤
│  MUTUAL (2)                                 │
│  ┌─────────────────────────────────────┐   │
│  │ Sarah                               │   │
│  │ 5 shares · Last: 2 days ago         │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Mike                                │   │
│  │ 3 shares · Last: 1 week ago         │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  YOU INVITED (1)                            │
│  ┌─────────────────────────────────────┐   │
│  │ Jen                                 │   │
│  │ Responded to your ask · 3 days ago  │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  INVITED YOU (1)                            │
│  ┌─────────────────────────────────────┐   │
│  │ Tom                                 │   │
│  │ You responded · 1 week ago          │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [Invite Someone]                           │
├─────────────────────────────────────────────┤
│  [Home]  [Campfire]  [Connections]  [Maps]  │
└─────────────────────────────────────────────┘
```

**Sections:**

| Section | Who's Here | Visibility |
|---------|------------|------------|
| **Mutual** | Both directions | Full two-way sharing |
| **You Invited** | You sent ask, they responded | You see their shares |
| **Invited You** | They sent ask, you responded | They see your shares |

**Tap connection:** Goes to Connection Detail (full screen).

---

### Screen 5: Connection Detail

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ← Back                                     │
├─────────────────────────────────────────────┤
│  SARAH CHEN                                 │
│  Mutual · Connected 3 months ago            │
├─────────────────────────────────────────────┤
│  HOW WE'RE CONNECTED                        │
│  You invited her · She responded            │
│  She invited you · You responded            │
├─────────────────────────────────────────────┤
│  LINKED TO MY PREDICTIONS                   │
│  • Launch the product (3 shares helped)     │
│  • Navigate the reorg (1 share helped)      │
├─────────────────────────────────────────────┤
│  ABOUT THIS CONNECTION                      │
│  ┌─────────────────────────────────────┐   │
│  │ "Sarah and I worked together at     │   │
│  │ Acme. She's great at staying calm   │   │
│  │ under pressure."            [Edit]  │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  HOW THEY SUPPORT ME                        │
│  ┌─────────────────────────────────────┐   │
│  │ "Accountability on shipping.        │   │
│  │ Reminds me done > perfect." [Edit]  │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  THEIR RECENT SHARES                        │
│  [Priority/Proof cards from Sarah]          │
├─────────────────────────────────────────────┤
│  WHAT THEIR SHARES REVEAL                   │
│  🟡 Resilience (5 signals)                  │
│  🔵 Influence (3 signals)                   │
│  🟢 Ethics (2 signals)                      │
│  Based on 8 priorities and 3 proofs shared  │
├─────────────────────────────────────────────┤
│  [Ask for Proof]  [Send Priority]           │
│                                             │
│  [Mute from Campfire]                       │
└─────────────────────────────────────────────┘
```

**Sections:**

| Section | Purpose |
|---------|---------|
| **How We're Connected** | History of asks/responses both directions |
| **Linked to My Predictions** | Which predictions their shares helped (future: manual link) |
| **About This Connection** | User-written notes — context, history |
| **How They Support Me** | User-written — what role they play |
| **Their Recent Shares** | What they've shared that you can see |
| **What Their Shares Reveal** | FIRES aggregated from their shares (not your assessment — their declarations) |

**Actions:**
- Ask for Proof → Proof Tool Request flow
- Send Priority → Priority Builder Send flow
- Mute → Removes from Campfire (optional notification)

**Mute:** "Not actively working on anything together right now." They stay in Connections, just quieted.

---

### Screen 6: Integrity Maps

**Layout:**
```
┌─────────────────────────────────────────────┐
│  INTEGRITY MAPS                             │
│  "Snapshots of your clarity"                │
├─────────────────────────────────────────────┤
│  [Generate New Map]                         │
├─────────────────────────────────────────────┤
│  YOUR MAPS                                  │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 11, 2026                        │   │
│  │ 7 priorities · 2 proofs · 3 shares  │   │
│  │ [View]  [Share]                     │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 4, 2026                         │   │
│  │ 5 priorities · 1 proof · 2 shares   │   │
│  │ [View]  [Share]                     │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [Home]  [Campfire]  [Connections]  [Maps]  │
└─────────────────────────────────────────────┘
```

**Features:**
- **Generate New Map:** Creates map from activity since last map (or last 7 days)
- **View:** Opens full in-app Integrity Map
- **Share:** Choose specific connection to send (not broadcast)
- **History:** All maps saved, viewable anytime

**Map Contents:**

| Section | Content |
|---------|---------|
| **Summary** | AI-generated narrative: "This week you focused on..." |
| **Predictions Progress** | Each active prediction + activity count + score change |
| **FIRES Patterns** | What elements showed up most |
| **Connection Activity** | Who you engaged with, what they shared |
| **Wins** | Highlights — proofs completed, commitments kept |
| **Focus for Next Week** | AI-suggested based on patterns |

**Coached Client Enhancement:** Coach's observations, More/Less movement, deeper patterns.

**Coach Visibility:** Coach sees all client maps automatically.

---

### Screen 7: Settings

**Layout:**
```
┌─────────────────────────────────────────────┐
│  SETTINGS                                   │
├─────────────────────────────────────────────┤
│  PROFILE                                    │
│  Name: Brian Johnson                        │
│  Email: brian@example.com                   │
│  [Edit Profile]                             │
├─────────────────────────────────────────────┤
│  SHARING DEFAULTS                           │
│  ┌─────────────────────────────────────┐   │
│  │ Share priorities to Campfire        │   │
│  │ Default: OFF (ask each time)    [·] │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Share proofs to Campfire            │   │
│  │ Default: OFF (ask each time)    [·] │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  MY COACH (if coached)                      │
│  Sarah Chen · Engaged since Nov 2025        │
│  Your coach sees all your activity.         │
├─────────────────────────────────────────────┤
│  NOTIFICATIONS                              │
│  Email when someone shares with me: ON  [·] │
│  Weekly digest: ON                      [·] │
├─────────────────────────────────────────────┤
│  ACCOUNT                                    │
│  [Export My Data]                           │
│  [Delete Account]                           │
└─────────────────────────────────────────────┘
```

**Coach visibility:** Full access, no toggle. That's the relationship.

---

### Screen 8: Coach — Clients

**Layout:**
```
┌─────────────────────────────────────────────┐
│  COACH DASHBOARD                            │
│  "Where your clients are"                   │
├─────────────────────────────────────────────┤
│  YOUR CLIENTS                               │
│  ┌─────────────────────────────────────┐   │
│  │ Mike Chen                           │   │
│  │ Week 6 · PROVE phase                │   │
│  │ 3 active predictions                │   │
│  │ Last activity: Today                │   │
│  │ ⚡ New proof submitted              │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Jen Park                            │   │
│  │ Week 2 · PRIORITIZE phase           │   │
│  │ 2 active predictions                │   │
│  │ Last activity: 3 days ago           │   │
│  │ ⚠️ No activity this week            │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [Clients]  [Prepare]  [My Practice]        │
└─────────────────────────────────────────────┘
```

**Client card shows:**
- Name
- Engagement week + phase (PRIORITIZE/PROVE/PREDICT)
- Active prediction count
- Last activity
- Alerts (new submissions, inactivity)

---

### Screen 9: Coach — Client Detail

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ← Back                                     │
├─────────────────────────────────────────────┤
│  MIKE CHEN                                  │
│  Week 6 · PROVE phase · Next session: Fri   │
├─────────────────────────────────────────────┤
│  PREDICTIONS                                │
│  ┌─────────────────────────────────────┐   │
│  │ #1: Lead the product launch         │   │
│  │ Predictability: 72                  │   │
│  │ 8 priorities · 2 proofs · 3 connections │
│  └─────────────────────────────────────┘   │
│  [See all predictions]                      │
├─────────────────────────────────────────────┤
│  RECENT ACTIVITY                            │
│  • Priority today: "Delegated the..."       │
│  • Proof yesterday: "Handled pushback..."   │
│  • Shared with Sarah (2 days ago)           │
├─────────────────────────────────────────────┤
│  FIRES SIGNALS (last 30 days)               │
│  🟡 Resilience ████████ (strong)            │
│  🔵 Influence  █████░░░ (growing)           │
│  🔴 Feelings   ███░░░░░ (limited)           │
├─────────────────────────────────────────────┤
│  MORE/LESS MARKERS                          │
│  More: Confidence in decisions (6→8)        │
│  Less: Second-guessing (7→4)                │
├─────────────────────────────────────────────┤
│  INTEGRITY MAPS                             │
│  [View latest]  [Generate new]              │
├─────────────────────────────────────────────┤
│  SESSION TOOLS                              │
│  [Add notes]  [View transcript]             │
│  [AI: Prepare for session]                  │
└─────────────────────────────────────────────┘
```

---

### Screen 10: Coach — Prepare

**Layout:**
```
┌─────────────────────────────────────────────┐
│  PREPARE                                    │
│  "Get ready for your sessions"              │
├─────────────────────────────────────────────┤
│  UPCOMING                                   │
│  ┌─────────────────────────────────────┐   │
│  │ Mike Chen · Friday 10am             │   │
│  │ Week 6 · PROVE phase                │   │
│  │ [Prepare with AI]                   │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Jen Park · Friday 2pm               │   │
│  │ Week 2 · PRIORITIZE phase           │   │
│  │ [Prepare with AI]                   │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [Clients]  [Prepare]  [My Practice]        │
└─────────────────────────────────────────────┘
```

**"Prepare with AI" generates:**

| Section | Content |
|---------|---------|
| **Since Last Session** | Summary of activity, priorities, proofs, connections |
| **Patterns to Notice** | FIRES signals trending, gaps, changes |
| **Suggested Questions** | Based on recent activity and phase |
| **Comparison** | How this week compares to previous |
| **Watch For** | Potential blind spots, areas being avoided |

---

### Screen 11: Coach — My Practice

**Layout:**
```
┌─────────────────────────────────────────────┐
│  MY PRACTICE                                │
│  [My Journey]  [Coaching Practice]          │
├─────────────────────────────────────────────┤
│  (When "My Journey" selected)               │
│  ─────────────────────────────────────────  │
│  Same as Free User dashboard:               │
│  - My Predictions                           │
│  - My Feed                                  │
│  - My Connections                           │
│  - My Integrity Maps                        │
├─────────────────────────────────────────────┤
│  (When "Coaching Practice" selected)        │
│  ─────────────────────────────────────────  │
│  AI analysis of YOUR coaching:              │
│  - Which clients need attention             │
│  - Where you're most effective              │
│  - Patterns across clients                  │
│  - Your blind spots                         │
│  - Growth areas for you as coach            │
├─────────────────────────────────────────────┤
│  [Clients]  [Prepare]  [My Practice]        │
└─────────────────────────────────────────────┘
```

---

### Screen 12: Coach — Admin

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ADMIN                                      │
├─────────────────────────────────────────────┤
│  ACTIVITY (Last 7 days)                     │
│  ┌─────────────────────────────────────┐   │
│  │ Priorities created: 47              │   │
│  │ Proofs completed: 12                │   │
│  │ Predictions active: 23              │   │
│  │ Connections made: 8                 │   │
│  │ Maps generated: 6                   │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  BY TOOL                                    │
│  ┌─────────────────────────────────────┐   │
│  │ Priority Builder: 47 uses           │   │
│  │ Proof Tool: 12 uses                 │   │
│  │ Predict Tool: 5 uses                │   │
│  │ Dashboard: 89 sessions              │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  DATA HEALTH                                │
│  ┌─────────────────────────────────────┐   │
│  │ Edge Functions: ✓ All running       │   │
│  │ Database: ✓ Connected               │   │
│  │ AI Services: ✓ Operational          │   │
│  │ Last sync: 2 min ago                │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  USERS                                      │
│  Total: 34                                  │
│  Active (7 days): 18                        │
│  Coached: 8                                 │
│  [View all users]                           │
└─────────────────────────────────────────────┘
```

---

## Data Sources

### Home Feed Query

```sql
-- Your items
SELECT 'priority' as type, id, priority_line as text, fires_extracted, 
       prediction_id, created_at, client_email
FROM priorities WHERE client_email = :user

UNION ALL

SELECT 'proof' as type, id, proof_line as text, fires_extracted, 
       prediction_id, created_at, client_email
FROM validations WHERE client_email = :user

UNION ALL

-- Connections' shares (where visibility exists)
SELECT s.content_type as type, s.id, s.share_text as text, s.fires_extracted, 
       s.prediction_id, s.created_at, s.client_email
FROM inspiration_shares s
JOIN share_visibility v ON (
  (v.user_a_email = :user AND v.user_b_email = s.client_email) OR
  (v.user_b_email = :user AND v.user_a_email = s.client_email)
)
WHERE s.client_email != :user AND s.hidden_at IS NULL

ORDER BY created_at DESC
LIMIT 50
```

### Screen-to-Table Mapping

| Screen | Tables Used |
|--------|-------------|
| **Home** | `predictions`, `priorities`, `validations`, `inspiration_shares`, `share_visibility`, `clients` |
| **Prediction Detail** | `predictions`, `prediction_connections`, `priorities`, `validations`, `inspiration_shares`, `snapshots` |
| **Campfire** | `inspiration_shares`, `share_visibility`, `clients` |
| **Connections** | `share_visibility`, `priority_asks`, `priority_responses`, `clients` |
| **Connection Detail** | `share_visibility`, `inspiration_shares`, `clients` |
| **Integrity Maps** | `integrity_maps`, `predictions`, `priorities`, `validations`, `inspiration_shares`, `snapshots` |
| **Settings** | `clients`, `coaching_engagements` |
| **Coach: Clients** | `coaching_engagements`, `clients`, `predictions` |
| **Coach: Client Detail** | `predictions`, `priorities`, `validations`, `snapshots`, `more_less_markers`, `coaching_notes`, `integrity_maps` |
| **Coach: Prepare** | Same as Client Detail + `session_transcripts` |
| **Coach: My Practice** | All user tables (toggle) + aggregated client data |
| **Coach: Admin** | All tables (counts), system health |

---

## Schema Additions Needed

### Add to `share_visibility`

```sql
ALTER TABLE share_visibility ADD COLUMN notes TEXT;
ALTER TABLE share_visibility ADD COLUMN support_description TEXT;
ALTER TABLE share_visibility ADD COLUMN muted_at TIMESTAMP;
ALTER TABLE share_visibility ADD COLUMN mute_notified BOOLEAN DEFAULT false;
```

### New Table: `integrity_maps`

```sql
CREATE TABLE integrity_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    summary TEXT,
    predictions_data JSONB,
    fires_patterns JSONB,
    connection_activity JSONB,
    wins JSONB,
    focus_next JSONB,
    coach_layer JSONB,
    shared_with JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integrity_maps_client ON integrity_maps(client_email);
CREATE INDEX idx_integrity_maps_created ON integrity_maps(created_at DESC);
```

---

## Interactions

### User Actions

| Action | From | Result |
|--------|------|--------|
| Tap prediction | Home | → Prediction Detail |
| Add prediction | Home (+ card) | → Predict Tool |
| Tap feed card (yours) | Home | Expands inline |
| Tap feed card (theirs) | Home/Campfire | Shows linked prediction (future) |
| Add Priority | Home/Prediction Detail | → Priority Builder |
| Add Proof | Home/Prediction Detail | → Proof Tool |
| Practice Predicting | Prediction Detail | → Predict Tool (new snapshot) |
| Tap person | Prediction Detail | Quick popup |
| Ask someone | Prediction Detail | → Priority Builder Ask flow |
| Invite someone | Campfire empty state | → Priority Builder Ask flow |
| Tap connection | Connections | → Connection Detail |
| Edit notes | Connection Detail | Inline edit |
| Mute connection | Connection Detail | Toggle (optional notify) |
| Ask for proof | Connection Detail | → Proof Tool Request flow |
| Send priority | Connection Detail | → Priority Builder Send flow |
| Generate map | Integrity Maps | AI generation → new map |
| View map | Integrity Maps | Full in-app view |
| Share map | Integrity Maps | Select connection |

### Coach Actions

| Action | From | Result |
|--------|------|--------|
| Tap client | Clients | → Client Detail |
| Prepare for session | Prepare/Client Detail | AI generates prep |
| Add notes | Client Detail | → Notes editor |
| View transcript | Client Detail | Opens viewer |
| Generate client map | Client Detail | Creates Integrity Map |
| Toggle journey/practice | My Practice | Switches view |
| View admin | Admin | Activity + health dashboard |

---

## Empty States

| Screen | Condition | Display |
|--------|-----------|---------|
| **Home (no predictions)** | 0 predictions | "What are you working on?" + [Create your first prediction] |
| **Home (no activity)** | Predictions but no priorities | "Your feed will fill as you practice." + [Add a priority] |
| **Campfire (no connections)** | No visibility records | 🔥 "Your campfire is warming up..." + [Invite Someone] |
| **Campfire (no shares)** | Connections but no shares | "Your connections haven't shared yet." |
| **Connections (none)** | No visibility records | "Your circle is empty." + [Invite Someone] |
| **Prediction Detail (no activity)** | 0 priorities/proofs | "Start building evidence." + [Add Priority] [Add Proof] |
| **Prediction Detail (no people)** | 0 connections | "Who's in this with you?" + [+ Ask Someone] |
| **Integrity Maps (none)** | 0 maps | "Generate your first Integrity Map." + [Generate Map] |
| **Connection Detail (no shares)** | Connection hasn't shared | "[Name] hasn't shared anything yet." |

---

## Visual Direction

| Aspect | Decision |
|--------|----------|
| **Platform priority** | Mobile-first |
| **Layout** | Card-based throughout |
| **Density** | Clean/minimal with progressive disclosure |
| **Feel** | Home base — warmer, more personal than tools |
| **Colors** | FIRES colors for badges, brand accent for actions, subtle differentiation for yours vs others |
| **Consistency** | Same typography/palette as Predict/Priority/Proof |

---

## MVP Scope

### Build First (MVP)

| Feature | Rationale |
|---------|-----------|
| Home with predictions header | Core navigation |
| Activity feed (yours) | Value without connections |
| Prediction Detail | Drill into what matters |
| Add Priority/Proof links | Connect to existing tools |
| Practice Predicting badge | Close loop to Predict |
| Campfire (view only) | The "together" promise |
| Connections list | Know your circle |
| Connection Detail (basic) | Name, history, shares, mute |
| Integrity Map generation | Lead magnet, value proof |
| Integrity Map history | Expected feature |
| Settings (basic) | Profile, defaults, notifications |
| All empty states | Critical for new users |
| Coach: Clients + Client Detail | Coach needs to see clients |

### Phase 2

| Feature | Rationale |
|---------|-----------|
| Connection notes fields | Nice-to-have |
| FIRES aggregation on Connection Detail | Needs data volume |
| Manual share → prediction linking | Start implicit first |
| Share Integrity Map | Core works without it |
| Campfire grouped by prediction | Validate value first |
| Coach: Prepare tab with AI | Can use Client Detail |
| Coach: My Practice toggle | Can use free dashboard |

### Phase 3 (Future)

| Feature | Rationale |
|---------|-----------|
| Reactions (v2.0.5) | Social expansion |
| Comments (v2.1) | Social expansion |
| "Couldn't have done it without you" | Beautiful but not essential |
| Coach: Admin tab | Use Supabase dashboard initially |
| AI chat with data (coached) | High value, high complexity |

---

## Build Checklist

### Phase 1: Foundation
- [ ] Set up Dashboard app structure (React/Vite)
- [ ] Implement authentication (shared Supabase)
- [ ] Create navigation (bottom tabs)
- [ ] Build Predictions header component
- [ ] Build feed card components (priority, proof, share)

### Phase 2: Core Screens
- [ ] Home screen with feed
- [ ] Prediction Detail screen
- [ ] Campfire screen
- [ ] Connections list screen
- [ ] Connection Detail screen
- [ ] Integrity Maps screen

### Phase 3: Integrity Maps
- [ ] Create `integrity_maps` table
- [ ] Build AI generation edge function
- [ ] Map view component
- [ ] Generation UI

### Phase 4: Settings + Polish
- [ ] Settings screen
- [ ] All empty states
- [ ] Loading states
- [ ] Error handling

### Phase 5: Coach Views
- [ ] Coach nav structure
- [ ] Clients list
- [ ] Client Detail
- [ ] (Prepare, My Practice, Admin deferred)

---

**End of Specification**

*This document contains everything needed to build the Finding Good V2 Dashboard.*

*Created: January 11, 2026*
