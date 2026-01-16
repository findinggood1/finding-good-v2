# Finding Good: Master Database Schema

**Version:** 3.0  
**Last Updated:** January 11, 2026  
**Supabase Project:** finding-good

---

## Overview

This document is the single source of truth for the Finding Good database schema. All tools in the ecosystem share this database.

### Current Tools

| Tool | Status | Primary Tables |
|------|--------|----------------|
| **Predict Tool** | V2 Ready | `predictions`, `prediction_connections`, `snapshots`, `quick_predictions` |
| **Priority Builder** | V2 Ready | `priorities`, `predictions` |
| **Proof Tool** | Live + V2 Updates | `validations`, `validation_invitations`, `proof_requests`, `outcome_predictions` |
| **Dashboard** | V2 Ready | All tables |
| **Inspiration Feed** | V2 New | `inspiration_shares`, `share_visibility`, `reactions`, `comments` |

### Shared Infrastructure

| Table | Purpose | Used By |
|-------|---------|---------|
| `clients` | Universal user identity | All tools |
| `coaches` | Coach accounts | All tools |
| `events` | Workshop/event codes | All tools |

---

## V2 Core Tables

### `predictions` (V2 — First-Class Entity)

**Purpose:** Goals, challenges, or experiences users are actively working on. Max 3 active per user.

**Used by:** All V2 tools

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | User who owns this prediction |
| `title` | TEXT | No | — | The goal/challenge/experience |
| `description` | TEXT | Yes | — | Optional longer description |
| `type` | TEXT | Yes | `'goal'` | 'goal' / 'challenge' / 'experience' |
| `status` | TEXT | No | `'active'` | 'active' / 'archived' |
| `rank` | INTEGER | Yes | — | 1, 2, or 3 (priority order) |
| `current_predictability_score` | INTEGER | Yes | — | Latest aggregate score |
| `current_fires_map` | JSONB | Yes | — | Latest FIRES analysis |
| `baseline_snapshot_id` | UUID | Yes | — | FK to first snapshot |
| `latest_snapshot_id` | UUID | Yes | — | FK to most recent snapshot |
| `priority_count` | INTEGER | Yes | `0` | Cached count of Priority entries |
| `proof_count` | INTEGER | Yes | `0` | Cached count of Proof entries |
| `connection_count` | INTEGER | Yes | `0` | Cached count of connections |
| `history_summary` | TEXT | Yes | — | AI-generated on archive |
| `archived_at` | TIMESTAMP | Yes | — | When archived |
| `created_at` | TIMESTAMP | No | `NOW()` | Creation date |
| `updated_at` | TIMESTAMP | Yes | `NOW()` | Last modification |

**Constraints:**
- `status` IN ('active', 'archived')
- `type` IN ('goal', 'challenge', 'experience')
- `rank` BETWEEN 1 AND 3 (or NULL)
- Max 3 active predictions per user (enforced by trigger)

**Indexes:**
- `idx_predictions_v2_client` on `client_email`
- `idx_predictions_v2_status` on `status`
- `idx_predictions_v2_client_active` on `(client_email, status)` WHERE status = 'active'
- `idx_predictions_v2_created` on `created_at DESC`

---

### `prediction_connections`

**Purpose:** People linked to a prediction (named in Future/Past stories).

**Used by:** Predict Tool, Dashboard

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `prediction_id` | UUID | No | — | FK to predictions |
| `client_email` | TEXT | No | — | Who added this connection |
| `name` | TEXT | No | — | Connection's name |
| `email` | TEXT | Yes | — | Optional email for outreach |
| `relationship` | TEXT | Yes | — | How they know each other |
| `support_type` | TEXT | Yes | — | emotional / direct / indirect / similar |
| `working_on_similar` | BOOLEAN | Yes | `false` | +1 point if true |
| `source` | TEXT | Yes | — | 'future' / 'past' |
| `how_they_supported` | TEXT | Yes | — | For past connections |
| `engagement_count` | INTEGER | Yes | `0` | Times engaged |
| `last_engaged_at` | TIMESTAMP | Yes | — | Most recent interaction |
| `created_at` | TIMESTAMP | No | `NOW()` | When added |

**Indexes:**
- `idx_pred_conn_prediction` on `prediction_id`
- `idx_pred_conn_client` on `client_email`
- `idx_pred_conn_email` on `email` WHERE email IS NOT NULL

---

### `quick_predictions`

**Purpose:** Standalone quick assessments (workshop capture, entry point).

