# Dashboard Build Packet

**Created:** January 26, 2026  
**For Session:** Session 7 (Dashboard)  
**Confidence Rating:** 🟢 High

---

## 0. ARCHITECTURE DECISIONS (January 26, 2026)

### User Roles

Dashboard serves two roles with same app, different views:

```typescript
export type UserRole = 'user' | 'client' | 'coach' | 'admin';
```

| Role | App | Access |
|------|-----|--------|
| coach | Dashboard | See their clients only, session prep |
| admin | Dashboard (elevated) | See all users, manage coaches, system controls |

### Dashboard Architecture

**Single App, Role-Gated Views:**
- Same codebase at `dashboard.findinggood.com`
- Role detected on login
- Conditional navigation and data access

```
Coach View:
  /clients → My clients only
  /clients/:id → Client detail
  /sessions → My scheduled sessions
  /settings → Coach profile

Admin View (V2 minimal):
  /users → All users (filterable by role)
  /coaches → Coach list (approve/remove)
  /clients → All clients (filterable)
  + All coach features
```

### Key Differences by Role

| Feature | Coach | Admin |
|---------|-------|-------|
| Client list | Only their assigned clients | All clients (any coach) |
| User list | N/A | All users |
| Coach management | N/A | Approve/remove coaches |
| Role assignment | N/A | Promote user to coach/client |
| System health | N/A | Deferred (P3) |

---

## 1. OVERVIEW

### What This Session Builds

