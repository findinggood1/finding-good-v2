# Phase J Build Plan: Profile & Settings

**Created:** January 28, 2026  
**Source:** V2 Spec Part 9  
**Purpose:** Complete profile page with notifications, privacy, focus history  
**Estimated Time:** 1 session

---

## Objective

Complete the Profile page with:
1. Coach connection display (for coached clients)
2. Notification preferences
3. Privacy controls (what coach can see)
4. Focus history tracking

---

## Database Setup

```sql
-- Add columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_on_recognition": true,
  "email_on_ask": true,
  "daily_reminder": true,
  "daily_reminder_time": "18:00",
  "weekly_summary": false
}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "coach_sees_checkins": true,
  "coach_sees_priorities": true,
  "coach_sees_proofs": true,
  "coach_sees_recognition": true
}';

-- Focus history tracking
CREATE TABLE IF NOT EXISTS focus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  focus_name TEXT NOT NULL,
  started_at DATE NOT NULL DEFAULT CURRENT_DATE,
  ended_at DATE,
  evolved_into TEXT,
  reason TEXT CHECK (reason IN ('paused', 'evolved', 'completed', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_focus_history_email ON focus_history(client_email);

-- RLS
ALTER TABLE focus_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own history" ON focus_history
  FOR SELECT USING (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users manage own history" ON focus_history
  FOR ALL USING (auth.jwt() ->> 'email' = client_email);
```

---

## Checkpoint 1: Coach Connection Display

**Goal:** Show coaching relationship info for coached clients

### Design

```
COACH CONNECTION
┌────────────────────────────────────────────────────────────────────┐
│ Connected to: Brian Fretwell                                       │
│ Since: January 15, 2026                                            │
│ Week 6 of 12                                              [Manage] │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `apps/together/src/components/profile/CoachConnectionSection.tsx`
   - Display coach name
   - Show connection date
   - Calculate and show current week of engagement
   - [Manage] button (can link to external or show options)

2. Create `apps/together/src/hooks/useCoachConnection.ts`
   - Fetch from coaching_engagements table
   - Calculate week number from start_date

3. If no coach:
   - Show "Not currently in coaching"
   - Optional: "Learn about coaching" link

### Done Criteria
- [ ] Shows coach name and connection date
- [ ] Week calculation correct
- [ ] Hidden if no coach
- [ ] No TypeScript errors

---

## Checkpoint 2: Notification Preferences

**Goal:** Let users control email notifications

### Design

```
NOTIFICATIONS
┌────────────────────────────────────────────────────────────────────┐
│ ☑ Email when someone recognizes me                                 │
│ ☑ Email when someone asks for my perspective                       │
│ ☑ Daily check-in reminder (6:00 PM)                       [Change] │
│ ☐ Weekly summary email                                             │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `apps/together/src/components/profile/NotificationPreferences.tsx`
   - Checkboxes for each notification type
   - Time picker for daily reminder
   - Auto-save on change

2. Create `apps/together/src/hooks/useNotificationPreferences.ts`
   - Load from clients.notification_preferences
   - Update function that saves to database

3. Preference fields:
```typescript
interface NotificationPreferences {
  email_on_recognition: boolean;
  email_on_ask: boolean;
  daily_reminder: boolean;
  daily_reminder_time: string; // "18:00"
  weekly_summary: boolean;
}
```

### Done Criteria
- [ ] All toggles work
- [ ] Time picker works
- [ ] Changes save to database
- [ ] Loads existing preferences
- [ ] No TypeScript errors

---

## Checkpoint 3: Privacy Controls

**Goal:** Let users control what coach can see

### Design

