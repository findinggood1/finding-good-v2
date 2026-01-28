# Finding Good V2: Navigation Restructure

**Created:** January 27, 2026  
**Purpose:** Source of truth for nav renaming, restructuring, and new architecture  
**Status:** Ready for Implementation

---

## Part 1: Core Concept

### The Four I's Framework

The app helps users understand and strengthen their influence so they can have greater impact on the world. Everything is organized around four concepts:

| Concept | What It Means | Self Mode | Others Mode |
|---------|---------------|-----------|-------------|
| **INFLUENCE** | Declaring the influence you want to have | Define your permission, practice, focus | See others' influence pages (Exchange) |
| **IMPACT** | What went well? Where did you/others make a difference? | Record impact I had today | Recognize impact someone had on me |
| **IMPROVE** | Validating growth — how did improvement happen? | Validate my improvement | Help someone see their improvement |
| **INSPIRE** | Beliefs about what's possible | My beliefs about what I can do | Tell others what you believe they can do |

---

## Part 2: Navigation Structure

### Old Structure (Current)
```
DAILY:     Home, Today
GIVE:      Recognize, Witness, Believe, Exchange
BUILD:     Priority, Proof, Predict
DIRECTION: Map, Chat
BOTTOM:    My Focus, Profile, Learn
```

### New Structure

**Primary Nav (Sidebar/Top)**
| Item | Route | What It Is |
|------|-------|------------|
| **Home** | `/` or `/home` | Influence page — declaration + daily check-in + activity |
| **Campfire** | `/campfire` | Social feed — see influence happening in real time |
| **Exchange** | `/exchange` | Partnership views — see others' journeys by invitation |

**The Four I's (with dropdowns)**
| Main | Route | Sub: Self | Sub: Others |
|------|-------|-----------|-------------|
| **Impact** | `/impact` | `/impact/self` | `/impact/others` |
| **Improve** | `/improve` | `/improve/self` | `/improve/others` |
| **Inspire** | `/inspire` | `/inspire/self` | `/inspire/others` |

*Note: INFLUENCE is the Home page, not a separate nav item*

**Locked Features (Coached Clients Only)**
| Item | Route | What It Is |
|------|-------|------------|
| Map | `/map` | Deep metrics, patterns, numbers |
| Chat | `/chat` | Coach conversation |

**Utility (Bottom)**
| Item | Route | What It Is |
|------|-------|------------|
| Profile | `/profile` | Settings, account |
| Learn | `/learn` | Framework explanation |

---

## Part 3: Route Mapping

### What Changes

| Old Route | Old Name | New Route | New Name | Notes |
|-----------|----------|-----------|----------|-------|
| `/home` | Home | `/` or `/home` | Home (Influence) | Merged with My Focus + Today |
| `/today` | Today | — | — | Merged into Home |
| `/focus` | My Focus | — | — | Merged into Home |
| `/priority` | Priority | `/impact` | Impact | Info page landing |
| `/priority?mode=send` | Recognize | `/impact/others` | Impact (Others) | Renamed |
| `/proof` | Proof | `/improve` | Improve | Info page landing |
| `/proof?mode=send` | Witness | `/improve/others` | Improve (Others) | Renamed |
| `/predict` | Predict | `/inspire` | Inspire | Info page landing |
| `/predict?mode=send` | Believe | `/inspire/others` | Inspire (Others) | Renamed |
| `/exchange` | Exchange | `/exchange` | Exchange | Reimagined as partnership views |
| `/campfire` | Campfire | `/campfire` | Campfire | Stays same |
| `/map` | Map | `/map` | Map | Stays same, gets more metrics |
| `/chat` | Chat | `/chat` | Chat | Stays same |
| `/profile` | Profile | `/profile` | Profile | Stays same |
| `/learn` | Learn | `/learn` | Learn | Stays same |

### New Routes Needed

| Route | Purpose |
|-------|---------|
| `/impact` | Info page for Impact — explains concept, links to self/others |
| `/improve` | Info page for Improve — explains concept, links to self/others |
| `/inspire` | Info page for Inspire — explains concept, links to self/others |
| `/exchange` | Partnership list view |
| `/exchange/:partnerId` | Individual partner view |

