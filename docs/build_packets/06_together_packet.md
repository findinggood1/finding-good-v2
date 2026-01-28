# Together Integration Build Packet

**Created:** January 26, 2026  
**Updated:** January 26, 2026 (Architecture decisions added)  
**For Session:** Session 6 (Together Integration)  
**Confidence Rating:** 🟢 High

---

## 0. ARCHITECTURE DECISIONS (January 26, 2026)

### User Roles

We've defined four user types with a single TypeScript type:

```typescript
export type UserRole = 'user' | 'client' | 'coach' | 'admin';
```

| Role | App | Access |
|------|-----|--------|
| user | Together | Tools for personal use, no coach |
| client | Together | Tools + coach connection, data visible to their coach |
| coach | Dashboard | See their clients only, session prep |
| admin | Dashboard (elevated) | See all users, manage coaches, system controls |

### Architecture Decision: Option A — Embed Tools in Together

**Decision Made:** Tools are embedded WITHIN Together, not routed to separate apps.

**Before (deprecated):**
```
together.findinggood.com → Hub only (links out)
priority.findinggood.com → Separate standalone app
proof.findinggood.com → Separate standalone app
predict.findinggood.com → Separate standalone app
```

**After (implemented):**
```
together.findinggood.com → THE client app
  /priority → Embedded Priority tool
  /proof → Embedded Proof tool  
  /predict → Embedded Predict tool
  /home → Campfire feed
  /today → Daily check-in
  ...
```

**Why This Matters:**
- Single navigation experience
- Shared state/context across tools
- One auth context
- Simpler deployment
- User doesn't leave the app

### Lead Magnet Strategy

Existing standalone tool apps become lead magnets / public landing pages:

| URL | Purpose | Behavior |
|-----|---------|----------|
| `predict.findinggood.com` | Lead magnet, FIRES assessment | Public landing → sign up → redirect to `together.findinggood.com/predict` |
| `priority.findinggood.com` | Lead magnet, daily confirmation | Public landing → sign up → redirect to `together.findinggood.com/priority` |
| `proof.findinggood.com` | Lead magnet, validation | Public landing → sign up → redirect to `together.findinggood.com/proof` |

**URL Redirects (post-auth):**
```
predict.findinggood.com/[any] → together.findinggood.com/predict
priority.findinggood.com/[any] → together.findinggood.com/priority
proof.findinggood.com/[any] → together.findinggood.com/proof
```

### User Role Detection

```typescript
// On login, determine role from multiple sources
async function getUserRole(email: string): Promise<UserRole> {
  // Check coaching_relationships for client status
  const { data: clientRel } = await supabase
    .from('coaching_relationships')
    .select('id')
    .eq('client_email', email)
    .eq('status', 'active')
    .single();
  
  if (clientRel) return 'client';
  
  // Check if user has coach profile
  const { data: coachProfile } = await supabase
    .from('coaches')  // or similar table
    .select('id')
    .eq('email', email)
    .single();
  
  if (coachProfile) return 'coach';
  
  // Default: regular user
  return 'user';
}
```

### Conditional UI Based on Role

| UI Element | user | client |
|------------|------|--------|
| Map page | 🔒 "Reach out to inquire" | ✅ Full access |
| Chat page | 🔒 "Reach out to inquire" | ✅ Full access |
| Coach indicator | Hidden | "Your coach: [name]" |
| Share to coach | N/A | Toggle on entries |
| All other tools | Full access | Full access |

---

## 1. OVERVIEW

### What This Session Builds
- Sidebar navigation (DAILY / GIVE / BUILD / DIRECTION structure)
- Home page with Circle tracker + Campfire feed
- Today page with daily check-in integration
- **Tools embedded at /priority, /proof, /predict routes**
- Navigation between all sections
- Notifications display
- **User role detection (user vs client)**
- **Conditional UI based on role**

### What This Session Does NOT Build
- Map page (P2 — coached users only)
- Chat page (P2 — coached users only)
- AI synthesis features (Future Enhancement)
- URL redirects from standalone tools (DevOps task)
- Email notifications (separate infrastructure)
- Standalone tool apps (remain as lead magnets)

### Priority
- **P0 (Must Have):** Sidebar, Home/Campfire, Today/Check-in, embedded tools, role detection
- **P1 (Should Have):** Circle tracker, notifications, "Inspire me", conditional UI
- **P2 (Nice to Have):** Map, Chat, focus history tracking

---

