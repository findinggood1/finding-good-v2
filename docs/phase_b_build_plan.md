# Phase B Build Plan: Home/Influence Page

**Created:** January 27, 2026  
**Purpose:** Build the unified Home page that combines Influence declaration, daily check-in, and activity  
**Estimated Time:** 1-2 sessions  
**Dependencies:** Phase A complete, daily_reflections table created

---

## Objective

Create the Home page as the central hub of the Together app. This page shows:
1. User's declared influence (permission, practice, focus)
2. Daily check-in with focus items
3. Question + answer capture
4. This week's activity
5. Recent exchanges (sent/received)
6. Insights/trends

---

## Pre-Build Checklist

- [ ] Phase A complete (navigation restructured)
- [ ] Read `navigation_restructure_v1.md` Part 4 for Home layout spec
- [ ] Read `naming_concordance.md` for all label mappings
- [ ] Run `exchange_schema.sql` to create `daily_reflections` table
- [ ] Verify `permissions` table structure in Supabase
- [ ] Verify Together app runs

---

## Database Setup

Before starting, run the daily_reflections table creation via Supabase MCP:

```sql
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  reflection_date DATE NOT NULL,
  question_shown TEXT NOT NULL,
  answer TEXT,
  engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
  focus_items_completed INTEGER DEFAULT 0,
  focus_items_total INTEGER DEFAULT 0,
  completed_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_email, reflection_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_email ON daily_reflections(client_email);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(reflection_date DESC);
```

---

## Checkpoint 1: Your Influence Section

**Goal:** Display and edit the user's permission, practice, and focus items

### Tasks

1. Create `apps/together/src/components/home/InfluenceSection.tsx`
   - Displays:
     - Permission: "What you want to create more of in the world"
     - Practice: "How you're living this out with others"
     - Focus: 1-3 daily action items
   - Each has an Edit button that opens inline edit mode
   - Reads from `permissions` table

2. Create `apps/together/src/hooks/usePermissions.ts` (if not exists)
   - Fetches user's current permission, practice, focus
   - Provides update functions
   - Uses client_email for identification

3. Style the section:
   - Clean card layout
   - Permission and Practice as text with edit icons
   - Focus items as a list (will become checkboxes in next checkpoint)

### Done Criteria
- [ ] InfluenceSection displays permission, practice, focus
- [ ] Edit mode works for each field
- [ ] Changes save to database
- [ ] Empty state handles gracefully (shows prompts to add)
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 2: Daily Check-in

**Goal:** Add focus item checkboxes, engagement rating, and question/answer capture

### Tasks

1. Create `apps/together/src/components/home/DailyCheckin.tsx`
   - Shows focus items as checkable items
   - Tracks which items are completed today
   - Shows engagement rating (1-5 scale)
   
2. Create `apps/together/src/components/home/ReflectionQuestion.tsx`
   - Appears after checking off items
   - Shows a contextual question based on what was checked
   - Text area for short answer
   - Save button

3. Create `apps/together/src/hooks/useDailyReflection.ts`
   - Gets/creates today's reflection record
   - Tracks completed items, engagement, answer
   - Saves to `daily_reflections` table

4. Question logic:
   - Questions should come from existing pool (check what Today page used)
   - Question selection can be random or based on what was checked
   - Answer is stored in `daily_reflections.answer`

### Done Criteria
- [ ] Focus items show as checkboxes
- [ ] Checking item saves to daily_reflections
- [ ] Question appears after checking
- [ ] Answer saves to database
- [ ] Engagement rating works
- [ ] Data persists on page refresh
- [ ] Works for new day (creates new record)
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 3: This Week Section

**Goal:** Show goals, predictions, and evidence from current week

### Tasks

1. Create `apps/together/src/components/home/ThisWeekSection.tsx`
   - Shows active predictions (from `predictions` table)
   - Shows evidence count (priorities + validations this week)
   - Progress indicators where applicable

2. Create `apps/together/src/hooks/useWeeklyActivity.ts`
   - Fetches this week's:
     - Active predictions with progress
     - Priority entries count
     - Validation entries count
   - Date range: current week (Mon-Sun or Sun-Sat)

### Display

```
THIS WEEK
─────────────────────────────
Active Beliefs:
• [Prediction 1 title]  ████████░░ 80%
• [Prediction 2 title]  ███░░░░░░░ 30%

Evidence Collected:
• 5 Impact entries recorded
• 2 Improvements validated
```

### Done Criteria
- [ ] Shows active predictions
- [ ] Shows this week's entry counts
- [ ] Progress indicators display
- [ ] Links to relevant detail pages
- [ ] Empty state handles gracefully
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 4: Recent Activity Section

**Goal:** Show what you've sent to others and what others have sent to you

### Tasks

