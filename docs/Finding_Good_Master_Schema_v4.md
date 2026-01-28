# Finding Good: Master Database Schema

**Version:** 4.0  
**Last Updated:** January 26, 2026  
**Supabase Project:** finding-good

---

## Overview

This document is the single source of truth for the Finding Good database schema. All tools in the ecosystem share this database.

### Current Tools

| Tool | Status | Primary Tables |
|------|--------|----------------|
| **Predict Tool** | Live | `predictions`, `prediction_connections`, `snapshots`, `quick_predictions` |
| **Priority Builder** | Live | `priorities`, `predictions` |
| **Proof Tool** | Live | `validations`, `validation_invitations`, `proof_requests`, `outcome_predictions` |
| **Dashboard** | V2 Build | `weekly_snapshots`, `rolling_aggregates`, `agreed_activities`, `coaching_relationships` |
| **Together** | V2 Build | `permissions`, `daily_checkins`, `user_circles`, `inspiration_shares`, `share_recognitions` |

### Shared Infrastructure

| Table | Purpose | Used By |
|-------|---------|---------|
| `clients` | Universal user identity | All tools |
| `coaches` | Coach accounts | All tools |
| `events` | Workshop/event codes | All tools |
| `coaching_relationships` | Coach-client status tracking | Dashboard, Together |

---

## V4 New Tables (January 2026)

### `coaching_relationships`

**Purpose:** Track coach-client relationships with status.

**Used by:** Dashboard (primary), Together (profile display)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `coach_id` | UUID | No | — | FK to coaches |
| `client_email` | TEXT | No | — | Client identifier |
| `status` | TEXT | No | `'pending_coach_invite'` | Relationship status |
| `started_at` | TIMESTAMPTZ | Yes | — | When relationship began |
| `ended_at` | TIMESTAMPTZ | Yes | — | When relationship ended |
| `invite_code` | TEXT | Yes | — | Unique invite code |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Last modification |

**Constraints:**
- `status` IN ('pending_coach_invite', 'pending_client_request', 'active', 'paused', 'completed')

**Indexes:**
- `idx_coaching_relationships_coach` on `coach_id`
- `idx_coaching_relationships_client` on `client_email`
- `idx_coaching_relationships_status` on `status`
- `idx_coaching_relationships_invite` on `invite_code` WHERE invite_code IS NOT NULL (unique)

---

### `permissions`