```
PRIVACY
┌────────────────────────────────────────────────────────────────────┐
│ What my coach can see:                                             │
│ ☑ My check-ins and engagement                                      │
│ ☑ My priority entries                                              │
│ ☑ My proof entries                                                 │
│ ☑ Recognition I send and receive                                   │
│                                                                    │
│ Note: You can hide individual entries from your coach              │
│ using the 👁️ icon on any entry.                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `apps/together/src/components/profile/PrivacyControls.tsx`
   - Checkboxes for each category
   - Note about individual entry hiding
   - Auto-save on change

2. Create `apps/together/src/hooks/usePrivacySettings.ts`
   - Load from clients.privacy_settings
   - Update function

3. Privacy fields:
```typescript
interface PrivacySettings {
  coach_sees_checkins: boolean;
  coach_sees_priorities: boolean;
  coach_sees_proofs: boolean;
  coach_sees_recognition: boolean;
}
```

4. NOTE: Dashboard queries should respect these settings (future)

### Done Criteria
- [ ] All toggles work
- [ ] Changes save to database
- [ ] Loads existing settings
- [ ] Only shows for coached users
- [ ] No TypeScript errors

---

## Checkpoint 4: Focus History

**Goal:** Track and display focus item evolution

### Design

```
FOCUS HISTORY
┌────────────────────────────────────────────────────────────────────┐
│ • Daily journaling (Jan 1-15) → evolved into Self-care             │
│ • Morning routine (Jan 1-10) → paused                              │
│ • Team check-ins (Jan 5-present) → active                          │
└────────────────────────────────────────────────────────────────────┘
```

### Tasks

1. Create `apps/together/src/components/profile/FocusHistory.tsx`
   - List of past and current focus items
   - Show date ranges
   - Show outcome (evolved, paused, completed)

2. Create `apps/together/src/hooks/useFocusHistory.ts`
   - Fetch from focus_history table
   - Return sorted by started_at DESC

3. Update focus editing to track history:
   - When focus item removed → create history record with reason
   - When focus item changed → create history record with evolved_into

4. FocusHistoryItem type:
```typescript
interface FocusHistoryItem {
  id: string;
  name: string;
  startedAt: Date;
  endedAt: Date | null;
  evolvedInto: string | null;
  reason: 'paused' | 'evolved' | 'completed' | 'removed' | null;
  isActive: boolean;
}
```

### Done Criteria
- [ ] History displays correctly
- [ ] Date ranges show
- [ ] Evolution arrows work
- [ ] Active items show "present"
- [ ] No TypeScript errors

---

## Checkpoint 5: Profile Page Assembly

**Goal:** Add all sections to Profile page

### Layout

```
PROFILE
────────────────────────────────────────────────────────────────────

ACCOUNT
┌────────────────────────────────────────────────────────────────┐
│ Email: marcus@techcorp.com                            [Change] │
│ Password: ••••••••                                    [Change] │
└────────────────────────────────────────────────────────────────┘

[CoachConnectionSection] (if coached)

[NotificationPreferences]

[PrivacyControls] (if coached)

[FocusHistory]

────────────────────────────────────────────────────────────────────

[Sign Out]
```

### Tasks

1. Update `apps/together/src/pages/ProfilePage.tsx`
   - Import and add all new sections
   - Conditional rendering for coached-only sections
   - Proper spacing and dividers

2. Test full page:
   - All sections display
   - All interactions work
   - Changes persist

### Done Criteria
- [ ] All sections display correctly
- [ ] Conditional sections work
- [ ] Layout looks good
- [ ] All saves work
- [ ] No TypeScript errors
- [ ] Build passes

---

## Phase J Complete Checklist

- [ ] Database columns added (notification_preferences, privacy_settings)
- [ ] focus_history table created
- [ ] CoachConnectionSection complete
- [ ] NotificationPreferences complete
- [ ] PrivacyControls complete
- [ ] FocusHistory complete
- [ ] ProfilePage assembled
- [ ] No TypeScript errors
- [ ] Build passes

---

## Files Summary

### Components
```
apps/together/src/components/profile/
├── CoachConnectionSection.tsx (NEW)
├── NotificationPreferences.tsx (NEW)
├── PrivacyControls.tsx (NEW)
├── FocusHistory.tsx (NEW)
└── index.ts (NEW)
```

### Hooks
```
apps/together/src/hooks/
├── useCoachConnection.ts (NEW)
├── useNotificationPreferences.ts (NEW)
├── usePrivacySettings.ts (NEW)
└── useFocusHistory.ts (NEW)
```

### Pages
```
apps/together/src/pages/ProfilePage.tsx (UPDATE)
```

---

**End of Phase J Build Plan**