**Coach View (Primary Focus):**
- Client list with status indicators
- Discovery view (patterns clients don't see)
- Session prep (15-20 min before session)
- Client detail pages
- Quick prep section
- Private coach notes

**Admin View (V2 Minimal Scope):**
- User list (all users, filterable by role)
- Coach list (approve/remove coaches)
- Role assignment (promote user to coach)

**Shared Layout:**
- Role detection on login
- Conditional navigation based on role
- Same app, different views

### What This Session Does NOT Build
- System health dashboard (P3)
- Login history / audit logs (P3)
- Enterprise admin features (P3)
- AI synthesis features (P2 — scaffold only)
- Fathom transcript integration (P3)
- Calendar integration (P2)

### Priority
- **P0 (Must Have):** Client list, client detail, role detection, coach filtering
- **P1 (Should Have):** Quick prep section, pattern detection display, admin user list
- **P2 (Nice to Have):** Admin coach management, role assignment
- **P3 (Future):** System health, audit logs, enterprise features

---

## 2. SCHEMA SLICE

### Tables This Tool READS

| Table | What Coach Reads | What Admin Reads |
|-------|------------------|------------------|
| `clients` | Own clients | All clients |
| `coaching_relationships` | WHERE coach_id = me | All relationships |
| `permissions` | Client's Permission/Practice/Focus | All |
| `daily_checkins` | Client check-in history | All |
| `priorities` | Client priorities | All |
| `validations` | Client proofs | All |
| `predictions` | Client predictions | All |
| `agreed_activities` | Client activities | All |
| `coaching_context` | Client context | All |
| `coaches` | Own profile | All coaches |
| `scheduled_sessions` | Own sessions | All sessions |

### Tables This Tool WRITES

| Table | What It Writes | When |
|-------|----------------|------|
| `coach_notes` | Private notes | Coach adds note |
| `agreed_activities` | Activity updates | Coach marks resolved |
| `coaching_context` | Breakthroughs, themes | Coach marks breakthrough |
| `coaching_relationships` | Status changes | Admin/Coach actions |

### Key Table Definitions

```sql
-- coaching_relationships (core relationship)
CREATE TABLE coaching_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_coach_invite',
  -- 'pending_coach_invite' | 'pending_client_request' | 'active' | 'paused' | 'completed'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- coaches table
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_admin BOOLEAN DEFAULT false,
  calendar_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- coach_notes (private)
CREATE TABLE coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_email TEXT NOT NULL,
  note_text TEXT NOT NULL,
  visibility TEXT DEFAULT 'coach_only',  -- Always coach_only for notes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- coaching_context (AI-enriched client context)
CREATE TABLE coaching_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL UNIQUE,
  coaching_start DATE,
  total_weeks INTEGER,
  permission_evolution JSONB,      -- How Permission/Practice/Focus changed
  persistent_themes JSONB,         -- Themes that keep appearing
  fires_trajectory JSONB,          -- Score/zone changes over time
  relationship_map JSONB,          -- Who they engage with
  questions_explored JSONB,        -- What's been discussed
  breakthroughs JSONB,             -- Coach-marked moments
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- agreed_activities
CREATE TABLE agreed_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  coach_id UUID REFERENCES coaches(id),
  source TEXT,                      -- 'focus' | 'session' | 'transcript'
  activity_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',    -- 'pending' | 'evidence_found' | 'resolved' | 'deprioritized'
  evidence_entries JSONB,           -- Array of entry IDs
  coach_notes TEXT,
  visibility TEXT DEFAULT 'shared', -- 'shared' | 'coach_only'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. TYPES SLICE

```typescript
// User roles
export type UserRole = 'user' | 'client' | 'coach' | 'admin';

// Core types (from @finding-good/shared)
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';

// Coach context
export interface CoachContext {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  calendarLink?: string;
}

// Client list item (for coach view)
export interface ClientListItem {
  email: string;
  name: string;
  status: ClientStatus;
  challengeTitle?: string;          // From predictions.title
  permissionStatement?: string;     // From predictions.what_matters_most
  focusItems: string[];             // From permissions.focus
  weekNumber: number;               // Calculated from coaching_start
  totalWeeks: number;
  nextSessionDate?: string;
  lastActiveDate?: string;
  checkinsThisWeek: number;
  totalCheckins: number;
  avgEngagement: number;
  hasPattern: boolean;              // AI detected pattern
  hasPendingActivities: boolean;
  hasNewEntries: boolean;           // Since coach last viewed
}

export type ClientStatus = 'active' | 'moderate' | 'quiet' | 'needs_outreach';

// Client detail
export interface ClientDetail extends ClientListItem {
  coachNotes: CoachNote[];
  agreedActivities: AgreedActivity[];
  recentEntries: ClientEntry[];
  coachingContext?: CoachingContext;
}

// Coach note
export interface CoachNote {
  id: string;
  noteText: string;
  createdAt: string;
}

// Agreed activity
export interface AgreedActivity {
  id: string;
  source: 'focus' | 'session' | 'transcript';
  activityText: string;
  status: 'pending' | 'evidence_found' | 'resolved' | 'deprioritized';
  evidenceEntries?: string[];
  coachNotes?: string;
  visibility: 'shared' | 'coach_only';
  createdAt: string;
}

// Client entry (priority, proof, or prediction)
export interface ClientEntry {
  id: string;
  type: 'priority' | 'proof' | 'prediction';
  content: string;
  firesExtracted?: FiresElement[];
  createdAt: string;
  isNew: boolean;                   // Since coach last viewed
}

// Coaching context (AI-enriched)
export interface CoachingContext {
  coachingStart?: string;
  totalWeeks?: number;
  permissionEvolution?: PermissionEvolution[];
  persistentThemes?: string[];
  firesTrajectory?: FiresTrajectory[];
  breakthroughs?: Breakthrough[];
}

export interface PermissionEvolution {
  date: string;
  permission: string;
  practice?: string;
  focus?: string[];
}

export interface FiresTrajectory {
  date: string;
  scores: Record<FiresElement, number>;
}

export interface Breakthrough {
  id: string;
  date: string;
  description: string;
  markedBy: string;             // Coach who marked it
}

// Admin types
export interface UserListItem {
  email: string;
  name?: string;
  role: UserRole;
  coachName?: string;           // If role === 'client'
  createdAt: string;
  lastActiveAt?: string;
}

export interface CoachListItem {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  clientCount: number;
  activeClientCount: number;
  createdAt: string;
}
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
| FiresBadge | components/ui/FiresBadge.tsx | FIRES element display |
| EngagementIndicator | components/ui/EngagementIndicator.tsx | 1-5 score visual |

### Already Exists in apps/dashboard (REVIEW + MODIFY)

| Component | Current State | Action |
|-----------|--------------|--------|
| Clients.tsx | Table with filters | Modify for new cards |
| ClientDetail.tsx | 8-tab view | Modify for Quick Prep |
| ClientDetailHeader.tsx | Basic header | Add Permission/Practice/Focus |
| ClientSummaryCards.tsx | Zone, Growth cards | Replace with Quick Prep |
| Sidebar.tsx | Navigation | Add role-based items |

### Create in apps/dashboard (THIS SESSION)

| Component | Purpose | Location |
|-----------|---------|----------|
| ClientCard | New list card design | src/components/clients/ |
| QuickPrepSection | Session prep summary | src/components/clients/ |
| PermissionDisplay | Shows Permission/Practice/Focus | src/components/clients/ |
| ActivityBar | 7-day check-in visual | src/components/clients/ |
| CoachNotesList | Private notes list | src/components/clients/ |
| CoachNoteForm | Add note form | src/components/clients/ |
| AgreedActivitiesList | Activities tab | src/components/clients/ |
| PatternBadge | "Pattern detected" indicator | src/components/clients/ |
| RoleGate | Role-based rendering | src/components/layout/ |
| AdminSidebar | Admin nav items | src/components/layout/ |
| UserList | Admin: all users | src/components/admin/ |
| CoachList | Admin: coach management | src/components/admin/ |
| RoleAssignment | Admin: change roles | src/components/admin/ |

---

## 5. INTEGRATION POINTS

### Data Flow IN (What Dashboard Reads)

| Source | Data | Purpose |
|--------|------|---------|
| `clients` | Client info | List, detail |
| `coaching_relationships` | Coach-client mapping | Filter clients by coach |
| `permissions` | Permission/Practice/Focus | Header display, prep |
| `daily_checkins` | Check-in data | Activity bar, engagement |
| `priorities` | Client priorities | Entries tab, counts |
| `validations` | Client proofs | Entries tab, counts |
| `predictions` | Challenge, Permission text | Card, header |
| `agreed_activities` | Activities | Activities tab |
| `coaching_context` | Patterns, breakthroughs | Pattern detection |
| `coaches` | Coach profile | Admin list |

### Data Flow OUT (What Dashboard Writes)

| Destination | Data | When |
|-------------|------|------|
| `coach_notes` | Private note | Coach adds note |
| `agreed_activities` | Status change | Coach marks resolved |
| `coaching_context` | Breakthrough | Coach marks breakthrough |
| `coaching_relationships` | Status | Admin assigns/removes |

### Connects To

| Tool/App | How |
|----------|-----|
| Together | Shares database, same client data |
| Priority/Proof/Predict | Reads entries created by tools |
| AI Edge Functions | Calls for pattern detection (P2) |

---

## 6. UI SPEC

### Coach Sidebar Navigation

```
┌──────────────────┐
│ 📊 Dashboard     │
│                  │
│ MY CLIENTS       │
│   👥 Clients     │  → /clients
│   📅 Sessions    │  → /sessions
│                  │
│ ─────────────────│
│ ⚙️ Settings      │  → /settings
└──────────────────┘
```

### Admin Sidebar Navigation (extends Coach)

```
┌──────────────────┐
│ 📊 Dashboard     │
│                  │
│ MY CLIENTS       │
│   👥 Clients     │  → /clients
│   📅 Sessions    │  → /sessions
│                  │
│ ADMIN            │  ← Only for admin
│   👤 Users       │  → /admin/users
│   🎓 Coaches     │  → /admin/coaches
│                  │
│ ─────────────────│
│ ⚙️ Settings      │  → /settings
└──────────────────┘
```

---

### Client List (Coach View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Sidebar]              My Clients                    [+ Invite]         │
├─────────────────────────────────────────────────────────────────────────┤
│ Filters: [All] [🟢 Active] [🟡 Moderate] [⚪ Needs Outreach]            │
│                                          Group by: [None ▼]             │
│ Legend: ⚡ Pattern  📋 Pending  ✨ New                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🟢 Marcus Chen                    Week 6 of 12    📅 Tomorrow       │ │
│ │ Challenge: Rebuild trust after layoffs                              │ │
│ │ "Give myself and others permission to rebuild trust"                │ │
│ │ [Self-care] [Team 1:1s] [Strategic planning]                        │ │
│ │ ▓▓▓▓▓▒▒ 5/7 check-ins  5 priorities  1 proof  ⚡4.1 avg            │ │
│ │                                           [⚡ Pattern detected]      │ │
│ │ Last active: 2 hours ago                                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🟡 Sarah Park                     Week 3 of 12    📅 Thursday       │ │
│ │ Challenge: Find work-life balance                                   │ │
│ │ "Give myself permission to set boundaries"                          │ │
│ │ [Exercise] [Family time]                                            │ │
│ │ ▓▓▒▒▒▒▒ 2/7 check-ins  3 priorities  0 proof  ⚠️2.1 avg            │ │
│ │                                           [✨ New entries]          │ │
│ │ Last active: 1 day ago                                              │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Client Card Elements:**

| Element | Source | Purpose |
|---------|--------|---------|
| Status dot | Calculated from activity | Quick triage |
| Name + Week | `coaching_relationships`, calculated | Identity + progress |
| Next Session | `scheduled_sessions` | Prep urgency |
| Challenge | `predictions.title` | Context |
| Permission | `predictions.what_matters_most` | Their words |
| Focus pills | `permissions.focus` | Current daily focus |
| Activity bar | `daily_checkins` (7 days) | Engagement visual |
| Counts | Aggregated | Activity summary |
| Engagement avg | `daily_checkins.engagement` | Quality signal |
| Alert badges | Calculated | Coach attention flags |
| Last active | Most recent entry | Recency |

---

### Client Detail Header

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Clients                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ 🟢 Marcus Chen                                    Week 6 of 12          │
│ marcus@techcorp.com                               📅 Tomorrow 2pm       │
├─────────────────────────────────────────────────────────────────────────┤
│ THEIR PERMISSION                                                        │
│ "Give myself and others permission to rebuild trust"                    │
├─────────────────────────────────────────────────────────────────────────┤
│ THEIR PRACTICE                                                          │
│ "Being transparent even when it's uncomfortable"                        │
├─────────────────────────────────────────────────────────────────────────┤
│ THEIR FOCUS THIS WEEK                                                   │
│ [Self-care] [Team 1:1s] [Strategic planning]                            │
├─────────────────────────────────────────────────────────────────────────┤
│ [Quick Prep] [Entries] [Activities] [Map] [Notes] [History]            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Quick Prep Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│ QUICK PREP                                           Since last session │
├─────────────────────────────────────────────────────────────────────────┤
│ ACTIVITY SUMMARY                                                        │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Check-ins: 5 of 7 days    Avg engagement: 4.1 ⚡                     │ │
│ │ Priorities: 5 new         Proofs: 1 new                             │ │
│ │ Predictions: 0 new        Recognitions: 3 sent, 2 received          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ENGAGEMENT BY FOCUS                                                     │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Self-care:          ⚡ 4.6 avg (5 times)                            │ │
│ │ Team 1:1s:          3.2 avg (4 times)                               │ │
│ │ Strategic planning: ⚠️ 2.1 avg (2 times)                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ⚡ PATTERN DETECTED                                                     │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Marcus consistently rates Self-care highly but Strategic planning   │ │
│ │ drops below 3.0. This is the third week in a row.                   │ │
│ │                                                                     │ │
│ │ 💡 Suggested question: "What would make Strategic planning feel     │ │
│ │ more like Self-care?"                                               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ AGREED ACTIVITIES (3 pending)                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ○ "Schedule quarterly planning retreat" (from session)              │ │
│ │   ✓ Evidence: mentioned in Priority 1/23                            │ │
│ │ ○ "Delegate Q2 budget review" (from focus)                          │ │
│ │ ○ "Have 1:1 with Sarah about promotion" (from transcript)           │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ COACHING QUESTIONS                                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💡 "What shifted when Self-care started clicking?"                  │ │
│ │ 💡 "Strategic planning has been tough — what's getting in the way?" │ │
│ │ 💡 "You mentioned 'trust' in 3 priorities — what does trust mean    │ │
│ │     in the context of strategic planning?"                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Admin: User List

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Admin Sidebar]          Users                       [+ Invite User]    │
├─────────────────────────────────────────────────────────────────────────┤
│ Filters: [All] [Users] [Clients] [Coaches]          Search: [________] │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ Email                    Name              Role      Coach           ││
│ ├──────────────────────────────────────────────────────────────────────┤│
│ │ marcus@techcorp.com      Marcus Chen       client    Sarah Park     ││
│ │ elena@startup.io         Elena Rivera      user      —              ││
│ │ david@corp.com           David Kim         client    Sarah Park     ││
│ │ sarah@coaching.com       Sarah Park        coach     —              ││
│ │ admin@findinggood.com    Admin             admin     —              ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Click row to view details or change role                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Admin: Coach List

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Admin Sidebar]          Coaches                    [+ Add Coach]       │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ Name             Email                  Clients  Active   Admin      ││
│ ├──────────────────────────────────────────────────────────────────────┤│
│ │ Sarah Park       sarah@coaching.com     12       10       ○          ││
│ │ Mike Johnson     mike@coaching.com      8        7        ○          ││
│ │ Admin            admin@findinggood.com  0        0        ●          ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Click row to view coach details                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. TEST SCENARIOS

