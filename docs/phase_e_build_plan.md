# Phase E Build Plan: Dashboard Updates for V2

**Created:** January 28, 2026  
**Purpose:** Update coach Dashboard to align with V2 Four I's framework + discovery framing  
**Estimated Time:** 2-3 sessions  
**Dependencies:** None — Dashboard is independent app (`apps/dashboard/`)

---

## Objective

Update the existing Dashboard to:
1. Use V2 naming (Impact/Improve/Inspire instead of Priority/Proof/Predict)
2. Add "Discovery" framing (helping clients see their influence)
3. Create Quick Prep section for session preparation
4. Add YOUR INFLUENCE header to client detail (Permission/Practice/Focus)
5. Improve engagement indicators

---

## Pre-Build Checklist

- [ ] Dashboard app runs at localhost:3000 (or configured port)
- [ ] Read `docs/naming_concordance.md` for all label mappings
- [ ] Read `docs/Finding_Good_V2_Dashboard_Specification.md` for full spec
- [ ] Verify Supabase connection works
- [ ] Check existing components in `apps/dashboard/src/components/`

---

## What Already Exists (DO NOT REBUILD)

The Dashboard already has substantial infrastructure:

```
apps/dashboard/src/
├── pages/
│   ├── Clients.tsx              # Client list
│   ├── ClientDetail.tsx         # Client detail with tabs
│   ├── Dashboard.tsx            # Main dashboard
│   └── Analytics.tsx            # Usage stats
├── components/
│   ├── client-detail/
│   │   ├── ClientDetailHeader.tsx
│   │   ├── ClientSummaryCards.tsx
│   │   ├── FiresFocusSection.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── PredictionsCard.tsx
│   │   └── tabs/
│   │       ├── ImpactTab.tsx
│   │       ├── PrioritiesTab.tsx
│   │       └── ...
│   └── clients/
│       ├── ClientStatusBadge.tsx
│       └── ZoneBadge.tsx
├── hooks/
│   ├── useClients.ts
│   ├── useClientDetail.ts
│   └── useClientActivity.ts
└── ...
```

**Key insight:** This is UPDATE work, not greenfield build.

---

## Checkpoint 1: Naming Updates (Labels Only)

**Goal:** Update all UI labels from old names to V2 names

### Tasks

1. **Tab labels in ClientDetail.tsx:**
   ```tsx
   // OLD
   { value: 'proof', label: 'Proof', icon: CheckCircle }
   { value: 'priorities', label: 'Priorities', icon: Star }
   { value: 'predictions', label: 'Predictions', icon: Crosshair }
   
   // NEW
   { value: 'improve', label: 'Improve', icon: TrendingUp }
   { value: 'impact', label: 'Impact', icon: Zap }
   { value: 'inspire', label: 'Inspire', icon: Sparkles }
   ```

2. **Component file renames (optional but cleaner):**
   - `ImpactTab.tsx` → keep name (already correct!)
   - `PrioritiesTab.tsx` → rename to `ImpactHistoryTab.tsx` or keep
   - Update imports in ClientDetail.tsx

3. **Section headers throughout:**
   - "Recent Priorities" → "Recent Impact"
   - "Proofs" → "Improvements"  
   - "Predictions" → "Beliefs" or "Inspire"

4. **Card type labels:**
   - Priority badge → Impact badge
   - Proof badge → Improve badge
   - Prediction badge → Inspire badge

### Files to Modify
- `apps/dashboard/src/pages/ClientDetail.tsx`
- `apps/dashboard/src/components/client-detail/tabs/*.tsx`
- `apps/dashboard/src/components/client-detail/RecentActivity.tsx`
- Any other files with old naming (search for "Priority", "Proof", "Predict")

### Done Criteria
- [ ] All visible labels use V2 names
- [ ] Icons match (Zap for Impact, TrendingUp for Improve, Sparkles for Inspire)
- [ ] No TypeScript errors
- [ ] Build passes

### STOP — Verify with Brian before continuing

---