## 2. CODE MIGRATION NOTES

### Files to Adapt from apps/priority

| Source File | Adaptation Needed |
|-------------|-------------------|
| `src/pages/Priority.tsx` | → `apps/together/src/pages/Priority.tsx` (embed) |
| `src/components/*` | Copy or import from shared |
| `src/hooks/usePriority.ts` | → Keep logic, update imports |

### Files to Adapt from apps/prove

| Source File | Adaptation Needed |
|-------------|-------------------|
| `src/pages/Proof.tsx` | → `apps/together/src/pages/Proof.tsx` (embed) |
| `src/components/*` | Copy or import from shared |
| `src/hooks/useProof.ts` | → Keep logic, update imports |

### Files to Adapt from apps/predict

| Source File | Adaptation Needed |
|-------------|-------------------|
| `src/pages/Predict.tsx` | → `apps/together/src/pages/Predict.tsx` (embed) |
| `src/components/*` | Copy or import from shared |
| `src/hooks/usePrediction.ts` | → Keep logic, update imports |

### Migration Strategy

1. **Don't duplicate** — Move tool logic to Together, not copy
2. **Shared components** — Any component used by multiple tools → `@finding-good/shared`
3. **Tool-specific components** — Stay in `apps/together/src/components/[tool]/`
4. **Hooks** — Move to `apps/together/src/hooks/` with clear naming

### Import Path Changes

```typescript
// Before (in standalone app)
import { usePriority } from '../hooks/usePriority';
import { PriorityForm } from '../components/PriorityForm';

// After (in Together)
import { usePriority } from '../../hooks/usePriority';
import { PriorityForm } from '../../components/priority/PriorityForm';
```

---

## 3. ROUTE STRUCTURE

### Together App Routes

```typescript
// apps/together/src/App.tsx
<Routes>
  {/* DAILY */}
  <Route path="/" element={<Navigate to="/home" />} />
  <Route path="/home" element={<Home />} />
  <Route path="/today" element={<Today />} />
  
  {/* GIVE (opens tools in Send mode) */}
  <Route path="/priority" element={<Priority />} />
  <Route path="/proof" element={<Proof />} />
  <Route path="/predict" element={<Predict />} />
  
  {/* DIRECTION (role-gated) */}
  <Route path="/map" element={<ProtectedRoute requiredRole="client"><Map /></ProtectedRoute>} />
  <Route path="/chat" element={<ProtectedRoute requiredRole="client"><Chat /></ProtectedRoute>} />
  
  {/* SETTINGS */}
  <Route path="/focus" element={<Focus />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/learn" element={<Learn />} />
</Routes>
```

### Mode Parameters

Tools can open in different modes based on sidebar click:

```
/priority → default (My Entries)
/priority?mode=send → Send to Someone tab
/proof → default (My Entries)
/proof?mode=send → Send to Someone tab (Witness)
/predict → default (My Goals)
/predict?mode=send → Send to Someone tab (Believe)
```

---

## 4. SCHEMA SLICE

### Tables This Tool READS

| Table | What It Reads | Purpose |
|-------|---------------|---------|
| `permissions` | User's Permission, Practice, Focus | Today page, My Focus |
| `daily_checkins` | Check-in history | Today page, Circle tracker |
| `priorities` | Where share_to_feed = true | Campfire feed |
| `validations` | Where share_to_feed = true | Campfire feed |
| `predictions` | Where share_to_feed = true | Campfire feed |
| `inspiration_shares` | Feed content | Campfire display |
| `share_recognitions` | Recognition counts | Feed cards |
| `user_circles` | Circle membership | Circle tracker, feed filtering |
| `clients` | User identity, role info | Profile, role detection |
| `coaching_relationships` | Coach connection status | Profile, access control, role detection |

### Tables This Tool WRITES

| Table | What It Writes | When |
|-------|----------------|------|
| `daily_checkins` | Check-in entry | Daily check-in completion |
| `share_recognitions` | Recognition | User clicks "Recognized" on feed |
| `inspire_requests` | Nudge | User clicks "Inspire me" on circle |

### Key Table Definitions

