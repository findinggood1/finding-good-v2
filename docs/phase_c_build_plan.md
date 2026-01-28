# Phase C Build Plan: Tool Landing Pages, Renames, & Inspire Others

**Created:** January 27, 2026  
**Updated:** January 27, 2026  
**Purpose:** Create info landing pages for Impact/Improve/Inspire, rename existing tools, BUILD Inspire Others flow  
**Estimated Time:** 1-2 sessions (added Inspire Others flow)  
**Dependencies:** Phase A complete (routes exist), Phase B complete (Home page)

---

## Objective

Create professional landing pages for each of the three I's that:
1. Explain what the tool is about
2. Provide clear paths to "For Yourself" and "For Others" modes
3. Show recent entries for that tool type
4. Update existing tool pages with new labels

---

## Pre-Build Checklist

- [ ] Phase A complete (routes and placeholders exist)
- [ ] Read `navigation_restructure_v1.md` Part 5 for landing page content
- [ ] Read `naming_concordance.md` for all label mappings
- [ ] Verify current PriorityPage, ProofPage, PredictPage are working
- [ ] Note any mode switching logic in existing tools

---

## Checkpoint 1: Reusable Landing Page Component

**Goal:** Create a template component for tool landing pages

### Tasks

1. Create `apps/together/src/components/tools/ToolLandingPage.tsx`

```tsx
interface ToolLandingPageProps {
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  selfMode: {
    title: string;
    description: string;
    route: string;
    buttonText: string;
  };
  othersMode: {
    title: string;
    description: string;
    route: string;
    buttonText: string;
  };
  recentEntries?: Array<{
    id: string;
    preview: string;
    date: string;
    type: 'self' | 'others';
  }>;
}
```

