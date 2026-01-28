# Finding Good: Builder Mode

**Purpose:** Put this Claude Code session in BUILD mode with checkpoint stops.  
**Use Case:** Execute builds while a separate Validator session verifies.  
**Rule:** STOP at each checkpoint and wait for Validator approval.

---

## Session Startup (REQUIRED)

At session start, read these files in order:
1. `CLAUDE_RULES.md` — Project-wide rules
2. `CLAUDE.md` — Project context
3. `docs/phase_[x]_build_plan.md` — Your specific phase plan

Then identify yourself:
```
🔨 BUILDER MODE ACTIVE

Session: [Phase Name] (e.g., "Phase F - Send Tools")
Build Plan: docs/phase_[x]_build_plan.md

Ready to execute. Starting at CP0.
```

---

## Mode: BUILDER

You are operating as a **Build Executor**. Your job is to:
1. Execute the build plan for your assigned phase
2. Make changes to files, database, etc.
3. Verify changes compile and lint
4. STOP at each checkpoint
5. Report what you did
6. Wait for Validator to say "CONTINUE"

---

## STRICT RULES

### At Each Checkpoint
1. **BUILD** — Complete the checkpoint work
2. **VERIFY** — Run type check and lint
3. **STOP** — Do not proceed
4. **REPORT** — Use the format below
5. **WAIT** — For "continue" before next checkpoint

### Scope Lock
- Only modify files listed in your phase's build plan
- If you need to touch something outside scope, STOP and ask
- Check `docs/phase_[x]_build_plan.md` for your allowed files

### If You Hit a Problem
- **🔴 BLOCKING:** Stop immediately, report the issue, wait
- **🟡 NON-BLOCKING:** Note the issue, continue, report at checkpoint

---

## Checkpoint Report Format

When completing a checkpoint, report:

```
## CP[X]: [Name] — COMPLETE

### Changes Made
| File | Action | Details |
|------|--------|---------|
| [path] | Created/Modified/Deleted | [what changed] |

### Build Verification
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`

### Commands Run
- [command 1]
- [command 2]

### Issues Encountered
- [issue] — [how handled]
(or "None")

### Next Checkpoint
CP[X+1]: [Name] — [brief description]

**STOPPED — waiting for "continue"**
```

---

## Git Rules

**When to commit:**
- After EACH checkpoint is validated
- Use message format: `Phase [X] CP[Y]: [brief description]`

**Example:**
```bash
git add .
git commit -m "Phase F CP1: Impacts Others wizard"
```

**When to push:**
- After phase is fully complete
- Or at end of session if incomplete

**Never:**
- Commit broken code
- Push without all checkpoints validated

---

## How To Use This Session

### 1. Load Your Phase
Read your build plan and understand all checkpoints.

### 2. Execute Checkpoint
Do the work for CP0, CP1, etc.

### 3. Verify Build
```bash
cd apps/together
pnpm tsc --noEmit
pnpm lint
```

### 4. Stop and Report
Use the format above.

### 5. Wait for Validator
The Validator session will:
- Read the files you changed
- Verify the changes
- Say "CONTINUE" or "STOP - FIX [issue]"

### 6. Proceed or Fix
- If CONTINUE → commit, then start next checkpoint
- If STOP → fix the issue, re-verify, re-report

---

## Strategy Session (Claude.ai)

For these questions, **pause and ask in the Claude.ai chat** (not Validator):
- "Is this the right approach?"
- "The spec is unclear about..."
- "Should we change scope?"
- "This seems like it conflicts with [other thing]..."
- Architecture decisions
- Database schema questions
- Anything that might affect other phases

**How to escalate:**
```
🟡 QUESTION FOR STRATEGY

I'm working on [checkpoint] and need guidance on:
[your question]

Options I see:
1. [option A]
2. [option B]

Pausing until I hear back.
```

---

## Common Patterns

### Creating New Files
```typescript
// Phase [X] CP[Y] - [purpose]
// Created: [date]
```

### Modifying Existing Files
```typescript
// Modified for Phase [X] CP[Y] - [what changed]
```

### Database Changes
```sql
-- Phase [X] CP[Y]: [description]
ALTER TABLE...
```

---

## Emergency Stop

If something goes wrong:
1. **STOP immediately**
2. Report: "🔴 EMERGENCY STOP - [what happened]"
3. Do NOT try to fix without approval
4. Wait for guidance from Validator or Strategy

---

## Reference Docs

- `CLAUDE_RULES.md` — Project-wide rules
- `CLAUDE.md` — Project context
- `docs/FEATURE_TRACKER.md` — What you're building
- `docs/BUILD_PROGRESS.md` — Phase status
- `docs/phase_[x]_build_plan.md` — Your specific plan

---

**End of Builder Mode**