```sql
-- user_circles (who is in my circle)
CREATE TABLE user_circles (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  circle_member_email TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'sent_to',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_email, circle_member_email)
);

-- inspiration_shares (Campfire feed content)
CREATE TABLE inspiration_shares (
  id UUID PRIMARY KEY,
  client_email TEXT NOT NULL,
  content_type TEXT NOT NULL,    -- 'priority' | 'proof' | 'prediction'
  content_id UUID NOT NULL,      -- FK to source entry
  prediction_id UUID,
  share_text TEXT,
  fires_extracted JSONB,
  hidden_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  shared_at TIMESTAMPTZ DEFAULT now(),
  recognized_count INTEGER DEFAULT 0
);

-- share_recognitions (who recognized what)
CREATE TABLE share_recognitions (
  id UUID PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES inspiration_shares(id),
  recognizer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(share_id, recognizer_email)
);

-- inspire_requests (gentle nudges)
CREATE TABLE inspire_requests (
  id UUID PRIMARY KEY,
  requester_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- coaching_relationships (for role detection)
CREATE TABLE coaching_relationships (
  id UUID PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  client_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending_coach_invite, pending_client_request, active, paused, completed
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---


## 5. TYPES SLICE

### Types to Use (from @finding-good/shared)

```typescript
// User role type (new)
export type UserRole = 'user' | 'client' | 'coach' | 'admin';

// Core types
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';
export type ContentType = 'priority' | 'proof' | 'prediction';
export type CircleRelationshipType = 'sent_to' | 'received_from' | 'mutual';

// User context with role
export interface UserContext {
  email: string;
  name?: string;
  role: UserRole;
  coachName?: string;  // If role === 'client'
  coachEmail?: string;
}

// Campfire feed item
export interface CampfireItem {
  id: string;
  type: ContentType;
  author_email: string;
  author_name?: string;
  content: string;           // The share_text or integrity_line/proof_line
  fires_extracted?: FiresElement[];
  recognized_count: number;
  shared_at: string;
  content_id: string;        // Original entry ID
  has_recognized?: boolean;  // Current user recognized this
}

// Circle member for tracker
export interface CircleMember {
  email: string;
  name?: string;
  permission_statement?: string;  // Their "Permission"
  checked_in_today: boolean;
  last_checkin_date?: string;
}

// Notification item
export interface NotificationItem {
  id: string;
  type: 'recognition' | 'response' | 'inspire' | 'belief';
  from_email: string;
  from_name?: string;
  message: string;
  content_id?: string;
  created_at: string;
  read: boolean;
}

// Daily check-in (from Permission types)
export interface DailyCheckin {
  id: string;
  client_email: string;
  permission_id?: string;
  check_date: string;
  focus_scores: FocusScore[];
  created_at: string;
}

