# Claude Rules - Finding Good V2

This file contains learned rules and patterns for Claude sessions.
Update this file as we discover what works and what doesn't.

**Last Updated:** January 16, 2026

---

## Session Start Checklist

Every Claude session should begin with:

1. Read this file (CLAUDE_RULES.md)
2. Read CLAUDE.md for project context
3. Run `git status` and `git log --oneline -5`
4. **If this is a BUILD session:** Read BUILD_PROTOCOL.md and the relevant Build Document
5. Ask what Brian wants to work on
6. Understand the goal before writing code

---

## Build System (Added Jan 17, 2026)

### Key Files
- `docs/BUILD_PROTOCOL.md` - How to execute builds (SPEC → SCAFFOLD → IMPLEMENT → VALIDATE → POLISH)
- `docs/PATTERNS_LIBRARY.md` - Reusable patterns and mistakes to avoid
- Build Documents come from Brian via `fg-command-center/builds/active/`

### Build Session Rules
1. **Always follow BUILD_PROTOCOL.md** - Don't skip phases
2. **Validate each layer before moving to next** - DB ✓ → Edge ✓ → Shared ✓ → UI ✓
3. **Hard restart between IMPLEMENT and VALIDATE** - Fresh context for testing
4. **Stop and ask when stuck > 15 minutes** - Don't spin
5. **Post-mortem after every build** - Learnings go to PATTERNS_LIBRARY.md

### When a Build Document Exists
- The Build Document is the source of truth for scope
- Don't expand scope without Brian's approval
- Track progress in the Build Document's Progress Tracker section

---

## Core Principles

### 1. Small Commits, Often
- Commit after every working state
- Never leave a session with uncommitted work
- Commit message format: `Add:`, `Fix:`, `Update:`, `Remove:`

### 2. One Repo Only
- All work happens in `finding-good-v2`
- Never create new standalone repos
- Never clone duplicates

### 3. Explain While Building
- Brian learns by doing - explain decisions as you make them
- Don't just write code; teach what it does and why
- Connect technical choices to business goals

### 4. Check Before Assuming
- Read existing code before modifying
- Check git status before starting work
- Verify file exists before editing

---

## Brian-Specific Patterns

### His Learning Style
- "Doing to understand" - prefers building over planning
- Scatters easily - help him focus on one thing at a time
- Values self-awareness - point out patterns you notice

### When He Brings New Ideas
Ask: "Does this advance what's already in motion, or is it a new direction?"
- If it advances current work → proceed
- If it's new → help him decide if now is the time

### His Core Belief (Remind When He Drifts)
"Everything a person needs is already within them - it just needs drawn out."

### Business Context
- Goal: $1M through speaking + coaching + apps
- Current: 3-4 clients at $6-8k/month
- Leverage: Enterprise licensing, not more 1:1 clients

---

## Technical Rules

### File Locations
- Working repo: `C:\Users\bfret\finding-good-v2`
- NOT in OneDrive (causes sync issues with node_modules)
- Backup is GitHub, not local copies

### Ports (When Running Locally)
- Dashboard: 3001
- Priority: 3002
- Prove: 3003
- Predict: 3004
- Together: 3005

### Database
- Single Supabase instance for all apps
- Migrations go in `supabase/migrations/`
- Test schema changes before committing

### Never Commit
- `.env` files (secrets)
- `node_modules/` (installed via pnpm)
- `dist/` (build output)
- `tmpclaude-*` (temp files)

---

## Learned Lessons

### January 16, 2026 - Migration Cleanup
- **Problem:** Multiple duplicate folders of same repo at different states
- **Cause:** Previous sessions started migrations but never committed
- **Solution:** Always commit before session ends; created MIGRATION_PLAN.md as resumable checklist
- **Rule Added:** If a task might span sessions, create a checklist file that any Claude can pick up

### January 16, 2026 - Context Window Limits
- **Problem:** Long sessions run out of context, lose track of progress
- **Solution:** Create resumable documentation (MIGRATION_PLAN.md pattern)
- **Rule Added:** For multi-step tasks, create a status file with checkboxes

---

## Anti-Patterns to Avoid

1. **Don't create new repos** - Everything goes in the monorepo
2. **Don't make massive changes without intermediate commits** - Small steps
3. **Don't assume previous session context** - Always check current state
4. **Don't leave work uncommitted** - Always push before session ends
5. **Don't skip reading existing code** - Understand before modifying

---

## How to Update This File

When you learn something new that should be a rule:

1. Add it to the appropriate section
2. If it came from a specific incident, add to "Learned Lessons" with date
3. Commit with message: `Update: Add rule about [topic] to CLAUDE_RULES.md`

---

## Questions to Ask Brian

When unclear about direction:
- "What's the most important thing to finish this week?"
- "Does this connect to revenue, or is it infrastructure?"
- "Who will use this feature - coaches, clients, or enterprise?"
