# Phase D Build Plan: Exchange

**Created:** January 27, 2026  
**Purpose:** Build the Exchange feature for mutual visibility and partnership views  
**Estimated Time:** 1-2 sessions  
**Dependencies:** Phase A complete (routes exist), exchange_partnerships table created

---

## Objective

Create the Exchange feature that allows users to:
1. Invite others to see their Influence page
2. Accept/decline invitations from others
3. View partnership details (mutual activity)
4. See what they've exchanged with each partner

---

## Pre-Build Checklist

- [ ] Phase A complete (Exchange routes exist as placeholders)
- [ ] Read `navigation_restructure_v1.md` Part 6 for Exchange spec
- [ ] Run exchange schema SQL to create tables
- [ ] Verify Together app runs

---

## Database Setup

Before starting, run via Supabase MCP:

```sql
-- Exchange partnerships table
CREATE TABLE IF NOT EXISTS exchange_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  visibility_level TEXT DEFAULT 'standard',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  invitation_message TEXT,
  UNIQUE(inviter_email, invitee_email)
);

CREATE INDEX IF NOT EXISTS idx_exchange_partnerships_inviter ON exchange_partnerships(inviter_email);
CREATE INDEX IF NOT EXISTS idx_exchange_partnerships_invitee ON exchange_partnerships(invitee_email);
CREATE INDEX IF NOT EXISTS idx_exchange_partnerships_status ON exchange_partnerships(status);

-- Helper function to get exchange partners
CREATE OR REPLACE FUNCTION get_exchange_partners(user_email TEXT)
RETURNS TABLE (
  partner_email TEXT,
  partner_name TEXT,
  relationship_direction TEXT,
  status TEXT,
  connected_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN ep.inviter_email = user_email THEN ep.invitee_email
      ELSE ep.inviter_email
    END as partner_email,
    c.name as partner_name,
    CASE 
      WHEN ep.inviter_email = user_email THEN 'invited'
      ELSE 'invited_by'
    END as relationship_direction,
    ep.status,
    COALESCE(ep.responded_at, ep.invited_at) as connected_at
  FROM exchange_partnerships ep
  LEFT JOIN clients c ON c.email = CASE 
    WHEN ep.inviter_email = user_email THEN ep.invitee_email
    ELSE ep.inviter_email
  END
  WHERE (ep.inviter_email = user_email OR ep.invitee_email = user_email)
    AND ep.status = 'accepted';
END;
$$ LANGUAGE plpgsql;

-- Add recipient_email to tool tables if not exists
ALTER TABLE priorities ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE validations ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS recipient_email TEXT;
```

---

## Checkpoint 1: Exchange Hooks

**Goal:** Create data hooks for exchange functionality

### Tasks

1. Create `apps/together/src/hooks/useExchangePartners.ts`
   - Fetches all accepted partnerships for current user
   - Returns partner list with names, connection date
   - Uses `get_exchange_partners` function or direct query

```typescript
interface ExchangePartner {
  email: string;
  name?: string;
  direction: 'invited' | 'invited_by';
  connectedAt: string;
  lastActivity?: string;
  mutualExchanges: number;
}

function useExchangePartners() {
  // Returns { partners, isLoading, error }
}
```

2. Create `apps/together/src/hooks/useExchangeInvitations.ts`
   - Fetches pending invitations (received)
   - Provides accept/decline functions
   - Provides send invitation function

```typescript
interface PendingInvitation {
  id: string;
  fromEmail: string;
  fromName?: string;
  message?: string;
  invitedAt: string;
}

function useExchangeInvitations() {
  // Returns { pending, accept, decline, invite, isLoading }
}
```

3. Create `apps/together/src/hooks/usePartnershipActivity.ts`
   - Fetches mutual activity between current user and a specific partner
   - What I sent them (priorities, validations, predictions where recipient = partner)
   - What they sent me (same where recipient = me)

```typescript
interface PartnershipActivity {
  sentToPartner: ActivityEntry[];
  receivedFromPartner: ActivityEntry[];
  totalExchanges: number;
}

function usePartnershipActivity(partnerEmail: string) {
  // Returns { activity, isLoading, error }
}
```

### Done Criteria
- [ ] useExchangePartners returns partner list
- [ ] useExchangeInvitations handles pending invites
- [ ] usePartnershipActivity fetches mutual activity
- [ ] All hooks handle loading/error states
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 2: Exchange List Page