export interface FocusScore {
  focus_name: string;
  completed: boolean;
  engagement?: number;      // 1-5
  emerged_text?: string;    // For "something else emerged"
}
```

---

## 6. COMPONENT INVENTORY

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
| ProtectedRoute | components/layout/ProtectedRoute.tsx | Auth wrapper |
| AuthContext | contexts/AuthContext.tsx | Auth state |
| supabase | lib/supabase.ts | DB client |

### Created by Foundation Session (USE THESE)

| Component | Location | Use For |
|-----------|----------|---------|
| FiresBadge | packages/shared/components/ui/ | FIRES element display |
| EngagementIndicator | packages/shared/components/ui/ | 1-5 score visual |
| CampfireCard | packages/shared/components/exchange/ | Feed item display |
| CircleStatusRow | packages/shared/components/exchange/ | Circle member row |
| RecognizeButton | packages/shared/components/exchange/ | Recognition action |
| BridgeQuestionCard | packages/shared/components/exchange/ | Post-checkin question |

### Create in apps/together (THIS SESSION)

| Component | Purpose | Location |
|-----------|---------|----------|
| Sidebar | Main navigation | src/components/layout/ |
| CircleTracker | Shows who checked in | src/components/home/ |
| CampfireFeed | Feed container | src/components/home/ |
| NotificationList | Notification display | src/components/home/ |
| CheckinForm | Daily check-in UI | src/components/today/ |
| WeekHistory | Week's check-in visual | src/components/today/ |
| FocusSetup | My Focus management | src/components/focus/ |
| RoleGate | Conditional UI by role | src/components/layout/ |
| LockedFeature | "Reach out to inquire" | src/components/layout/ |

---

## 7. INTEGRATION POINTS

### Data Flow IN (What Together Reads)

| Source | Data | Via |
|--------|------|-----|
| Permission tool | User's Focus items | `permissions` table |
| Daily check-ins | Check-in history | `daily_checkins` table |
| Priority tool | Shared priorities | `priorities` WHERE share_to_feed = true |
| Proof tool | Shared proofs | `validations` WHERE share_to_feed = true |
| Predict tool | Shared predictions | `predictions` WHERE share_to_feed = true |
| Circle data | Who user is connected to | `user_circles` table |
| Coaching relationship | User role, coach info | `coaching_relationships` table |

### Data Flow OUT (What Together Produces)

| Destination | Data | When |
|-------------|------|------|
| `daily_checkins` | Check-in entry | User completes daily check-in |
| `share_recognitions` | Recognition | User clicks recognize on feed |
| `inspire_requests` | Nudge | User clicks "Inspire me" |
| Priority tool | Entry context | Bridge question → Priority with pre-fill |

### Connects To

| Tool/App | How |
|----------|-----|
| Permission | Together reads permissions.focus for check-in |
| Priority | **Embedded at /priority route**, bridge flows to Priority |
| Proof | **Embedded at /proof route** |
| Predict | **Embedded at /predict route** |
| Dashboard | Shares database, coach sees same entries |

---

## 8. UI SPEC

### Sidebar Navigation

```
┌──────────────────┐
│ DAILY            │
│   🏠 Home        │
│   📅 Today       │
│   ✓✓○○ 2/4       │  ← Circle check-in indicator
│                  │
│ GIVE             │
│   💬 Recognize   │  → /priority?mode=send
│   👁 Witness     │  → /proof?mode=send
│   🌟 Believe     │  → /predict?mode=send
│                  │
│ BUILD            │
│   ⭐ Priority    │  → /priority
│   📝 Proof       │  → /proof
│                  │
│ DIRECTION        │
│   🎯 Predict     │  → /predict
│   🧭 Map     🔒  │  → /map (client role only)
│   💬 Chat    🔒  │  → /chat (client role only)
│                  │
│ ─────────────────│
│ ⚙️ My Focus      │  → /focus
│ 👤 Profile       │  → /profile
│ ─────────────────│
│ [?] Learn        │  → /learn
└──────────────────┘
```

**Navigation Logic:**
- GIVE items open embedded tools in "Send" mode (witness/recognize someone)
- BUILD items open embedded tools in "My Entries" mode
- Lock icons 🔒 shown for `user` role (not `client` role)
- Circle indicator shows X/Y checked in today

**Role-Based UI:**
```tsx
// Example conditional rendering
{userContext.role === 'client' ? (
  <NavItem to="/map" icon="🧭" label="Map" />
) : (
  <LockedFeature icon="🧭" label="Map" message="Reach out to inquire about access" />
)}
```

---

### Home Page (Campfire Feed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HOME                                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ YOUR CIRCLE TODAY                                                       │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Sarah              ✓ David             ○ Elena        ○ Marcus    │ │
│ │   Rebuild trust        Lead authentically  Find balance   Scale     │ │
│ │                                            [Inspire me]  [Inspire]  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ NOTIFICATIONS                                                    [Clear]│
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🔔 Sarah recognized your share about team transparency              │ │
│ │ 🔔 David responded to your ask about delegation                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ CAMPFIRE                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Sarah                                                    [F] [R]    │ │
│ │ ⭐ Priority • 2 hours ago                                           │ │
│ │                                                                     │ │
│ │ "Finally had the conversation about workload with my manager"       │ │
│ │                                                                     │ │
│ │ 💭 What did they prioritize?                                        │ │
│ │                                                                     │ │
│ │ [✓ Recognized]  [💬 Ask them]  [🔥 Share yours]                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ David                                                    [R] [S]    │ │
│ │ 📝 Proof • 5 hours ago                                              │ │
│ │                                                                     │ │
│ │ "Delegated the client presentation and it went better than mine"    │ │
│ │                                                                     │ │
│ │ 💭 What worked here?                                                │ │
│ │                                                                     │ │
│ │ [✓ Recognized]  [💬 Ask them]  [🔥 Share yours]                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Today Page (Daily Check-in)

**Before Check-in:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TODAY                                                    [⚙️ My Focus]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Where was your focus today?                                             │
│                                                                         │
│ ☐ Self-care                                                             │
│   → If checked: How engaged were you? [1] [2] [3] [4] [5]              │
│                                                                         │
│ ☐ Team 1:1s                                                             │
│   → If checked: How engaged were you? [1] [2] [3] [4] [5]              │
│                                                                         │
│ ☐ Strategic planning                                                    │
│   → If checked: How engaged were you? [1] [2] [3] [4] [5]              │
│                                                                         │
│ ☐ Something else emerged                                                │
│   → If checked: What? [text field]                                      │
│                                                                         │
│                                                          [Done]         │
└─────────────────────────────────────────────────────────────────────────┘
```