### Scenario: Coach Session Prep (Sarah - Coach)

**Happy Path:**
1. Sarah (coach) opens Dashboard
2. Sees client list filtered to her clients only
3. Sees Marcus has session tomorrow, clicks card
4. Opens client detail, Quick Prep tab
5. Sees activity summary, engagement by focus
6. Sees pattern: "Strategic planning consistently low"
7. Sees suggested question
8. Reviews agreed activities (evidence auto-linked)
9. Ready for session in 15 minutes

### Scenario: Admin User Management (Admin)

**Happy Path:**
1. Admin logs in, sees Admin section in sidebar
2. Clicks "Users" → sees all users across system
3. Filters by "Users" (no coach assigned)
4. Clicks Elena → sees she's an active user
5. Clicks "Assign Coach" → selects Sarah
6. Elena's role changes to "client"
7. Sarah can now see Elena in her client list

### Scenario: Coach Role Detection

**Happy Path:**
1. Sarah logs in (coach role)
2. Dashboard detects coach profile in `coaches` table
3. Sidebar shows coach navigation (no Admin section)
4. Client list queries `coaching_relationships WHERE coach_id = Sarah's ID`
5. Only Sarah's clients appear

### Scenario: Admin Role Detection

**Happy Path:**
1. Admin logs in
2. Dashboard detects `is_admin = true` in `coaches` table
3. Sidebar shows Admin section
4. Can access /admin/users, /admin/coaches
5. Client list can show all clients (option)

