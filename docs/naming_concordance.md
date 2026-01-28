# Finding Good V2: Naming Concordance

**Created:** January 27, 2026  
**Purpose:** Single source of truth for all naming changes  
**Rule:** Reference this document when touching ANY file

---

## The Four I's Framework

| Concept | Old Name | New Name | Icon | Color |
|---------|----------|----------|------|-------|
| Declaring influence | My Focus / Permission | **INFLUENCE** (merged into Home) | Home | #1B5666 |
| What went well | Priority | **IMPACT** | Zap | #1B5666 |
| How growth happened | Proof | **INSIGHT** | TrendingUp | #81C784 |
| What's possible | Predict | **INSPIRE** | Sparkles | #FFD54F |

### ⚠️ PENDING RENAME: Improve → Insight

**Status:** To be implemented after Phase B  
**Reason:** Marketing alignment — "Insight" better captures the discovery aspect of validating growth

**What will change:**
- Routes: `/improve/*` → `/insight/*`
- Pages: `ImproveLandingPage` → `InsightLandingPage`, etc.
- Sidebar labels: "Improve" → "Insight"
- All UI references to "Improve" / "Improvement"

**What stays same:**
- Database table name: `validations` (unchanged)
- Internal hook names (optional to change)

---

## Tool Name Changes

### Self Mode (for yourself)

| Old | New | Route Change |
|-----|-----|--------------|
| Priority (self) | Impact (self) | `/priority` → `/impact/self` |
| Proof (self) | Improve (self) | `/proof` → `/improve/self` |
| Predict (self) | Inspire (self) | `/predict` → `/inspire/self` |

### Others Mode (for someone else)

| Old | New | Route Change |
|-----|-----|--------------|
| Recognize | Impact (others) | `/priority?mode=send` → `/impact/others` |
| Witness | Improve (others) | `/proof?mode=send` → `/improve/others` |
| Believe | Inspire (others) | `/predict?mode=send` → `/inspire/others` |

---

## Navigation Section Changes

### Old Structure
```
DAILY:     Home, Today
GIVE:      Recognize, Witness, Believe, Exchange
BUILD:     Priority, Proof
DIRECTION: Predict, Map, Chat
BOTTOM:    My Focus, Profile, Learn
```

### New Structure
```
PRIMARY:   Home (Influence), Campfire, Exchange
TOOLS:     Impact (dropdown), Improve (dropdown), Inspire (dropdown)
DIRECTION: Map (locked), Chat (locked)
UTILITY:   Profile, Learn
```

---

## Route Mapping

### Routes That Change

| Old Route | New Route | Notes |
|-----------|-----------|-------|
| `/home` | `/` or `/home` | Now includes Focus/Today functionality |
| `/today` | `/` (merged) | Part of Home |
| `/focus` | `/` (merged) | Part of Home |
| `/priority` | `/impact/self` | Tool renamed |
| `/priority?mode=send` | `/impact/others` | Mode becomes route |
| `/proof` | `/improve/self` | Tool renamed |
| `/proof?mode=send` | `/improve/others` | Mode becomes route |
| `/predict` | `/inspire/self` | Tool renamed |
| `/predict?mode=send` | `/inspire/others` | Mode becomes route |

### New Routes

| Route | Purpose |
|-------|---------|
| `/impact` | Landing page for Impact |
| `/improve` | Landing page for Improve |
| `/inspire` | Landing page for Inspire |
| `/exchange` | Partnership views |
| `/exchange/:partnerId` | Individual partner view |

### Routes That Stay Same

| Route | Purpose |
|-------|---------|
| `/campfire` | Social feed |
| `/map` | Deep metrics (locked for non-clients) |
| `/chat` | Coach conversation (locked for non-clients) |
| `/profile` | Settings |
| `/learn` | Framework explanation |

### Redirects Needed

```typescript
// Old routes → new routes
'/today' → '/'
'/focus' → '/'
'/priority' → '/impact/self'
'/priority?mode=send' → '/impact/others'
'/proof' → '/improve/self'
'/proof?mode=send' → '/improve/others'
'/predict' → '/inspire/self'
'/predict?mode=send' → '/inspire/others'
```

---

## Database Table Names

**Tables stay the same** — we're renaming UI labels, not database tables.

| Table | UI Name (Old) | UI Name (New) |
|-------|---------------|---------------|
| `priorities` | Priority entries | Impact entries |
| `validations` | Proof entries | Improve entries |
| `predictions` | Predictions | Inspire entries / Beliefs |
| `permissions` | Permission/Practice/Focus | Influence |
| `daily_checkins` | Check-ins | Check-ins |
| `daily_reflections` | (new) | Daily reflections |
| `exchange_partnerships` | (new) | Exchange partnerships |

---

## UI Label Changes

### Page Titles

| Old | New |
|-----|-----|
| "My Focus" | "Your Influence" |
| "Today" | (merged into Home) |
| "Record a Priority" | "Record Your Impact" |
| "Recognize Someone" | "Recognize Someone's Impact" |
| "Validate Your Proof" | "Validate Your Improvement" |
| "Witness Someone's Proof" | "Witness Someone's Growth" |
| "Create a Prediction" | "Define Your Beliefs" |
| "Share a Belief" | "Tell Someone What You Believe They Can Do" |

### Button Labels

| Old | New |
|-----|-----|
| "Record Priority" | "Record Impact" |
| "Send Recognition" | "Recognize Impact" |
| "Validate" | "Validate Improvement" |
| "Witness" | "Witness Growth" |
| "Create Prediction" | "Define Belief" |
| "Share Belief" | "Inspire Someone" |