**After Check-in (Bridge Question):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TODAY                                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ✓ Checked in!                                                           │
│                                                                         │
│ You engaged most with Self-care today (4/5)                             │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ What made Self-care land?                                           │ │
│ │                                                                     │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ [Answer textarea]                                               │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                     │ │
│ │ [Skip]                           [Continue to Priority →]           │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. TEST SCENARIOS

### Scenario: First-Time User (Sarah)

**Happy Path:**
1. Sarah signs up, opens Together
2. Sees "Welcome" or educational content
3. Two entry paths: "Recognize Someone" OR "Set Up My Focus"
4. Chooses "Set Up My Focus"
5. Adds 3 Focus items
6. Returns to Home, sees empty Campfire (no circle yet)
7. Goes to Today, completes first check-in
8. Sees bridge question, answers it
9. Flows to embedded Priority with context

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| No Focus items set | Today shows "Set up your Focus first" prompt |
| Empty circle | Campfire shows "Share something to start building your circle" |

### Scenario: User vs Client Role

**User (no coach):**
1. Marcus opens Together (user role)
2. Sidebar shows Map and Chat with 🔒 icons
3. Clicks Map → sees "Reach out to inquire about access"
4. All other tools work normally

**Client (has coach):**
1. Elena opens Together (client role)  
2. Sidebar shows Map and Chat without locks
3. Profile shows "Your coach: [Coach Name]"
4. Entries have "Share with coach" toggle

### Scenario: Daily Check-in (Marcus)

**Happy Path:**
1. Marcus opens Together, goes to Today
2. Sees his 3 Focus items with checkboxes
3. Checks 2 items (Self-care: 4/5, Team 1:1s: 3/5)
4. Clicks Done
5. Sees bridge question: "What made Self-care land?" (highest score)
6. Types answer, clicks "Continue to Priority"
7. **Embedded** Priority opens with Self-care pre-filled

### Scenario: Navigation Between Embedded Tools

**Happy Path:**
1. User on /home clicks "Priority" in sidebar
2. /priority loads with embedded Priority tool
3. User creates entry
4. User clicks "Proof" in sidebar
5. /proof loads, Priority state preserved in React Query cache
6. Back to /priority shows same state

---

## 10. DONE CRITERIA

### P0 — Must Complete

- [ ] Sidebar renders with all sections (DAILY/GIVE/BUILD/DIRECTION)
- [ ] Navigation works to all routes
- [ ] **User role detection on login**
- [ ] **Conditional UI for user vs client role**
- [ ] Home page loads
- [ ] Circle tracker displays (shows who checked in)
- [ ] Campfire feed displays shared items
- [ ] "Recognized" button works
- [ ] Today page loads
- [ ] Check-in form shows user's Focus items
- [ ] Check-in saves to `daily_checkins`
- [ ] Bridge question appears after check-in
- [ ] Bridge flows to **embedded** Priority with context
- [ ] /priority route works (**embedded tool**)
- [ ] /proof route works (**embedded tool**)
- [ ] /predict route works (**embedded tool**)
- [ ] /focus route works (My Focus setup)
- [ ] No TypeScript errors
- [ ] No console errors

### P1 — Should Complete If Time

- [ ] Notifications section on Home
- [ ] "Inspire me" button on circle members
- [ ] Week history display after check-in
- [ ] Engagement averages by Focus item
- [ ] Educational/overview page at /learn
- [ ] Lock icons on Map/Chat for user role
- [ ] Coach name display for client role

### P2 — Defer

- [ ] Map page (/map)
- [ ] Chat page (/chat)
- [ ] Focus history tracking
- [ ] Email notifications

---

## CRITICAL FLAGS

🟢 **Architecture decision confirmed:** Tools embedded in Together (Option A)

🟢 **No blockers identified**

🟡 **NOTE:** Tool code migration — Review existing apps/priority, apps/prove, apps/predict code and migrate relevant components

🟡 **NOTE:** Campfire feed can be built in two ways:
- **Direct query:** Query priorities/validations/predictions with share_to_feed = true
- **Via inspiration_shares:** Use the denormalized feed table
- Recommend starting with direct query (simpler), migrate to inspiration_shares later

🟡 **NOTE:** Circle membership bootstrapping — users won't have circles initially. Consider auto-populating from prediction_connections or exchange history.