**Goal:** Create the main Exchange page showing partners and pending invitations

### Tasks

1. Update `apps/together/src/pages/ExchangePage.tsx`
   - Replace placeholder with full implementation

2. Layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  EXCHANGE                                                       │
│  "See the influence you share with others"                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PENDING INVITATIONS (if any)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar] David Kim wants to connect                      │   │
│  │ "Would love to share our journeys"                       │   │
│  │                          [Accept]  [Decline]             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  YOUR EXCHANGE PARTNERS                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Avatar] Sarah Park                                      │   │
│  │ Connected 3 weeks ago • 12 exchanges                     │   │
│  │                                          [View →]        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ [Avatar] Marcus Chen                                     │   │
│  │ Connected 1 month ago • 8 exchanges                      │   │
│  │                                          [View →]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Invite Someone to Exchange]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

3. Create components:
   - `PendingInvitationCard` — shows invitation with accept/decline
   - `PartnerCard` — shows partner with stats and link to detail

4. Empty state:
   - No partners yet → "Start building your exchange circle"
   - Prompt to invite someone

### Done Criteria
- [ ] Exchange page displays partners
- [ ] Pending invitations show with actions
- [ ] Accept/Decline works
- [ ] Partner cards link to detail view
- [ ] Empty state displays properly
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 3: Invite Modal

**Goal:** Create flow to invite someone to exchange

### Tasks

1. Create `apps/together/src/components/exchange/InviteModal.tsx`
   - Email input field
   - Optional message field
   - Send button
   - Success/error feedback

2. Flow:
   - User clicks "Invite Someone to Exchange"
   - Modal opens
   - User enters email + optional message
   - On submit: create record in `exchange_partnerships`
   - Show success: "Invitation sent to [email]"

3. Validation:
   - Valid email format
   - Not already invited
   - Not self

4. Future consideration (not this phase):
   - Email notification to invitee
   - For now, they'll see it when they log in

### Done Criteria
- [ ] Invite modal opens from Exchange page
- [ ] Email validation works
- [ ] Invitation creates database record
- [ ] Success message displays
- [ ] Prevents duplicate invitations
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 4: Partnership View Page

**Goal:** Create detailed view of a specific partnership

### Tasks

1. Update `apps/together/src/pages/PartnershipViewPage.tsx`
   - Route: `/exchange/:partnerId` (partnerId = email or uuid)
   - Back link to /exchange

2. Layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Exchange                                             │
│                                                                 │
│  [Avatar] SARAH PARK                                            │
│  Connected 3 weeks ago                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  THEIR INFLUENCE                                                │
│  ───────────────────────────────────────────────────────────── │
│  Permission: "Create space for authentic leadership"            │
│  Practice: "Daily check-ins with team members"                  │
│  Focus: Self-care, Strategic thinking, Team development         │
│                                                                 │
│  This Week: Checked in 4/5 days • 3 impact entries              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WHAT YOU'VE SEEN IN THEM (5)                                   │
│  ───────────────────────────────────────────────────────────── │
│  ⚡ Impact: "Your presentation inspired the whole team" (2d)    │
│  📈 Improve: "Watched you handle that conflict well" (1w)       │
│  ✨ Belief: "You'll be a VP within 2 years" (2w)                │
│                                          [See All →]            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WHAT THEY'VE SEEN IN YOU (7)                                   │
│  ───────────────────────────────────────────────────────────── │
│  ⚡ Impact: "Your feedback changed how I approach..." (1d)      │
│  📈 Improve: "You've grown so much in delegation" (3d)          │
│                                          [See All →]            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HOW YOU COMPLEMENT EACH OTHER                                  │
│  ───────────────────────────────────────────────────────────── │
│  [Future: AI-generated insight about working styles]            │
│  "You both value Ethics highly. Sarah leads with Influence      │
│   while you lead with Resilience — complementary strengths."    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

3. Create `apps/together/src/hooks/usePartnerInfluence.ts`
   - Fetches partner's permission, practice, focus
   - Fetches their recent activity stats
   - Only returns data if partnership is accepted

4. Sections:
   - Their Influence: Read from their `permissions` record
   - What You've Seen: Query tool tables where sender = me, recipient = them
   - What They've Seen: Query where sender = them, recipient = me
   - Complement section: Placeholder for now (P2)