**Purpose:** Store Permission/Practice/Focus (user's self-framing).

**Used by:** Dashboard (coach view), Together (Today, Focus setup)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | User identifier |
| `prediction_id` | UUID | Yes | — | Optional FK to predictions |
| `practice` | TEXT | Yes | — | User's practice statement |
| `permission` | TEXT | Yes | — | User's permission statement |
| `focus` | JSONB | Yes | `'[]'` | Array of focus items |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Last modification |

**Indexes:**
- `idx_permissions_client` on `client_email`
- `idx_permissions_updated` on `updated_at DESC`

---

### `daily_checkins`

**Purpose:** Daily focus check-in with engagement scores.

**Used by:** Dashboard (engagement tracking), Together (Today page)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | User identifier |
| `permission_id` | UUID | Yes | — | FK to permissions |
| `check_date` | DATE | No | `CURRENT_DATE` | Date of check-in |
| `focus_scores` | JSONB | Yes | `'[]'` | Array of {focus, score} |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |

**Constraints:**
- UNIQUE on `(client_email, check_date)` — one per user per day

**Indexes:**
- `idx_daily_checkins_client` on `client_email`
- `idx_daily_checkins_date` on `check_date DESC`
- `idx_daily_checkins_permission` on `permission_id`

---

### `weekly_snapshots`

**Purpose:** AI-generated weekly summaries for coaching prep.

**Used by:** Dashboard (Quick Prep, Map tabs)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Client identifier |
| `coach_id` | UUID | Yes | — | FK to coaches |
| `week_number` | INTEGER | Yes | — | Week number in engagement |
| `week_start` | DATE | No | — | Week start date |
| `week_end` | DATE | No | — | Week end date |
| `activity_counts` | JSONB | Yes | — | Counts by activity type |
| `themes` | JSONB | Yes | — | Extracted themes |
| `language_patterns` | JSONB | Yes | — | Notable language patterns |
| `fires_signals` | JSONB | Yes | — | FIRES-related signals |
| `exchanges` | JSONB | Yes | — | Recognition exchanges |
| `open_threads` | JSONB | Yes | — | Unresolved topics |
| `coaching_questions` | JSONB | Yes | — | AI-suggested questions |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |

**Indexes:**
- `idx_weekly_snapshots_client` on `client_email`
- `idx_weekly_snapshots_coach` on `coach_id`
- `idx_weekly_snapshots_week` on `week_start DESC`

---

### `rolling_aggregates`

**Purpose:** Long-term coaching context (accumulated over weeks/months).

**Used by:** Dashboard (Map tab, pattern detection)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Client identifier |
| `coach_id` | UUID | Yes | — | FK to coaches |
| `coaching_start` | DATE | Yes | — | When coaching began |
| `total_weeks` | INTEGER | Yes | `0` | Total weeks of coaching |
| `permission_evolution` | JSONB | Yes | — | How permission changed |
| `persistent_themes` | JSONB | Yes | — | Recurring themes |
| `fires_trajectory` | JSONB | Yes | — | FIRES patterns over time |
| `relationship_map` | JSONB | Yes | — | Key relationships |
| `questions_explored` | JSONB | Yes | — | Questions covered |
| `breakthroughs` | JSONB | Yes | — | Notable breakthroughs |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Last modification |

**Constraints:**
- UNIQUE on `(client_email, coach_id)` — one per coaching relationship

**Indexes:**
- `idx_rolling_aggregates_client` on `client_email`
- `idx_rolling_aggregates_coach` on `coach_id`

---

### `agreed_activities`

**Purpose:** Coach-tracked activities from Focus, sessions, transcripts.

**Used by:** Dashboard (Agreed Activities tab)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | Client identifier |
| `coach_id` | UUID | Yes | — | FK to coaches |
| `source` | TEXT | No | `'focus'` | Where activity came from |
| `activity_text` | TEXT | No | — | The activity description |
| `status` | TEXT | No | `'pending'` | Current status |
| `evidence_entries` | JSONB | Yes | — | Links to evidence |
| `coach_notes` | TEXT | Yes | — | Coach's private notes |
| `visibility` | TEXT | No | `'shared'` | Who can see this |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Last modification |

**Constraints:**
- `source` IN ('focus', 'session', 'transcript')
- `status` IN ('pending', 'evidence_found', 'resolved', 'deprioritized')
- `visibility` IN ('shared', 'coach_only')

**Indexes:**
- `idx_agreed_activities_client` on `client_email`
- `idx_agreed_activities_coach` on `coach_id`
- `idx_agreed_activities_status` on `status`

---

### `user_circles`

**Purpose:** Track who is in each user's circle (for Campfire visibility).

**Used by:** Together (Home page, Campfire feed)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_email` | TEXT | No | — | Circle owner |
| `circle_member_email` | TEXT | No | — | Circle member |
| `relationship_type` | TEXT | Yes | `'sent_to'` | How connected |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |

**Constraints:**
- UNIQUE on `(user_email, circle_member_email)`

**Indexes:**
- `idx_user_circles_user` on `user_email`
- `idx_user_circles_member` on `circle_member_email`

---

### `share_recognitions`

**Purpose:** Track who "recognized" (liked) an inspiration_share in the feed.

**Used by:** Together (Campfire feed recognition counts)

**Note:** This is DIFFERENT from the `recognitions` table, which handles direct person-to-person recognition.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `share_id` | UUID | No | — | FK to inspiration_shares (CASCADE delete) |
| `recognizer_email` | TEXT | No | — | Who recognized |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |

**Constraints:**
- UNIQUE on `(share_id, recognizer_email)` — one recognition per user per share

**Indexes:**
- `idx_share_recognitions_share` on `share_id`
- `idx_share_recognitions_recognizer` on `recognizer_email`

**Trigger:**
- `trigger_recognition_count` — updates `inspiration_shares.recognized_count` on INSERT/DELETE

---

### `inspire_requests`

**Purpose:** "Inspire me" nudges between circle members.

**Used by:** Together (Campfire, gentle nudges)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `requester_email` | TEXT | No | — | Who sent the nudge |
| `recipient_email` | TEXT | No | — | Who receives the nudge |
| `message` | TEXT | Yes | — | Optional message |
| `status` | TEXT | Yes | `'pending'` | Current status |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |

**Constraints:**
- `status` IN ('pending', 'acknowledged')

**Indexes:**
- `idx_inspire_requests_recipient` on `recipient_email`
- `idx_inspire_requests_status` on `status`

---

### `chat_conversations`

**Purpose:** AI discovery chat history for coached users.

**Used by:** Together (AI chat feature)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | User identifier |
| `messages` | JSONB | Yes | `'[]'` | Array of chat messages |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | Record creation |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Last modification |

**Indexes:**
- `idx_chat_conversations_client` on `client_email`
- `idx_chat_conversations_updated` on `updated_at DESC`

---

### `focus_history`

**Purpose:** Track how Focus items evolve over time.

**Used by:** Dashboard (pattern detection), Together (Focus evolution)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `client_email` | TEXT | No | — | User identifier |
| `focus_name` | TEXT | No | — | The focus item text |
| `started_at` | DATE | No | `CURRENT_DATE` | When focus started |
| `ended_at` | DATE | Yes | — | When focus ended |
| `evolved_into` | TEXT | Yes | — | What it became |
| `reason` | TEXT | Yes | — | Why it ended |

**Constraints:**
- `reason` IN ('paused', 'evolved', 'completed') OR NULL

**Indexes:**
- `idx_focus_history_client` on `client_email`
- `idx_focus_history_active` on `client_email` WHERE ended_at IS NULL

---

## V4 Column Additions

### `predictions` — New Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `what_matters_most` | TEXT | — | User's Permission statement |
| `share_to_feed` | BOOLEAN | `false` | Whether to show in Campfire feed |

### `clients` — New Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `calendar_link` | TEXT | — | Calendly/Cal.com scheduling link |

---

## Existing Tables Reference

### Recognition Tables (Two Different Purposes)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `recognitions` | Direct person-to-person recognition | `from_email`, `to_name`, `what_they_did`, `what_it_showed`, `how_it_affected` |
| `share_recognitions` | Feed item "likes" | `share_id`, `recognizer_email` |

### Tables Using `client_email` Convention (24 tables)

```
agreed_activities          integrity_maps              priorities
assignments                integrity_primer_responses  quick_predictions
chat_conversations         more_less_markers           scheduled_sessions
client_assessments         outcome_predictions         session_transcripts
client_files               permissions                 snapshots
coaching_engagements       prediction_connections      validations
coaching_notes             predictions                 voice_memos
daily_checkins             predictions_v1_backup       weekly_narrative_maps
focus_history                                          weekly_pulse_responses
inspiration_shares                                     weekly_snapshots
```

---

## Triggers

| Trigger | Table | Function | Purpose |
|---------|-------|----------|---------|
| `trigger_recognition_count` | share_recognitions | `update_recognition_count()` | Updates `inspiration_shares.recognized_count` |
| `trigger_permissions_updated` | permissions | `update_updated_at()` | Auto-update `updated_at` |
| `trigger_coaching_relationships_updated` | coaching_relationships | `update_updated_at()` | Auto-update `updated_at` |
| `trigger_rolling_aggregates_updated` | rolling_aggregates | `update_updated_at()` | Auto-update `updated_at` |
| `trigger_agreed_activities_updated` | agreed_activities | `update_updated_at()` | Auto-update `updated_at` |
| `trigger_chat_conversations_updated` | chat_conversations | `update_updated_at()` | Auto-update `updated_at` |

---

## RLS Policies

All V4 tables have RLS enabled with permissive "Allow all" policies for now. Tighter policies will be added once auth patterns are finalized.

**Tables with user-scoped policies:**
- `predictions` — INSERT/SELECT/UPDATE based on `client_email`
- `integrity_maps` — SELECT based on `client_email`
- `coaching_engagements` — UPDATE based on `client_email`
- `recognitions` — SELECT/INSERT based on `from_email`
- `priority_asks` — UPDATE based on `user_id`

---

## Schema Change Log

| Date | Version | Change | Tables Affected |
|------|---------|--------|-----------------|
| Jan 2025 | 1.0 | Initial unified schema | All |
| Jan 7, 2026 | 2.0 | Proof Tool launch | validations, validation_invitations, proof_requests |
| Jan 11, 2026 | 3.0 | V2 Architecture | predictions, prediction_connections, quick_predictions |
| Jan 15, 2026 | 3.1 | V2 Migration Executed | predictions renamed, priorities renamed |
| **Jan 26, 2026** | **4.0** | **Dashboard V2 + Together V2** | See below |

### V4 Changes (January 26, 2026)

**New Tables (11):**
1. `coaching_relationships` — Coach-client relationship tracking
2. `permissions` — Permission/Practice/Focus
3. `daily_checkins` — Daily engagement scores
4. `weekly_snapshots` — AI-generated weekly summaries
5. `rolling_aggregates` — Long-term coaching context
6. `agreed_activities` — Coach-tracked activities
7. `user_circles` — Campfire feed visibility
8. `share_recognitions` — Feed item likes (distinct from person-to-person recognitions)
9. `inspire_requests` — Gentle nudges
10. `chat_conversations` — AI chat history
11. `focus_history` — Focus item lifecycle

**New Columns (3):**
- `predictions.what_matters_most` — Permission statement
- `predictions.share_to_feed` — Campfire visibility
- `clients.calendar_link` — Scheduling link

**Existing Tables Preserved:**
- `inspiration_shares` — Already existed with compatible structure
- `recognitions` — Person-to-person recognition (unchanged)

---

## Quick Reference: Table by App

### Dashboard V2
| Table | Purpose |
|-------|---------|
| coaching_relationships | Client list, relationship status |
| weekly_snapshots | Quick Prep summaries |
| rolling_aggregates | Map tab, long-term patterns |
| agreed_activities | Activity tracking |
| session_transcripts | Transcript processing |

### Together V2
| Table | Purpose |
|-------|---------|
| permissions | Today page, Permission/Practice/Focus |
| daily_checkins | Daily engagement scoring |
| user_circles | Campfire feed visibility |
| inspiration_shares | Shared content |
| share_recognitions | Feed "likes" |
| inspire_requests | Gentle nudges |
| chat_conversations | AI chat |
| focus_history | Focus evolution |

### Shared Across Apps
| Table | Purpose |
|-------|---------|
| predictions | Core goals/challenges |
| clients | User identity |
| coaches | Coach accounts |
| priorities | Priority entries |
| validations | Proof entries |

---

**End of Schema Document**
