# Phase H Build Plan: Check-in Enhancement

**Created:** January 28, 2026  
**Source:** V2 Spec Part 4 (Today Page)  
**Purpose:** Bridge question flow, week history view  
**Estimated Time:** 1 session  
**Dependencies:** Phase B complete (DailyCheckin exists)

---

## Objective

Enhance the daily check-in with:
1. Bridge question — contextual question after check-in that flows into Priority
2. Week history — calendar view showing check-in history and engagement averages

---

## Checkpoint 1: Bridge Question Logic

**Goal:** Show contextual question after check-in completion

### Design

```
✓ Check-in saved

┌────────────────────────────────────────────────────────────────────┐
│  Self-care landed today (5/5).                                     │
│                                                                    │
│  What made it land?                                                │
│                                                                    │
│  [Text area...]                                                    │
│                                                                    │
│                              [Skip]    [Continue to Priority →]    │
└────────────────────────────────────────────────────────────────────┘
```

### Bridge Question Logic

| Condition | Question |
|-----------|----------|
| Highest engagement (4-5) | "What made [item] land?" |
| Lowest engagement (1-2) | "What became more important than [item]?" |
| Nothing checked | "What got your attention today?" |
| Only "Something else emerged" | "Tell me about what emerged" |
| All items equal | Pick first item: "What made [item] land?" |

### Tasks

1. Create `apps/together/src/components/home/BridgeQuestion.tsx`
   - Shows after check-in is saved
   - Displays contextual question based on scores
   - Text area for answer
   - [Skip] and [Continue to Priority →] buttons

2. Update `apps/together/src/hooks/useDailyReflection.ts`
   - Add `bridgeAnswer` field
   - Add `bridgeFocusItem` field (which item the question is about)
   - Save bridge answer to daily_reflections

3. Add bridge columns to daily_reflections (if not present):
```sql
ALTER TABLE daily_reflections 
ADD COLUMN IF NOT EXISTS bridge_question TEXT,
ADD COLUMN IF NOT EXISTS bridge_answer TEXT,
ADD COLUMN IF NOT EXISTS bridge_focus_item TEXT;
```

### Done Criteria
- [ ] Bridge question appears after check-in saved
- [ ] Question is contextual based on engagement scores
- [ ] Text area captures answer
- [ ] [Skip] closes the bridge
- [ ] Answer saves to database
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 2: Bridge → Priority Flow

**Goal:** "Continue to Priority" pre-fills Priority entry

### Tasks

1. Update BridgeQuestion component
   - [Continue to Priority →] navigates to /impact/self
   - Pass bridge answer as URL param or localStorage

2. Update ImpactSelfPage (or PriorityPage)
   - Check for bridge pre-fill data
   - Pre-populate "What went well?" with bridge answer
   - Pre-populate context with focus item

3. Pre-fill data structure:
```typescript
interface BridgePreFill {
  focusItem: string;      // "Self-care"
  bridgeAnswer: string;   // User's answer to bridge question
  fromCheckin: boolean;   // Flag to show it came from check-in
}
```

4. Navigation with state:
```typescript
navigate('/impact/self', { 
  state: { 
    prefill: {
      focusItem: 'Self-care',
      bridgeAnswer: 'I made time for a morning walk...',
      fromCheckin: true
    }
  }
});
```

### Done Criteria
- [ ] [Continue to Priority →] navigates to Impact Self
- [ ] Bridge answer pre-fills "What went well?" field
- [ ] Focus item shows as context
- [ ] User can edit the pre-filled content
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 3: Week History Calendar

**Goal:** Show check-in history for the week

### Design

```
THIS WEEK
┌────────────────────────────────────────────────────────────────────┐
│ Mon   Tue   Wed   Thu   Fri   Sat   Sun                            │
│  ✓     ✓     ✓     ○     ✓     -     ●                             │
│ 3/3   2/3   3/3         2/3         (today)                        │
└────────────────────────────────────────────────────────────────────┘
```