---

## 8. DATABASE QUERIES

### Get coach profile and determine role

```typescript
const { data: coachProfile } = await supabase
  .from('coaches')
  .select('id, email, name, is_admin')
  .eq('email', userEmail)
  .single();

const role: UserRole = coachProfile 
  ? (coachProfile.is_admin ? 'admin' : 'coach')
  : 'user';  // Shouldn't happen on Dashboard
```

### Get coach's clients (Coach View)

```typescript
const { data: clients } = await supabase
  .from('coaching_relationships')
  .select(`
    client_email,
    status,
    started_at,
    clients!inner(name, email),
    predictions(title, what_matters_most),
    permissions(focus)
  `)
  .eq('coach_id', coachId)
  .eq('status', 'active');
```

### Get all clients (Admin View)

```typescript
const { data: allClients } = await supabase
  .from('coaching_relationships')
  .select(`
    client_email,
    status,
    started_at,
    coach_id,
    coaches(name),
    clients!inner(name, email),
    predictions(title, what_matters_most),
    permissions(focus)
  `)
  .eq('status', 'active');
```

### Calculate client status

```typescript
function calculateClientStatus(checkinsThisWeek: number, avgEngagement: number): ClientStatus {
  if (checkinsThisWeek >= 5 && avgEngagement >= 3.0) return 'active';
  if (checkinsThisWeek >= 2 || avgEngagement >= 2.0) return 'moderate';
  if (checkinsThisWeek >= 1) return 'quiet';
  return 'needs_outreach';
}
```

