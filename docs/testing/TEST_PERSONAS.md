# Test Personas & Data Seeding

**Purpose:** Consistent test data for validating builds  
**Status:** Documentation ready, script pending

---

## Test Personas

These personas represent different user types. Use them when testing features.

### Marcus Chen — Executive Rebuilding Trust

| Attribute | Value |
|-----------|-------|
| Email | `marcus.test@findinggood.dev` |
| Role | `client` |
| Coach | Brian |
| Profile | Recently promoted exec who had a team setback, rebuilding credibility |

**Characteristics:**
- High achiever dealing with a confidence dip
- Values: Integrity, influence, results
- FIRES pattern: Strong Ethics/Strengths, lower Resilience currently
- Use case: Tests coached client flows, Map/Chat access

**Sample Data:**
- 1 active prediction: "Rebuild team trust by Q2"
- 5 priorities this month (mix of self and received)
- 2 validations
- Permission: "Create environments where people feel safe to fail"
- Practice: "Start meetings by acknowledging what's working"
- Focus: "Ask one open question per meeting", "Notice when I'm defending vs learning"

---

### Sarah Park — Scaling Founder

| Attribute | Value |
|-----------|-------|
| Email | `sarah.test@findinggood.dev` |
| Role | `client` |
| Coach | Brian |
| Profile | Founder transitioning from doer to leader |

**Characteristics:**
- High energy, struggles to delegate
- Values: Impact, speed, authenticity
- FIRES pattern: Strong Feelings/Influence, developing Strengths awareness
- Use case: Tests high-volume user, lots of entries

**Sample Data:**
- 2 active predictions: "Step back from daily ops", "Hire my replacement for X"
- 12 priorities this month
- 4 validations
- Heavy exchange activity (gives lots of recognition)

---

### David Kim — New Manager

| Attribute | Value |
|-----------|-------|
| Email | `david.test@findinggood.dev` |
| Role | `user` |
| Coach | None |
| Profile | Recently promoted IC, learning to lead |

**Characteristics:**
- Eager but uncertain
- Values: Competence, being liked, doing right
- FIRES pattern: All elements developing
- Use case: Tests free user flows, locked features

**Sample Data:**
- 1 active prediction
- 3 priorities
- 0 validations (hasn't discovered Proof yet)
- No coach access (Map/Chat should be locked)

---

### Elena Rodriguez — Career Changer

| Attribute | Value |
|-----------|-------|
| Email | `elena.test@findinggood.dev` |
| Role | `user` |
| Coach | None |
| Profile | Mid-career professional pivoting industries |

**Characteristics:**
- Reflective, sometimes overthinks
- Values: Meaning, growth, authenticity
- FIRES pattern: Strong Ethics, building Confidence
- Use case: Tests new user experience, empty states

**Sample Data:**
- 0 predictions (brand new)
- 0 priorities
- 0 validations
- Use for testing onboarding and empty states

---

## Data Seeding Approach

### Option 1: SQL Script (Recommended)

Create `scripts/seed-test-data.sql` that:
1. Creates test users in `clients` table
2. Adds sample predictions, priorities, validations
3. Sets up permissions/focus items
4. Creates some exchange activity between personas

**Run with:** Supabase MCP or SQL editor

### Option 2: Manual via UI

Test each persona by:
1. Log in as that user
2. Go through the flows manually
3. Create realistic data

**Pro:** Tests real user experience  
**Con:** Time consuming, inconsistent

### Option 3: Seeding Hook (Dev Only)

Add a dev-only endpoint or hook that populates data:
```typescript
// Only available in development
useEffect(() => {
  if (process.env.NODE_ENV === 'development' && searchParams.get('seed')) {
    seedTestData()
  }
}, [])
```

---

## Seed Data SQL Template

```sql
-- ============================================
-- TEST PERSONA: Marcus Chen
-- ============================================

-- Client record
INSERT INTO clients (email, full_name, role, coach_id)
VALUES ('marcus.test@findinggood.dev', 'Marcus Chen', 'client', '[BRIAN_COACH_ID]')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Permission/Focus
INSERT INTO permissions (client_email, permission, practice, focus_items, created_at)
VALUES (
  'marcus.test@findinggood.dev',
  'Create environments where people feel safe to fail',
  'Start meetings by acknowledging what''s working',
  '["Ask one open question per meeting", "Notice when I''m defending vs learning"]',
  NOW()
)
ON CONFLICT (client_email) DO UPDATE SET 
  permission = EXCLUDED.permission,
  practice = EXCLUDED.practice;

-- Prediction
INSERT INTO predictions (client_email, title, status, created_at)
VALUES (
  'marcus.test@findinggood.dev',
  'Rebuild team trust by Q2',
  'active',
  NOW() - INTERVAL '14 days'
);

-- Sample priorities
INSERT INTO priorities (client_email, what_i_did, my_part, impact, created_at)
VALUES 
  ('marcus.test@findinggood.dev', 'Held space for team concerns in all-hands', 'Asked questions instead of defending', 'Team opened up about real blockers', NOW() - INTERVAL '2 days'),
  ('marcus.test@findinggood.dev', 'Admitted I was wrong about timeline', 'Owned the miss publicly', 'PM said it helped her feel safe to raise concerns', NOW() - INTERVAL '5 days');

-- Continue for other personas...
```

---

## When to Use Each Persona

| Testing | Use Persona |
|---------|-------------|
| Coached client features | Marcus, Sarah |
| Free user limitations | David, Elena |
| Empty states / onboarding | Elena |
| High activity / volume | Sarah |
| Exchange flows (send/receive) | Marcus ↔ Sarah |
| Locked features (Map/Chat) | David (should be locked) |

---

## Next Steps

1. [ ] Create full `scripts/seed-test-data.sql` with all personas
2. [ ] Add npm script: `pnpm seed:test` 
3. [ ] Document how to reset test data
4. [ ] Add to pre-flight checklist option

---

**End of Test Personas Doc**