---

## FILES TO CREATE

```
apps/together/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           ← Navigation component
│   │   ├── RoleGate.tsx          ← Role-based rendering
│   │   └── LockedFeature.tsx     ← "Reach out to inquire"
│   ├── home/
│   │   ├── CircleTracker.tsx     ← Who checked in
│   │   ├── CampfireFeed.tsx      ← Feed container
│   │   ├── CampfireItem.tsx      ← Individual feed card
│   │   └── NotificationList.tsx  ← Notifications
│   ├── today/
│   │   ├── CheckinForm.tsx       ← Daily check-in UI
│   │   ├── BridgeQuestion.tsx    ← Post-checkin question
│   │   └── WeekHistory.tsx       ← Week visual
│   ├── focus/
│   │   └── FocusSetup.tsx        ← My Focus management
│   ├── priority/                 ← Migrated from apps/priority
│   │   └── (migrated components)
│   ├── proof/                    ← Migrated from apps/prove
│   │   └── (migrated components)
│   └── predict/                  ← Migrated from apps/predict
│       └── (migrated components)
├── pages/
│   ├── Home.tsx                  ← /home route
│   ├── Today.tsx                 ← /today route
│   ├── Priority.tsx              ← /priority route (EMBEDDED)
│   ├── Proof.tsx                 ← /proof route (EMBEDDED)
│   ├── Predict.tsx               ← /predict route (EMBEDDED)
│   ├── Focus.tsx                 ← /focus route
│   ├── Profile.tsx               ← /profile route
│   ├── Learn.tsx                 ← /learn route
│   ├── Map.tsx                   ← /map (P2, role-gated)
│   └── Chat.tsx                  ← /chat (P2, role-gated)
├── hooks/
│   ├── useCircle.ts              ← Circle data
│   ├── useCampfire.ts            ← Feed data
│   ├── useCheckin.ts             ← Check-in operations
│   ├── useNotifications.ts       ← Notifications
│   ├── useUserRole.ts            ← Role detection
│   ├── usePriority.ts            ← Migrated
│   ├── useProof.ts               ← Migrated
│   └── usePrediction.ts          ← Migrated
├── contexts/
│   └── UserContext.tsx           ← Role + user state
└── App.tsx                       ← Router setup
```

---

## DATABASE QUERIES

### Get user role

```typescript
const { data: role } = await supabase.rpc('get_user_role', { 
  user_email: email 
});

// Or manual check:
const { data: clientRel } = await supabase
  .from('coaching_relationships')
  .select('coach_id, coaches(name)')
  .eq('client_email', userEmail)
  .eq('status', 'active')
  .single();

const role = clientRel ? 'client' : 'user';
const coachName = clientRel?.coaches?.name;
```

### Get user's circle with check-in status

```typescript
const { data: circle } = await supabase
  .from('user_circles')
  .select(`
    circle_member_email,
    clients!inner(name),
    permissions(permission)
  `)
  .eq('user_email', userEmail);

// Then check today's check-ins
const today = new Date().toISOString().split('T')[0];
const { data: checkins } = await supabase
  .from('daily_checkins')
  .select('client_email')
  .eq('check_date', today)
  .in('client_email', circleEmails);
```

### Get Campfire feed (direct query approach)

```typescript
// Get shared priorities from circle
const { data: priorities } = await supabase
  .from('priorities')
  .select('id, client_email, integrity_line, fires_extracted, created_at')
  .eq('share_to_feed', true)
  .in('client_email', circleEmails)
  .order('created_at', { ascending: false })
  .limit(20);

// Get shared proofs from circle
const { data: validations } = await supabase
  .from('validations')
  .select('id, client_email, proof_line, fires_extracted, created_at')
  .eq('share_to_feed', true)
  .in('client_email', circleEmails)
  .order('created_at', { ascending: false })
  .limit(20);

// Merge and sort by date
```

### Save daily check-in

```typescript
const { error } = await supabase
  .from('daily_checkins')
  .upsert({
    client_email: userEmail,
    permission_id: permissionId,
    check_date: today,
    focus_scores: [
      { focus_name: 'Self-care', completed: true, engagement: 4 },
      { focus_name: 'Team 1:1s', completed: true, engagement: 3 },
      { focus_name: 'Strategic planning', completed: false },
    ],
  }, { onConflict: 'client_email,check_date' });
```

---

**End of Together Integration Build Packet**
