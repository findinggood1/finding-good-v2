# Phase A Build Plan: Navigation Structure

**Created:** January 27, 2026  
**Purpose:** Update nav labels, create placeholder pages, update routing  
**Estimated Time:** 1 session  
**Dependencies:** None (can start immediately)

---

## Objective

Restructure the Together app navigation to use the Four I's framework without breaking existing functionality. This phase is "scaffolding" — we're renaming and reorganizing, not rebuilding tools yet.

---

## Pre-Build Checklist

- [ ] Read `navigation_restructure_v1.md` for full context
- [ ] Read `naming_concordance.md` for all name mappings
- [ ] Verify Together app runs at localhost:3005
- [ ] Note current sidebar structure before changes

---

## Checkpoint 1: Create NavDropdown Component

**Goal:** Build a reusable dropdown nav component for Impact/Improve/Inspire

### Tasks

1. Create `apps/together/src/components/layout/NavDropdown.tsx`
   - Props: `icon`, `label`, `basePath`, `children`, `isLocked?`
   - Click on main item → expand/collapse dropdown
   - Shows indicator when any child route is active
   - Supports locked state (grayed out, no expand)

2. Export from `apps/together/src/components/layout/index.ts`

### Done Criteria
- [ ] NavDropdown component renders
- [ ] Click expands/collapses
- [ ] Active state shows when on child route
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 2: Update Sidebar Structure

**Goal:** Implement new navigation structure

### Tasks

1. Update `apps/together/src/components/layout/Sidebar.tsx`:

```
PRIMARY SECTION:
- Home (/) — icon: Home
- Campfire (/campfire) — icon: Flame
- Exchange (/exchange) — icon: Users

TOOLS SECTION (with dropdowns):
- Impact (/impact) — icon: Zap
  - About Impact (/impact)
  - For Yourself (/impact/self)
  - For Others (/impact/others)
- Improve (/improve) — icon: TrendingUp
  - About Improve (/improve)
  - For Yourself (/improve/self)
  - For Others (/improve/others)
- Inspire (/inspire) — icon: Sparkles
  - About Inspire (/inspire)
  - For Yourself (/inspire/self)
  - For Others (/inspire/others)

DIRECTION SECTION:
- Map (/map) — locked for non-clients
- Chat (/chat) — locked for non-clients

UTILITY SECTION (bottom):
- Profile (/profile)
- Learn (/learn)
```

2. Remove old nav items:
   - Remove: Today, My Focus
   - Remove: DAILY, GIVE, BUILD section headers
   - Remove: Recognize, Witness, Believe (replaced by tool dropdowns)

3. Add section labels:
   - No label for primary (Home/Campfire/Exchange)
   - "TOOLS" label above Impact/Improve/Inspire
   - "DIRECTION" label above Map/Chat

### Done Criteria
- [ ] Sidebar shows new structure
- [ ] Dropdowns expand/collapse
- [ ] Icons display correctly
- [ ] Locked items show lock icon
- [ ] Mobile nav updated to match (if applicable)
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 3: Create Placeholder Pages

**Goal:** Create basic placeholder pages for new routes so navigation doesn't break

### Tasks

Create these files in `apps/together/src/pages/`:

1. `HomePage.tsx` (will replace current home + today + focus)
   - Temporary content: "Home - Influence (Coming Soon)"
   - Import existing Focus data to show something

2. `ImpactLandingPage.tsx`
   - Shows: Title "IMPACT", brief description
   - Two cards: "For Yourself" → /impact/self, "For Others" → /impact/others

3. `ImpactSelfPage.tsx`
   - For now: Re-export or redirect to existing PriorityPage
   - Add comment: "// TODO: Rename from Priority to Impact"

4. `ImpactOthersPage.tsx`
   - For now: Re-export or redirect to existing Priority with mode=send
   - Add comment: "// TODO: Rename from Recognize to Impact Others"

5. `ImproveLandingPage.tsx`
   - Shows: Title "IMPROVE", brief description
   - Two cards: "For Yourself" → /improve/self, "For Others" → /improve/others

6. `ImproveSelfPage.tsx`
   - For now: Re-export existing ProofPage

7. `ImproveOthersPage.tsx`
   - For now: Re-export existing Proof with mode=send

8. `InspireLandingPage.tsx`
   - Shows: Title "INSPIRE", brief description
   - Two cards: "For Yourself" → /inspire/self, "For Others" → /inspire/others

9. `InspireSelfPage.tsx`
   - For now: Re-export existing PredictPage

10. `InspirelOthersPage.tsx`
    - For now: Re-export existing Predict with mode=send

11. `ExchangePage.tsx`
    - Temporary content: "Exchange (Coming in Phase D)"
    - Basic layout placeholder

