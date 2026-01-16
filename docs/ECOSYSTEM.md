# Finding Good V2: Ecosystem Map

**Version:** 1.0  
**Created:** January 10, 2026  
**Last Updated:** January 10, 2026  
**Purpose:** Reference document for V2 build — shows how all tools connect and what would break if changed

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FINDING GOOD V2 ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                │
│    │   PREDICT    │    │   PRIORITY   │    │    PROOF     │                │
│    │    TOOL      │    │   BUILDER    │    │    TOOL      │                │
│    │              │    │              │    │              │                │
│    │  Periodic    │    │   Daily      │    │   Weekly     │                │
│    │  ~15 min     │    │   ~3 min     │    │   ~10 min    │                │
│    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                │
│           │                   │                   │                         │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                    PREDICTIONS TABLE                        │         │
│    │            (V2 First-Class Entity — Max 3 Active)          │         │
│    │         Links all tool activity to goals/challenges         │         │
│    └─────────────────────────────────────────────────────────────┘         │
│                                │                                            │
│                                ▼                                            │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                        TOGETHER                             │         │
│    │                    (Dashboard)                              │         │
│    │   • Prediction progress & scores                           │         │
│    │   • FIRES patterns extracted                               │         │
│    │   • Connection engagement                                  │         │
│    │   • Integrity Maps (weekly PDF)                            │         │
│    └──────────────────────────┬──────────────────────────────────┘         │
│                               │                                             │
│                               ▼                                             │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                       CAMPFIRE                              │         │
│    │                  (Inspiration Feed)                         │         │
│    │   • Shared priorities, proofs, predictions                 │         │
│    │   • Mutual connections only                                │         │
│    │   • Reactions (v2.0.5) → Comments (v2.1)                   │         │
│    └─────────────────────────────────────────────────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Tools & Their Purpose

### 1.1 Predict Tool

| Attribute | Value |
|-----------|-------|
| **Old Name** | FIRES Snapshot / Alignment Builder |
| **Primary Function** | Assess predictability of success on specific goals |
| **Who Uses It** | Users (direct), Coaches (view results) |
| **Cadence** | Periodic — entry point + re-assessment after ~10 priorities + 2 proofs |
| **Time to Complete** | Standard: ~15 min, Quick: ~3-5 min |
| **URL** | snapshot.findinggood.com (V1) |

**What It Creates:**

| Output | Description | Stored In |
|--------|-------------|-----------|
| Prediction | Goal/challenge/experience being tracked | `predictions` (V2 new) |
| Predictability Score | Aggregate score (clarity + confidence + alignment + connections) | `predictions.current_predictability_score` |
| FIRES Map | Per-element clarity/confidence/zone | `snapshots.zone_breakdown`, `predictions.current_fires_map` |
| Connections | People linked to prediction | `prediction_connections` (V2 new) |
| Snapshot Record | Full assessment responses | `snapshots` |

**Modes (V2):**

| Mode | Purpose | Output |
|------|---------|--------|
| Standard | Full FIRES assessment | Full prediction + snapshot |
| Quick | Workshop capture, entry point | `quick_predictions` record |
| Send | Invite someone to share what they're working on | Recipient creates their own prediction |

---

### 1.2 Priority Builder

| Attribute | Value |
|-----------|-------|
| **Old Name** | Impact Amplifier |
| **Primary Function** | Confirm what mattered + inspire/get inspired by others |
| **Who Uses It** | Users (direct), Coaches (view activity) |
| **Cadence** | Daily |
| **Time to Complete** | ~2-5 min |
| **URL** | impact.findinggood.com (V1) |

**What It Creates:**

| Output | Description | Stored In |
|--------|-------------|-----------|
| Priority Entry | What mattered, your part, your impact | `priorities` (renamed from `impact_verifications`) |
| FIRES Extraction | AI-detected FIRES elements | `priorities.fires_extracted` |
| Priority Line | AI-generated shareable summary | `priorities.integrity_line` |
| Connection Ask | Request for someone else to confirm | Creates invite flow |
| Inspiration Share | Content for Campfire feed | `inspiration_shares` |

**Modes (V2):**

| Mode | User-Facing Name | Purpose |
|------|------------------|---------|
| Confirm + Ask | "Confirm what mattered today" | Build evidence, get inspired |
| Send Impact | "Tell someone what they did mattered" | Current "Other" flow |

---

### 1.3 Proof Tool