### Done Criteria
- [ ] Partnership view displays partner info
- [ ] Their Influence section shows their declaration
- [ ] Sent items display correctly
- [ ] Received items display correctly
- [ ] Back navigation works
- [ ] Handles partner not found gracefully
- [ ] No TypeScript errors

### STOP — Verify with Brian before continuing

---

## Checkpoint 5: Activity Entry Cards

**Goal:** Create reusable cards for displaying exchange activity

### Tasks

1. Create `apps/together/src/components/exchange/ActivityEntryCard.tsx`

```typescript
interface ActivityEntryCardProps {
  type: 'impact' | 'improve' | 'inspire';
  preview: string;
  date: string;
  direction: 'sent' | 'received';
  onClick?: () => void;
}
```

2. Design:
   - Icon based on type (Zap/TrendingUp/Sparkles)
   - Type label with appropriate color
   - Preview text (truncated)
   - Relative time
   - Direction indicator (subtle)

3. Use in PartnershipViewPage for both "What you've seen" and "What they've seen" sections

### Done Criteria
- [ ] Card displays all info correctly
- [ ] Icons and colors match type
- [ ] Preview truncates nicely
- [ ] Click navigates to full entry (optional)
- [ ] No TypeScript errors

### STOP — Final verification with Brian

---

## Phase D Complete Checklist

- [ ] exchange_partnerships table created
- [ ] recipient_email columns added to tool tables
- [ ] useExchangePartners hook complete
- [ ] useExchangeInvitations hook complete
- [ ] usePartnershipActivity hook complete
- [ ] usePartnerInfluence hook complete
- [ ] ExchangePage displays partners and invitations
- [ ] Accept/Decline invitation works
- [ ] Invite modal creates partnerships
- [ ] PartnershipViewPage shows full detail
- [ ] ActivityEntryCard component works
- [ ] Navigation flows correctly
- [ ] Empty states handled
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build passes

---

## Files Created/Modified Summary

### New Components
```
apps/together/src/components/exchange/
├── PendingInvitationCard.tsx
├── PartnerCard.tsx
├── InviteModal.tsx
├── ActivityEntryCard.tsx
├── InfluenceDisplay.tsx
└── index.ts
```

### New Hooks
```
apps/together/src/hooks/
├── useExchangePartners.ts
├── useExchangeInvitations.ts
├── usePartnershipActivity.ts
└── usePartnerInfluence.ts
```

### Updated Pages
```
apps/together/src/pages/
├── ExchangePage.tsx (full implementation)
└── PartnershipViewPage.tsx (full implementation)
```

---

## Data Flow Summary

| Component | Reads From | Writes To |
|-----------|------------|-----------|
| ExchangePage | `exchange_partnerships` | — |
| InviteModal | — | `exchange_partnerships` |
| PendingInvitationCard | `exchange_partnerships` | `exchange_partnerships` (accept/decline) |
| PartnershipViewPage | `permissions`, `priorities`, `validations`, `predictions` | — |

---

## Security Considerations

1. **Visibility gating:** Only show partner's Influence if partnership is accepted
2. **Query filtering:** Always filter by current user's email
3. **RLS policies:** Consider adding policies on exchange_partnerships

```sql
-- Example RLS policy
CREATE POLICY "Users can view their own partnerships"
ON exchange_partnerships
FOR SELECT
USING (
  inviter_email = auth.jwt() ->> 'email' 
  OR invitee_email = auth.jwt() ->> 'email'
);

CREATE POLICY "Users can create invitations"
ON exchange_partnerships
FOR INSERT
WITH CHECK (inviter_email = auth.jwt() ->> 'email');

CREATE POLICY "Invitees can update status"
ON exchange_partnerships
FOR UPDATE
USING (invitee_email = auth.jwt() ->> 'email');
```

---

## Future Enhancements (Not This Phase)

- Email notifications when invited
- AI-generated "How you complement each other" insights
- Activity feed within partnership view
- Revoke partnership option
- Privacy settings per partnership

---

## Handoff Notes

After Phase D:
- Users can invite others to exchange
- Accepted partnerships show mutual visibility
- Partnership view shows what each has seen in the other
- Ready for Dashboard integration (Session 7)

---

**End of Phase D Build Plan**
