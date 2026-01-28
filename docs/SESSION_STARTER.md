# Finding Good V2: Desktop Session Starter

**Use this prompt to start a new Desktop Claude chat for the Finding Good V2 build.**

---

## Starter Prompt

```
I'm continuing the Finding Good V2 build. This is a coaching platform with apps for Impact, Improve, Inspire tools plus Together (client hub) and Dashboard (coach view).

**Project Location:** C:\Users\bfret\finding-good-v2 (monorepo with pnpm workspaces)

**Current Phase:** Phase C — Tool Landing Pages + Inspire Others

**What's Complete:**
- Phase A: Navigation restructured to Four I's framework (Impact/Improve/Inspire)
- Phase B: Home page rebuilt with Influence section, daily check-in, weekly activity, insights

**What's Next (Phase C has 7 checkpoints):**
1. Reusable ToolLandingPage component
2. Impact landing page
3. Improve landing page  
4. Inspire landing page
5. Update Self pages with new branding
6. Update Others pages with new branding
7. BUILD Inspire Others flow (new — doesn't exist yet)

**Key Files to Read:**
- docs/CURRENT_PHASE.md — Current status and starter prompt for Claude Code
- docs/phase_c_build_plan.md — Detailed checkpoint instructions
- docs/BUILD_PROGRESS.md — Overall progress tracker
- docs/handoffs/phase_b_complete.md — What was just built
- docs/naming_concordance.md — Old → new name mappings
- docs/COLLABORATION_PROTOCOL.md — How Desktop + Claude Code work together

**How We Work:**
- Desktop Claude: Strategic guidance, checkpoint validation, architecture decisions
- Claude Code: Executes builds, writes code, runs commands
- STOP at each checkpoint for validation before continuing

**Important Context:**
- Impact Others (RecognizePage) already exists — just needs title update
- Improve Others (OtherMode) already exists — just needs title update  
- Inspire Others does NOT exist — must be built from scratch in Checkpoint 7

Please read the key files and confirm you're ready to guide Phase C. When I start Claude Code, I'll use the prompt from CURRENT_PHASE.md.
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

## Session Tips

1. **Start Claude Code** with the prompt in `docs/CURRENT_PHASE.md`
2. **After each checkpoint**, Claude Code will STOP — paste results here for validation
3. **Before moving on**, confirm the checkpoint passes
4. **Update BUILD_PROGRESS.md** at each checkpoint
5. **Create handoff doc** at end of session

---

## What We Accomplished Today (Jan 27, 2026)

**Phase B - Home/Influence Page:**
- YOUR INFLUENCE section (Permission, Practice, Focus inline edit)
- WHAT YOU'RE CREATING (Predictions moved here)
- TODAY'S CHECK-IN (Focus checkboxes, engagement, reflection question)
- THIS WEEK (Active beliefs + evidence counts)
- RECENT ACTIVITY (Sent/Received with type icons)
- INSIGHTS (Rule-based contextual messages)
- Map page now has all analytics
- daily_reflections table with RLS

**Files created:** 6 new components, 3 new hooks, 2 pages restructured

Great session! 🎉
