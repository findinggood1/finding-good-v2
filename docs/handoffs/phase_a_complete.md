# Phase A Complete: Navigation Restructure to Four I's Framework

**Date Completed:** January 27, 2026
**Branch:** master

---

## What Was Built

### New Files Created

| File | Purpose |
|------|---------|
| `apps/together/src/components/layout/NavDropdown.tsx` | Reusable expandable nav component with active-state detection |
| `apps/together/src/pages/ImpactLandingPage.tsx` | Landing page with description + For Yourself / For Others cards |
| `apps/together/src/pages/ImpactSelfPage.tsx` | Re-exports PriorityPage as ImpactSelfPage |
| `apps/together/src/pages/ImpactOthersPage.tsx` | Re-exports PriorityPage as ImpactOthersPage |
| `apps/together/src/pages/ImproveLandingPage.tsx` | Landing page with description + For Yourself / For Others cards |
| `apps/together/src/pages/ImproveSelfPage.tsx` | Re-exports ProofPage as ImproveSelfPage |
| `apps/together/src/pages/ImproveOthersPage.tsx` | Re-exports ProofPage as ImproveOthersPage |
| `apps/together/src/pages/InspireLandingPage.tsx` | Landing page with description + For Yourself / For Others cards |
| `apps/together/src/pages/InspireSelfPage.tsx` | Re-exports PredictPage as InspireSelfPage |
| `apps/together/src/pages/InspireOthersPage.tsx` | Re-exports PredictPage as InspireOthersPage |
| `apps/together/src/pages/PartnershipViewPage.tsx` | Placeholder for Phase D |

### Files Modified

| File | Changes |
|------|---------|
| `apps/together/src/components/layout/Sidebar.tsx` | Full restructure: PRIMARY → TOOLS (dropdowns) → DIRECTION → UTILITY |
| `apps/together/src/components/layout/index.ts` | Added NavDropdown export |
| `apps/together/src/components/AppLayout.tsx` | Removed unused `circleCheckedIn` prop |
| `apps/together/src/pages/index.ts` | Added all new page exports |
| `apps/together/src/App.tsx` | New route structure + old route redirects |

---

## New Navigation Structure

```
PRIMARY (no label):
  Home (/)          — 🏠
  Campfire (/campfire) — 🔥
  Exchange (/exchange) — 🤝

TOOLS (section label):
  Impact (/impact)   — ⚡  [dropdown: About, For Yourself, For Others]
  Improve (/improve)  — 📈  [dropdown: About, For Yourself, For Others]
  Inspire (/inspire)  — ✨  [dropdown: About, For Yourself, For Others]

DIRECTION (section label):
  Map (/map)    — 🧭  [locked for non-clients]
  Chat (/chat)  — 💬  [locked for non-clients]

UTILITY (bottom):
  Profile (/profile) — 👤
  Learn (/learn)     — 📖
```

---

## Routes Added

| Route | Page |
|-------|------|
| `/impact` | ImpactLandingPage |
| `/impact/self` | ImpactSelfPage (wraps PriorityPage) |
| `/impact/others` | ImpactOthersPage (wraps PriorityPage) |
| `/improve` | ImproveLandingPage |
| `/improve/self` | ImproveSelfPage (wraps ProofPage) |
| `/improve/others` | ImproveOthersPage (wraps ProofPage) |
| `/inspire` | InspireLandingPage |
| `/inspire/self` | InspireSelfPage (wraps PredictPage) |
| `/inspire/others` | InspireOthersPage (wraps PredictPage) |
| `/exchange/:partnerId` | PartnershipViewPage (placeholder) |

## Redirects Added

| Old Route | New Route |
|-----------|-----------|
| `/home` | `/` |
| `/today` | `/` |
| `/focus` | `/` |
| `/priority` | `/impact/self` |
| `/priority/*` | `/impact/self` |
| `/proof` | `/improve/self` |
| `/proof/*` | `/improve/self` |
| `/predict` | `/inspire/self` |
| `/predict/*` | `/inspire/self` |

---

## Known Limitations & TODOs for Phase B+

1. **Others pages are identical to Self pages** — the "Others" wrappers just re-export the same component. The existing PriorityPage/ProofPage/PredictPage don't accept a `defaultMode` prop, so self vs. others differentiation needs to be built in Phase C.

2. **HomePage is unchanged** — still shows old content. Phase B will rebuild it as the unified Influence page with daily check-in, focus items, recent activity, and insights.

3. **ExchangePage is unchanged** — Phase D will rebuild it as partnership views.

4. **No lucide-react icons** — the project uses emoji strings for nav icons. The naming concordance references lucide-react icons, but the dependency isn't installed. NavDropdown was built with string icons to match the existing pattern.

5. **`FocusSetupPage` and `DailyCheckinPage` imports removed from App.tsx** — these pages still exist but are no longer routed. The `/focus` route now redirects to `/`. If these need to be accessible, they should be integrated into the new HomePage in Phase B.

6. **Mobile nav (BottomNav in AppLayout)** — not updated in this phase. It uses a separate component from `@finding-good/shared`. Should be updated to match the new structure.

---

**Next:** Phase B — Build out HomePage with Influence/daily check-in functionality.