### Get client detail with aggregated data

```typescript
const { data: clientDetail } = await supabase
  .from('clients')
  .select(`
    email,
    name,
    predictions(title, what_matters_most, created_at),
    permissions(permission, practice, focus),
    daily_checkins(check_date, focus_scores, created_at),
    priorities(id, integrity_line, fires_extracted, created_at),
    validations(id, proof_line, fires_extracted, created_at),
    agreed_activities(id, activity_text, status, source, evidence_entries),
    coaching_context(
      coaching_start,
      persistent_themes,
      breakthroughs
    )
  `)
  .eq('email', clientEmail)
  .single();
```

### Add coach note

```typescript
const { error } = await supabase
  .from('coach_notes')
  .insert({
    coach_id: coachId,
    client_email: clientEmail,
    note_text: noteText,
    visibility: 'coach_only'
  });
```

### Update activity status

```typescript
const { error } = await supabase
  .from('agreed_activities')
  .update({ 
    status: 'resolved',
    updated_at: new Date().toISOString()
  })
  .eq('id', activityId);
```

### Admin: Get all users with role info

```typescript
const { data: users } = await supabase
  .from('clients')
  .select(`
    email,
    name,
    created_at,
    coaching_relationships(
      status,
      coach_id,
      coaches(name)
    )
  `);

// Map to determine role
const usersWithRole = users.map(u => ({
  ...u,
  role: u.coaching_relationships?.status === 'active' ? 'client' : 'user',
  coachName: u.coaching_relationships?.coaches?.name
}));
```

