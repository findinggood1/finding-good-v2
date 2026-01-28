# Phase B Complete: Home/Influence Page

**Completed:** January 27, 2026  
**Next Phase:** Phase C — Tool Landing Pages + Inspire Others

---

## What Was Built

### HomePage Restructure

The Home page was transformed from a sparse analytics-focused page to an action-oriented daily hub:

**New Section Order:**
1. **YOUR INFLUENCE** — Permission, Practice, Focus with inline editing
2. **WHAT YOU'RE CREATING** — Predictions/beliefs card (moved from bottom)
3. **TODAY'S CHECK-IN** — Focus item checkboxes, engagement rating, reflection
4. **THIS WEEK** — Active beliefs + evidence counts
5. **RECENT ACTIVITY** — Sent/Received entries with type icons
6. **INSIGHTS** — Rule-based contextual messages
7. **FEED** — Bottom section for activity feed

### MapPage Gets Analytics

All analytics moved from Home to Map:
- PredictabilityCard
- FIRES Grid
- Trajectory Chart
- Activity Counts (all time)
- Yours vs Others comparison

### Database

**New Table:** `daily_reflections`
```sql
CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  reflection_date DATE NOT NULL,
  completed_items JSONB DEFAULT '[]',
  engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
  question_shown TEXT,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_email, reflection_date)
);
```

RLS policies enabled for user-level access.

---

## Files Created

```
apps/together/src/
├── components/home/
│   ├── InfluenceSection.tsx      # Permission/Practice/Focus with inline edit
│   ├── DailyCheckin.tsx          # Focus checkboxes + engagement
│   ├── ReflectionQuestion.tsx    # Question + answer with locked state
│   ├── ThisWeekSection.tsx       # Beliefs + evidence counts
│   ├── RecentActivitySection.tsx # Sent/Received with type icons
│   ├── InsightsSection.tsx       # Rule-based contextual messages
│   └── index.ts                  # Barrel exports
├── hooks/
│   ├── useDailyReflection.ts     # Check-in state management
│   ├── useWeeklyActivity.ts      # This week data + checkin count
│   └── useRecentActivity.ts      # Sent/received queries
└── pages/
    ├── HomePage.tsx              # Restructured with new sections
    └── MapPage.tsx               # Now contains analytics
```

---

## Key Features

### Daily Check-in Flow
1. Focus items appear as checkboxes
2. Checking an item shows engagement rating (1-5)
3. Selecting engagement shows contextual question:
   - 4-5: "What made [item] land?"
   - 1-2: "How did you work through it?"
   - 3: "What got your attention today?"
4. After saving, reflection is locked with Edit button
5. Celebration UX: highlighted background, scale animation, checkmark

### Insights Rules (Shows up to 2)
- 5+ check-ins: "incredible consistency"
- 3+ check-ins: "great consistency"
- Engagement >= 4: "you're showing up fully"
- 5+ evidence entries: "strong momentum"
- 2+ evidence entries: "keep building the pattern"
- 3+ active beliefs: "building on multiple fronts"

### Recent Activity
- **Sent:** "What you're noticing in others" (type='others' or has target_email)
- **Received:** "What they're noticing in you" (recipient_email = current user)
- Type icons: ⚡ Impact, 📈 Improve, ✨ Inspire
- Relative timestamps: "just now", "5m ago", "3h ago", etc.

---

## Deferred Items

| Item | Reason | When to Address |
|------|--------|-----------------|
| predictions.priority_count/proof_count always 0 | Priority/Proof tools don't set prediction_id or increment counters | Phase C or later |
| Received validations need recipient_email | Column exists but not populated | When building Exchange |
| Improve → Insight rename | Marketing alignment | After Phase C, before launch |
| Full visual design pass | Time | Future polish session |

---

## Verification Points

✅ HomePage shows all 7 sections in order  
✅ MapPage shows analytics (Predictability, FIRES, Trajectory, Activity, Comparison)  
✅ Daily check-in creates/updates daily_reflections record  
✅ Reflection locks after save with Edit button  
✅ Insights show based on weekly data  
✅ Recent Activity shows sent entries with type icons  
✅ No console errors  
✅ Build passes  

---

## Next Phase

**Phase C: Tool Landing Pages + Inspire Others**

Key tasks:
1. Create reusable ToolLandingPage component
2. Build landing pages for Impact, Improve, Inspire
3. Update Self/Others pages with new branding
4. **BUILD Inspire Others flow** (does not exist yet)

See: `docs/phase_c_build_plan.md`