| Attribute | Value |
|-----------|-------|
| **Old Name** | Finding Good Validation |
| **Primary Function** | Own the HOW — gather evidence of process |
| **Who Uses It** | Users (direct), Coaches (view evidence) |
| **Cadence** | Weekly or episodic (after success/challenge) |
| **Time to Complete** | ~10 min |
| **URL** | proof.findinggood.com ✅ **LIVE (Claude Code)** |

**What It Creates:**

| Output | Description | Stored In |
|--------|-------------|-----------|
| Validation Entry | Reflection on how success happened | `validations` |
| Scores | Confidence, Clarity, Ownership (1-5) | `validations.scores` |
| FIRES Extraction | AI-detected FIRES elements | `validations.fires_extracted` |
| Proof Line | Shareable one-sentence summary | `validations.proof_line` |
| Pattern | whatWorked, whyItWorked, howToRepeat | `validations.pattern` |
| Outcome Prediction | Prediction for next time | `outcome_predictions` (renamed from `predictions`) |

**Modes:**

| Mode | Description | Tables Used |
|------|-------------|-------------|
| Self | Reflect on YOUR success | `validations` |
| Request | Ask someone for perspective on YOUR success | `proof_requests` |
| Send to Others | Help someone ELSE surface THEIR proof | `validation_invitations` |

---

### 1.4 Together (Dashboard)

| Attribute | Value |
|-----------|-------|
| **Old Name** | Coach Dashboard |
| **Primary Function** | Synthesize all activity, show progress, enable coaching |
| **Who Uses It** | Coaches (primary), Users (their own view), Free users (limited) |
| **URL** | dashboard.findinggood.com (V1 in Lovable) |

**What It Displays:**

| Section | Data Source | Who Sees |
|---------|-------------|----------|
| My Predictions | `predictions` | All users |
| Prediction Activity | `priorities`, `validations` linked by `prediction_id` | All users |
| FIRES Signals | AI extraction from recent activity | All users |
| Connections | `prediction_connections`, share activity | All users |
| Integrity Map | Weekly synthesis PDF | All users |
| More/Less Markers | `more_less_markers` | Coached clients |
| Coaching Notes | `coaching_notes` | Coach view |
| Session Transcripts | `session_transcripts` | Coach view |

---

### 1.5 Campfire (Inspiration Feed)

| Attribute | Value |
|-----------|-------|
| **New in V2** | Yes |
| **Primary Function** | Social layer — see what connections share, get inspired |
| **Who Uses It** | All users with mutual connections |
| **Location** | Within Together dashboard |

**What It Contains:**

| Content Type | Source | Visibility |
|--------------|--------|------------|
| Priorities | `priorities` where `share_to_feed = true` | Mutual connections |
| Proofs | `validations` where `share_to_feed = true` | Mutual connections |
| Predictions | `predictions` where shared | Mutual connections |

**Phased Rollout:**

| Phase | Features |
|-------|----------|
| v2.0 | View-only — see shares, no interaction |
| v2.0.5 | Add reactions (👍 💡 🔥 ❤️ 🙌) |
| v2.1 | Add comments + "open to discovery" toggle |

---

## Part 2: Data Flows

### 2.1 Core Flow Diagram

```
USER JOURNEY:
═════════════

1. ENTRY POINT
   ┌─────────────────────────────────────────────────┐
   │                 PREDICT TOOL                     │
   │   Creates: prediction + baseline snapshot        │
   │   Sets: predictability score + FIRES map         │
   │   Names: connections (people supporting you)     │
   └──────────────────────┬──────────────────────────┘
                          │
                          │ prediction_id
                          ▼
2. DAILY PRACTICE
   ┌─────────────────────────────────────────────────┐
   │               PRIORITY BUILDER                   │
   │   Reads: active prediction for context           │
   │   Creates: priority entry linked to prediction   │
   │   Extracts: FIRES signals                        │
   │   Optional: share to Campfire feed               │
   │   Triggers: Ask someone → creates connection     │
   └──────────────────────┬──────────────────────────┘
                          │
                          │ prediction_id
                          ▼
3. WEEKLY EVIDENCE
   ┌─────────────────────────────────────────────────┐
   │                  PROOF TOOL                      │
   │   Reads: active prediction for context           │
   │   Creates: validation entry linked to prediction │
   │   Extracts: FIRES signals, confidence scores     │
   │   Optional: share to Campfire feed               │
   │   Creates: outcome_prediction (for tracking)     │
   └──────────────────────┬──────────────────────────┘
                          │
                          │ All activity aggregated
                          ▼
4. SYNTHESIS
   ┌─────────────────────────────────────────────────┐
   │                  TOGETHER                        │
   │   Displays: predictions with activity counts     │
   │   Shows: FIRES patterns over time                │
   │   Tracks: connection engagement                  │
   │   Generates: weekly Integrity Map PDF            │
   └──────────────────────┬──────────────────────────┘
                          │
                          │ Re-assessment trigger
                          │ (10 priorities + 2 proofs)
                          ▼
5. RE-ASSESSMENT
   ┌─────────────────────────────────────────────────┐
   │                 PREDICT TOOL                     │
   │   Updates: predictability score                  │
   │   Compares: to baseline                          │
   │   Shows: progress over time                      │
   └─────────────────────────────────────────────────┘
```

