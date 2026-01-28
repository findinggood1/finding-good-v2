# Together Build Session

**Started:** January 26, 2026
**Status:** IN_PROGRESS

## Files I Own
- apps/together/src/**
- Route structure, pages, components within Together

## What Already Exists
- App.tsx with routing (using AppLayout + bottom nav)
- Permission tool pages: /focus (FocusSetupPage), /today (DailyCheckinPage)
- Hooks: usePermission, useDailyCheckin, useCampfire, useFeed, etc.
- Components: permission/*, campfire/*, home/*, map/*
- Pages: HomePage, CampfirePage, MapPage, ExchangePage, etc.
- Coach routes under /coach/*

## What Needs to Be Built

### P0 - Must Have
1. Sidebar navigation (DAILY/GIVE/BUILD/DIRECTION structure)
2. User role detection (user vs client)
3. Embedded tools at /priority, /proof, /predict routes
4. Conditional UI based on role (RoleGate, LockedFeature)
5. Circle tracker with check-in status
6. Campfire feed with Recognized button
7. Bridge question flow (check-in → Priority)

### P1 - Should Have
- Notifications section on Home
- "Inspire me" button on circle members
- Week history display after check-in
- Lock icons on Map/Chat for user role

## Checkpoints

- [x] Checkpoint 1: Sidebar renders + basic navigation works
- [x] Checkpoint 2: Embedded tools (/priority, /proof, /predict) work
- [ ] Checkpoint 3: Role detection + conditional UI
- [ ] Checkpoint 4: Home/Circle/Campfire enhanced
- [ ] Checkpoint 5: Full integration + done criteria met

## Checkpoint 1 Complete

### Files Created
- `src/components/layout/Sidebar.tsx` - Sidebar with DAILY/GIVE/BUILD/DIRECTION sections
- `src/components/layout/index.ts` - Layout component exports
- `src/pages/PriorityPage.tsx` - Placeholder for embedded Priority
- `src/pages/ProofPage.tsx` - Placeholder for embedded Proof
- `src/pages/PredictPage.tsx` - Placeholder for embedded Predict
- `src/pages/ProfilePage.tsx` - User profile page
- `src/pages/LearnPage.tsx` - Learn/help page
- `src/pages/ChatPage.tsx` - Chat placeholder (P2)

### Files Modified
- `src/components/AppLayout.tsx` - Added responsive sidebar (desktop) + bottom nav (mobile)
- `src/components/index.ts` - Added Sidebar export
- `src/pages/index.ts` - Added new page exports
- `src/App.tsx` - Added new routes, / redirects to /home

## Checkpoint 2 Complete

### Files Modified
- `src/pages/PriorityPage.tsx` - Full Priority tool embedded
  - Home view with "Name What Matters" CTA
  - Form view with 4 questions + AI analysis
  - Results view with Integrity Line + FIRES badges
  - History view showing past priorities
  - Share to Campfire toggle
  - Check-in flow integration (via URL params)

- `src/pages/ProofPage.tsx` - Full Proof tool embedded (WITH FIRES QUESTIONS)
  - Home view with "Build Your Proof" CTA
  - Goal input step (describe accomplishment)
  - Depth/intensity selection (light=3, balanced=4, deeper=5 questions)
  - FIRES questions flow: one question at a time with element badge
    - Feelings: "What felt satisfying?", "What feeling told you you were on track?", etc.
    - Influence: "What action made a difference?", etc.
    - Resilience: "What obstacle did you work around?", etc.
    - Ethics: "What value did you honor?", etc.
    - Strengths: "What skill did you rely on?", etc.
  - Results with validation signal, scores, FIRES detection, pattern
  - History view
  - Share to Campfire toggle
  - Local scoring (no edge function - computes results from answers)

- `src/pages/PredictPage.tsx` - Full 6-step wizard (PROPERLY MIGRATED from apps/predict)
  - List view showing user's predictions with predictability score
  - Step 1: Basic Info (title, type, description, what_matters_most)
  - Step 2: Future Story (6 FIRES questions with confidence ratings)
  - Step 3: Future Connections (up to 4 supporters)
  - Step 4: Past Story (6 FIRES questions with alignment ratings)
  - Step 5: Past Connections (up to 4 past supporters)
  - Step 6: Review (zones summary, connection count, what's next)
  - Progress indicator with step navigation
  - LocalStorage draft persistence
  - Full save logic with snapshots and connections tables

### Database Integration
- Priority: Saves to `priorities` table, calls `priority-analyze` edge function
- Proof: Saves to `validations` table (local scoring)
- Predict: Saves to `predictions`, `prediction_connections`, `snapshots` tables with calculated scores

## Notes
- Option A architecture: Tools embedded in Together (not separate apps)
- Permission tool already embedded (from Phase 2)
- Standalone apps (priority, prove, predict) become lead magnets

## Checkpoint 2.5 - Predict Fixes (Jan 26)

### Issues Fixed
1. **No final output** - After completing wizard, now shows results view with:
   - Predictability score (large display)
   - FIRES zones summary
   - Growth opportunity / Edge
   - 48-hour question
   - Support network summary
   - What's Next guidance

2. **Can't view prior predictions** - Clicking prediction card now opens detail view with:
   - Title, type, status, description
   - Predictability score with progress bar
   - FIRES zones visualization
   - Growth opportunity
   - Connection avatars

3. **Can't delete predictions** - Fixed with:
   - Delete button visible on hover (list) and in header (detail)
   - Confirmation modal with clear messaging
   - Cascade delete: connections → snapshots → prediction
   - Proper cleanup and navigation after delete

### Files Modified
- `src/pages/PredictPage.tsx` - Added results view, detail view, fixed delete

## Checkpoint 2.6 - Full AI Results (Jan 26)

### What Was Added
Full results view matching apps/predict standalone, including:

**Edge Function Integration**
- Calls `predict-analyze` edge function after wizard completion
- Runs in background (non-blocking) while results load
- Saves AI narrative to `snapshots.narrative` as JSON

**AI-Generated Content Now Displayed**
- **Clarity/Confidence/Alignment** - Progress bars with levels (strong/building/emerging) + rationales
- **Your Pattern** - Pattern name, exact quotes from user's responses, curiosity prompt
- **Your Edge** - Element, why it matters, the gap (future vs past quotes), meaning, question
- **Network** - AI-summarized supporters with roles, why they matter, who else to engage
- **Generate Insights** button - If narrative missing, user can trigger AI analysis

**Fallbacks**
- Shows static `growth_opportunity` and `question_48hr` if AI narrative not available
- Shows basic connection list if no AI network summary

### Files Modified
- `src/pages/PredictPage.tsx` - Full AI narrative integration (2000+ lines total)

### Navigation Update (Same Session)
- `src/components/layout/Sidebar.tsx`:
  - Added Campfire (/campfire) to DAILY
  - Added Exchange (/exchange) to GIVE
  - Moved Predict from DIRECTION to BUILD

## Checkpoint 2.7 - View Full Details + Detail View Parity (Jan 26)

### What Was Added

**1. View Full Details Expandable Section (Results View)**
- Collapsible section at bottom of results view
- Toggle button with chevron rotation animation
- When expanded shows:
  - Regenerate Insights button (re-runs AI analysis)
  - Alignment Assessment with 1-2-3-4 rating dots
  - Future Story with FIRES badges showing all answers
  - Past Story with FIRES badges showing all answers
  - Connection Details with names, relationships, involvement types

**2. Detail View Now Shows Full Content**
- Prior prediction detail view now matches results view completely
- Shows full Clarity/Confidence/Alignment breakdown with progress bars
- Shows Pattern section (name, quotes, curiosity)
- Shows Zone Summary with EDGE indicator
- Shows Your Edge section with gap analysis
- Shows Network section with AI summary
- Includes View Full Details expandable section
- Generate Insights button if AI narrative missing
- All the same content as freshly completed wizard results

### Files Modified
- `src/pages/PredictPage.tsx`:
  - Added `showFullDetails` state variable
  - Added View Full Details toggle button + expandable section to results view
  - Replaced simplified detail view with full results content

## Issues/Blockers
- Delete persistence requires RLS migration (`supabase/migrations/20260126_predictions_rls.sql`) to be run in Supabase