## Checkpoint 2: Client Detail Header — YOUR INFLUENCE

**Goal:** Add Permission/Practice/Focus display to client detail header

### Tasks

1. **Create `apps/dashboard/src/components/client-detail/InfluenceSection.tsx`**

   Display the client's current Influence (Permission/Practice/Focus):
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  YOUR INFLUENCE                                             │
   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
   │  │ PERMISSION   │ │ PRACTICE     │ │ FOCUS        │        │
   │  │ "Lead with   │ │ "Start each  │ │ • Clear comm │        │
   │  │ curiosity"   │ │ day present" │ │ • Team trust │        │
   │  └──────────────┘ └──────────────┘ └──────────────┘        │
   └─────────────────────────────────────────────────────────────┘
   ```

2. **Data source:** Query `permissions` table for this client
   ```typescript
   const { data: permission } = useQuery({
     queryKey: ['permission', clientEmail],
     queryFn: () => supabase
       .from('permissions')
       .select('*')
       .eq('client_email', clientEmail)
       .single()
   })
   ```

3. **Add to ClientDetail.tsx** above the tabs or in overview tab

### Done Criteria
- [ ] InfluenceSection component created
- [ ] Displays Permission, Practice, Focus for client
- [ ] Shows empty state if client hasn't set these
- [ ] Integrated into ClientDetail page
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 3: Quick Prep Section

**Goal:** Add a "Quick Prep" section for session preparation

### Tasks

1. **Create `apps/dashboard/src/components/client-detail/QuickPrepSection.tsx`**

   Show coach-relevant summary:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  QUICK PREP                                    [Expand ▼]   │
   ├─────────────────────────────────────────────────────────────┤
   │  Since Last Session (Jan 21)                                │
   │  • 3 Impact entries recorded                                │
   │  • 1 Improve entry completed                                │
   │  • Focus items: 2/3 checked off                            │
   │                                                             │
   │  Patterns to Notice                                         │
   │  • Strong in Resilience (5 mentions)                       │
   │  • Limited Feelings signals                                 │
   │                                                             │
   │  Suggested Questions                                        │
   │  • "What made delegation easier this week?"                │
   │  • "How did you handle the pushback on..."                 │
   └─────────────────────────────────────────────────────────────┘
   ```

2. **Data sources:**
   - `priorities` — count since last session
   - `validations` — count since last session
   - `daily_checkins` — completion rates
   - FIRES extraction from recent entries

3. **Optional: AI-generated questions** (can be Phase 2 if complex)
   - For MVP: Show counts + manual FIRES patterns
   - Future: Edge function generates suggested questions

### Done Criteria
- [ ] QuickPrepSection component created
- [ ] Shows activity counts since last session
- [ ] Shows FIRES patterns from recent activity
- [ ] Collapsible (default expanded)
- [ ] Integrated into ClientDetail overview tab
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 4: Engagement Indicators

**Goal:** Add visual indicators for client engagement levels

### Tasks

1. **Update `apps/dashboard/src/pages/Clients.tsx`**
   
   Add engagement indicators to client cards:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  Mike Chen                                    🟢 Active     │
   │  Week 6 · 3 active beliefs                                  │
   │  Last: Today · This week: 5 entries                        │
   └─────────────────────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────────────────────┐
   │  Jen Park                                     🟡 Quiet      │
   │  Week 2 · 2 active beliefs                                  │
   │  Last: 5 days ago · This week: 1 entry                     │
   └─────────────────────────────────────────────────────────────┘
   ```

2. **Engagement levels:**
   | Level | Indicator | Criteria |
   |-------|-----------|----------|
   | Active | 🟢 Green | Activity in last 48 hours |
   | Engaged | 🔵 Blue | Activity in last 7 days |
   | Quiet | 🟡 Yellow | No activity 7-14 days |
   | Inactive | 🔴 Red | No activity 14+ days |

3. **Create `apps/dashboard/src/components/clients/EngagementBadge.tsx`**

4. **Update client list query** to include recent activity counts

### Done Criteria
- [ ] EngagementBadge component created
- [ ] Client cards show engagement indicator
- [ ] Correct calculation based on last activity
- [ ] Visual matches spec (colored dots/badges)
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 5: Activity Feed Updates

**Goal:** Update activity feed to use V2 naming and improve display

### Tasks

1. **Update `apps/dashboard/src/components/client-detail/RecentActivity.tsx`**
   - Change type labels: Priority → Impact, Proof → Improve
   - Update icons: Zap for Impact, TrendingUp for Improve, Sparkles for Inspire

2. **Update `apps/dashboard/src/components/client-detail/ActivityFeed.tsx`**
   - Same naming changes
   - Add FIRES badges if not already present

3. **Ensure consistent card design:**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  ⚡ IMPACT · Today                                          │
   │  "I prioritized having the difficult conversation with..."  │
   │  🟢 Ethics  🔵 Influence                                    │
   └─────────────────────────────────────────────────────────────┘
   ```