### Done Criteria
- [ ] All placeholder pages created
- [ ] Each page renders without error
- [ ] Landing pages show two cards linking to self/others
- [ ] No duplicate component definitions
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 4: Update App.tsx Routes

**Goal:** Wire up all new routes

### Tasks

1. Update `apps/together/src/App.tsx`:

```tsx
// New route structure

// Home (replaces /, /home, /today, /focus)
<Route path="/" element={<HomePage />} />
<Route path="/home" element={<Navigate to="/" />} />

// Campfire (unchanged)
<Route path="/campfire" element={<CampfirePage />} />

// Exchange (new)
<Route path="/exchange" element={<ExchangePage />} />
<Route path="/exchange/:partnerId" element={<PartnershipViewPage />} />

// Impact (was Priority)
<Route path="/impact" element={<ImpactLandingPage />} />
<Route path="/impact/self" element={<ImpactSelfPage />} />
<Route path="/impact/others" element={<ImpactOthersPage />} />

// Improve (was Proof)
<Route path="/improve" element={<ImproveLandingPage />} />
<Route path="/improve/self" element={<ImproveSelfPage />} />
<Route path="/improve/others" element={<ImproveOthersPage />} />

// Inspire (was Predict)
<Route path="/inspire" element={<InspireLandingPage />} />
<Route path="/inspire/self" element={<InspireSelfPage />} />
<Route path="/inspire/others" element={<InspirelOthersPage />} />

// Direction (locked for non-clients)
<Route path="/map" element={<RoleGate allowedRoles={['client', 'coach', 'admin']} fallback={<LockedFeature />}><MapPage /></RoleGate>} />
<Route path="/chat" element={<RoleGate allowedRoles={['client', 'coach', 'admin']} fallback={<LockedFeature />}><ChatPage /></RoleGate>} />

// Utility
<Route path="/profile" element={<ProfilePage />} />
<Route path="/learn" element={<LearnPage />} />

// Redirects for old routes
<Route path="/today" element={<Navigate to="/" />} />
<Route path="/focus" element={<Navigate to="/" />} />
<Route path="/priority" element={<Navigate to="/impact/self" />} />
<Route path="/priority/*" element={<Navigate to="/impact/self" />} />
<Route path="/proof" element={<Navigate to="/improve/self" />} />
<Route path="/proof/*" element={<Navigate to="/improve/self" />} />
<Route path="/predict" element={<Navigate to="/inspire/self" />} />
<Route path="/predict/*" element={<Navigate to="/inspire/self" />} />
```

2. Add all imports at top of file

3. Keep old page files for now (don't delete PriorityPage, ProofPage, PredictPage)

### Done Criteria
- [ ] All routes work
- [ ] Old routes redirect to new equivalents
- [ ] No 404s when navigating
- [ ] Sidebar links all work
- [ ] Tools still function (Priority/Proof/Predict)
- [ ] No TypeScript errors
- [ ] No console errors

### STOP — Final verification with Brian

---

## Phase A Complete Checklist

- [ ] NavDropdown component works
- [ ] Sidebar has new structure
- [ ] All placeholder pages exist
- [ ] All routes wired up
- [ ] Old routes redirect properly
- [ ] Existing tools still work (via redirects)
- [ ] Mobile nav works
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes

---

## Files Created/Modified Summary

### New Files
```
apps/together/src/components/layout/NavDropdown.tsx
apps/together/src/pages/HomePage.tsx
apps/together/src/pages/ImpactLandingPage.tsx
apps/together/src/pages/ImpactSelfPage.tsx
apps/together/src/pages/ImpactOthersPage.tsx
apps/together/src/pages/ImproveLandingPage.tsx
apps/together/src/pages/ImproveSelfPage.tsx
apps/together/src/pages/ImproveOthersPage.tsx
apps/together/src/pages/InspireLandingPage.tsx
apps/together/src/pages/InspireSelfPage.tsx
apps/together/src/pages/InspirelOthersPage.tsx
apps/together/src/pages/ExchangePage.tsx
apps/together/src/pages/PartnershipViewPage.tsx (placeholder)
```

### Modified Files
```
apps/together/src/components/layout/Sidebar.tsx
apps/together/src/components/layout/index.ts
apps/together/src/App.tsx
```

### Files to Keep (Not Delete)
```
apps/together/src/pages/PriorityPage.tsx (used by ImpactSelfPage)
apps/together/src/pages/ProofPage.tsx (used by ImproveSelfPage)
apps/together/src/pages/PredictPage.tsx (used by InspireSelfPage)
```

---

## Handoff Notes

After Phase A:
- Navigation uses new structure and labels
- Tools still work via the wrapper pages
- Ready for Phase B: Build out HomePage with full functionality

---

**End of Phase A Build Plan**
