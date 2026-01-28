# Finding Good V2: Desktop Session Starter

**Use this prompt to start a new Desktop Claude chat for the Finding Good V2 build.**

---

## Pre-Session Checklist (MANDATORY)

Before starting ANY session:

- [ ] Check `docs/FEATURE_TRACKER.md` — Is this phase's features listed correctly?
- [ ] Check `docs/BUILD_PROGRESS.md` — What's the current status?
- [ ] Check `docs/COMPLETE_BUILD_PHASES.md` — What's the full sequence?
- [ ] Are there any "⏳ Not Assigned" features that should be in this phase?

**If features are missing from the tracker, add them BEFORE starting the build.**

---

## Starter Prompt

```
I'm continuing the Finding Good V2 build. This is a coaching platform with apps for Impact, Improve, Inspire tools plus Together (client hub) and Dashboard (coach view).

**Project Location:** C:\Users\bfret\finding-good-v2 (monorepo with pnpm workspaces)

**MANDATORY FIRST STEP:** Read docs/FEATURE_TRACKER.md to verify all features for this phase are listed.

**Current Status:**
- Phase A-E: ✅ COMPLETE
- Phase E.5 (Dashboard Data): ⏳ NOT STARTED
- Phase F (Send Tools): 📋 PLANNED
- Phase G (Social Features): 📋 PLANNED
- Phase H-K: 📋 PLANNED

**Key Docs:**
- docs/FEATURE_TRACKER.md — **SINGLE SOURCE OF TRUTH** for all features
- docs/COMPLETE_BUILD_PHASES.md — Full phase sequence with all features
- docs/BUILD_PROGRESS.md — Current progress by phase
- docs/CLAUDE_CODE_BUILD_RULES.md — Build rules (includes Rule 0: Feature Tracker Check)
- docs/phase_[X]_build_plan.md — Detailed checkpoints for specific phase

**How We Work:**
- Desktop Claude: Strategic guidance, checkpoint validation, architecture decisions
- Claude Code: Executes builds, writes code, runs commands
- STOP at each checkpoint for validation before continuing

**Feature Tracker Rule:**
- Update features to "🔨 In Progress" when starting
- Update features to "✅ Complete" when done
- If you find a missing feature → STOP, add to tracker, assign to phase

Please read FEATURE_TRACKER.md first, then confirm what phase we're working on and that all features are accounted for.
```

---

## Quick Reference

| App | Port | URL |
|-----|------|-----|
| Together | 3005 | localhost:3005 |
| Priority | 3002 | localhost:3002 |
| Prove | 3003 | localhost:3003 |
| Predict | 3004 | localhost:3004 |
| Dashboard | 3001 | localhost:3001 |

---

## Phase Sequence

```
COMPLETED:
├── Phase A: Navigation ············· ✅
├── Phase B: Home/Influence ········· ✅
├── Phase C: Tool Landing + Inspire · ✅
├── Phase D: Exchange ··············· ✅
└── Phase E: Dashboard ·············· ✅

NEXT:
├── Phase E.5: Dashboard Data ······· Sent/received in tabs
├── Phase F: Send Tools ············· Impact/Improve Others wizards
└── Phase G: Social Features ········ Circle tracker, notifications

THEN:
├── Phase H: Check-in Enhancement ··· Bridge question, week history
├── Phase I: Chat Page ·············· AI self-discovery
├── Phase J: Profile & Settings ····· Notification prefs, privacy
└── Phase K: Map AI Features ········ Coached synthesis features
```

---

## Session Tips

1. **Start with FEATURE_TRACKER.md** — This is now mandatory
2. **Start Claude Code** with the prompt in `docs/CURRENT_PHASE.md`
3. **After each checkpoint**, Claude Code will STOP — paste results here for validation
4. **Before moving on**, confirm the checkpoint passes
5. **Update BUILD_PROGRESS.md** at each checkpoint
6. **Update FEATURE_TRACKER.md** as features complete
7. **Create handoff doc** at end of session

---

## What Happened January 28, 2026

**Discovery:** Features got lost between V2 spec (Jan 25) and phase plans (Jan 27).

**Fix Created:**
- `docs/FEATURE_TRACKER.md` — Single source of truth for ALL features
- `docs/COMPLETE_BUILD_PHASES.md` — All phases including G, H, I, J, K
- Updated `CLAUDE_CODE_BUILD_RULES.md` with Rule 0: Feature Tracker Check
- Updated this file with pre-session checklist

**Lost Features Now Tracked:**
- Circle tracker (Phase G)
- Notifications section (Phase G)
- Recognition counts/buttons (Phase G)
- Bridge question flow (Phase H)
- Week history (Phase H)
- Chat page (Phase I)
- Profile settings (Phase J)
- Map AI features (Phase K)

---

**End of Session Starter**