---

## Part 4: Home/Influence Page

### What It Contains

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR INFLUENCE                                                 │
│  ───────────────────────────────────────────────────────────── │
│  PERMISSION: "What you want to create more of in the world"     │
│  [User's permission statement]                          [Edit]  │
│                                                                 │
│  PRACTICE: "How you're living this out with others"             │
│  [User's practice statement]                            [Edit]  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  TODAY'S FOCUS                                                  │
│  ───────────────────────────────────────────────────────────── │
│  [Action 1]                                    ☑ Done           │
│  [Action 2]                                    ☐ Not yet        │
│  [Action 3]                                    ☐ Not yet        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💭 [Question that appears based on check-in]            │   │
│  │                                                         │   │
│  │ [Text area for quick answer]                            │   │
│  │                                                  [Save]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Engagement: [○ ○ ○ ○ ○] How present were you today?           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  THIS WEEK                                                      │
│  ───────────────────────────────────────────────────────────── │
│  [Active goals/predictions with progress indicators]            │
│  [Evidence collected this week]                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                                                │
│  ───────────────────────────────────────────────────────────── │
│  What you're noticing in others:                                │
│  • [Recent impact/improve/inspire you sent]                     │
│                                                                 │
│  What they're noticing in you:                                  │
│  • [Recent impact/improve/inspire you received]                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  INSIGHTS                                                       │
│  ───────────────────────────────────────────────────────────── │
│  [Trend: "You've been strong in Influence this week"]           │
│  [Pattern: "Ethics shows up most in your entries"]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Sources

| Section | Data Source |
|---------|-------------|
| Permission, Practice | `permissions` table |
| Today's Focus | `permissions.focus_items` or `daily_focus` |
| Question + Answer | `daily_reflections` table (NEW) |
| Engagement rating | `daily_checkins` table |
| This Week | `predictions` + `priorities` + `validations` |
| Recent Activity (sent) | `priorities`, `validations`, `predictions` WHERE mode = 'others' |
| Recent Activity (received) | Same tables WHERE recipient = current user |
| Insights | AI-generated from patterns |

---

## Part 5: The Four I's - Tool Landing Pages

Each of the three nav items (Impact, Improve, Inspire) has an info landing page.

### Landing Page Template

```
┌─────────────────────────────────────────────────────────────────┐
│  [TOOL NAME]                                                    │
│  ───────────────────────────────────────────────────────────── │
│  [One sentence explaining what this is about]                   │
│                                                                 │
│  [Paragraph explaining the concept and why it matters]          │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │                      │    │                      │          │
│  │   FOR YOURSELF       │    │    FOR OTHERS        │          │
│  │                      │    │                      │          │
│  │   [Description]      │    │   [Description]      │          │
│  │                      │    │                      │          │
│  │   [Start Button]     │    │   [Start Button]     │          │
│  │                      │    │                      │          │
│  └──────────────────────┘    └──────────────────────┘          │
│                                                                 │
│  RECENT [TOOL] ENTRIES                                          │
│  ───────────────────────────────────────────────────────────── │
│  • [Entry 1 preview]                                            │
│  • [Entry 2 preview]                                            │
│  • [Entry 3 preview]                                            │
│                                           [View All →]          │
└─────────────────────────────────────────────────────────────────┘
```

### Impact Landing Page Content

| Element | Content |
|---------|---------|
| Title | IMPACT |
| Tagline | "What went well? Where did you or others make a difference?" |
| Explanation | Impact is about recognizing the positive difference being made — by you and by others. When you notice impact, you strengthen your ability to create more of it. |
| Self Mode | "Record the impact you had today" — reflects on what went well, what you contributed |
| Others Mode | "Recognize impact someone had on you" — send recognition to someone who made a difference |

### Improve Landing Page Content

| Element | Content |
|---------|---------|
| Title | IMPROVE |
| Tagline | "How did growth actually happen?" |
| Explanation | Improvement isn't just about outcomes — it's about understanding the process. When you validate how you grew, you can repeat it. When you help others see their growth, you multiply it. |
| Self Mode | "Validate your improvement" — reflect on how you overcame a challenge or grew |
| Others Mode | "Help someone see their improvement" — witness growth in someone else |

### Inspire Landing Page Content

| Element | Content |
|---------|---------|
| Title | INSPIRE |
| Tagline | "What do you believe is possible?" |
| Explanation | Inspiration comes from belief — in yourself and in others. When you name what you believe you can do, and when you tell others what you believe they can do, you create possibility. |
| Self Mode | "Define what you believe you can accomplish" — set intentions and predictions |
| Others Mode | "Tell someone what you believe they can do" — share belief in another person |

---

## Part 6: Exchange Page

### What It Is

Exchange shows mutual influence — the influence others are having on you, and you on them. It's a partnership view.

### What You See

```
┌─────────────────────────────────────────────────────────────────┐
│  EXCHANGE                                                       │
│  ───────────────────────────────────────────────────────────── │
│  "See the influence you share with others"                      │
│                                                                 │
│  PEOPLE IN YOUR CIRCLE                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar] Sarah Park                                      │   │
│  │ Last activity: 2 days ago                                │   │
│  │ Mutual exchanges: 12                        [View →]     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ [Avatar] Marcus Chen                                     │   │
│  │ Last activity: Today                                     │   │
│  │ Mutual exchanges: 8                         [View →]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  PENDING INVITATIONS                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ David Kim invited you to connect    [Accept] [Decline]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Invite Someone to Exchange]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Partnership View (Click on a Person)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Exchange                                             │
│                                                                 │
│  [Avatar] SARAH PARK                                            │
│  ───────────────────────────────────────────────────────────── │
│                                                                 │
│  THEIR INFLUENCE                                                │
│  Permission: [Their permission statement]                       │
│  Practice: [Their practice statement]                           │
│  Focus: [Their current focus items]                             │
│                                                                 │
│  THEIR PROGRESS THIS WEEK                                       │
│  [Engagement indicator] [Goals progress]                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  WHAT YOU'VE SEEN IN THEM                                       │
│  (Things you sent them via Impact/Improve/Inspire)              │
│  • [Entry preview]                                              │
│  • [Entry preview]                                              │
│                                                                 │
│  WHAT THEY'VE SEEN IN YOU                                       │
│  (Things they sent you via Impact/Improve/Inspire)              │
│  • [Entry preview]                                              │
│  • [Entry preview]                                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  HOW YOU COMPLEMENT EACH OTHER (Future: AI-generated)           │
│  [Insight about working styles, FIRES alignment, etc.]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Sidebar Component Update

### New Sidebar Structure

```tsx
// Pseudo-structure for new sidebar

<Sidebar>
  {/* Primary */}
  <NavItem icon={Home} to="/" label="Home" />
  <NavItem icon={Flame} to="/campfire" label="Campfire" />
  <NavItem icon={Users} to="/exchange" label="Exchange" />
  
  {/* Divider */}
  
  {/* The Four I's (minus Influence which is Home) */}
  <NavDropdown icon={Zap} label="Impact" basePath="/impact">
    <DropdownItem to="/impact" label="About Impact" />
    <DropdownItem to="/impact/self" label="For Yourself" />
    <DropdownItem to="/impact/others" label="For Others" />
  </NavDropdown>
  
  <NavDropdown icon={TrendingUp} label="Improve" basePath="/improve">
    <DropdownItem to="/improve" label="About Improve" />
    <DropdownItem to="/improve/self" label="For Yourself" />
    <DropdownItem to="/improve/others" label="For Others" />
  </NavDropdown>
  
  <NavDropdown icon={Sparkles} label="Inspire" basePath="/inspire">
    <DropdownItem to="/inspire" label="About Inspire" />
    <DropdownItem to="/inspire/self" label="For Yourself" />
    <DropdownItem to="/inspire/others" label="For Others" />
  </NavDropdown>
  
  {/* Divider */}
  
  {/* Locked for non-clients */}
  <NavItem icon={Map} to="/map" label="Map" locked={!isClient} />
  <NavItem icon={MessageCircle} to="/chat" label="Chat" locked={!isClient} />
  
  {/* Divider */}
  
  {/* Utility */}
  <NavItem icon={User} to="/profile" label="Profile" />
  <NavItem icon={BookOpen} to="/learn" label="Learn" />
</Sidebar>
```

---

## Part 8: Database Changes

### New Table: `daily_reflections`

Stores answers to the daily check-in questions.

```sql
CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  reflection_date DATE NOT NULL,
  question_shown TEXT NOT NULL,
  answer TEXT,
  engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
  focus_items_completed INTEGER DEFAULT 0,
  focus_items_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries for same day
  UNIQUE(client_email, reflection_date)
);

-- Indexes
CREATE INDEX idx_daily_reflections_email ON daily_reflections(client_email);
CREATE INDEX idx_daily_reflections_date ON daily_reflections(reflection_date DESC);
```

### New Table: `exchange_partnerships`

Tracks who has invited whom to see their Influence page.

```sql
CREATE TABLE exchange_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  -- Prevent duplicate invitations
  UNIQUE(inviter_email, invitee_email)
);