### Indicators
- ✓ = Checked in (with X/Y items completed)
- ○ = No check-in (past day)
- - = No check-in (weekend, if weekday-only mode)
- ● = Today (current)

### Tasks

1. Create `apps/together/src/components/home/WeekHistoryCalendar.tsx`
   - 7-day row (Mon-Sun or Sun-Sat based on locale)
   - Shows indicator for each day
   - Shows X/Y items completed below

2. Create `apps/together/src/hooks/useWeekHistory.ts`
   - Fetch daily_reflections for current week
   - Return: `{ days: DayHistory[], currentDay: number }`

3. DayHistory type:
```typescript
interface DayHistory {
  date: Date;
  dayLabel: string;       // "Mon", "Tue", etc.
  checkedIn: boolean;
  itemsCompleted: number;
  itemsTotal: number;
  isToday: boolean;
  isWeekend: boolean;
}
```

### Done Criteria
- [ ] Calendar shows 7 days
- [ ] Correct indicators for each day
- [ ] X/Y completion shows
- [ ] Today highlighted
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 4: Weekly Engagement Averages

**Goal:** Show engagement averages per focus item for the week

### Design

```
ENGAGEMENT THIS WEEK
Self-care: ⚡4.2 avg
Team 1:1s: 3.1 avg
Strategic planning: ⚠️2.1 avg
```

### Indicators
- ⚡ = High engagement (≥3.5)
- (none) = Moderate engagement (2.5-3.5)
- ⚠️ = Low engagement (<2.5)

### Tasks

1. Create `apps/together/src/components/home/WeeklyEngagement.tsx`
   - List focus items with average engagement
   - Show indicator based on average

2. Update useWeekHistory hook
   - Calculate per-item averages
   - Return: `{ focusAverages: FocusAverage[] }`

3. FocusAverage type:
```typescript
interface FocusAverage {
  name: string;
  average: number;
  timesCompleted: number;
  indicator: 'high' | 'moderate' | 'low';
}
```

### Done Criteria
- [ ] Focus items listed with averages
- [ ] Correct indicators (⚡, none, ⚠️)
- [ ] Averages calculated correctly
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 5: Integration

**Goal:** Add components to DailyCheckin section

### Layout Update

After check-in is complete, show:
```
┌────────────────────────────────────────────────────────────────────┐
│ TODAY'S CHECK-IN                                                   │
│                                                                    │
│ ✓ Checked in today                                        [Edit]  │
│                                                                    │
│ ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│ THIS WEEK                                                          │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Mon   Tue   Wed   Thu   Fri   Sat   Sun                     │   │
│ │  ✓     ✓     ✓     ○     ✓     -     ●                      │   │
│ │ 3/3   2/3   3/3         2/3         (today)                 │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ ENGAGEMENT THIS WEEK                                               │
│ Self-care: ⚡4.2 avg                                               │
│ Team 1:1s: 3.1 avg                                                │
│ Strategic planning: ⚠️2.1 avg                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Update DailyCheckin component
   - After check-in saved, show BridgeQuestion
   - After bridge complete/skipped, show week history

2. Show WeekHistoryCalendar and WeeklyEngagement
   - Only visible after today's check-in is complete
   - OR show as collapsed/expandable section

3. Test full flow:
   - Check in → Bridge question → Priority (or Skip)
   - See week history and engagement

### Done Criteria
- [ ] Bridge question appears after check-in
- [ ] Week history shows after bridge
- [ ] Engagement averages display
- [ ] Full flow works
- [ ] Layout looks good
- [ ] No TypeScript errors
- [ ] Build passes

---

## Phase H Complete Checklist

- [ ] BridgeQuestion component complete
- [ ] Bridge question logic correct
- [ ] Bridge → Priority pre-fill works
- [ ] WeekHistoryCalendar component complete
- [ ] useWeekHistory hook working
- [ ] WeeklyEngagement component complete
- [ ] DailyCheckin integration complete
- [ ] No TypeScript errors
- [ ] Build passes

---

**End of Phase H Build Plan**
