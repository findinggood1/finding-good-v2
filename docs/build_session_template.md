# Build Session Template

**Copy this entire prompt into Claude Code when starting a build session.**  
**Replace all [BRACKETS] with actual values.**

---

## START OF PROMPT — COPY BELOW THIS LINE

```
# [TOOL NAME] BUILD SESSION

## CRITICAL: READ FIRST
Before doing anything, read: `docs/CLAUDE_CODE_BUILD_RULES.md`

## SESSION INFO
- Tool: [Tool name]
- Build Packet: `docs/build_packets/[XX]_[tool]_packet.md`
- Session File: Create `docs/build_sessions/[tool]_session.md`

## SCOPE LOCK

### ✅ I OWN (can create/modify)
- apps/[tool]/**
- [List any new shared components from build packet]

### 📖 I READ ONLY
- packages/shared/** (import existing, don't modify)
- docs/** (reference)
- apps/[other]/** (patterns only)

### 🚫 I DO NOT TOUCH
- apps/dashboard/** [remove if this IS the dashboard session]
- apps/together/** [remove if this IS the together session]
- apps/predict/** [remove if this IS the predict session]
- apps/priority/** [remove if this IS the priority session]
- apps/prove/** [remove if this IS the proof session]
- supabase/migrations/** (no schema changes)
- packages/shared/src/types/** (unless Foundation session)

## CHECKPOINTS — STOP AFTER EACH

### Checkpoint 1: [Description]
- [ ] [Specific testable criterion]
- [ ] [Specific testable criterion]
→ STOP. Show me what renders. Wait for "continue".

### Checkpoint 2: [Description]
- [ ] [Specific testable criterion]
- [ ] [Specific testable criterion]
→ STOP. Show me the data flow. Wait for "continue".

### Checkpoint 3: [Description]
- [ ] [Specific testable criterion]
- [ ] [Specific testable criterion]
→ STOP. Show me the full flow. Wait for "continue".

### Final: Done Criteria
- [ ] All items from build packet done criteria
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] BUILD_PROGRESS.md updated
- [ ] Session file marked COMPLETE
→ END SESSION. Show summary.

## PROBLEM PROTOCOL

If you encounter:
| Problem | Action |
|---------|--------|
| Need to modify shared component | STOP, ask me |
| Need schema change | STOP, flag 🔴 |
| Blocked by other tool | STOP, note it |
| Unclear requirement | STOP, ask me |
| Bug in existing code | Note it, work around, continue |

## STARTING STEPS

1. Read the build packet: `docs/build_packets/[XX]_[tool]_packet.md`
2. Create session file: `docs/build_sessions/[tool]_session.md`
3. Check for conflicts: Verify no other session owns my files
4. Report ready: Tell me what you're about to build
5. Wait for my "go" before writing code

## BUILD PACKET SUMMARY
[Paste the overview section from the build packet here, or just reference the file]

---

Ready? Read the build packet first, create the session file, then tell me your plan.
```

## END OF PROMPT — COPY ABOVE THIS LINE

---

## How To Use This Template

### Step 1: Copy the prompt above

### Step 2: Replace these placeholders:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `[TOOL NAME]` | Tool you're building | `PRIORITY` |
| `[tool]` | Lowercase tool name | `priority` |
| `[XX]` | Packet number | `04` |
| `[Description]` | What checkpoint verifies | `Basic UI renders` |
| `[Specific testable criterion]` | Pass/fail test | `Focus setup page loads` |

### Step 3: Remove irrelevant "DO NOT TOUCH" lines
If building Priority, remove the "apps/priority/**" line from DO NOT TOUCH.

### Step 4: Fill in checkpoints from build packet
Copy the checkpoint items from your specific build packet.

### Step 5: Paste into Claude Code and run

---

## Example: Filled-In Permission Session

```
# PERMISSION BUILD SESSION

## CRITICAL: READ FIRST
Before doing anything, read: `docs/CLAUDE_CODE_BUILD_RULES.md`

## SESSION INFO
- Tool: Permission
- Build Packet: `docs/build_packets/02_permission_packet.md`
- Session File: Create `docs/build_sessions/permission_session.md`

## SCOPE LOCK

### ✅ I OWN (can create/modify)
- apps/permission/** (new app)
- packages/shared/src/components/FocusItemCard.tsx (new)
- packages/shared/src/components/EngagementScore.tsx (new)

### 📖 I READ ONLY
- packages/shared/** (import existing)
- docs/**

### 🚫 I DO NOT TOUCH
- apps/dashboard/**
- apps/together/**
- apps/predict/**
- apps/priority/**
- apps/prove/**
- supabase/migrations/**

## CHECKPOINTS — STOP AFTER EACH

### Checkpoint 1: Focus Setup Page
- [ ] Page renders at /focus
- [ ] Can add Permission text
- [ ] Can add Practice text
- [ ] Can add up to 3 Focus items
→ STOP. Show me the page. Wait for "continue".

### Checkpoint 2: Data Persistence
- [ ] Permission saves to `permissions` table
- [ ] Focus items save as JSONB array
- [ ] Page loads existing data on refresh
→ STOP. Show me database writes. Wait for "continue".

### Checkpoint 3: Daily Check-in
- [ ] Check-in page renders at /today
- [ ] Shows user's Focus items
- [ ] Can mark completed + engagement score
- [ ] Saves to `daily_checkins` table
→ STOP. Show me full flow. Wait for "continue".

### Final: Done Criteria
- [ ] Bridge question appears after check-in
- [ ] All P0 items from packet complete
- [ ] No TypeScript errors
- [ ] BUILD_PROGRESS.md updated
→ END SESSION.

Ready? Read the build packet first, then tell me your plan.
```

---

## Quick Checklist Before Starting Any Session

- [ ] Build packet exists for this tool
- [ ] Confirmed which files I own
- [ ] Checked no other session is active on same files
- [ ] Have the done criteria clear
- [ ] Ready to STOP at checkpoints