2. Layout:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Icon]  TITLE                                                  │
│  Tagline goes here                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Description paragraph explaining the concept and why           │
│  it matters...                                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   FOR YOURSELF      │    │    FOR OTHERS       │            │
│  │                     │    │                     │            │
│  │   Description       │    │   Description       │            │
│  │                     │    │                     │            │
│  │   [Button]          │    │   [Button]          │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  RECENT ENTRIES                                                 │
│  • Entry preview... (2h ago)                      [Self]        │
│  • Entry preview... (yesterday)                   [Others]      │
│  • Entry preview... (3d ago)                      [Self]        │
│                                          [View All →]           │
└─────────────────────────────────────────────────────────────────┘
```

3. Features:
   - Cards are clickable (navigate to route)
   - Buttons are prominent CTAs
   - Recent entries show 3-5 items with type badges
   - Responsive (stack cards on mobile)

### Done Criteria
- [ ] ToolLandingPage component renders correctly
- [ ] Accepts all props as defined
- [ ] Cards navigate to correct routes
- [ ] Responsive on mobile
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 2: Impact Landing Page

**Goal:** Create the Impact landing page with specific content

### Tasks

1. Update `apps/together/src/pages/ImpactLandingPage.tsx`
   - Use ToolLandingPage component
   - Content from naming_concordance.md:

```tsx
const impactConfig = {
  title: "IMPACT",
  tagline: "What went well? Where did you or others make a difference?",
  description: "Impact is about recognizing the positive difference being made — by you and by others. When you notice impact, you strengthen your ability to create more of it.",
  icon: Zap,
  color: "#1B5666", // Deep Teal
  selfMode: {
    title: "For Yourself",
    description: "Record the impact you had today. Reflect on what went well and what you contributed.",
    route: "/impact/self",
    buttonText: "Record My Impact"
  },
  othersMode: {
    title: "For Others", 
    description: "Recognize the impact someone had on you. Send acknowledgment to someone who made a difference.",
    route: "/impact/others",
    buttonText: "Recognize Someone"
  }
};
```

2. Create `apps/together/src/hooks/useRecentToolEntries.ts`
   - Fetches recent entries by tool type
   - For Impact: queries `priorities` table
   - Returns formatted preview data

3. Connect recent entries to landing page

### Done Criteria
- [ ] Impact landing page displays all content
- [ ] Cards navigate to /impact/self and /impact/others
- [ ] Recent entries load and display
- [ ] Styling matches brand (Deep Teal)
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 3: Improve Landing Page

**Goal:** Create the Improve landing page with specific content

### Tasks

1. Update `apps/together/src/pages/ImproveLandingPage.tsx`
   - Use ToolLandingPage component
   - Content:

```tsx
const improveConfig = {
  title: "IMPROVE",
  tagline: "How did growth actually happen?",
  description: "Improvement isn't just about outcomes — it's about understanding the process. When you validate how you grew, you can repeat it. When you help others see their growth, you multiply it.",
  icon: TrendingUp,
  color: "#81C784", // Green (Resilience color)
  selfMode: {
    title: "For Yourself",
    description: "Validate your improvement. Reflect on how you overcame a challenge or experienced growth.",
    route: "/improve/self",
    buttonText: "Validate My Growth"
  },
  othersMode: {
    title: "For Others",
    description: "Help someone see their improvement. Witness growth in another person and share what you observed.",
    route: "/improve/others", 
    buttonText: "Witness Someone's Growth"
  }
};
```

2. Update useRecentToolEntries hook to support 'improve' type
   - For Improve: queries `validations` table

### Done Criteria
- [ ] Improve landing page displays all content
- [ ] Cards navigate to /improve/self and /improve/others
- [ ] Recent entries load from validations table
- [ ] Styling consistent with Improve theme
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 4: Inspire Landing Page

**Goal:** Create the Inspire landing page with specific content

### Tasks

1. Update `apps/together/src/pages/InspireLandingPage.tsx`
   - Use ToolLandingPage component
   - Content:

```tsx
const inspireConfig = {
  title: "INSPIRE",
  tagline: "What do you believe is possible?",
  description: "Inspiration comes from belief — in yourself and in others. When you name what you believe you can do, and when you tell others what you believe they can do, you create possibility.",
  icon: Sparkles,
  color: "#FFD54F", // Yellow (Ethics color)
  selfMode: {
    title: "For Yourself",
    description: "Define what you believe you can accomplish. Set intentions and predictions for what's possible.",
    route: "/inspire/self",
    buttonText: "Define My Beliefs"
  },
  othersMode: {
    title: "For Others",
    description: "Tell someone what you believe they can do. Share your belief in another person's potential.",
    route: "/inspire/others",
    buttonText: "Inspire Someone"
  }
};
```

2. Update useRecentToolEntries hook to support 'inspire' type
   - For Inspire: queries `predictions` table

### Done Criteria
- [ ] Inspire landing page displays all content
- [ ] Cards navigate to /inspire/self and /inspire/others
- [ ] Recent entries load from predictions table
- [ ] Styling consistent with Inspire theme
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 5: Update Tool Self Pages

**Goal:** Rename and update labels in the "self" mode tool pages

### Tasks

1. Update `apps/together/src/pages/ImpactSelfPage.tsx`
   - If currently just re-exporting PriorityPage, update to:
     - Render PriorityPage component but with updated header
     - OR create wrapper that sets context for "Impact" branding
   - Update any visible labels from "Priority" to "Impact"
   - Update page title/header to "Record Your Impact"

2. Update `apps/together/src/pages/ImproveSelfPage.tsx`
   - Similar approach with ProofPage
   - Update labels from "Proof" to "Improve"
   - Update header to "Validate Your Improvement"

3. Update `apps/together/src/pages/InspireSelfPage.tsx`
   - Similar approach with PredictPage
   - Update labels from "Predict" to "Inspire"
   - Update header to "Define Your Beliefs"

### Approach Options

**Option A: Wrapper with prop override**
```tsx
// ImpactSelfPage.tsx
export function ImpactSelfPage() {
  return <PriorityPage title="Record Your Impact" toolName="Impact" />;
}
```

**Option B: Full rename (more work but cleaner)**
- Copy PriorityPage → ImpactSelfPage
- Update all internal references
- Eventually delete PriorityPage

For Phase C, recommend Option A (wrapper) for speed. Full rename can happen in polish phase.

### Done Criteria
- [ ] Each self page shows updated branding
- [ ] Functionality unchanged (tool still works)
- [ ] Headers reflect new naming
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 6: Update Tool Others Pages

**Goal:** Rename and update labels in the "others" mode tool pages

### Tasks

1. Update `apps/together/src/pages/ImpactOthersPage.tsx`
   - Currently routes to Priority with mode=send
   - Update labels to "Recognize Someone's Impact"
   - Ensure mode is set correctly

2. Update `apps/together/src/pages/ImproveOthersPage.tsx`
   - Routes to Proof with mode=send
   - Update labels to "Witness Someone's Growth"
   
3. Update `apps/together/src/pages/InspireOthersPage.tsx`
   - Routes to Predict with mode=send
   - Update labels to "Tell Someone What You Believe They Can Do"

### Note on Inspire Others

This is the wording Brian specified:
- **Old:** "Share a belief with someone"
- **New:** "Tell others what you believe they can do"

Make sure the Inspire Others flow asks questions like:
- "Who do you want to inspire?"
- "What do you believe they can accomplish?"
- "Why do you believe this about them?"

### Done Criteria
- [ ] Each others page shows updated branding
- [ ] Functionality unchanged
- [ ] Headers and CTAs reflect new naming
- [ ] Inspire Others has correct framing
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 7: Build Inspire Others Flow (NEW)

**Goal:** Create the "Tell someone what you believe they can do" flow

### Why This Is Needed

Unlike Impact Others (RecognizePage) and Improve Others (OtherMode) which are already built, 
**Inspire Others does not exist yet**. The Predict app only has self-mode (NewPredictionPage).

### Tasks

1. Create `apps/predict/src/pages/InspireOthersPage.tsx`
   - New page for the "others" flow
   - Multi-step form similar to OtherMode in Prove

2. Flow Steps:

```
Step 1: WHO
┌─────────────────────────────────────────────────────────────────┐
│  Who do you want to inspire?                                    │
│                                                                 │
│  Their Name: [________________]                                 │
│  Their Email (optional): [________________]                     │
│                                                                 │
│                                          [Continue]             │
└─────────────────────────────────────────────────────────────────┘

