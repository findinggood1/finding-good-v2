# Phase E.5 Build Plan: Sent/Received Data for Coaching

**Created:** January 28, 2026  
**Purpose:** Surface what clients sent TO others and received FROM others in Dashboard  
**Estimated Time:** 1 session  
**Dependencies:** Phase E complete

---

## Why This Matters for Coaching

| Data Type | Coaching Insight |
|-----------|------------------|
| **Self** (existing) | What they notice about themselves |
| **Sent to Others** (NEW) | How they see others, leadership style, what they value |
| **Received from Others** (NEW) | External validation, blind spots, how others perceive them |

This creates a complete picture:
- Self-awareness (self entries)
- Leadership behavior (what they notice in others)
- External feedback (what others notice in them)

---

## Data Sources

### Impact (Recognition)

| Type | Table | Filter |
|------|-------|--------|
| Self | `priorities` | `client_email = X AND (type = 'self' OR target_email IS NULL)` |
| Sent | `priorities` | `client_email = X AND target_email IS NOT NULL` |
| Sent | `recognitions` | `from_email = X` |
| Received | `priorities` | `target_email = X` |
| Received | `recognitions` | `to_email = X` |

### Improve (Validation/Witness)

| Type | Table | Filter |
|------|-------|--------|
| Self | `validations` | `client_email = X AND mode != 'send'` |
| Sent | `validation_invitations` | `sender_email = X` |
| Received | `validations` | `recipient_email = X` (if populated) |
| Received | `validation_invitations` | `recipient_email = X` (completed ones) |

### Inspire (Beliefs)

| Type | Table | Filter |
|------|-------|--------|
| Self | `predictions` | `client_email = X` |
| Sent | `inspire_others` | `sender_email = X` |
| Received | `inspire_others` | `recipient_email = X` |

---

## Checkpoint 0: Deferred UI Tasks

**Goal:** Complete small UI tasks deferred from Phase E

### Tasks

1. **Add Upload File button to Notes tab**
   - Add "Upload File" button in NotesTab.tsx
   - Place near existing "Add Note" functionality
   - Use existing upload logic from removed action bar

### Done Criteria
- [ ] Upload File button appears in Notes tab
- [ ] Upload functionality works
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 1: Quick Prep Enhancement

**Goal:** Add sent/received counts to Quick Prep section

### Current Quick Prep Shows:
```
THEIR WORK
• 3 Impact entries · 1 Improve · 2/3 Focus checked
```

