# Phase G Build Plan: Social Features

**Created:** January 28, 2026  
**Source:** V2 Spec Part 3 (Home Page)  
**Purpose:** Circle tracker, notifications, recognition interactions  
**Estimated Time:** 2 sessions  
**Dependencies:** Phase D complete (Exchange partnerships exist)

---

## Objective

Add social engagement features to the Home page:
1. Circle tracker — see who in your circle checked in today
2. Notifications section — pending recognitions, asks, responses
3. Recognition interactions — counts and buttons on feed items
4. "Inspire me" requests — gentle nudges to circle members

---

## Pre-Build Checklist

- [ ] Phase D complete (exchange_partnerships table exists)
- [ ] Read `together_v2_complete_spec.md` Part 3 for design
- [ ] Verify HomePage structure
- [ ] Plan component placement in HomePage

---

## Database Setup

Run before starting:

```sql
-- Circle membership (derived from exchange_partnerships, or explicit)
-- NOTE: We may be able to derive this from exchange_partnerships where status='accepted'
-- But having explicit table allows for non-exchange circle members

CREATE TABLE IF NOT EXISTS user_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  circle_member_email TEXT NOT NULL,
  display_name TEXT, -- cached for display
  relationship_type TEXT DEFAULT 'exchange', -- exchange, manual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, circle_member_email)
);

CREATE INDEX idx_user_circles_user ON user_circles(user_email);
CREATE INDEX idx_user_circles_member ON user_circles(circle_member_email);

-- Recognition counts on shared entries
CREATE TABLE IF NOT EXISTS recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('priority', 'validation', 'prediction', 'inspire')),
  recognizer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(share_id, share_type, recognizer_email)
);

CREATE INDEX idx_recognitions_share ON recognitions(share_id, share_type);
CREATE INDEX idx_recognitions_recognizer ON recognitions(recognizer_email);

-- "Inspire me" requests
CREATE TABLE IF NOT EXISTS inspire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  message TEXT DEFAULT 'would like to be inspired by what you''re working on today',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX idx_inspire_requests_recipient ON inspire_requests(recipient_email, status);
CREATE INDEX idx_inspire_requests_requester ON inspire_requests(requester_email);

-- Unified notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recognition', 'response', 'ask', 'inspire_request', 'thank')),
  title TEXT NOT NULL,
  message TEXT,
  source_type TEXT, -- priority, validation, prediction, inspire, exchange
  source_id UUID,
  from_email TEXT,
  from_name TEXT,
  link_to TEXT, -- URL to navigate to
  read_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_email, cleared_at);
CREATE INDEX idx_notifications_unread ON notifications(user_email) WHERE read_at IS NULL AND cleared_at IS NULL;

-- RLS Policies
ALTER TABLE user_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspire_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- user_circles: See your own circle
CREATE POLICY "Users can view own circle" ON user_circles
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can manage own circle" ON user_circles
  FOR ALL USING (auth.jwt() ->> 'email' = user_email);

-- recognitions: Anyone can add, see counts
CREATE POLICY "Anyone can add recognition" ON recognitions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = recognizer_email);

CREATE POLICY "Anyone can view recognitions" ON recognitions
  FOR SELECT USING (true);

-- inspire_requests: Recipient can see their requests
CREATE POLICY "Recipients can view requests" ON inspire_requests
  FOR SELECT USING (auth.jwt() ->> 'email' = recipient_email OR auth.jwt() ->> 'email' = requester_email);

CREATE POLICY "Users can create requests" ON inspire_requests
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = requester_email);

CREATE POLICY "Recipients can update requests" ON inspire_requests
  FOR UPDATE USING (auth.jwt() ->> 'email' = recipient_email);

-- notifications: Only see your own
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Triggered by other actions

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
```

---

## Checkpoint 0: Database Tables

**Goal:** Create all tables and verify they work

### Tasks

1. Run SQL to create tables
2. Verify tables exist in Supabase
3. Test RLS policies with sample queries

### Done Criteria
- [ ] All 4 tables created (user_circles, recognitions, inspire_requests, notifications)
- [ ] RLS policies in place
- [ ] Sample insert/select works

### STOP — Verify before continuing

---

## Checkpoint 1: Circle Tracker Component

**Goal:** Show who in your circle checked in today

### Design

