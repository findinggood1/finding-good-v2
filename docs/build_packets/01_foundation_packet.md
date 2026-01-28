# Foundation Build Packet

**Created:** January 26, 2026  
**For Session:** Session 1 (MUST COMPLETE FIRST)  
**Confidence Rating:** 🟢 High

---

## 1. OVERVIEW

### What This Session Builds
- TypeScript interfaces integration (shared_types_v2.ts → @finding-good/shared)
- New shared UI components for exchange features
- Edge function contracts (AI analysis stubs)
- Database verification (confirm V4 schema running)
- Constants updates for V2 terminology

### What This Session Does NOT Build
- Individual tool UIs (Sessions 2-5)
- Together/Dashboard integration (Sessions 6-7)
- AI function implementations (just contracts/stubs)
- Data migration (schema is already clean)

### Priority
- **P0 (Must Have):** Types integration, basic shared components, database verification
- **P1 (Should Have):** Edge function stubs, exchange components
- **P2 (Nice to Have):** Advanced AI prompt templates

---

## 2. SCHEMA SLICE

**Status:** Schema V4 already migrated to Supabase (12 tables added, 3 columns, 6 triggers)

### NEW Tables (V4)

```sql
-- Core new tables created in V4 migration
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  prediction_id UUID REFERENCES predictions(id),
  practice TEXT,
  permission TEXT,
  focus JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  permission_id UUID REFERENCES permissions(id),
  check_date DATE NOT NULL,
  focus_scores JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_email, check_date)
);

CREATE TABLE coaching_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending_coach_invite',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  invite_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE weekly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  week_number INTEGER,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  activity_counts JSONB,
  themes JSONB,
  language_patterns JSONB,
  fires_signals JSONB,
  exchanges JSONB,
  open_threads JSONB,
  coaching_questions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rolling_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  coaching_start DATE,
  total_weeks INTEGER DEFAULT 0,
  permission_evolution JSONB,
  persistent_themes JSONB,
  fires_trajectory JSONB,
  relationship_map JSONB,
  questions_explored JSONB,
  breakthroughs JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agreed_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  source TEXT NOT NULL,
  activity_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  evidence_entries JSONB,
  coach_notes TEXT,
  visibility TEXT DEFAULT 'shared',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE session_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  session_date DATE,
  transcript_text TEXT,
  transcript_source TEXT,
  extracted_themes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE focus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  focus_name TEXT NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE,
  evolved_into TEXT,
  reason TEXT
);

CREATE TABLE user_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  circle_member_email TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'sent_to',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_email, circle_member_email)
);

CREATE TABLE inspiration_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  share_text TEXT,
  recognized_count INTEGER DEFAULT 0,
  shared_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES inspiration_shares(id),
  recognizer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(share_id, recognizer_email)
);

CREATE TABLE inspire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### NEW Columns Added to Existing Tables

```sql
-- predictions table
ALTER TABLE predictions ADD COLUMN what_matters_most TEXT;
ALTER TABLE predictions ADD COLUMN share_to_feed BOOLEAN DEFAULT false;

-- priorities table
ALTER TABLE priorities ADD COLUMN share_to_feed BOOLEAN DEFAULT false;
ALTER TABLE priorities ADD COLUMN shared_at TIMESTAMPTZ;

-- validations table
ALTER TABLE validations ADD COLUMN share_to_feed BOOLEAN DEFAULT false;
ALTER TABLE validations ADD COLUMN shared_at TIMESTAMPTZ;

-- clients table
ALTER TABLE clients ADD COLUMN calendar_link TEXT;
```

---

## 3. TYPES SLICE

The complete `shared_types_v2.ts` file needs to be integrated into `packages/shared/src/types/`.

### Key Types to Add

```typescript
// From shared_types_v2.ts - Core enums
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';
export type CoachingRelationshipStatus = 'pending_coach_invite' | 'pending_client_request' | 'active' | 'paused' | 'completed';
export type ActivityStatus = 'pending' | 'evidence_found' | 'resolved' | 'deprioritized';
export type ActivitySource = 'focus' | 'session' | 'transcript';
export type ContentType = 'priority' | 'proof' | 'predict';
export type CircleRelationshipType = 'sent_to' | 'received_from' | 'mutual';
export type FocusEndReason = 'paused' | 'evolved' | 'completed';