1. Create `apps/together/src/components/home/RecentActivitySection.tsx`
   - Two subsections:
     - "What you're noticing in others" (sent)
     - "What they're noticing in you" (received)

2. Create `apps/together/src/hooks/useRecentActivity.ts`
   - Fetches recent entries where:
     - Sent: current user is sender, mode = 'others' or has recipient_email
     - Received: recipient_email = current user
   - From tables: priorities, validations, predictions
   - Limit: 5 most recent each direction

### Display

```
RECENT ACTIVITY
─────────────────────────────
What you're noticing in others:
• Sent impact to Sarah about her presentation (2h ago)
• Shared belief with Marcus (yesterday)

What they're noticing in you:
• Sarah recognized your leadership (1d ago)
• Marcus witnessed your growth (3d ago)
```

### Done Criteria
- [ ] Shows sent items with recipient name
- [ ] Shows received items with sender name  
- [ ] Timestamps display nicely (relative time)
- [ ] Links to full entries
- [ ] Empty state: "Start noticing impact in others"
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 5: Insights Section (Light Version)

**Goal:** Show simple patterns/trends (not full AI analysis yet)

### Tasks

1. Create `apps/together/src/components/home/InsightsSection.tsx`
   - Shows 1-2 simple insights based on data
   - Can be rule-based for now (not AI)

2. Simple insight rules:
   - "You've been consistent this week" (if checked in 3+ days)
   - "Ethics shows up often in your entries" (if FIRES extraction available)
   - "Your engagement is high" (if avg engagement >= 4)
   - Fallback: encouraging prompt to keep going

### Display

```
INSIGHTS
─────────────────────────────
💡 You've checked in 4 days this week — great consistency!
🔥 Ethics appears frequently in your reflections
```

### Done Criteria
- [ ] Shows at least one insight when data exists
- [ ] Graceful fallback when no data
- [ ] Doesn't show empty section
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 6: Assemble HomePage

**Goal:** Put all sections together in the final layout

### Tasks

1. Update `apps/together/src/pages/HomePage.tsx`
   - Import and arrange all sections
   - Add proper spacing and dividers
   - Responsive layout (mobile-friendly)

2. Layout structure:
```tsx
<div className="home-page">
  <InfluenceSection />
  
  <Divider />
  
  <DailyCheckin />
  
  <Divider />
  
  <ThisWeekSection />
  
  <Divider />
  
  <RecentActivitySection />
  
  <Divider />
  
  <InsightsSection />
</div>
```

3. Add loading states for each section

4. Test full flow:
   - New user (empty state)
   - User with data
   - Daily check-in flow

### Done Criteria
- [ ] All sections display correctly
- [ ] Layout is responsive
- [ ] Loading states show appropriately
- [ ] Empty states guide user
- [ ] Full check-in flow works
- [ ] Data saves and persists
- [ ] No TypeScript errors
- [ ] No console errors

### STOP — Final verification with Brian

---

## Phase B Complete Checklist

- [ ] daily_reflections table created
- [ ] InfluenceSection component complete
- [ ] DailyCheckin component complete
- [ ] ReflectionQuestion component complete
- [ ] ThisWeekSection component complete
- [ ] RecentActivitySection component complete
- [ ] InsightsSection component complete
- [ ] HomePage assembled and working
- [ ] All hooks working correctly
- [ ] Data flows correctly to/from database
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes

---

## Files Created Summary

### Components
```
apps/together/src/components/home/
├── InfluenceSection.tsx
├── DailyCheckin.tsx
├── ReflectionQuestion.tsx
├── ThisWeekSection.tsx
├── RecentActivitySection.tsx
├── InsightsSection.tsx
└── index.ts
```

### Hooks
```
apps/together/src/hooks/
├── usePermissions.ts
├── useDailyReflection.ts
├── useWeeklyActivity.ts
├── useRecentActivity.ts
└── (update index.ts)
```

### Pages
```
apps/together/src/pages/
└── HomePage.tsx (major update)
```

---

## Data Flow Summary

| Component | Reads From | Writes To |
|-----------|------------|-----------|
| InfluenceSection | `permissions` | `permissions` |
| DailyCheckin | `permissions`, `daily_reflections` | `daily_reflections` |
| ReflectionQuestion | `daily_reflections` | `daily_reflections` |
| ThisWeekSection | `predictions`, `priorities`, `validations` | — |
| RecentActivitySection | `priorities`, `validations`, `predictions` | — |
| InsightsSection | `daily_reflections`, various | — |

---

## Handoff Notes

After Phase B:
- Home page is the central hub
- Daily check-in captures focus completion + reflection
- User sees their activity and trends
- Ready for Phase C: Polish tool landing pages

---

**End of Phase B Build Plan**