```
YOUR CIRCLE TODAY                                    [2/4 checked in]
┌────────────────────────────────────────────────────────────────────┐
│ ✓ Sarah Park           ✓ David Kim           ○ Elena Rodriguez     │
│   Rebuild trust          Lead authentically    Find work balance   │
│                                                 [Inspire me]       │
│                                                                    │
│ ○ Marcus Chen                                                      │
│   Scale sustainably                                                │
│   [Inspire me]                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `apps/together/src/components/home/CircleTracker.tsx`
   - Grid of circle members (from exchange partners)
   - Check mark (✓) or circle (○) based on today's check-in
   - Shows their Permission statement
   - [Inspire me] button for those who haven't checked in

2. Create `apps/together/src/hooks/useCircle.ts`
   - Get user's circle members (from exchange_partnerships where accepted)
   - For each member, check if they have today's daily_reflection
   - Get their permission from clients/permissions table
   - Return: `{ members: CircleMember[], checkedInCount: number }`

3. CircleMember type:
```typescript
interface CircleMember {
  email: string;
  name: string;
  permission: string | null;
  checkedInToday: boolean;
}
```

### Done Criteria
- [ ] CircleTracker displays members in grid
- [ ] ✓/○ indicators show correctly
- [ ] Permission statements display
- [ ] [Inspire me] button shows for non-checked-in members
- [ ] "2/4 checked in" count is accurate
- [ ] Empty state if no circle members
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 2: Notifications Section

**Goal:** Show pending recognitions, asks, and responses

### Design

```
NOTIFICATIONS                                                 [Clear all]
┌────────────────────────────────────────────────────────────────────┐
│ 🔔 Sarah recognized your share about team transparency      2h ago │
│ 🔔 David responded to your ask about delegation           yesterday │
│ 📬 Elena is asking for your perspective on client pitch      3h ago │
│ ✨ Marcus thanked you for your belief in them                1d ago │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `apps/together/src/components/home/NotificationsSection.tsx`
   - List of uncleared notifications
   - Click → navigates to source (or scrolls to feed item)
   - [Clear all] button marks all as cleared
   - Individual dismiss (X) on hover

2. Create `apps/together/src/hooks/useNotifications.ts`
   - Fetch notifications where cleared_at IS NULL
   - Order by created_at DESC
   - Provide clearAll() and clearOne(id) functions
   - Provide markAsRead(id) function

3. Notification types and icons:
   - 🔔 recognition — "X recognized your share about Y"
   - 🔔 response — "X responded to your ask about Y"
   - 📬 ask — "X is asking for your perspective on Y"
   - ✨ thank — "X thanked you for your belief"
   - 💡 inspire_request — "X would like to be inspired by you"

### Done Criteria
- [ ] Notifications display with correct icons
- [ ] Click navigates/scrolls to source
- [ ] [Clear all] works
- [ ] Individual dismiss works
- [ ] Empty state: section hidden or "No new notifications"
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 3: Recognition Counts on Feed

**Goal:** Show recognition counts on Campfire/feed items

### Design

```
┌────────────────────────────────────────────────────────────────────┐
│ Sarah Chen                                         [R] Resilience  │
│ ⭐ Priority • 2 hours ago                                          │
│                                                                    │
│ "Stayed calm when the client pushed back hard on timeline.         │
│  My part: I listened first instead of defending."                  │
│                                                                    │
│ 👏 3 recognized                                    [👏 Recognize]  │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Update Campfire feed cards to show recognition count
   - Query recognitions table for count per entry
   - Display "👏 X recognized" or hide if 0

2. Create `apps/together/src/hooks/useRecognitionCounts.ts`
   - Given list of share_ids and types, return counts
   - Batch query for efficiency

3. Update feed card components (likely in Campfire)

### Done Criteria
- [ ] Recognition counts display on feed items
- [ ] Count updates when recognition added
- [ ] "👏 3 recognized" format
- [ ] Hidden or "Be first to recognize" when 0
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 4: Recognize Button Action

**Goal:** Let users recognize feed items with one click

### Tasks

1. Add [👏 Recognize] button to feed cards
   - Disabled if already recognized by this user
   - On click: insert into recognitions table
   - Update count optimistically

2. Create `apps/together/src/hooks/useRecognize.ts`
   - recognize(shareId, shareType) function
   - hasRecognized(shareId, shareType) check
   - Handles the insert + notification creation

3. When recognized:
   - Insert into recognitions table
   - Create notification for the entry owner
   - Update local count immediately

4. Button states:
   - Default: "👏 Recognize"
   - After click: "👏 Recognized" (disabled, different style)
   - Already recognized: "👏 Recognized" (disabled)

### Done Criteria
- [ ] Button appears on feed items
- [ ] Click inserts recognition
- [ ] Button disables after recognizing
- [ ] Notification created for owner
- [ ] Count updates immediately
- [ ] Already-recognized state shows correctly
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 5: "Inspire Me" Request Flow

**Goal:** Let users send gentle nudges to circle members

### Design Flow

1. User clicks [Inspire me] on circle member who hasn't checked in
2. Creates inspire_request record
3. Creates notification for recipient
4. Button changes to "Request sent"
5. Recipient sees notification: "[Name] would like to be inspired by what you're working on today"
6. Recipient can acknowledge (dismisses notification)

### Tasks

1. Add click handler to [Inspire me] button in CircleTracker
   - Insert into inspire_requests
   - Create notification for recipient
   - Update button state

2. Create `apps/together/src/hooks/useInspireRequest.ts`
   - sendRequest(recipientEmail) function
   - hasSentToday(recipientEmail) check (limit 1/day per person)
   - getPendingRequests() for recipient view

3. Recipient notification handling
   - Shows in Notifications section
   - Click → goes to check-in (or just acknowledges)
   - Acknowledge removes from list

### Done Criteria
- [ ] [Inspire me] button works
- [ ] Request created in database
- [ ] Notification created for recipient
- [ ] Button changes to "Request sent" after click
- [ ] Limited to 1 request per person per day
- [ ] Recipient sees notification
- [ ] Acknowledge dismisses notification
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 6: HomePage Integration

**Goal:** Add all components to HomePage layout

### Layout Update

```tsx
// HomePage.tsx structure

