# Finding Good: Collaboration Protocol

**Created:** January 27, 2026  
**Purpose:** Define how Desktop Claude and Claude Code work together on builds  
**Rule:** Both Claudes should read this at session start

---

## Roles

### Desktop Claude (Strategy & Validation)

**Primary responsibilities:**
- Help Brian design and plan before building
- Validate what Claude Code produces at each checkpoint
- Answer questions during the build process
- Catch scope drift or architectural issues
- Flag when something looks off before continuing
- Identify process improvements

**Desktop Claude does NOT:**
- Write code or make file changes (preserves context window for strategy)
- Execute builds
- Run terminal commands for building (reading/validating is fine)

**Desktop Claude actively looks for:**
- Patterns worth extracting into skills
- MCPs that could streamline builds
- Repetitive tasks that could be automated
- Friction points in the workflow
- Better ways to structure checkpoints

---

### Claude Code (Execution)

**Primary responsibilities:**
- Execute builds according to plan docs
- Stop at each checkpoint for validation
- Commit and push changes
- Create handoff docs at session end
- Ask Desktop (via Brian) when encountering ambiguity

**Claude Code workflow:**
1. Read the build plan doc first
2. Check pre-build requirements (app runs, schema exists, etc.)
3. Execute checkpoint tasks
4. **STOP** after each checkpoint — wait for "continue" from Brian
5. At session end: commit, push, create handoff doc

**Claude Code does NOT:**
- Continue past checkpoints without validation
- Make architectural decisions without checking plan
- Skip the pre-flight checklist

---

## Checkpoint Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    CHECKPOINT FLOW                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Claude Code: Completes checkpoint tasks                │
│       ↓                                                 │
│  Claude Code: Reports what changed + any issues         │
│       ↓                                                 │
│  Claude Code: STOPS (does not continue)                 │
│       ↓                                                 │
│  Brian: Shares output with Desktop Claude               │
│       ↓                                                 │
│  Desktop Claude: Validates from code review             │
│       ↓                                                 │
│  Desktop Claude: Lists what Brian should verify in UI   │
│       ↓                                                 │
│  Brian: Tests in dev mode                               │
│       ↓                                                 │
│  Brian: Reports results (pass / issues found)           │
│       ↓                                                 │
│  If pass → Brian tells Claude Code "continue"           │
│  If issues → Fix before continuing                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Claude Code Capabilities

### MCP Access

| MCP | Capability | Use For |
|-----|------------|---------|
| **Supabase** | Direct database queries, schema inspection, run migrations | Verify tables exist, check structure, create new tables |
| **GitHub** | Commit, push, branch operations | Version control without manual git commands |
| **Desktop Commander** | File operations | Read/write files in the monorepo |

### Implications

- Claude Code can verify schema before building (no need to assume)
- Claude Code can check if tables exist before creating them
- Claude Code can run migrations directly
- No need to manually run SQL in Supabase dashboard
- Commits can happen programmatically at checkpoints

### Pre-Flight Checklist (Every Session)

Before starting any checkpoint, Claude Code should:

1. **Verify app runs:** `pnpm dev` or check localhost responds
2. **Check TypeScript:** `pnpm tsc --noEmit` passes
3. **Read build plan:** Load the phase doc for context
4. **Check schema:** If build needs specific tables, verify they exist via Supabase MCP
5. **Check for uncommitted changes:** `git status`

---

## Session Start Protocol

### For Desktop Claude

```
1. Ask what phase/checkpoint we're on
2. Read the relevant build plan doc
3. Read any recent handoff docs
4. Understand current state before advising
```

### For Claude Code

**Standard session start prompt:**
```
Starting [Phase X]: [Description]

Read these files first:
- docs/[phase]_build_plan.md (primary guide)
- docs/COLLABORATION_PROTOCOL.md (how we work)
- docs/handoffs/[previous_phase]_complete.md (context)
- docs/naming_concordance.md (if doing UI work)

Pre-flight checklist:
1. Verify app runs at localhost:[port]
2. Check TypeScript compiles
3. Check git status
4. [Phase-specific checks]

Then start Checkpoint 1: [Name]

STOP after each checkpoint for validation.
```

