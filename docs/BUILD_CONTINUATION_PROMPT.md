# Finding Good V2: Build Continuation Prompt

**Created:** January 28, 2026  
**Purpose:** Copy this entire prompt to start a new Desktop Claude session

---

## THE PROMPT (Copy Everything Below the Line)

---

# Finding Good V2 Build Session

## Project Overview

I'm building Finding Good, a coaching platform that helps people "clarify their influence, own their impact, capture their insights, and inspire action." The core insight: "by standing in the integrity of what's most important, we give others permission to do the same."

**Project Location:** `C:\Users\bfret\finding-good-v2` (monorepo with pnpm workspaces)

**Apps:**
- `apps/together` — Client hub (Together app)
- `apps/dashboard` — Coach view
- `apps/predict` — Inspire tool (standalone)
- `apps/priority` — Impact tool (standalone)  
- `apps/prove` — Improve tool (standalone)
- `packages/shared` — Shared components and types

## Current Status

```
COMPLETED:
├── Phase A: Navigation ············· ✅ Four I's framework
├── Phase B: Home/Influence ········· ✅ Check-in, activity, insights
├── Phase C: Tool Landing + Inspire · ✅ Landing pages + Inspire Others wizard
├── Phase D: Exchange ··············· ✅ Partnership system
└── Phase E: Dashboard ·············· ✅ V2 naming, Quick Prep

READY TO BUILD:
├── Phase F: Send Tools ············· Impact Others + Improve Others wizards
├── Phase G: Social Features ········ Circle tracker, Notifications, Recognition
└── (can run in parallel)

QUEUED:
├── Phase H: Check-in Enhancement ··· Bridge question, week history
├── Phase I: Chat Page ·············· AI self-discovery (coached)
├── Phase J: Profile & Settings ····· Notification prefs, privacy controls
└── Phase K: Map AI Features ········ "What's Emerging", "You vs Others", "The Thread"
```

## Critical Context: Features Were Lost

On January 28, 2026, we discovered that features from the V2 spec (January 25) got lost when we created phase plans (January 27). The navigation restructure focused on the Four I's framework but missed social features, check-in enhancements, Chat page, Profile settings, and Map AI features.

**Solution Created:** A Feature Tracker system that is now the single source of truth.

## MANDATORY: Read These Files First

**In this order:**

1. **`docs/FEATURE_TRACKER.md`** — Single source of truth for ALL features
   - Every feature from V2 spec is listed
   - Each feature assigned to a phase
   - Status: ⏳ Not Assigned | 📋 Planned | 🔨 In Progress | ✅ Complete
   - **If it's not in this file, it doesn't exist**

2. **`docs/COMPLETE_BUILD_PHASES.md`** — All phases with full scope
   - Phases F through K fully documented
   - Database tables needed per phase
   - Edge functions needed per phase

3. **`docs/CLAUDE_CODE_BUILD_RULES.md`** — Build rules including Rule 0
   - Rule 0: Feature Tracker Check (MANDATORY before any phase)
   - Scope lock, checkpoint stops, conflict prevention
   - Session lock protocol

4. **`docs/BUILD_PROGRESS.md`** — Current progress by phase
   - What's complete
   - What's in progress
   - Known issues

5. **`docs/phase_f_build_plan.md`** — Phase F detailed checkpoints (if starting there)

## How We Work Together

**Desktop Claude (You):**
- Strategic guidance and validation
- Review checkpoint results
- Architecture decisions
- Approve before Claude Code continues
- Keep track of Feature Tracker updates

**Claude Code (Separate session):**
- Executes the actual build
- Writes code, runs commands
- STOPS at each checkpoint
- Reports back for validation

**Workflow:**
```
1. Desktop: Verify Feature Tracker is correct for this phase
2. Desktop: Create/review build plan with checkpoints
3. Desktop: Generate Claude Code starter prompt
4. Claude Code: Execute checkpoint 1
5. Claude Code: STOP and report
6. Desktop: Validate, approve to continue
7. Repeat 4-6 for each checkpoint
8. Desktop: Update Feature Tracker with completions
9. Desktop: Create handoff doc
```

## Feature Tracker Rules

**Before starting ANY phase:**
1. Open `docs/FEATURE_TRACKER.md`
2. Find all features for this phase
3. Verify nothing is "⏳ Not Assigned" that should be included
4. Update features to "📋 Planned" if not already

**During the build:**
- Update features to "🔨 In Progress" when starting
- Update features to "✅ Complete" when done

**If you find a missing feature:**
- STOP
- Add it to the tracker
- Assign it to the appropriate phase
- Then continue

## Phase Priorities

**Recommended sequence:**

1. **Phase F (Send Tools)** — Without this, users can't recognize (Impact Others) or witness (Improve Others) anyone. Core functionality.

2. **Phase G (Social Features)** — Circle tracker + notifications make the app feel alive. Brian said this is a priority.

3. **Phase H (Check-in Enhancement)** — Bridge question creates flow from check-in → Priority entry.

4. **Phases I, J, K** — Coached features (Chat, Profile settings, Map AI).

## Key Reference Files

| File | Purpose |
|------|---------|
| `docs/FEATURE_TRACKER.md` | **START HERE** — All features |
| `docs/COMPLETE_BUILD_PHASES.md` | All phases F-K detailed |
| `docs/phase_f_build_plan.md` | Phase F checkpoints |
| `docs/Finding_Good_V2_Social_Features_Spec.md` | Social features philosophy |
| `docs/navigation_restructure_v1.md` | Four I's framework |
| `docs/naming_concordance.md` | Old → new naming |
| `apps/together/src/pages/InspireOthersPage.tsx` | Reference pattern for send wizards |

## Database Access

You have Supabase MCP available. Use it to:
- Query current schema
- Verify table structures
- Check what data exists

**Key tables:**
- `clients` — User records
- `priorities` — Impact entries
- `validations` — Improve entries  
- `predictions` — Inspire entries
- `inspire_others` — Inspire Others send records
- `exchange_partnerships` — Exchange system
- `daily_reflections` — Check-in data

## What I Need From You

1. **Confirm you've read** the Feature Tracker and understand the system
2. **Recommend** which phase to start (F or G)
3. **Create/validate** the Claude Code starter prompt for that phase
4. **Guide me through** each checkpoint with validation
5. **Update** the Feature Tracker as we complete features
6. **Flag** if anything seems missing or unclear

## My Working Style

- I have ADD — give me specific prompts, not open-ended questions
- I learn by doing but need help keeping things organized
- Checkpoints help me stay on track
- I want to understand what we're building, not just have it built
- Surface context I might have forgotten

## Ready?

Please:
1. Read `docs/FEATURE_TRACKER.md` first
2. Confirm you understand the Feature Tracker system
3. Tell me which phase you recommend starting with and why
4. Show me what features are in that phase (from the tracker)
5. Generate the Claude Code prompt for that phase's first checkpoint

---

## END OF PROMPT

---

## Notes for Brian

**To start the session:**
1. Open a new Desktop Claude chat
2. Copy everything between the two `---` lines above
3. Paste it as your first message
4. Let Claude read the files and respond
5. Follow Claude's guidance for starting Claude Code

**Files Claude will need to read:**
- FEATURE_TRACKER.md (single source of truth)
- COMPLETE_BUILD_PHASES.md (phase details)
- CLAUDE_CODE_BUILD_RULES.md (build rules)
- BUILD_PROGRESS.md (current status)
- phase_f_build_plan.md (if doing Phase F)

**MCP tools available:**
- Desktop Commander (file operations)
- Supabase (database queries)
- Claude in Chrome (if needed for testing)