<div className="home-page">
  {/* NEW: Circle tracker at top */}
  <CircleTracker />
  
  {/* NEW: Notifications */}
  <NotificationsSection />
  
  {/* Existing sections */}
  <InfluenceSection />
  <DailyCheckin />
  <ThisWeekSection />
  <RecentActivitySection />
  <InsightsSection />
</div>
```

### Tasks

1. Import CircleTracker and NotificationsSection into HomePage
2. Add to layout in correct position (top)
3. Ensure proper spacing and dividers
4. Test full flow:
   - Circle shows members
   - Notifications appear
   - Recognize works on any feed items
   - Inspire me works

### Done Criteria
- [ ] CircleTracker appears at top of HomePage
- [ ] NotificationsSection appears below CircleTracker
- [ ] Layout looks good (spacing, dividers)
- [ ] All interactions work
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes

### STOP — Final verification with Brian

---

## Phase G Complete Checklist

- [ ] Database tables created (user_circles, recognitions, inspire_requests, notifications)
- [ ] CircleTracker component complete
- [ ] useCircle hook working
- [ ] NotificationsSection component complete
- [ ] useNotifications hook working
- [ ] Recognition counts on feed items
- [ ] useRecognitionCounts hook working
- [ ] [👏 Recognize] button working
- [ ] useRecognize hook working
- [ ] "Inspire me" flow complete
- [ ] useInspireRequest hook working
- [ ] HomePage updated with new sections
- [ ] All interactions create proper notifications
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes

---

## Files Summary

### New Components
```
apps/together/src/components/home/
├── CircleTracker.tsx (NEW)
├── NotificationsSection.tsx (NEW)
└── index.ts (update)
```

### New Hooks
```
apps/together/src/hooks/
├── useCircle.ts (NEW)
├── useNotifications.ts (NEW)
├── useRecognitionCounts.ts (NEW)
├── useRecognize.ts (NEW)
├── useInspireRequest.ts (NEW)
└── index.ts (update)
```

### Updated Components
```
apps/together/src/
├── pages/HomePage.tsx (add CircleTracker, NotificationsSection)
└── components/campfire/ (add recognition count + button)
```

---

## Integration Notes

### Auto-populate Circle
When exchange partnership is accepted, add to both users' circles:
```sql
-- Trigger or application code
INSERT INTO user_circles (user_email, circle_member_email, display_name)
VALUES 
  (inviter_email, invitee_email, invitee_name),
  (invitee_email, inviter_email, inviter_name)
ON CONFLICT DO NOTHING;
```

### Notification Creation Pattern
When action happens, create notification:
```typescript
// Example: when recognition is added
await supabase.from('notifications').insert({
  user_email: entryOwnerEmail,
  type: 'recognition',
  title: `${recognizerName} recognized your share`,
  message: truncate(entryContent, 50),
  source_type: 'priority',
  source_id: entryId,
  from_email: recognizerEmail,
  from_name: recognizerName,
  link_to: `/campfire#entry-${entryId}`
});
```

---

**End of Phase G Build Plan**