-- Indexes
CREATE INDEX idx_exchange_partnerships_inviter ON exchange_partnerships(inviter_email);
CREATE INDEX idx_exchange_partnerships_invitee ON exchange_partnerships(invitee_email);
CREATE INDEX idx_exchange_partnerships_status ON exchange_partnerships(status);
```

### Existing Tables: Add recipient tracking

Some existing tables may need a `recipient_email` column to track "others" mode entries:

```sql
-- If not already present
ALTER TABLE priorities ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE validations ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS recipient_email TEXT;
```

---

## Part 9: Files to Modify

### Sidebar
- `apps/together/src/components/layout/Sidebar.tsx` — Full restructure

### Routes
- `apps/together/src/App.tsx` — Update all routes

### Pages to Create
| Page | Path |
|------|------|
| `HomePage.tsx` | New unified home/influence page |
| `ImpactLandingPage.tsx` | Info page for Impact |
| `ImproveLandingPage.tsx` | Info page for Improve |
| `InspireLandingPage.tsx` | Info page for Inspire |
| `ExchangePage.tsx` | Partnership list view |
| `PartnershipViewPage.tsx` | Individual partner view |

### Pages to Rename/Refactor
| Old | New | Changes |
|-----|-----|---------|
| `PriorityPage.tsx` | `ImpactSelfPage.tsx` | Rename, update labels |
| `ProofPage.tsx` | `ImproveSelfPage.tsx` | Rename, update labels |
| `PredictPage.tsx` | `InspireSelfPage.tsx` | Rename, update labels |

### Pages to Deprecate
| Page | Reason |
|------|--------|
| `TodayPage.tsx` | Merged into Home |
| `FocusPage.tsx` | Merged into Home |

### Components to Create
| Component | Purpose |
|-----------|---------|
| `NavDropdown.tsx` | Expandable nav item with sub-items |
| `ToolLandingPage.tsx` | Reusable template for info pages |
| `DailyReflectionInput.tsx` | Question + answer box for Home |
| `PartnerCard.tsx` | Card showing exchange partner |
| `PartnershipView.tsx` | Full partner detail view |

---

## Part 10: Migration Path

### Phase A: Structure (Nav + Routes)
1. Update Sidebar with new structure
2. Create placeholder pages for new routes
3. Update App.tsx routing
4. Verify navigation works

### Phase B: Home/Influence
1. Create unified HomePage
2. Create daily_reflections table
3. Build DailyReflectionInput component
4. Connect existing Focus/Permission data
5. Add Recent Activity section
6. Add Insights section (can be placeholder initially)

### Phase C: Tool Landing Pages + Renames
1. Create ToolLandingPage component (reusable)
2. Create ImpactLandingPage with content
3. Rename PriorityPage → ImpactSelfPage, update routes
4. Create ImproveLandingPage with content
5. Rename ProofPage → ImproveSelfPage, update routes
6. Create InspireLandingPage with content
7. Rename PredictPage → InspireSelfPage, update routes
8. Update "others" mode routing for all three

### Phase D: Exchange
1. Create exchange_partnerships table
2. Create ExchangePage (list view)
3. Create PartnershipViewPage
4. Add invitation flow
5. Connect to existing entries (what you sent / they sent)

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| Jan 27, 2026 | Document created | Claude + Brian |

---

**End of Navigation Restructure Document**