### Enhanced Quick Prep:
```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 QUICK PREP                                    [Collapse ▼]  │
│ Since Jan 21                                                    │
│                                                                 │
│ THEIR WORK                                                      │
│ • 3 Impact · 1 Improve · 2/3 Focus                             │
│                                                                 │
│ SENT TO OTHERS                                                  │
│ • 2 recognitions · 1 witnessed · 1 belief                      │
│                                                                 │
│ RECEIVED FROM OTHERS                                            │
│ • 1 recognition · 0 witnessed · 2 beliefs                      │
│                                                                 │
│ FIRES: Strong in Resilience, Limited Feelings                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `useSentReceivedCounts` hook
   - Queries all tables for sent/received counts
   - Returns: `{ sent: { impact, improve, inspire }, received: { impact, improve, inspire } }`

2. Update `QuickPrepSection.tsx`
   - Add sent/received sections
   - Show counts with appropriate labels

### Done Criteria
- [ ] Quick Prep shows "SENT TO OTHERS" section with counts
- [ ] Quick Prep shows "RECEIVED FROM OTHERS" section with counts
- [ ] Counts accurate from database
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 2: Impact Tab — Sent/Received Sections

**Goal:** Add sent/received entries to Impact tab

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ IMPACT                                                          │
├─────────────────────────────────────────────────────────────────┤
│ SELF (12 entries)                                               │
│ ⚡ "Prioritized the difficult conversation..." · 2h ago        │
│ ⚡ "Made time for team check-in..." · yesterday                │
├─────────────────────────────────────────────────────────────────┤
│ SENT TO OTHERS (4 entries)                                      │
│ → Sarah: "Recognized her handling of..."  · 3d ago             │
│ → Mike: "Noticed his patience with..." · 1w ago                │
├─────────────────────────────────────────────────────────────────┤
│ RECEIVED FROM OTHERS (2 entries)                                │
│ ← From Sarah: "You showed real courage..." · 5d ago            │
│ ← From Jen: "Your leadership in..." · 2w ago                   │
└─────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `useSentImpact` hook — queries priorities/recognitions sent
2. Create `useReceivedImpact` hook — queries priorities/recognitions received
3. Update Impact tab to show 3 sections: Self, Sent, Received
4. Create `SentEntryCard` component (shows → arrow, recipient name)
5. Create `ReceivedEntryCard` component (shows ← arrow, sender name)

### Done Criteria
- [ ] Impact tab shows Self, Sent, Received sections
- [ ] Sent entries show recipient name with → indicator
- [ ] Received entries show sender name with ← indicator
- [ ] Correct data from database
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 3: Improve Tab — Sent/Received Sections

**Goal:** Add sent/received entries to Improve tab

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ IMPROVE                                                         │
├─────────────────────────────────────────────────────────────────┤
│ SELF (5 entries)                                                │
│ 📈 "Validated my handling of the budget..." · 3d ago           │
├─────────────────────────────────────────────────────────────────┤
│ WITNESSED IN OTHERS (2 entries)                                 │
│ → Sarah: "Saw her growth in delegation..." · 1w ago            │
├─────────────────────────────────────────────────────────────────┤
│ WITNESSED BY OTHERS (1 entry)                                   │
│ ← From Mike: "Noticed your improvement in..." · 2w ago         │
└─────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `useSentImprove` hook — queries validation_invitations sent
2. Create `useReceivedImprove` hook — queries validations/invitations received
3. Update Improve tab to show 3 sections
4. Reuse SentEntryCard/ReceivedEntryCard with different styling

### Done Criteria
- [ ] Improve tab shows Self, Witnessed in Others, Witnessed by Others
- [ ] Sent entries show recipient name
- [ ] Received entries show sender name
- [ ] Correct data from database
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 4: Inspire Tab — Sent/Received Sections

**Goal:** Add sent/received beliefs to Inspire tab

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ INSPIRE                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ Zone        │ │ Growth Opp  │ │ Highlight   │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│ MY BELIEFS (3 active)                                           │
│ ✨ "Launch the product successfully" · Predictability: 72      │
├─────────────────────────────────────────────────────────────────┤
│ BELIEFS SHARED WITH OTHERS (2 entries)                          │
│ → To Sarah: "I believe you can lead the team..." · 1w ago      │
├─────────────────────────────────────────────────────────────────┤
│ BELIEFS OTHERS HAVE IN ME (3 entries)                           │
│ ← From Mike: "I believe you can navigate..." · 2w ago          │
│ ← From Jen: "You have the ability to..." · 3w ago              │
└─────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `useSentInspire` hook — queries inspire_others sent
2. Create `useReceivedInspire` hook — queries inspire_others received
3. Update Inspire tab to add Sent/Received sections below Summary Cards and My Beliefs
4. Reuse SentEntryCard/ReceivedEntryCard

### Done Criteria
- [ ] Inspire tab shows My Beliefs, Beliefs Shared, Beliefs Received
- [ ] Sent entries show recipient name
- [ ] Received entries show sender name (or "Someone" if anonymous)
- [ ] Correct data from inspire_others table
- [ ] No TypeScript errors

### STOP — Verify before continuing

---

## Checkpoint 5: Polish & Commit

### Tasks

1. Verify all counts match between Quick Prep and individual tabs
2. Test with client that has no sent/received data (empty states)
3. Test with client that has rich sent/received data
4. Ensure no duplicate queries (optimize if needed)
5. Commit and push
6. Create handoff doc

### Done Criteria
- [ ] All sent/received data displays correctly
- [ ] Empty states handled gracefully
- [ ] Performance acceptable
- [ ] No TypeScript errors
- [ ] Build passes
- [ ] Committed and pushed
- [ ] Handoff doc created

---

## Files Summary

### New Hooks
```
apps/dashboard/src/hooks/
├── useSentReceivedCounts.ts (NEW)
├── useSentImpact.ts (NEW)
├── useReceivedImpact.ts (NEW)
├── useSentImprove.ts (NEW)
├── useReceivedImprove.ts (NEW)
├── useSentInspire.ts (NEW)
└── useReceivedInspire.ts (NEW)
```

### New Components
```
apps/dashboard/src/components/client-detail/
├── SentEntryCard.tsx (NEW)
└── ReceivedEntryCard.tsx (NEW)
```

### Modified Files
```
apps/dashboard/src/components/client-detail/
├── QuickPrepSection.tsx (add sent/received counts)
├── tabs/ImpactTab.tsx (add sent/received sections)
├── tabs/ImproveTab.tsx (add sent/received sections)
└── tabs/InspireTab.tsx (add sent/received sections)
```

---

## Starter Prompt for Claude Code

```
Starting Phase E.5: Sent/Received Data for Coaching

Read docs/phase_e5_build_plan.md for full spec.

This adds visibility into:
- What client SENT to others (recognitions, witnessed growth, beliefs)
- What client RECEIVED from others

Data sources:
- Impact: priorities (with target_email), recognitions table
- Improve: validation_invitations, validations (with recipient_email)
- Inspire: inspire_others table (sender_email, recipient_email)

Start with Checkpoint 1: Quick Prep Enhancement

STOP after each checkpoint for validation.
```

---

**End of Phase E.5 Build Plan**

---

## Future: Dashboard ↔ Together Alignment

After Phase E.5, a comprehensive walkthrough is planned to:
- Review Together app's new structure (Four I's, landing pages, flows)
- Identify gaps where Dashboard doesn't match Together's patterns
- Create alignment spec for Dashboard to mirror Together's UX where appropriate
- Ensure coach view complements client experience

This will be scoped as Phase F or a dedicated alignment session.
