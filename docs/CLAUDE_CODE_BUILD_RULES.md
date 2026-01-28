# Claude Code Build Rules

**Created:** January 26, 2026  
**Purpose:** Guardrails for parallel Claude Code build sessions  
**Location:** Keep this file in `docs/` — reference it in every build session

---

## Core Principle

Each Claude Code session owns specific files and cannot touch anything else. This enables parallel building without conflicts.

---

## Rule 1: Scope Lock

Every session declares what it can modify:

```
✅ I OWN (can create/modify)
   - Specific folders/files listed in build packet

📖 I READ ONLY (can import/reference)
   - packages/shared/** (unless creating new component)
   - docs/**
   - Other apps' code (for patterns only)

🚫 I DO NOT TOUCH
   - Other apps' folders
   - Database migrations (unless Foundation session)
   - Files owned by other sessions
```

**Violation = STOP and ask.**

---

## Rule 2: Checkpoint Stops

Every session has mandatory checkpoints. At each checkpoint:

1. **STOP** — Don't continue automatically
2. **SHOW** — Display what was built
3. **VERIFY** — Wait for human confirmation
4. **LOG** — Update BUILD_PROGRESS.md

Typical checkpoints:
- [ ] Basic UI renders without errors
- [ ] Data reads from database correctly
- [ ] Data writes to database correctly
- [ ] Core feature works end-to-end
- [ ] All done criteria met

---

## Rule 3: Conflict Prevention

Before modifying any file, check:

1. **Is there a SESSION_LOCK for this file?** → If yes, STOP
2. **Am I creating a shared component?** → Must be declared in build packet
3. **Does this change affect other apps?** → STOP and flag

If unsure, **STOP and ask**.

---

## Rule 4: Session Lock Protocol

### Starting a Session

Create `docs/build_sessions/[tool]_session.md`:

```markdown
# [TOOL] Build Session

**Started:** [timestamp]
**Status:** IN_PROGRESS

## Files I Own
- apps/[tool]/**
- [any new shared components declared]

## Checkpoints
- [ ] Checkpoint 1: [description]
- [ ] Checkpoint 2: [description]
- [ ] Checkpoint 3: [description]
- [ ] Done criteria met
```

### Ending a Session

Update the session file:

```markdown
**Status:** COMPLETE
**Ended:** [timestamp]

## What Was Built
- [list of features]

## Files Modified
- [list of files]

## Deferred Items
- [anything pushed to P2/P3]

## Issues for Other Sessions
- [anything they need to know]
```

---

## Rule 5: Shared Component Protocol

If you need to create a new shared component:

1. **Check it's in your build packet** — If not, STOP and ask
2. **Check it doesn't already exist** — Run: `ls packages/shared/src/components/`
3. **Create in packages/shared/src/components/** — Not in your app folder
4. **Export from index** — Update `packages/shared/src/index.ts`
5. **Document in session file** — Note what you created

---

## Rule 6: Database Protocol

### Reading Data
- ✅ Query any table you need
- ✅ Use existing Supabase client from shared

### Writing Data
- ✅ Write to tables listed in your build packet
- 🚫 Do NOT modify schema
- 🚫 Do NOT run migrations (unless Foundation session)
- 🚫 Do NOT add columns

If you need a schema change → **STOP and flag as 🔴 blocker**

---

## Rule 7: Problem Escalation

When you hit an issue:

| Issue Type | Action |
|------------|--------|
| Need to modify shared component | STOP, ask human |
| Need schema change | STOP, flag 🔴 |
| Blocked by another tool's work | STOP, note dependency |
| Unclear requirement | STOP, ask human |
| Found a bug in existing code | Note it, work around, flag for later |
| Test failing | Try to fix, if can't → STOP |

**Never assume. Never work around silently. Always flag.**

---

## Rule 8: Progress Tracking

After each checkpoint, update `docs/BUILD_PROGRESS.md`:

```markdown
## [Tool Name]
- [x] Checkpoint 1: Basic UI ← COMPLETE
- [ ] Checkpoint 2: Data saves ← IN PROGRESS
- [ ] Checkpoint 3: Full flow
- [ ] Done
```

This lets parallel sessions know what's ready.

---

## Rule 9: No Scope Creep

If you notice something that should be fixed but isn't in your packet:

1. **Don't fix it** (unless trivial typo)
2. **Note it** in your session file under "Issues for Other Sessions"
3. **Continue** with your assigned scope

Stay in your lane.

---

## Rule 10: Clean Handoff

When session ends:

1. ✅ All checkpoints complete
2. ✅ BUILD_PROGRESS.md updated
3. ✅ Session file marked COMPLETE
4. ✅ No uncommitted changes (if using git)
5. ✅ Document any "gotchas" for integration

---

## Quick Reference Card

```
START SESSION
├── Read build packet
├── Create session lock file
├── Verify no conflicts
└── Begin work

DURING SESSION
├── Stay in scope (files I own)
├── STOP at checkpoints
├── Flag issues immediately
└── Update progress after each checkpoint

END SESSION
├── Verify all done criteria
├── Update session file to COMPLETE
├── Update BUILD_PROGRESS.md
└── Note issues for other sessions
```

---

## File Locations

| File | Purpose | Who Updates |
|------|---------|-------------|
| `docs/build_packets/XX_[tool]_packet.md` | Build instructions | Created before building |
| `docs/build_sessions/[tool]_session.md` | Session status/lock | Active session |
| `docs/BUILD_PROGRESS.md` | Overall progress | All sessions |
| `docs/CLAUDE_CODE_BUILD_RULES.md` | These rules | Don't modify |

---

**Remember: When in doubt, STOP and ask.**