### 2.2 Cross-Tool Data Dependencies

| From Tool | To Tool | Data Passed | Purpose |
|-----------|---------|-------------|---------|
| Predict | Priority Builder | `prediction_id`, prediction title | Context for daily entry |
| Predict | Proof Tool | `prediction_id`, prediction title | Context for weekly reflection |
| Predict | Together | All prediction data | Display progress |
| Priority Builder | Together | Entry counts, FIRES extracted | Activity tracking |
| Priority Builder | Campfire | Shared entries | Inspiration feed |
| Priority Builder | Predictions table | Increment `priority_count` | Track re-assessment trigger |
| Proof Tool | Together | Entry counts, scores | Evidence tracking |
| Proof Tool | Campfire | Shared entries | Inspiration feed |
| Proof Tool | Predictions table | Increment `proof_count` | Track re-assessment trigger |
| Proof Tool | Outcome Predictions | Prediction text + accuracy | Prediction accuracy tracking |

### 2.3 Connection Data Flow

```
CONNECTION LIFECYCLE:
════════════════════

1. USER NAMES CONNECTION
   Predict Tool → prediction_connections table
   ├── Name, relationship, support_type
   ├── working_on_similar (boolean)
   └── source: 'future' or 'past' story

2. USER ASKS CONNECTION (Priority or Proof)
   Tool creates share/request
   └── If recipient responds → create_mutual_visibility()
       └── share_visibility record created (user_a < user_b for dedup)

3. MUTUAL VISIBILITY ESTABLISHED
   Both users can now:
   ├── See each other's Campfire shares
   ├── Appear in each other's connection lists
   └── Engagement tracked (count + last_engaged_at)

4. CAMPFIRE DISPLAY
   Query: inspiration_shares WHERE
   ├── client_email IN (SELECT visible_users FROM share_visibility)
   └── hidden_at IS NULL
```

---

## Part 3: Shared Concepts

### 3.1 Universal Identifier: `client_email`

**CRITICAL:** `client_email` is THE universal identifier across all tools.

| Usage | Why It Works |
|-------|--------------|
| Links all tool entries | Same person, same email |
| Works with Supabase Auth | Email from JWT |
| Works with event codes | No auth required, email captured |
| Works with sharing | Invites go to email |

