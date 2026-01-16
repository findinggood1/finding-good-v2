# Finding Good Monorepo Migration

## STATUS: IN PROGRESS
**Last Updated:** January 16, 2026
**Current Step:** 1 of 7

---

## THE PLAN

| Step | Task | Status |
|------|------|--------|
| 1 | Clean tmpclaude files from all repos | 🔄 IN PROGRESS |
| 2 | Update .gitignore files to prevent future clutter | ⬜ NOT STARTED |
| 3 | Commit untracked files in finding-good-v2 | ⬜ NOT STARTED |
| 4 | Copy dashboard into apps/dashboard | ⬜ NOT STARTED |
| 5 | Copy prove tool into apps/prove | ⬜ NOT STARTED |
| 6 | Update pnpm workspace config | ⬜ NOT STARTED |
| 7 | Test and verify | ⬜ NOT STARTED |

---

## STEP 1: Clean tmpclaude files

Run these commands in PowerShell:

```powershell
# Clean finding-good-v2
Get-ChildItem -Path "C:\Users\bfret\finding-good-v2" -Filter "tmpclaude-*" -Recurse | Remove-Item

# Clean fgdashboard-v1
Get-ChildItem -Path "C:\Users\bfret\fgdashboard-v1" -Filter "tmpclaude-*" -Recurse | Remove-Item

# Clean proof-tool-v2
Get-ChildItem -Path "C:\Users\bfret\proof-tool-v2" -Filter "tmpclaude-*" -Recurse | Remove-Item

# Clean Projects prove tool
Get-ChildItem -Path "C:\Users\bfret\Projects\finding-good-prove-tool" -Filter "tmpclaude-*" -Recurse | Remove-Item

# Clean root-level prove tool
Get-ChildItem -Path "C:\Users\bfret\finding-good-prove-tool" -Filter "tmpclaude-*" -Recurse | Remove-Item

# Clean user home directory temp files
Get-ChildItem -Path "C:\Users\bfret" -Filter "tmpclaude-*" | Remove-Item
```

---

## STEP 2: Update .gitignore files

Add these lines to .gitignore in each repo:

```
# Claude temp files
tmpclaude-*
```

Repos to update:
- [ ] C:\Users\bfret\finding-good-v2\.gitignore
- [ ] C:\Users\bfret\fgdashboard-v1\.gitignore

---

## STEP 3: Commit untracked files in finding-good-v2

```powershell
cd C:\Users\bfret\finding-good-v2
git add scripts/create-outcome-table.mjs
git add scripts/insert-test-personas.js
git add scripts/verify-personas.js
git add docs/testing/
git commit -m "Add test scripts and testing docs"
git push
```

---

## STEP 4: Copy dashboard into monorepo

```powershell
# Create the dashboard app folder
mkdir C:\Users\bfret\finding-good-v2\apps\dashboard

# Copy source files (not node_modules or dist)
Copy-Item "C:\Users\bfret\fgdashboard-v1\src" "C:\Users\bfret\finding-good-v2\apps\dashboard\src" -Recurse
Copy-Item "C:\Users\bfret\fgdashboard-v1\public" "C:\Users\bfret\finding-good-v2\apps\dashboard\public" -Recurse
Copy-Item "C:\Users\bfret\fgdashboard-v1\index.html" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\package.json" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\vite.config.ts" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\tailwind.config.ts" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\tsconfig*.json" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\postcss.config.js" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\components.json" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\eslint.config.js" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\.env" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\vercel.json" "C:\Users\bfret\finding-good-v2\apps\dashboard\"
Copy-Item "C:\Users\bfret\fgdashboard-v1\supabase" "C:\Users\bfret\finding-good-v2\apps\dashboard\supabase" -Recurse
```

After copying, update package.json name to "@finding-good/dashboard"

---

## STEP 5: Copy prove tool into monorepo

```powershell
# Create the prove app folder
mkdir C:\Users\bfret\finding-good-v2\apps\prove

# Copy source files
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\src" "C:\Users\bfret\finding-good-v2\apps\prove\src" -Recurse
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\public" "C:\Users\bfret\finding-good-v2\apps\prove\public" -Recurse
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\index.html" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\package.json" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\vite.config.ts" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\tailwind.config.js" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\tsconfig*.json" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\postcss.config.js" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\eslint.config.js" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\.env" "C:\Users\bfret\finding-good-v2\apps\prove\"
Copy-Item "C:\Users\bfret\Projects\finding-good-prove-tool\vercel.json" "C:\Users\bfret\finding-good-v2\apps\prove\"
```

After copying, update package.json name to "@finding-good/prove"

---

## STEP 6: Update pnpm workspace

Edit C:\Users\bfret\finding-good-v2\pnpm-workspace.yaml to include:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Then run:
```powershell
cd C:\Users\bfret\finding-good-v2
pnpm install
```

---

## STEP 7: Test and verify

```powershell
cd C:\Users\bfret\finding-good-v2
pnpm dev
```

Check each app runs on its port:
- [ ] localhost:3001 - dashboard
- [ ] localhost:3002 - priority
- [ ] localhost:3003 - prove
- [ ] localhost:3004 - predict
- [ ] localhost:3005 - together

---

## BACKUP LOCATION

All critical untracked files backed up to:
C:\Users\bfret\finding-good-backup-jan16\

---

## IF YOU NEED TO RESUME

Tell Claude: "Read C:\Users\bfret\finding-good-v2\MIGRATION_PLAN.md and continue from where we left off"