---

## Session End Protocol

Before exiting Claude Code:

1. **Check git status** — Any uncommitted changes?
2. **Commit all changes** — With descriptive message: "[Phase] complete: [description]"
3. **Push to origin** — Backup the work
4. **Create handoff doc** — `docs/handoffs/[phase]_complete.md`

**Handoff doc should include:**
- What was built (files created/modified)
- What works now
- Known limitations or TODOs
- Any issues for next session
- Date completed

**Session end prompt:**
```
[Phase] is validated and complete. Before I exit:

1. Check git status - show uncommitted changes
2. Commit everything with message: "[Phase] complete: [description]"  
3. Push to origin
4. Create handoff doc at docs/handoffs/[phase]_complete.md with:
   - Files created/modified
   - What works now
   - Known limitations/TODOs for next phase
   - Date completed

Show git output and confirm handoff created.
```

---

## Validation Protocol

### What Desktop Claude Can Validate (From Code)

- File exists and has expected structure
- Imports are correct
- Props/interfaces match spec
- Routes are wired correctly
- TypeScript compiles
- Logic appears correct

### What Brian Must Validate (In Browser)

- Visual rendering correct
- Interactions work (click, expand, submit)
- Data saves to database
- Navigation flows work
- No console errors
- Mobile responsive (if applicable)

### Validation Report Format

Desktop Claude reports like this:

```markdown
## Checkpoint [N] Validation

### ✅ Confirmed From Code
- [thing checked] — [status]
- [thing checked] — [status]

### ⚠️ Observations (Not Blockers)
- [thing noticed that might matter later]

### 🔍 Verify in Dev Mode
- [ ] [specific thing to test]
- [ ] [specific thing to test]

### Verdict
[Ready to continue / Needs fixes first]
```

---

## Process Improvement Tracking

Desktop Claude tracks improvement opportunities here. When identified:

1. Name the improvement
2. Estimate effort vs payoff  
3. Suggest when to implement (now vs. after current phase)
4. Add to this section or create separate doc

### Identified Improvements

| Improvement | Type | Effort | Payoff | Status |
|-------------|------|--------|--------|--------|
| Pre-flight checklist automation | Prompt/Skill | Low | Medium | Documented above |
| Handoff template standardization | Doc | Low | High | Done (this doc) |
| Test persona data seeding | Script | Medium | High | Pending |
| Schema verification before build | Process | Low | High | Documented above |

### Ideas to Explore

- Component library documentation (what exists in @finding-good/shared)
- Visual regression testing
- Automated checkpoint validation where possible
- Build packet generator from specs

---

## Communication Patterns

### When Claude Code Should Ask (Via Brian)

- Architectural decisions not covered in plan
- Conflicts between plan and existing code
- Missing information needed to proceed
- Multiple valid approaches — which to choose?

### When Desktop Claude Should Flag

- Scope creep (building more than planned)
- Pattern that will cause problems later
- Missing edge case handling
- Inconsistency with other parts of system

### Quick Signals

| Signal | Meaning |
|--------|---------|
| ✅ | Validated, good to continue |
| ⚠️ | Observation, not blocking |
| 🔍 | Needs manual verification |
| 🛑 | Stop, issue must be resolved |
| 💡 | Process improvement idea |

---

## File Locations

| Doc | Purpose | Location |
|-----|---------|----------|
| Build plans | Phase-by-phase instructions | `docs/phase_[x]_build_plan.md` |
| Handoffs | Session completion summaries | `docs/handoffs/` |
| Naming concordance | Old→new name mappings | `docs/naming_concordance.md` |
| Database rules | Schema change safety | `docs/Finding_Good_Database_Rules.md` |
| Ecosystem map | How tools connect | `docs/ECOSYSTEM.md` |
| This doc | Collaboration protocol | `docs/COLLABORATION_PROTOCOL.md` |

---

**End of Collaboration Protocol**
