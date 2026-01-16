# Development Rules - Finding Good V2

## The Golden Rules

1. **One repo only** - All work happens in `finding-good-v2`. No new standalone repos.
2. **Commit often** - Small, frequent commits beat big scary ones.
3. **Branch for features** - Never work directly on `master` for anything substantial.
4. **Test before push** - Run the app locally before pushing.
5. **Update docs** - If you change how something works, update CLAUDE.md or relevant docs.

---

## Git Workflow

### For Small Fixes (typos, quick bug fixes)
```bash
# Work directly on master
git add .
git commit -m "Fix: description of fix"
git push
```

### For Features or Significant Changes
```bash
# Create a branch
git checkout -b feature/description-of-feature

# Work, commit often
git add .
git commit -m "Add: description"

# When ready, push branch
git push -u origin feature/description-of-feature

# Vercel creates preview URL automatically
# Test the preview URL

# When confirmed working, merge to master
git checkout master
git pull
git merge feature/description-of-feature
git push

# Delete the branch
git branch -d feature/description-of-feature
```

### Commit Message Format
- `Add:` New feature or file
- `Fix:` Bug fix
- `Update:` Change to existing feature
- `Remove:` Deleted code or feature
- `Refactor:` Code change that doesn't change behavior
- `Docs:` Documentation only

---

## Starting a Work Session

### For Claude Sessions
1. Claude reads `CLAUDE.md` first
2. Claude checks `git status` to see current state
3. Claude reads relevant app's code before making changes
4. Work in small increments, commit after each working state

### For Brian (or any human)
1. `cd C:\Users\bfret\finding-good-v2`
2. `git pull` (get latest)
3. `pnpm install` (if dependencies changed)
4. `pnpm dev` (start all apps)
5. Work on what you need

---

## App-Specific Ports

When running `pnpm dev`, apps run on these ports:

| App | Port | URL |
|-----|------|-----|
| dashboard | 3001 | http://localhost:3001 |
| priority | 3002 | http://localhost:3002 |
| prove | 3003 | http://localhost:3003 |
| predict | 3004 | http://localhost:3004 |
| together | 3005 | http://localhost:3005 |

---

## Before Pushing to Production

### Checklist
- [ ] App runs locally without errors
- [ ] No TypeScript errors (`pnpm build` succeeds)
- [ ] Tested the specific feature/fix manually
- [ ] Committed with clear message
- [ ] If database changes: migration file added to `supabase/migrations/`

### Preview Deploys
Vercel automatically creates preview URLs for branches. Use these to test before merging to master.

---

## File Organization

### Where Things Go

| Type | Location |
|------|----------|
| New app | `apps/[app-name]/` |
| Shared component | `packages/shared/src/components/` |
| Shared hook | `packages/shared/src/hooks/` |
| Shared types | `packages/shared/src/types/` |
| Database migration | `supabase/migrations/` |
| Documentation | `docs/` |
| App-specific docs | `apps/[app-name]/README.md` |

### What NOT to Commit
- `.env` files (contain secrets)
- `node_modules/` (installed via pnpm)
- `dist/` (build output)
- `tmpclaude-*` (Claude temp files)

---

## Database Changes

### Adding a New Table
1. Create migration file: `supabase/migrations/YYYYMMDD_description.sql`
2. Include CREATE TABLE and RLS policies
3. Test locally or in Supabase dashboard
4. Commit the migration file

### Modifying Existing Table
1. Create migration file with ALTER TABLE
2. Update any affected TypeScript types
3. Update any affected queries in apps
4. Commit everything together

---

## When Stuck

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules
pnpm install
pnpm dev
```

### Git Conflicts
```bash
# See what's conflicting
git status

# If you want to keep your changes
git stash
git pull
git stash pop
# Resolve conflicts manually
```

### Unknown State
```bash
# See recent history
git log --oneline -10

# See what's changed
git status
git diff
```

---

## Claude-Specific Rules

### DO
- Read CLAUDE.md at start of session
- Check git status before making changes
- Make small, incremental changes
- Commit after each working state
- Explain what you're doing and why

### DON'T
- Create new repos or folders outside monorepo
- Make massive changes without committing intermediate states
- Leave work uncommitted at end of session
- Assume previous session's context carries over