---

## 9. DONE CRITERIA

### P0 — Must Complete

- [ ] Role detection on login (coach vs admin)
- [ ] Conditional sidebar navigation
- [ ] Client list displays (coach sees own clients only)
- [ ] Client cards with status, challenge, permission, focus
- [ ] Activity bar (7-day check-in visual)
- [ ] Click card → client detail
- [ ] Client detail header with Permission/Practice/Focus
- [ ] Quick Prep tab with activity summary
- [ ] Entries tab with recent entries
- [ ] Coach notes list + add form
- [ ] No TypeScript errors
- [ ] No console errors

### P1 — Should Complete

- [ ] Engagement by focus breakdown
- [ ] Pattern detection display (placeholder or real)
- [ ] Suggested coaching questions (placeholder or real)
- [ ] Agreed activities tab with status
- [ ] Admin: User list page
- [ ] Admin: Filter users by role
- [ ] Status dot calculation

### P2 — Nice to Have

- [ ] Admin: Coach list page
- [ ] Admin: Role assignment
- [ ] Pattern detection (AI call)
- [ ] Suggested questions (AI call)
- [ ] Evidence auto-linking in activities

### P3 — Defer

- [ ] System health dashboard
- [ ] Login history / audit logs
- [ ] Enterprise admin features
- [ ] Fathom transcript integration
- [ ] Calendar integration

---

## CRITICAL FLAGS

🟢 **Architecture decision confirmed:** Same app, role-gated views

🟢 **No blockers identified**

🟡 **NOTE:** AI features (pattern detection, suggested questions) — scaffold UI with placeholder data, wire up later

🟡 **NOTE:** Existing dashboard code needs review — some components can be modified vs replaced

🟡 **NOTE:** Coach-client relationship bootstrapping — ensure test data exists

---

## FILES TO CREATE/MODIFY

```
apps/dashboard/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            ← Modify for role-based nav
│   │   ├── RoleGate.tsx           ← NEW: Role-based rendering
│   │   └── AdminNav.tsx           ← NEW: Admin nav items
│   ├── clients/
│   │   ├── ClientCard.tsx         ← NEW: List card design
│   │   ├── ClientList.tsx         ← Modify existing
│   │   ├── ClientDetail.tsx       ← Modify existing
│   │   ├── ClientDetailHeader.tsx ← Modify existing
│   │   ├── QuickPrepSection.tsx   ← NEW: Session prep
│   │   ├── PermissionDisplay.tsx  ← NEW: P/P/F display
│   │   ├── ActivityBar.tsx        ← NEW: 7-day visual
│   │   ├── EntriesTab.tsx         ← NEW or modify
│   │   ├── ActivitiesTab.tsx      ← NEW: Agreed activities
│   │   ├── CoachNotesList.tsx     ← NEW: Notes list
│   │   ├── CoachNoteForm.tsx      ← NEW: Add note
│   │   └── PatternBadge.tsx       ← NEW: Alert indicator
│   └── admin/
│       ├── UserList.tsx           ← NEW: All users
│       ├── CoachList.tsx          ← NEW: Coach management
│       └── RoleAssignment.tsx     ← NEW: Change roles
├── pages/
│   ├── Clients.tsx                ← Modify for new cards
│   ├── ClientDetail.tsx           ← Modify for tabs
│   ├── Sessions.tsx               ← Keep existing
│   ├── Settings.tsx               ← Keep existing
│   └── admin/
│       ├── Users.tsx              ← NEW
│       └── Coaches.tsx            ← NEW
├── hooks/
│   ├── useClients.ts              ← Modify for role filtering
│   ├── useClientDetail.ts         ← Extend for new data
│   ├── useCoachProfile.ts         ← NEW: Role detection
│   ├── useCoachNotes.ts           ← NEW
│   ├── useAgreedActivities.ts     ← NEW
│   └── useAdminUsers.ts           ← NEW
├── contexts/
│   └── CoachContext.tsx           ← NEW: Coach profile + role
└── App.tsx                        ← Add admin routes
```

---

**End of Dashboard Build Packet**