**Never use:**
- `user_id` (different meaning in different contexts)
- `client_id` (UUID changes between entries)
- `auth.uid()` alone (doesn't work for unauthenticated flows)

### 3.2 FIRES Framework

**Definition:** Five internal navigation systems the brain uses when deciding how to act.

| Element | Label | Core Question | Color |
|---------|-------|---------------|-------|
| **F** | Feelings | What signals I'm on the right track? | #E57373 (Red) |
| **I** | Influence | What can I actually control? | #64B5F6 (Blue) |
| **R** | Resilience | How have I handled difficulty before? | #81C784 (Green) |
| **E** | Ethics (Why) | What actually matters here? | #FFD54F (Yellow) |
| **S** | Strengths | What do I bring to this? | #BA68C8 (Purple) |

**Where FIRES Appears:**

| Tool | How FIRES Is Used |
|------|-------------------|
| Predict Tool | Explicit questions per element, zone mapping |
| Priority Builder | AI extraction from responses (not user-selected in V2) |
| Proof Tool | AI extraction from responses |
| Together | Aggregated patterns displayed |

**FIRES Data Structure (JSONB):**
```json
{
  "feelings": {
    "clarity": 4,
    "confidence": 3,
    "zone": "Performing",
    "evidence": "User described specific signals..."
  },
  "influence": { ... },
  "resilience": { ... },
  "ethics": { ... },
  "strengths": { ... }
}
```

### 3.3 Predictions (V2 First-Class Entity)

**Definition:** A goal, challenge, or experience the user is actively working on.

| Attribute | Value |
|-----------|-------|
| Max active per user | 3 |
| Ranking | User can order 1st, 2nd, 3rd |
| Status | `active` or `archived` |
| Re-assessment trigger | 10 priorities + 2 proofs |

**Prediction Links Everything:**
```
predictions
├── snapshots (via prediction_id)
├── priorities (via prediction_id)
├── validations (via prediction_id)
├── prediction_connections (via prediction_id)
├── proof_requests (via prediction_id)
└── validation_invitations (via prediction_id)
```

### 3.4 Scoring Concepts

| Score Type | Source | Range | Used In |
|------------|--------|-------|---------|
| **Predictability Score** | Aggregate of clarity + confidence + alignment + connections | 0-100 | Predictions, Together |
| **Clarity** | AI extraction from language specificity | 1-5 | All tools |
| **Confidence** | AI extraction from evidence/process | 1-5 | All tools |
| **Ownership** | AI extraction from action attribution | 1-5 | Proof Tool |
| **Alignment** | Self-rated (how clearly past links to future) | 1-4 | Predict Tool |
| **Connection Score** | People named + working_on_similar bonus | 1-8 | Predict Tool |

### 3.5 Zones

| Zone | Clarity/Confidence | Alignment | The Work |
|------|-------------------|-----------|----------|
| **Exploring** | Low | Low | Stay curious, refine the question |
| **Discovering** | Low | High | Bring forward past success |
| **Performing** | High | Low | Reconnect to evidence |
| **Owning** | High | High | Extend to others |

**Zone Calculation:**
- High Confidence = score ≥ 4 (on 1-5 scale)
- High Alignment = score ≥ 3 (on 1-4 scale)

### 3.6 Event Codes

**Purpose:** Allow anonymous or workshop participation without full auth.

| Table | Has `event_code` |
|-------|------------------|
| `events` | Defines the event |
| `snapshots` | Yes |
| `priorities` | Yes |
| `validations` | Yes |
| `quick_predictions` | Yes |

---

## Part 4: Breaking Change Risks

### 4.1 High Risk — Would Break Multiple Tools

| Change | Impact | Affected Tools |
|--------|--------|----------------|
| Rename `client_email` | All queries break | ALL |
| Change FIRES element names | AI prompts break, UI labels wrong | ALL |
| Remove `predictions` table | No context for entries | Predict, Priority, Proof, Together |
| Change `id` column type | All foreign keys break | ALL |

### 4.2 Medium Risk — Would Break Specific Tools

| Change | Impact | Affected Tools |
|--------|--------|----------------|
| Rename `snapshots` | Predict Tool queries fail | Predict, Together |
| Rename `validations` | Proof Tool queries fail | Proof, Together |
| Rename `priorities` (planned) | Priority Builder queries fail | Priority, Together |
| Change `scores` JSONB structure | Score display breaks | Proof |
| Change `zone_breakdown` structure | Zone display breaks | Predict, Together |

### 4.3 Low Risk — Isolated Impact

| Change | Impact | Affected Tools |
|--------|--------|----------------|
| Add nullable columns | None (backward compatible) | None |
| Add new tables | None | None |
| Add indexes | None (performance only) | None |
| Change `pdf_url` location | PDF links break | Together (PDF display) |

### 4.4 Coordinated Changes (V2 Migration)

These changes are PLANNED and require coordinated deployment:

| Change | Why | Coordination |
|--------|-----|--------------|
| `predictions` → `outcome_predictions` | Free name for V2 predictions | Update Proof Tool before SQL |
| `impact_verifications` → `priorities` | Match V2 terminology | Update Priority Builder before SQL |
| Add `prediction_id` to all tables | Link to V2 predictions | After V2 predictions table exists |
| Enable RLS policies | Security | After V2 auth working |

---

## Part 5: Current Supabase Schema

### 5.1 Table Summary (Live Data)

| Table | Rows | Primary Use | V2 Change |
|-------|------|-------------|-----------|
| `clients` | 8 | User identity | Add `coach_visibility_level` |
| `coaches` | 1 | Coach accounts | None |
| `snapshots` | 9 | Predict Tool results | Add `prediction_id`, AI scores |
| `impact_verifications` | 2 | Priority Builder entries | **RENAME** → `priorities` |
| `validations` | 11 | Proof Tool entries | Add `prediction_id`, `share_to_feed` |
| `predictions` | 4 | Proof Tool outcome tracking | **RENAME** → `outcome_predictions` |
| `proof_requests` | 3 | Proof Tool request mode | Add `prediction_id` |
| `validation_invitations` | 1 | Proof Tool send mode | Add `prediction_id` |
| `coaching_engagements` | 4 | 12-week coaching | None |
| `events` | 3 | Workshop codes | None |

### 5.2 Foreign Key Relationships (Current)

```
coaches
├── clients.coach_id → coaches.id
├── clients.approved_by → coaches.id
├── coaching_engagements.coach_id → coaches.id
├── coaching_notes.coach_id → coaches.id
├── session_transcripts.coach_id → coaches.id
├── client_files.uploaded_by_coach_id → coaches.id
├── voice_memos.coach_id → coaches.id
├── assignments.coach_id → coaches.id
└── scheduled_sessions.coach_id → coaches.id

coaching_engagements
├── more_less_markers.engagement_id → coaching_engagements.id
├── coaching_notes.engagement_id → coaching_engagements.id
├── session_transcripts.engagement_id → coaching_engagements.id
├── client_files.engagement_id → coaching_engagements.id
├── client_assessments.engagement_id → coaching_engagements.id
├── voice_memos.engagement_id → coaching_engagements.id
├── assignments.engagement_id → coaching_engagements.id
├── narrative_map_history.engagement_id → coaching_engagements.id
├── integrity_primer_responses.engagement_id → coaching_engagements.id
└── weekly_narrative_maps.engagement_id → coaching_engagements.id

snapshots
└── coaching_notes.related_snapshot_id → snapshots.id

impact_verifications (→ priorities)
└── coaching_notes.related_verification_id → impact_verifications.id
    ⚠️ Must update FK constraint when renaming

session_transcripts
├── voice_memos.related_session_id → session_transcripts.id
└── coaching_notes.related_session_id → session_transcripts.id

more_less_markers
├── more_less_markers.paired_marker_id → more_less_markers.id (self-ref)
├── more_less_updates.marker_id → more_less_markers.id
└── more_less_updates.exchange_marker_id → more_less_markers.id
```

### 5.3 New Tables Needed (V2)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `predictions` (V2) | Goals/challenges being tracked | `client_email`, `title`, `status`, `rank`, `predictability_score` |
| `prediction_connections` | People linked to predictions | `prediction_id`, `name`, `email`, `working_on_similar` |
| `quick_predictions` | Workshop quick captures | `client_email`, `goal_text`, `ai_clarity` |
| `inspiration_shares` | Campfire feed content | `client_email`, `content_type`, `content_id`, `share_text` |
| `share_visibility` | Mutual connections | `user_a_email`, `user_b_email` |
| `reactions` (v2.0.5) | Feed reactions | `share_id`, `reactor_email`, `reaction_type` |
| `comments` (v2.1) | Feed comments | `share_id`, `commenter_email`, `comment_text` |

### 5.4 Columns Shared Across Tools

These columns appear in multiple tables and MUST stay consistent:

| Column | Tables | Type | Notes |
|--------|--------|------|-------|
| `client_email` | All user-facing | TEXT | Universal identifier |
| `event_code` | snapshots, priorities, validations, quick_predictions | TEXT | Workshop linking |
| `engagement_id` | Most coaching tables | UUID | 12-week journey |
| `fires_extracted` | priorities, validations | JSONB | AI FIRES analysis |
| `fires_focus` | impact_verifications, coaching_engagements | JSONB | User-selected FIRES (V1) |
| `prediction_id` | V2 tables | UUID | Link to prediction |
| `share_to_feed` | priorities, validations | BOOLEAN | Campfire opt-in |
| `created_at` | All tables | TIMESTAMP | Creation date |
| `status` | Multiple | TEXT | State tracking |

---

## Part 6: Authentication & Access

### 6.1 Auth Patterns

| Pattern | When Used | How It Works |
|---------|-----------|--------------|
| Supabase Auth | Normal app use | JWT with email in claims |
| Event Code | Workshops, anonymous | Email captured, no auth required |
| Share Links | Proof Tool modes | Unique `share_id` grants access |
| Coach Code | Dashboard access | Coach authenticates separately |

### 6.2 RLS Policy Summary (Current)

Most tables currently have permissive "allow all" policies. V2 will tighten this:

| Table | V2 RLS Plan |
|-------|-------------|
| `predictions` | Owner can CRUD, coach can view clients' |
| `inspiration_shares` | Owner can CRUD, mutual connections can view |
| `share_visibility` | Users can view their own |
| `prediction_connections` | Owner can CRUD, coach visibility based on client setting |

### 6.3 Coach Visibility Levels (V2)

| Level | What Coach Sees |
|-------|-----------------|
| `names` | Connection names only |
| `engagement` | Names + how often engaged |
| `full` | Names + engagement + what they shared |

Client controls via: `clients.coach_visibility_level`

---

## Part 7: API & Edge Functions

### 7.1 Current Edge Functions

| Function | Location | Purpose | Used By |
|----------|----------|---------|---------|
| `validation-interpret` | Supabase Edge | AI analysis of Proof reflections | Proof Tool |
| (snapshot interpret) | Supabase Edge | AI analysis of Predict responses | Predict Tool |
| (impact interpret) | Supabase Edge | AI analysis of Priority entries | Priority Builder |

### 7.2 AI Analysis Patterns

All tools use similar AI patterns:

```
Input: User responses (text)
    ↓
Edge Function calls Claude API
    ↓
Output: JSONB with:
├── scores (clarity, confidence, ownership)
├── fires_extracted (which elements detected)
├── insight (AI interpretation)
└── summary_line (shareable one-liner)
```

---

## Part 8: Brand & UI Consistency

### 8.1 Color Palette (All Tools)

| Name | Hex | Usage |
|------|-----|-------|
| Deep Teal (Primary) | `#1B5666` | Headers, buttons |
| Medium Teal (Secondary) | `#678C95` | Secondary text |
| Yellow-Green (Accent) | `#CBC13D` | Highlights |
| Light Background | `#EDF2F2` | Backgrounds |
| Dark Text | `#333333` | Body text |

### 8.2 FIRES Element Colors

| Element | Color | Hex |
|---------|-------|-----|
| Feelings | Red | `#E57373` |
| Influence | Blue | `#64B5F6` |
| Resilience | Green | `#81C784` |
| Ethics | Yellow | `#FFD54F` |
| Strengths | Purple | `#BA68C8` |

### 8.3 Common UI Components

These should be consistent across tools:

| Component | Pattern |
|-----------|---------|
| FIRES badges | Colored pill with element initial |
| Score displays | Number + label + optional trend |
| Zone indicators | Quadrant position or text label |
| Connection cards | Name + relationship + engagement count |
| Share buttons | "Share to Campfire" toggle |

---

## Part 9: Migration Checklist

### Phase 1: Safe Additions (Do First)

- [ ] Create `prediction_connections` table
- [ ] Create `inspiration_shares` table
- [ ] Create `share_visibility` table
- [ ] Create `quick_predictions` table
- [ ] Add `prediction_id` to existing tables (nullable)
- [ ] Add `share_to_feed` to priorities/validations
- [ ] Add `coach_visibility_level` to clients
- [ ] Create helper functions

### Phase 2: Renames (Coordinated)

- [ ] Update Proof Tool: `predictions` → `outcome_predictions`
- [ ] Update Priority Builder: `impact_verifications` → `priorities`
- [ ] Update Dashboard queries
- [ ] Run table renames in Supabase
- [ ] Update `coaching_notes` FK constraint
- [ ] Create V2 `predictions` table
- [ ] Create triggers

### Phase 3: RLS (After Auth Working)

- [ ] Enable RLS on new tables
- [ ] Create all policies
- [ ] Test with authenticated users
- [ ] Remove permissive policies

---

## Document Status

| Section | Status | Last Verified |
|---------|--------|---------------|
| Tool Purposes | ✅ Complete | Jan 10, 2026 |
| Data Flows | ✅ Complete | Jan 10, 2026 |
| Shared Concepts | ✅ Complete | Jan 10, 2026 |
| Breaking Changes | ✅ Complete | Jan 10, 2026 |
| Supabase Schema | ✅ Verified via query | Jan 10, 2026 |

---

**End of Ecosystem Map**

*Update this document when:*
- *Adding new tools or tables*
- *Changing shared concepts (FIRES, predictions)*
- *Modifying authentication patterns*
- *Running migration phases*
