# BUILD PROTOCOL
## How Claude Code Executes Builds

**Purpose:** This protocol ensures focused, phase-based builds with validation checkpoints. Claude Code follows this automatically when a Build Document is provided.

---

## The Five Phases

Every build follows this sequence. **Do not skip phases. Do not combine phases.**

```
SPEC → SCAFFOLD → IMPLEMENT → VALIDATE → POLISH
```

---

## Phase 1: SPEC (Alignment)

**Goal:** Confirm we're building the right thing before writing code.

**Claude Code actions:**
1. Read the Build Document completely
2. Restate in your own words: "Here's what I understand we're building..."
3. Identify any ambiguities or gaps
4. Ask clarifying questions BEFORE proceeding
5. Confirm acceptance criteria are testable

**Exit criteria:**
- [ ] Brian has confirmed the spec is accurate
- [ ] All acceptance criteria are specific and testable
- [ ] Data shapes are defined
- [ ] Integration points are identified

**Validation prompt:**
> "Before I scaffold, let me confirm: [restate spec]. The acceptance criteria are: [list]. I'll know it's done when: [specific tests]. Is this right?"

---

## Phase 2: SCAFFOLD (Structure)

**Goal:** Create all files across all layers. Nothing works yet—just the skeleton.

**Claude Code actions:**
1. Create database migration file (if needed)
2. Create edge function file (if needed)
3. Create/update shared types (if needed)
4. Create component files with stub exports
5. Create hook files with stub exports
6. **Do NOT implement logic yet**

**Layer order:**
```
Database → Edge Function → Shared Types → Shared Hooks → App Components
```

**Exit criteria:**
- [ ] All files exist in correct locations
- [ ] Imports resolve (no red squiggles on imports)
- [ ] Types are defined (even if minimal)
- [ ] App compiles (even if components are empty)

**Validation prompt:**
> "Scaffold complete. Files created: [list]. All imports resolve. Ready to implement. Should I proceed with [first layer]?"

---

## Phase 3: IMPLEMENT (Build)

**Goal:** Fill in the logic, one layer at a time.

**Layer sequence with mini-validations:**

### 3a. Database
- Write migration SQL
- Run migration locally or push to Supabase
- **STOP AND VERIFY:** Query the table, confirm structure

### 3b. Edge Function
- Implement the function logic
- Deploy to Supabase
- **STOP AND VERIFY:** Test endpoint with curl/Postman, confirm response

### 3c. Shared Package
- Implement types fully
- Implement hooks
- **STOP AND VERIFY:** Import into app, confirm no type errors

### 3d. App UI
- Implement components
- Wire up hooks and state
- **STOP AND VERIFY:** Run app, confirm renders

**Critical rule:** Complete one layer's mini-validation before starting the next.

**Validation prompt (per layer):**
> "[Layer] complete. Verified by: [what you tested]. Moving to [next layer]. Proceed?"

---

## Phase 4: VALIDATE (Integration)

**Goal:** Test the full flow against acceptance criteria.

**Claude Code actions:**
1. Walk through each acceptance criterion
2. Test the happy path end-to-end
3. Test at least one error/edge case
4. Check data persistence (did it save to Supabase?)
5. Document any issues found

**Exit criteria:**
- [ ] All acceptance criteria pass
- [ ] Data flows correctly from UI → Edge Function → Database
- [ ] Data flows correctly from Database → UI
- [ ] No console errors
- [ ] No type errors

**Validation prompt:**
> "Validation complete. Results: [pass/fail per criterion]. Issues found: [list or none]. Ready to polish or need fixes?"

---

## Phase 5: POLISH (Cleanup)

**Goal:** Handle edge cases, improve error handling, clean up code.

**Claude Code actions:**
1. Add error handling where missing
2. Add loading states where missing
3. Remove console.logs and debugging code
4. Add comments to complex logic
5. Update any affected documentation
6. Commit with clear message

**Exit criteria:**
- [ ] No TODO comments left unaddressed
- [ ] Error states handled gracefully
- [ ] Loading states present
- [ ] Code is readable
- [ ] Changes committed and pushed

**Final prompt:**
> "Build complete. Summary: [what was built]. Files changed: [list]. Commit: [hash]. Ready for post-mortem?"

---

## Context Window Management

### When to do a HARD RESTART:

1. After completing IMPLEMENT phase (before VALIDATE)
2. If context feels cluttered with old errors/attempts
3. If Claude starts repeating mistakes
4. After any phase that took more than 30 minutes of troubleshooting

### Hard Restart Protocol:

1. Commit all working code: `git add . && git commit -m "WIP: [phase] complete"`
2. Push: `git push`
3. Update Build Document with current status
4. Exit Claude Code
5. Start new Claude Code session
6. First message: "Read BUILD_PROTOCOL.md and [Build Document]. We're at [phase]. Continue."

### Soft Checkpoint (within session):

Use when switching layers within IMPLEMENT:
> "Checkpoint: [layer] complete and verified. Clearing mental context. Now focusing only on [next layer]."

---

## Escalation Rules

**When to STOP and ask Brian:**

1. Spec ambiguity discovered mid-build
2. Existing code contradicts the spec
3. A "simple" fix is taking more than 15 minutes
4. You're about to modify shared code that affects other apps
5. You're unsure if a change is safe

**Prompt:**
> "Stopping for input. I encountered [issue]. Options I see: [A, B, C]. My recommendation: [X]. What do you want to do?"

---

## Commit Message Format

```
[PHASE] Brief description

- Specific change 1
- Specific change 2

Build: [Build Document name]
```

Example:
```
[IMPLEMENT] Add recognition flow to Priority app

- Created recognitions table migration
- Added recognition-analyze edge function
- Built RecognitionCard component
- Wired up to Campfire display

Build: Campfire_Recognition_Jan2026
```

---

## Quick Reference

| Phase | Goal | Exit Gate |
|-------|------|-----------|
| SPEC | Alignment | Brian confirms understanding |
| SCAFFOLD | Structure | All files exist, imports resolve |
| IMPLEMENT | Build | Each layer verified before next |
| VALIDATE | Integration | All acceptance criteria pass |
| POLISH | Cleanup | Code clean, committed, pushed |

---

*This protocol lives in finding-good-v2/docs/ and should be referenced at the start of every Claude Code build session.*