// Key interfaces
export interface FocusItem { name: string; linked_goal_id?: string; order: number; }
export interface FocusScore { focus_name: string; completed: boolean; engagement?: number | null; emerged_text?: string | null; }
export interface Permission { id: string; client_email: string; /* ... */ }
export interface DailyCheckin { id: string; client_email: string; check_date: string; focus_scores: FocusScore[]; /* ... */ }
export interface CoachingRelationship { id: string; coach_id: string; client_email: string; status: CoachingRelationshipStatus; /* ... */ }
// ... (see full shared_types_v2.ts for complete interfaces)

// Composite types for UI
export type ClientStatus = 'active' | 'moderate' | 'quiet' | 'needs_outreach';
export interface ClientEngagementSummary { client_email: string; status: ClientStatus; checkins_this_week: number; /* ... */ }
export interface CampfireItem { id: string; type: ContentType; author_email: string; content: string; /* ... */ }
export interface BridgeQuestion { trigger: 'highest' | 'lowest' | 'nothing' | 'emerged'; question: string; /* ... */ }

// Helper functions
export function calculateClientStatus(checkinsThisWeek: number, avgEngagement: number): ClientStatus;
export function getBridgeQuestion(focusScores: FocusScore[]): BridgeQuestion | null;
```

---

## 4. COMPONENT INVENTORY

### Already Exists in @finding-good/shared (USE THESE)

| Component | Location | Use For |
|-----------|----------|---------|
| Button | components/ui/Button.tsx | All buttons |
| Card | components/ui/Card.tsx | Content containers |
| Input | components/ui/Input.tsx | Text inputs |
| Textarea | components/ui/Textarea.tsx | Multi-line text |
| Badge | components/ui/Badge.tsx | Status indicators |
| LoadingSpinner | components/ui/LoadingSpinner.tsx | Loading states |
| PageContainer | components/layout/PageContainer.tsx | Page wrapper |
| TopBar | components/layout/TopBar.tsx | Header navigation |
| BottomNav | components/layout/BottomNav.tsx | Mobile navigation |
| ProtectedRoute | components/layout/ProtectedRoute.tsx | Auth wrapper |
| AuthContext | contexts/AuthContext.tsx | Auth state |
| supabase | lib/supabase.ts | DB client |
| calculations | lib/calculations.ts | Score calculations |

### Needs to Be Created (This Session)

| Component | Purpose | Where It Goes |
|-----------|---------|---------------|
| FiresBadge | Display FIRES element with color | packages/shared/src/components/ui/ |
| EngagementIndicator | 1-5 scale visual | packages/shared/src/components/ui/ |
| CircleStatusRow | Shows check-in status for circle | packages/shared/src/components/exchange/ |
| CampfireCard | Feed item display | packages/shared/src/components/exchange/ |
| RecognizeButton | Recognition action | packages/shared/src/components/exchange/ |
| BridgeQuestionCard | Question after check-in | packages/shared/src/components/exchange/ |

---

## 5. INTEGRATION POINTS

### Data Flow IN (What Foundation Provides)

| Consumer | Data | Via |
|----------|------|-----|
| All Tools | FiresElement type + colors | `@finding-good/shared` types |
| All Tools | Supabase client | `@finding-good/shared` lib |
| Together | CampfireItem, CircleMember types | `@finding-good/shared` types |
| Dashboard | ClientStatus, ClientEngagementSummary | `@finding-good/shared` types |
| Permission | Permission, DailyCheckin, FocusScore | `@finding-good/shared` types |

### Data Flow OUT (What Foundation Produces)

| Destination | Data | When |
|-------------|------|------|
| Supabase | None (reads only) | Schema already exists |

### Connects To

| Other Tool/App | How |
|----------------|-----|
| Permission | Uses Permission, DailyCheckin types |
| Priority | Uses priorities table extensions |
| Proof | Uses validations table extensions |
| Predict | Uses predictions table extensions |
| Together | Uses all exchange components + types |
| Dashboard | Uses aggregation types + components |

---

## 6. UI SPEC

### No UI in Foundation Session

Foundation creates shared infrastructure only. No screens.

### Component Specifications

**FiresBadge**
```
Props: { element: FiresElement; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }
Display: Colored circle/badge with element initial or label
Colors from FIRES_DISPLAY constant
```

**EngagementIndicator**
```
Props: { value: number; max?: number; interactive?: boolean; onChange?: (val) => void }
Display: 5 dots/circles, filled based on value
Interactive mode for check-in input
```

**CampfireCard**
```
Props: { item: CampfireItem; onRecognize?: () => void }
Display: Author, content preview, FIRES badge, recognize count, button
```

---

## 7. TEST SCENARIOS

### Scenario: Types Import Correctly

**Happy Path:**
1. In any app, add `import { FiresElement, Permission } from '@finding-good/shared'`
2. TypeScript compiles without errors
3. IntelliSense shows correct properties

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Missing type | Compile error with clear message |
| Wrong enum value | TypeScript error |

### Scenario: Components Render

**Happy Path:**
1. Import FiresBadge
2. Render with element="resilience"
3. Shows green badge with "R"

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid element | TypeScript error (won't compile) |
| No props | Default rendering |

### Scenario: Database Tables Exist

**Happy Path:**
1. Query `SELECT * FROM permissions LIMIT 1`
2. Returns empty array (no data yet)
3. Column names match types

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Table missing | Query error → stop build |
| Column mismatch | Query error → check migration |

---

## 8. DONE CRITERIA

### Types Integration
- [ ] `shared_types_v2.ts` content added to `packages/shared/src/types/index.ts`
- [ ] All exports working from `@finding-good/shared`
- [ ] Types compile in predict, priority, proof, together, dashboard apps

### Components Created
- [ ] FiresBadge component with all 5 FIRES colors
- [ ] EngagementIndicator component (1-5 visual)
- [ ] CampfireCard component (basic layout)
- [ ] RecognizeButton component
- [ ] All components exported from `@finding-good/shared`

### Constants Updated
- [ ] FIRES_DISPLAY with colors and labels
- [ ] FIRES_ELEMENTS array

### Database Verification
- [ ] All 12 new tables accessible via Supabase client
- [ ] New columns on predictions, priorities, validations accessible
- [ ] RLS policies don't block authenticated queries

### Edge Function Stubs (P1)
- [ ] `priority-recognition-analyze` stub created
- [ ] `proof-witness-analyze` stub created
- [ ] `weekly-synthesis` stub created
- [ ] All return typed responses

---

## CRITICAL FLAGS

🟢 **No blockers identified**

🟡 **NOTE:** Existing `types/index.ts` may have some types that overlap with shared_types_v2.ts. Merge carefully to avoid duplicate exports.

🟡 **NOTE:** Component styling should use existing Tailwind patterns. Check current Button/Card for conventions.

---

## FILES TO CREATE

```
packages/shared/src/
├── types/
│   └── index.ts  ← MERGE shared_types_v2.ts content here
├── components/
│   ├── ui/
│   │   ├── FiresBadge.tsx  ← NEW
│   │   └── EngagementIndicator.tsx  ← NEW
│   └── exchange/  ← NEW FOLDER
│       ├── index.ts
│       ├── CampfireCard.tsx
│       ├── CircleStatusRow.tsx
│       ├── RecognizeButton.tsx
│       └── BridgeQuestionCard.tsx
└── constants/
    └── index.ts  ← ADD FIRES_DISPLAY, FIRES_ELEMENTS
```

---

**End of Foundation Build Packet**