Step 2: WHAT
┌─────────────────────────────────────────────────────────────────┐
│  What do you believe {name} can accomplish?                     │
│                                                                 │
│  [Helper chips: "I believe they can...", "They have the        │
│   ability to...", "They're capable of..."]                      │
│                                                                 │
│  [Textarea - min 20 chars]                                      │
│                                                                 │
│                                [Back]    [Continue]             │
└─────────────────────────────────────────────────────────────────┘

Step 3: WHY
┌─────────────────────────────────────────────────────────────────┐
│  Why do you believe this about {name}?                          │
│                                                                 │
│  [Helper chips: "I've seen them...", "They showed me...",      │
│   "When they...", "Their track record shows..."]                │
│                                                                 │
│  [Textarea - min 20 chars]                                      │
│                                                                 │
│                                [Back]    [Continue]             │
└─────────────────────────────────────────────────────────────────┘

Step 4: COMPLETE
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Your belief is ready to share!                               │
│                                                                 │
│  For {name}:                                                    │
│  "I believe you can [accomplishment]"                           │
│                                                                 │
│  Because: [why text]                                            │
│                                                                 │
│  [Share Link]  [Copy]                                           │
│                                                                 │
│  [Inspire Someone Else]  [Done]                                 │
└─────────────────────────────────────────────────────────────────┘
```

3. Database Storage:
   - Save to `predictions` table with `mode = 'send'` or `type = 'inspire_others'`
   - Fields: `target_name`, `target_email`, `belief_text`, `reason_text`
   - Generate `share_id` for shareable link

4. OR Create separate table `inspire_others` if cleaner:
```sql
CREATE TABLE inspire_others (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  belief_text TEXT NOT NULL,
  reason_text TEXT NOT NULL,
  share_id TEXT UNIQUE DEFAULT nanoid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. Create recipient view page:
   - `apps/predict/src/pages/InspireRecipientView.tsx`
   - Route: `/inspire/:shareId` or `/b/:shareId`
   - Shows: "Someone believes you can..."
   - Optional: Let recipient respond/thank

### Done Criteria
- [ ] InspireOthersPage renders with all steps
- [ ] Form validation works (names required, min chars)
- [ ] Saves to database (predictions or new table)
- [ ] Share link generated and copyable
- [ ] Recipient can view via share link
- [ ] No TypeScript errors
- [ ] Build passes

### STOP — Final verification with Brian

---

## Phase C Complete Checklist

- [ ] ToolLandingPage component complete
- [ ] ImpactLandingPage complete with content
- [ ] ImproveLandingPage complete with content
- [ ] InspireLandingPage complete with content
- [ ] useRecentToolEntries hook works for all types
- [ ] ImpactSelfPage updated with new branding
- [ ] ImproveSelfPage updated with new branding
- [ ] InspireSelfPage updated with new branding
- [ ] ImpactOthersPage updated with new branding
- [ ] ImproveOthersPage updated with new branding
- [ ] InspireOthersPage — **NEW FLOW BUILT** (not just branding)
- [ ] Inspire Others saves to database
- [ ] Inspire Others share link works
- [ ] All tools still function correctly
- [ ] Recent entries display on landing pages
- [ ] Navigation flows smoothly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes
- [ ] useRecentToolEntries hook works for all types
- [ ] ImpactSelfPage updated with new branding
- [ ] ImproveSelfPage updated with new branding
- [ ] InspireSelfPage updated with new branding
- [ ] ImpactOthersPage updated with new branding
- [ ] ImproveOthersPage updated with new branding
- [ ] InspireOthersPage updated with new branding
- [ ] All tools still function correctly
- [ ] Recent entries display on landing pages
- [ ] Navigation flows smoothly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes

---

## Files Created/Modified Summary

### New Components
```
apps/together/src/components/tools/
├── ToolLandingPage.tsx
└── index.ts
```

### New Hooks
```
apps/together/src/hooks/
└── useRecentToolEntries.ts
```

### Updated Pages
```
apps/together/src/pages/
├── ImpactLandingPage.tsx (full implementation)
├── ImpactSelfPage.tsx (updated branding)
├── ImpactOthersPage.tsx (updated branding)
├── ImproveLandingPage.tsx (full implementation)
├── ImproveSelfPage.tsx (updated branding)
├── ImproveOthersPage.tsx (updated branding)
├── InspireLandingPage.tsx (full implementation)
├── InspireSelfPage.tsx (updated branding)
└── InspireOthersPage.tsx (updated branding)

apps/predict/src/pages/
├── InspireOthersPage.tsx (NEW — full flow)
└── InspireRecipientView.tsx (NEW — share link view)
```

---

## Content Reference

### Impact (was Priority)
| Old Term | New Term |
|----------|----------|
| Priority | Impact |
| Record a priority | Record your impact |
| Recognize someone | Recognize someone's impact |
| What went well | What impact did you have |

### Improve (was Proof)
| Old Term | New Term |
|----------|----------|
| Proof | Improve |
| Validate | Validate your improvement |
| Witness | Witness someone's growth |
| How it happened | How growth happened |

### Inspire (was Predict)
| Old Term | New Term |
|----------|----------|
| Predict | Inspire |
| Create a prediction | Define your beliefs |
| Share a belief | Tell someone what you believe they can do |
| Goal/Challenge | What you believe is possible |

---

## Handoff Notes

After Phase C:
- All three tools have professional landing pages
- Tool branding updated from Priority/Proof/Predict to Impact/Improve/Inspire
- Users see clear path to self vs others modes
- Ready for Phase D: Exchange functionality

---

**End of Phase C Build Plan**