### Card/Entry Type Labels

| Old | New |
|-----|-----|
| "Priority" | "Impact" |
| "Proof" | "Improvement" |
| "Prediction" | "Belief" / "Inspiration" |

---

## Component Renames

### Pages

| Old File | New File |
|----------|----------|
| `PriorityPage.tsx` | `ImpactSelfPage.tsx` |
| `ProofPage.tsx` | `ImproveSelfPage.tsx` |
| `PredictPage.tsx` | `InspireSelfPage.tsx` |
| `TodayPage.tsx` | (merged into HomePage) |
| `FocusPage.tsx` | (merged into HomePage) |

### Hooks

| Old | New | Notes |
|-----|-----|-------|
| `usePriority` | `useImpact` | Or keep internal name, change UI labels |
| `useProof` | `useImprove` | Or keep internal name, change UI labels |
| `usePrediction` | `useInspire` | Or keep internal name, change UI labels |

**Recommendation:** Keep hook names for now (less code churn), just update UI labels.

---

## Campfire Feed Changes

### Content Type Labels

| Old | New |
|-----|-----|
| `content_type: 'priority'` | Display as "Impact" |
| `content_type: 'proof'` | Display as "Improvement" |
| `content_type: 'prediction'` | Display as "Belief" |

### Feed Item Display

| Old | New |
|-----|-----|
| "⭐ Priority • 2 hours ago" | "⚡ Impact • 2 hours ago" |
| "📝 Proof • 5 hours ago" | "📈 Improvement • 5 hours ago" |
| "🎯 Prediction • 1 day ago" | "✨ Belief • 1 day ago" |

---

## Dashboard Changes

### Client View Sections

| Old | New |
|-----|-----|
| "Recent Priorities" | "Recent Impact" |
| "Recent Proofs" | "Recent Improvements" |
| "Active Predictions" | "Active Beliefs" |
| "Priority entries" | "Impact entries" |
| "Validation entries" | "Improvement entries" |

### Coach Prep View

| Old | New |
|-----|-----|
| "Focus items" | "Influence focus" |
| "Priority themes" | "Impact themes" |
| "Proof patterns" | "Improvement patterns" |

---

## Sidebar Icons

| Item | Icon | Library |
|------|------|---------|
| Home | `Home` | lucide-react |
| Campfire | `Flame` | lucide-react |
| Exchange | `Users` | lucide-react |
| Impact | `Zap` | lucide-react |
| Improve | `TrendingUp` | lucide-react |
| Inspire | `Sparkles` | lucide-react |
| Map | `Map` | lucide-react |
| Chat | `MessageCircle` | lucide-react |
| Profile | `User` | lucide-react |
| Learn | `BookOpen` | lucide-react |

---

## Content/Copy Changes

### Home Section Headers

| Old | New |
|-----|-----|
| "YOUR PERMISSION" | "YOUR INFLUENCE" |
| "YOUR PRACTICE" | "YOUR PRACTICE" (stays same) |
| "YOUR FOCUS" | "YOUR FOCUS" (stays same) |

### Landing Page Taglines

| Tool | Tagline |
|------|---------|
| Impact | "What went well? Where did you or others make a difference?" |
| Improve | "How did growth actually happen?" |
| Inspire | "What do you believe is possible?" |

### Others Mode Descriptions

| Tool | Others Mode Copy |
|------|------------------|
| Impact | "Recognize the impact someone had on you" |
| Improve | "Help someone see their improvement" |
| Inspire | "Tell someone what you believe they can do" |

---

## Search & Replace Reference

When updating files, search for these terms:

| Search | Replace With | Context |
|--------|--------------|---------|
| `Priority` | `Impact` | UI labels only |
| `priority` (route) | `impact` | Route strings |
| `Proof` | `Improve` / `Improvement` | UI labels only |
| `proof` (route) | `improve` | Route strings |
| `Predict` | `Inspire` | UI labels only |
| `predict` (route) | `inspire` | Route strings |
| `Recognize` | `Impact (Others)` | Nav labels |
| `Witness` | `Improve (Others)` | Nav labels |
| `Believe` | `Inspire (Others)` | Nav labels |
| `My Focus` | `Influence` | Section headers |

---

## Files Likely Affected

### Together App
```
apps/together/src/
├── components/layout/Sidebar.tsx        ← Nav labels
├── pages/
│   ├── HomePage.tsx                     ← Section headers
│   ├── PriorityPage.tsx                 ← Rename to ImpactSelfPage
│   ├── ProofPage.tsx                    ← Rename to ImproveSelfPage
│   ├── PredictPage.tsx                  ← Rename to InspireSelfPage
│   ├── CampfirePage.tsx                 ← Content type labels
│   └── (new landing pages)
├── App.tsx                              ← Route definitions
└── components/
    ├── home/CampfireCard.tsx            ← Type badges
    └── (various)
```

### Dashboard App
```
apps/dashboard/src/
├── components/
│   ├── ClientCard.tsx                   ← Entry type labels
│   ├── ClientDetail.tsx                 ← Section headers
│   └── QuickPrep.tsx                    ← Category labels
└── pages/
    └── (various client views)
```

### Shared Package
```
packages/shared/src/
├── types/                               ← Type comments/docs only
└── components/
    └── CampfireCard.tsx                 ← Type display labels
```

---

## Checklist for Any File Update

When editing a file, check:

- [ ] Page title/header updated?
- [ ] Button labels updated?
- [ ] Route references updated?
- [ ] Icon references updated?
- [ ] Content type display labels updated?
- [ ] Comments/docs updated?
- [ ] Test descriptions updated?

---

**End of Naming Concordance**