**Used by:** Predict Tool, Events

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Who completed |
| `goal_text` | TEXT | No | — | What they're focused on |
| `success_vision` | TEXT | Yes | — | One-sentence success vision |
| `past_similar` | TEXT | Yes | — | What they've done before |
| `what_worked` | TEXT | Yes | — | How it worked |
| `supporters` | JSONB | Yes | — | Array of supporter names |
| `ai_clarity` | INTEGER | Yes | — | 1-5 clarity assessment |
| `ai_connection_strength` | INTEGER | Yes | — | 1-5 connection strength |
| `ai_interpretation` | TEXT | Yes | — | AI analysis |
| `event_code` | TEXT | Yes | — | For workshop tracking |
| `converted_to_prediction_id` | UUID | Yes | — | If they did full Prediction |
| `created_at` | TIMESTAMP | No | `NOW()` | Completion date |

**Indexes:**
- `idx_quick_pred_client` on `client_email`
- `idx_quick_pred_event` on `event_code` WHERE event_code IS NOT NULL
- `idx_quick_pred_created` on `created_at DESC`

---

## Inspiration Feed Tables

### `inspiration_shares`

**Purpose:** Content shared to the Inspiration Feed.

**Used by:** Dashboard, Priority Builder, Proof Tool

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Who shared |
| `content_type` | TEXT | No | — | 'priority' / 'proof' / 'prediction' |
| `content_id` | UUID | No | — | FK to source table |
| `prediction_id` | UUID | Yes | — | FK to predictions (context) |
| `share_text` | TEXT | Yes | — | What appears in feed |
| `fires_extracted` | JSONB | Yes | — | AI-extracted FIRES |
| `hidden_at` | TIMESTAMP | Yes | — | If hidden |
| `created_at` | TIMESTAMP | No | `NOW()` | When shared |

**Indexes:**
- `idx_shares_client` on `client_email`
- `idx_shares_prediction` on `prediction_id`
- `idx_shares_created` on `created_at DESC`
- `idx_shares_content` on `(content_type, content_id)`

---

### `share_visibility`

**Purpose:** Mutual connections — who can see whom in the feed.

