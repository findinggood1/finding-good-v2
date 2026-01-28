# Together/Campfire Handoff Document

**Session Date:** January 17, 2026  
**Duration:** ~2 hours  
**Status:** P0 + P1 Complete, pushed to origin/master

---

## What Was Built

### Together App — 4-Page Exchange Hub

| Page | URL | Features |
|------|-----|----------|
| **Home** | `/` | Predictability score (75), FIRES grid with zones, activity counts, this week's evidence, "noticing in others" section |
| **Exchange** | `/exchange` | Growth edge card (Feelings/Discovering), exchange impact tracking, active asks |
| **Campfire** | `/campfire` | Circle feed (empty state with CTA), pending asks section |
| **Map** | `/map` | Activity counts (all-time), yours vs others FIRES comparison |

### New Database Tables

| Table | Purpose |
|-------|---------|
| `exchange_impacts` | Records when someone marks content with impact level (helpful/meaningful/high_impact) |
| `recognized_entries` | Records when someone "recognizes" an entry |
| `predictions.question` | New column for user's core question |

### Files Created

- **34 new files** (~1,400 lines)
- **7 hooks:** useActivityCounts, useExchangeImpacts, useYoursVsOthers, useTrajectory, usePendingAsks, useThisWeeksEvidence, useNoticingInOthers
- **15+ components:** PredictabilityCard, FiresGrid, FeedCard, GrowthEdgeCard, TrajectoryChart, YoursVsOthersChart, etc.
- **4 pages:** HomePage, ExchangePage, CampfirePage, MapPage (all rewritten)

### Git Commits

```
4c1390d [SCAFFOLD] Create Together app file structure
[hash]  [IMPLEMENT] Database layer verified
[hash]  [IMPLEMENT] P0 hooks verified with data
[hash]  [IMPLEMENT] Layer 3c - UI components wired to HomePage
[hash]  [IMPLEMENT] P0 complete - Home, Campfire, Map pages wired
[hash]  [IMPLEMENT] P1 complete - Exchange page + actions
[hash]  [VALIDATE] Browser verification complete
[hash]  [POLISH] Together app ready for testing
```

---

## Known Issues

### 1. Trajectory Chart Shows Empty State

**Symptom:** Map page shows "Take more snapshots to see your journey" despite hook returning 13 data points.

**Evidence:** Console log showed `[useTrajectory] points: 13`

**Likely cause:** Component not receiving/rendering the data correctly. Quick fix — check TrajectoryChart.tsx props.

**Priority:** Low (doesn't block core functionality)

### 2. Can't Test Recognized/Impact Actions

**Reason:** Marcus has no circle members, so no feed items to interact with.

**Fix:** Either create test exchange data or test after Priority/Proof share toggles are built.

---

## What's NOT Built (P2 + Separate Builds)

### P2 — Enhancement Layer (Together)

| Feature | Description |
|---------|-------------|
| AI synthesis | Thread, themes, trends extraction |
| Cross-user FIRES matching | "Who can help you" / "Where your experience has value" |
| Custom metrics | Goal-specific dashboards |

### Separate Builds — Other Apps

| App | Changes Needed |
|-----|----------------|
| **Priority** | Share to Campfire toggle, "Recognized" capability, impact level on receive |
| **Proof** | Share to Campfire toggle, link to prediction |
| **Predict** | The Question field, share prediction summary |

These changes populate the Campfire feed and enable the exchange loop.

---

## Deployment Steps

### 1. Verify Production Build

```bash
cd C:\Users\bfret\finding-good-v2\apps\together
pnpm build
```

Should complete without errors (already verified: 456KB bundle).

### 2. Deploy to Vercel (or current host)

If using Vercel:
```bash
vercel --prod
```

Or push to deploy branch if auto-deploy is configured.

### 3. Verify Production

- Go to https://together.findinggood.com
- Login as Marcus (info@findinggood.com)
- Check all 4 pages render

### 4. Update Supabase Redirect URLs

If production URL changed, add to Supabase Auth:
```
https://together.findinggood.com
https://together.findinggood.com/auth/callback
```

---

## UX Feedback Questions for the Group

### General

1. Does the 4-page structure make sense? (Home / Exchange / Campfire / Map)
2. Is it clear what each page is for?
3. What's missing that you expected to see?

### Home Page

4. Does the Predictability score feel meaningful? What would make it more useful?
5. Is the FIRES grid understandable without explanation?
6. Does "This Week's Evidence" show the right things?

### Exchange Page

7. Does "Growth Edge" make sense as a concept?
8. What would make you actually use the Exchange Impact feature?

### Campfire Page

9. Does the empty state ("Your campfire is warming up") motivate or discourage?
10. What would make you want to "Send a Recognition"?

### Map Page

11. Is "Yours vs Others" comparison valuable or confusing?
12. What would make the trajectory chart meaningful?

### Overall

13. On a scale of 1-10, how likely would you use this daily/weekly?
14. What's the ONE thing that would make this more useful?

---

## Resume Prompt for Next Session

### For P2 Features:

```
Resuming Together/Campfire build.

Completed: P0 + P1 (all committed and pushed)
- 4 pages working: Home, Exchange, Campfire, Map
- Database tables: exchange_impacts, recognized_entries
- Actions: recognizeEntry(), recordImpact()

Known issue: Trajectory chart shows empty state despite 13 data points (investigate TrajectoryChart.tsx)

Ready for P2:
1. AI synthesis (themes, trends, thread)
2. Cross-user FIRES matching
3. Fix trajectory chart display

Start with the trajectory chart fix, then proceed to P2 features.
```

### For Deployment Only:

```
Deploying Together app to production.

Build is complete and pushed to origin/master.
Bundle: 456KB (gzip: 123KB)

Steps:
1. Run production build verification
2. Deploy to Vercel/hosting
3. Verify all 4 pages work on production URL
4. Confirm Supabase redirect URLs include production domain
```

### For Priority/Proof Share Toggles:

```
Starting Priority/Proof share toggle build.

Context: Together app is built and needs feed data. 
Priority and Proof apps need share toggles to populate the Campfire feed.

Reference: Together_Campfire_Design_Spec_v1.md - Part 4: Required Changes to Other Apps

Changes needed:
- Priority: share_to_feed toggle at completion, default ON
- Proof: share_to_feed toggle at completion, default ON
- Both: FIRES visible on entries, question prompts

Start with Priority app changes.
```

---

## File Locations

| Document | Location |
|----------|----------|
| Build doc | `BUILD_Together_Campfire_Jan2026.md` (uploaded to chat) |
| Design spec | `Together_Campfire_Design_Spec_v1.md` (uploaded to chat) |
| Mockup | `together-mockup.jsx` (uploaded to chat) |
| Session guide | `Together_Build_Session_Guide.md` (created this session) |
| This handoff | `Together_Campfire_Handoff_Jan17_2026.md` |

---

## Local Dev Setup Reminder

```bash
cd C:\Users\bfret\finding-good-v2\apps\together
pnpm dev
# Runs on localhost:3005 (or 3006 if 3005 in use)
```

Supabase redirect URLs configured:
- `http://localhost:3005`
- `http://localhost:3005/auth/callback`
- `http://localhost:3006`
- `http://localhost:3006/auth/callback`

---

**End of Handoff**