### Done Criteria
- [ ] All activity displays use V2 naming
- [ ] Icons correct (Zap/TrendingUp/Sparkles)
- [ ] FIRES badges display on entries
- [ ] Consistent with Together app styling
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 6: Polish & Integration

**Goal:** Final cleanup and verification

### Tasks

1. **Search and replace any remaining old names:**
   - Search for "Priority" (not in variable names, just UI strings)
   - Search for "Proof" (UI strings)
   - Search for "Predict" (UI strings)

2. **Verify navigation flows:**
   - Client list → Client detail → All tabs work
   - Back buttons work
   - No broken links

3. **Test with real data:**
   - Load actual client data
   - Verify Influence section populates
   - Verify Quick Prep shows accurate counts
   - Verify engagement indicators calculate correctly

4. **Create handoff doc**

### Done Criteria
- [ ] No old naming visible in UI
- [ ] All navigation works
- [ ] Real data displays correctly
- [ ] Quick Prep accurate
- [ ] Engagement indicators accurate
- [ ] Handoff doc created
- [ ] Build passes
- [ ] Committed and pushed

### STOP — Final validation with Brian

---

## Phase E Complete Checklist

- [ ] All labels updated to V2 naming (Impact/Improve/Inspire)
- [ ] Icons updated (Zap/TrendingUp/Sparkles)
- [ ] InfluenceSection shows client's Permission/Practice/Focus
- [ ] QuickPrepSection shows activity since last session
- [ ] EngagementBadge shows client activity level
- [ ] Activity feeds use V2 naming
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes
- [ ] Handoff doc created

---

## Files Created/Modified Summary

### New Components
```
apps/dashboard/src/components/client-detail/
├── InfluenceSection.tsx (NEW)
└── QuickPrepSection.tsx (NEW)

apps/dashboard/src/components/clients/
└── EngagementBadge.tsx (NEW)
```

### Modified Files
```
apps/dashboard/src/
├── pages/
│   ├── Clients.tsx (engagement badges)
│   └── ClientDetail.tsx (tabs renamed, new sections)
├── components/client-detail/
│   ├── RecentActivity.tsx (naming)
│   ├── ActivityFeed.tsx (naming)
│   └── tabs/*.tsx (naming)
└── ...
```

---

## Naming Reference (Quick Lookup)

| Old | New | Icon |
|-----|-----|------|
| Priority | Impact | Zap |
| Proof | Improve | TrendingUp |
| Predict | Inspire | Sparkles |
| Priority entries | Impact entries | — |
| Validation entries | Improvement entries | — |
| Predictions | Beliefs | — |

---

## Data Dependencies

| Section | Table(s) | Query |
|---------|----------|-------|
| Influence | `permissions` | Single record by client_email |
| Quick Prep | `priorities`, `validations`, `daily_checkins`, `session_transcripts` | Counts since last session |
| Engagement | `priorities`, `validations`, `daily_checkins` | Last activity date |
| Activity Feed | `priorities`, `validations` | Recent entries |

---

**End of Phase E Build Plan**