**Used by:** Dashboard, Inspiration Feed

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_a_email` | TEXT | No | — | One user (alphabetically first) |
| `user_b_email` | TEXT | No | — | Other user |
| `initiated_by` | TEXT | Yes | — | Who created connection |
| `source_share_id` | UUID | Yes | — | Share that created this |
| `created_at` | TIMESTAMP | No | `NOW()` | When established |

**Constraints:**
- UNIQUE on `(user_a_email, user_b_email)`
- `user_a_email < user_b_email` (ordering for deduplication)

**Indexes:**
- `idx_visibility_user_a` on `user_a_email`
- `idx_visibility_user_b` on `user_b_email`

---

### `reactions` (v2.0.5)

**Purpose:** Reactions to shared content.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `share_id` | UUID | No | — | FK to inspiration_shares |
| `reactor_email` | TEXT | No | — | Who reacted |
| `reaction_type` | TEXT | No | — | 👏 / 💡 / 🔥 / ❤️ / 🙌 |
| `created_at` | TIMESTAMP | No | `NOW()` | When reacted |

**Constraints:**
- UNIQUE on `(share_id, reactor_email, reaction_type)`
- `reaction_type` IN ('👏', '💡', '🔥', '❤️', '🙌')

---

### `comments` (v2.1)

**Purpose:** Comments on shared content.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `share_id` | UUID | No | — | FK to inspiration_shares |
| `commenter_email` | TEXT | No | — | Who commented |
| `comment_text` | TEXT | No | — | The comment |
| `hidden_at` | TIMESTAMP | Yes | — | If moderated |
| `created_at` | TIMESTAMP | No | `NOW()` | When posted |

---

## Updated Existing Tables

### `clients` (Shared)

**Purpose:** Universal user identity across all Finding Good tools.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `email` | TEXT | No | — | Unique identifier |
| `name` | TEXT | Yes | — | Display name |
| `coach_id` | UUID | Yes | — | FK to coaches.id |
| `status` | TEXT | Yes | `'pending'` | Account status |
| `approved_at` | TIMESTAMP | Yes | — | When approved |
| `approved_by` | UUID | Yes | — | FK to coaches.id |
| `coach_visibility_level` | TEXT | Yes | `'names'` | **V2:** names / engagement / full |
| `open_to_discovery` | BOOLEAN | Yes | `false` | **V2:** v2.1 discovery toggle |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Account creation |

---

### `snapshots` (Predict Tool)

**Purpose:** Store completed FIRES Snapshot assessments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Links to client |
| `event_code` | TEXT | Yes | — | If via event |
| `prediction_id` | UUID | Yes | — | **V2:** FK to predictions |
| `goal` | TEXT | Yes | — | Future Story goal |
| `success` | TEXT | Yes | — | Past Story success |
| `fs_answers` | JSONB | Yes | — | Future Story answers |
| `ps_answers` | JSONB | Yes | — | Past Story answers |
| `confidence_scores` | JSONB | Yes | — | User confidence ratings |
| `alignment_scores` | JSONB | Yes | — | User alignment ratings |
| `ai_clarity_scores` | JSONB | Yes | — | **V2:** AI-extracted clarity |
| `ai_confidence_scores` | JSONB | Yes | — | **V2:** AI-extracted confidence |
| `total_confidence` | INTEGER | Yes | — | Sum (6-30) |
| `total_alignment` | INTEGER | Yes | — | Sum (6-30) |
| `connection_score` | INTEGER | Yes | — | **V2:** From connections |
| `predictability_score` | INTEGER | Yes | — | **V2:** Aggregate score |
| `overall_zone` | TEXT | Yes | — | Legacy zone |
| `zone_breakdown` | JSONB | Yes | — | Zone per FIRES |
| `growth_opportunity_category` | TEXT | Yes | — | FIRES for growth |
| `growth_opportunity_zone` | TEXT | Yes | — | Zone of growth opp |
| `owning_highlight_category` | TEXT | Yes | — | FIRES of strength |
| `owning_highlight_zone` | TEXT | Yes | — | Zone of highlight |
| `owning_highlight_is_fallback` | BOOLEAN | Yes | — | If fallback used |
| `forty_eight_hour_question` | TEXT | Yes | — | Legacy question |
| `edge_cases` | JSONB | Yes | — | Edge case flags |
| `future_support` | TEXT | Yes | — | Legacy support field |
| `past_support` | TEXT | Yes | — | Legacy support field |
| `focus` | TEXT | Yes | — | Focus area |
| `narrative` | JSONB | Yes | — | AI narrative |
| `pdf_url` | TEXT | Yes | — | PDF location |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Completion date |

**Indexes:**
- `idx_snapshots_client` on `client_email`
- `idx_snapshots_created` on `created_at DESC`
- `idx_snapshots_event` on `event_code`
- `idx_snapshots_prediction` on `prediction_id` WHERE prediction_id IS NOT NULL

---

### `priorities` (Priority Builder — Renamed from `impact_verifications`)

**Purpose:** Store Priority Builder practice entries.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Sender's email |
| `event_code` | TEXT | Yes | — | If via event |
| `prediction_id` | UUID | Yes | — | **V2:** FK to predictions |
| `type` | TEXT | No | — | 'self' or 'other' |
| `timeframe` | TEXT | Yes | — | day/week/month/year |
| `intensity` | TEXT | Yes | — | light/balanced/deeper |
| `fires_focus` | JSONB | Yes | — | Selected FIRES |
| `responses` | JSONB | Yes | — | {moment, role, impact} |
| `helper_framings` | JSONB | Yes | — | **V2:** Framings selected |
| `fires_extracted` | JSONB | Yes | — | **V2:** AI extraction |
| `integrity_line` | TEXT | Yes | — | AI quotable line |
| `interpretation` | TEXT | Yes | — | AI interpretation |
| `ownership_signal` | TEXT | Yes | — | Signal strength |
| `clarity_signal` | TEXT | Yes | — | Signal strength |
| `confidence_signal` | TEXT | Yes | — | Signal strength |
| `evidence` | JSONB | Yes | — | Evidence data |
| `target_name` | TEXT | Yes | — | For 'other' type |
| `target_email` | TEXT | Yes | — | For 'other' type |
| `target_relationship` | TEXT | Yes | — | For 'other' type |
| `impact_card` | JSONB | Yes | — | Card data |
| `share_id` | TEXT | Yes | — | Unique share link |
| `status` | TEXT | Yes | `'draft'` | draft/shared/completed |
| `share_to_feed` | BOOLEAN | Yes | `false` | **V2:** Feed sharing |
| `shared_at` | TIMESTAMP | Yes | — | **V2:** When shared to feed |
| `recipient_email` | TEXT | Yes | — | Recipient email |
| `recipient_responses` | JSONB | Yes | — | Their responses |
| `recipient_completed_at` | TIMESTAMP | Yes | — | When completed |
| `recipient_skipped` | BOOLEAN | Yes | `false` | If skipped |
| `alignment` | JSONB | Yes | — | Alignment data |
| `sender_notified_at` | TIMESTAMP | Yes | — | Notification sent |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Entry creation |

**Indexes:**
- `idx_priorities_client` on `client_email`
- `idx_priorities_created` on `created_at DESC`
- `idx_priorities_event` on `event_code`
- `idx_priorities_share` on `share_id`
- `idx_priorities_status` on `status`
- `idx_priorities_prediction` on `prediction_id` WHERE prediction_id IS NOT NULL
- `idx_priorities_shared` on `share_to_feed` WHERE share_to_feed = true

---

### `validations` (Proof Tool)

**Purpose:** Store Proof Tool self-reflection entries.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Links to client |
| `engagement_id` | UUID | Yes | — | FK to coaching_engagements |
| `prediction_id` | UUID | Yes | — | **V2:** FK to predictions |
| `mode` | TEXT | Yes | — | 'self', 'other', 'request' |
| `goal_challenge` | TEXT | Yes | — | What accomplished |
| `timeframe` | TEXT | Yes | — | day/week/month/year |
| `intensity` | TEXT | No | — | light/balanced/deeper |
| `entry_type` | TEXT | Yes | — | Entry type |
| `source_impact_id` | UUID | Yes | — | If from Impact |
| `source_invitation_id` | UUID | Yes | — | If from invitation |
| `q0_response` - `q4_response` | TEXT | Yes | — | Legacy responses |
| `responses` | JSONB | Yes | — | Question responses |
| `validation_signal` | TEXT | Yes | — | emerging/developing/grounded |
| `validation_insight` | TEXT | Yes | — | AI insight |
| `scores` | JSONB | Yes | — | {confidence, clarity, ownership} |
| `pattern` | JSONB | Yes | — | {whatWorked, whyItWorked, howToRepeat} |
| `fires_extracted` | JSONB | Yes | — | AI FIRES analysis |
| `fires_elements` | JSONB | Yes | — | Legacy FIRES data |
| `fires_insight` | TEXT | Yes | — | FIRES insight |
| `proof_line` | TEXT | Yes | — | Shareable summary |
| `transferable_method` | TEXT | Yes | — | Method identified |
| `method_clarity_level` | TEXT | Yes | — | Clarity level |
| `method_clarity_reflection` | TEXT | Yes | — | Reflection |
| `pattern_for_client` | TEXT | Yes | — | Client pattern |
| `pattern_for_coach` | TEXT | Yes | — | Coach pattern |
| `event_code` | TEXT | Yes | — | If via event |
| `share_to_feed` | BOOLEAN | Yes | `false` | **V2:** Feed sharing |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Entry creation |

**Indexes:**
- `idx_validations_client` on `client_email`
- `idx_validations_created` on `created_at DESC`
- `idx_validations_prediction` on `prediction_id` WHERE prediction_id IS NOT NULL
- `idx_validations_shared` on `share_to_feed` WHERE share_to_feed = true

---

### `proof_requests` (Proof Tool)

**Purpose:** Request Mode — ask someone for perspective.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `share_id` | TEXT | No | — | Unique share link |
| `requester_email` | TEXT | No | — | Who requested |
| `requester_name` | TEXT | Yes | — | Display name |
| `recipient_name` | TEXT | No | — | Who they're asking |
| `recipient_email` | TEXT | Yes | — | Recipient email |
| `responder_email` | TEXT | Yes | — | Who responded |
| `goal_challenge` | TEXT | No | — | Topic |
| `what_you_did` | TEXT | Yes | — | Context |
| `prediction_id` | UUID | Yes | — | **V2:** FK to predictions |
| `status` | TEXT | No | `'pending'` | pending/viewed/completed/expired |
| `responses` | JSONB | Yes | — | Recipient responses |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Creation |
| `completed_at` | TIMESTAMP | Yes | — | When completed |

**Indexes:**
- `idx_proof_requests_share_id` on `share_id`
- `idx_proof_requests_requester` on `requester_email`
- `idx_proof_requests_prediction` on `prediction_id` WHERE prediction_id IS NOT NULL

---

### `validation_invitations` (Proof Tool)

**Purpose:** Send to Others — invite reflection.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `share_id` | TEXT | No | — | Unique share link |
| `sender_email` | TEXT | No | — | Who sent |
| `sender_name` | TEXT | Yes | — | Display name |
| `recipient_email` | TEXT | Yes | — | Recipient email |
| `recipient_name` | TEXT | No | — | Recipient name |
| `recipient_relationship` | TEXT | Yes | — | Relationship |
| `what_sender_noticed` | TEXT | No | — | What observed |
| `why_learn` | TEXT | Yes | — | Why learn |
| `entry_type` | TEXT | Yes | — | Entry type |
| `prediction_id` | UUID | Yes | — | **V2:** FK to predictions |
| `status` | TEXT | Yes | `'pending'` | pending/viewed/completed |
| `recipient_intensity` | TEXT | Yes | — | Intensity |
| `recipient_q0` - `recipient_q4` | TEXT | Yes | — | Responses |
| `transferable_method` | TEXT | Yes | — | Method |
| `fires_insight` | TEXT | Yes | — | FIRES analysis |
| `learning_prompt` | TEXT | Yes | — | Learning prompt |
| `conversation_starter` | TEXT | Yes | — | Conversation starter |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Creation |
| `viewed_at` | TIMESTAMP | Yes | — | When viewed |
| `completed_at` | TIMESTAMP | Yes | — | When completed |
| `expires_at` | TIMESTAMP | Yes | `NOW() + 30 days` | Expiration |

**Indexes:**
- `idx_invitations_share` on `share_id`
- `idx_invitations_sender` on `sender_email`
- `idx_invitations_status` on `status`
- `idx_invitations_prediction` on `prediction_id` WHERE prediction_id IS NOT NULL

---

### `outcome_predictions` (Proof Tool — Renamed)

**Purpose:** Track outcome predictions and accuracy (renamed from `predictions`).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Who made prediction |
| `validation_id` | UUID | Yes | — | FK to validations |
| `engagement_id` | UUID | Yes | — | FK to coaching_engagements |
| `prediction_text` | TEXT | No | — | The prediction |
| `action_text` | TEXT | Yes | — | Action to take |
| `timeframe` | TEXT | Yes | — | Expected timeframe |
| `outcome` | TEXT | Yes | — | What happened |
| `outcome_text` | TEXT | Yes | — | Detailed outcome |
| `outcome_accuracy` | INTEGER | Yes | — | 1-5 accuracy |
| `learning` | TEXT | Yes | — | What learned |
| `week_of` | DATE | Yes | `CURRENT_DATE` | Week of prediction |
| `status` | TEXT | Yes | `'open'` | open/reviewed |
| `checked_at` | TIMESTAMP | Yes | — | When checked |
| `reviewed_at` | TIMESTAMP | Yes | — | When marked reviewed |
| `created_at` | TIMESTAMP | Yes | `NOW()` | Creation |

**Indexes:**
- `idx_outcome_pred_client` on `client_email`
- `idx_outcome_pred_status` on `status`

---

## Schema Change Log

| Date | Version | Change | Tables Affected |
|------|---------|--------|-----------------|
| Jan 2025 | 1.0 | Initial unified schema | All |
| Jan 7, 2026 | 2.0 | Proof Tool launch | validations, validation_invitations, proof_requests, predictions, weekly_pulse_responses |
| Jan 11, 2026 | 3.0 | **V2 Architecture** | See below |
| Jan 15, 2026 | 3.1 | **V2 Migration Executed** | predictions, outcome_predictions, priorities, snapshots |

### V2 Changes (v3.0)

**New Tables:**
- `predictions` — V2 first-class entity for goals/challenges
- `prediction_connections` — People linked to predictions
- `quick_predictions` — Workshop capture tool
- `inspiration_shares` — Feed content
- `share_visibility` — Mutual connections
- `reactions` — v2.0.5 (designed)
- `comments` — v2.1 (designed)

**Renamed Tables:**
- `predictions` → `outcome_predictions` (Proof Tool's outcome tracking)
- `impact_verifications` → `priorities` (Priority Builder entries)

**Modified Tables:**
- `clients` — Added `coach_visibility_level`, `open_to_discovery`
- `snapshots` — Added `prediction_id`, AI scores, `predictability_score`
- `priorities` — Added `prediction_id`, `share_to_feed`, `shared_at`, `helper_framings`, `fires_extracted`
- `validations` — Added `prediction_id`, `share_to_feed`
- `proof_requests` — Added `prediction_id`
- `validation_invitations` — Added `prediction_id`

---

### V2 Migration (v3.1 - Jan 15, 2026)

**Changes Executed:**
- Created `outcome_predictions` table for Proof Tool outcome tracking
- Renamed `impact_verifications` → `priorities` in database
- Linked `predictions.current_predictability_score` from `snapshots.predictability_score` via client_email matching
- Updated all app code references (fgdashboard-v1, fgimpact, finding-good-v2)
- Fixed Together app to read `current_predictability_score` directly
- Fixed Dashboard zone cards to read from `snapshots.zone_scores`

---

**End of Schema Document**
