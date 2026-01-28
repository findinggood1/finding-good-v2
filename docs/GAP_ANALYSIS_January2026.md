# Gap Analysis: Current Tools vs. Framework V4

**Date:** January 24, 2026  
**Purpose:** Identify what needs to change in each tool

---

## Executive Summary

The current tools are functional but designed for a different flow:
- **Current:** Predict → Priority → Prove (separate tools, separate logins)
- **Target:** Permission → Predict → Daily Check-in → Campfire (unified, Campfire-centric)

Major gaps:
1. No "Permission" layer (anchor action + activities definition)
2. No daily check-in mechanism
3. Campfire is passive feed, not active home base
4. Tools don't share login or navigation
5. No notification/text system

---

## Tool-by-Tool Analysis

### PREDICT TOOL (predict.findinggood.com)

**Current State:**
- 6-step form: BasicInfo → FutureStory → FutureConnections → PastStory → PastConnections → Alignment
- Captures: title, type (goal/challenge/experience), description
- FIRES questions through the steps
- Outputs: Predictability score, zone placement

**What's Working:**
- Clean entry flow
- FIRES extraction happening
- Results page with scores

**Gaps vs. Framework V4:**
| Current | Needed |
|---------|--------|
| Single goal/challenge | Multiple goals under one "what matters most" |
| No "what matters most" prompt | Add Permission-style opening question |
| No anchor action definition | Add anchor action + activities capture |
| QuickPredictPage is placeholder | QuickPredict should BE the enhanced entry |
| Doesn't populate Campfire | Should auto-populate daily check-in items |

**Recommended Changes:**
1. Add "What do you want more of / what's most important?" as Step 0
2. Allow multiple goals/challenges tied to that one north star
3. Add anchor action + activities capture (can be new step or part of Step 1)
4. QuickPredict becomes the enhanced entry point (not the 6-step)
5. Data should write to Together/Campfire daily check-in

**Estimated Complexity:** Medium (restructure existing, add new step)

---

### PRIORITY TOOL (priority.findinggood.com)

**Current State:**
- Three flows: "Name What Matters" (self), "Get Inspired" (ask), "Recognize Impact" (other)
- Self mode asks: what went well, what was your part
- Stores in `validations` table with mode='self'
- AI extracts FIRES signals

**What's Working:**
- Core "what went well" capture
- Recognition of others flow
- FIRES extraction

**Gaps vs. Framework V4:**
| Current | Needed |
|---------|--------|
| Standalone tool | Action triggered from Campfire |
| Generic "what went well" | Tied to specific activities from Permission |
| Separate login | Unified login through Campfire |
| Email prompts scattered | Campfire-based prompts |

**Recommended Changes:**
1. Should launch from Campfire after daily check-in
2. "What went well" should reference the user's defined activities
3. Remove email ask from Priority → move to Campfire
4. Priority becomes a deepening tool, not a starting point

**Estimated Complexity:** Medium (context shifting more than code)

---

### PROVE TOOL (proof.findinggood.com)

**Current State:**
- Three modes: Self, Request, Send to Others
- Goal → Intensity → Questions → AI Analysis → Results
- Confidence/Clarity/Ownership scores
- FIRES extraction
- Proof line generation

**What's Working:**
- Strongest tool currently
- AI scoring working well
- Three modes cover the use cases

**Gaps vs. Framework V4:**
| Current | Needed |
|---------|--------|
| Standalone tool | Action triggered from Campfire |
| Any goal/challenge | Tied to goals from Predict |
| Separate login | Unified login through Campfire |

**Recommended Changes:**
1. Should launch from Campfire, pre-populated with user's goals
2. When goal achieved, prompt: "Log proof for [Goal Name]?"
3. Proof becomes evidence tied to prediction, not standalone

**Estimated Complexity:** Low (mostly context, some data linking)

---

### TOGETHER/CAMPFIRE (together.findinggood.com)

**Current State:**
- Feed of activity from connections
- Pending asks section
- Passive viewing experience
- Circle-based filtering

**What's Working:**
- Feed architecture exists
- Connection concept established
- Visual design clean

**Gaps vs. Framework V4:**
| Current | Needed |
|---------|--------|
| Passive feed | Active home base |
| No daily check-in | Daily "did you do it?" as entry |
| No activity tracking | Track anchor action + activities |
| No unified login | Single login for all tools |
| No notifications | Text/push prompts |
| Viewing only | Prompt Priority/Proof actions |

**Recommended Changes:**
1. Add Permission setup (anchor action + activities) if not done
2. Daily check-in as primary interaction: tap to confirm activities
3. "X people did theirs—do yours to see" mechanic
4. Ping others: "Did you do your most important things?"
5. Launch Priority/Proof from Campfire context
6. Unified auth—all tools accessible from here

**Estimated Complexity:** High (significant new functionality)

---

### DASHBOARD (dashboard.findinggood.com)

**Current State:**
- Coach view of clients
- Engagement tracking
- Notes and session management

**Gaps vs. Framework V4:**
| Current | Needed |
|---------|--------|
| Generic client view | "What matters most" front and center |
| Activity counts | Daily check-in streaks |
| No anchor action visibility | Show anchor + activities |
| No dyad view | See how pairs are interacting |

**Recommended Changes:**
1. Client card shows: anchor action, activities, current goals
2. Daily check-in streak visible
3. Priority/Proof frequency tied to their prediction
4. Dyad partner interaction visible

**Estimated Complexity:** Medium (display changes, some new queries)

---

## New Components Needed

### 1. Permission Tool/Flow
**Purpose:** Define anchor action + activities
**Could be:**
- New micro-tool
- Part of enhanced Predict
- Onboarding flow in Campfire

**Recommendation:** Part of enhanced Predict (QuickPredict becomes this)

---

### 2. Daily Check-in Component
**Purpose:** 30-second "did you do it?" tracking
**Lives in:** Campfire (home screen)
**Triggers:** Priority/Proof prompts based on response

---

### 3. Notification System
**Purpose:** Text/push "Did you do your most important things?"
**Options:**
- Twilio for SMS
- Push notifications via PWA
- Email fallback

**Recommendation:** Start with email, add SMS for coaching clients

---

### 4. Unified Authentication
**Purpose:** One login, access all tools from Campfire
**Current:** Each app has separate auth flow
**Needed:** Shared session, Campfire as hub

---

## Database Changes Needed

**New columns/tables:**

```sql
-- In predictions table
anchor_action TEXT,
activities JSONB,  -- [{name, description}]

-- New table: daily_checkins
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY,
  client_email TEXT NOT NULL,
  prediction_id UUID REFERENCES predictions(id),
  check_date DATE NOT NULL,
  activities_completed JSONB,  -- [{activity_id, completed: bool}]
  created_at TIMESTAMP DEFAULT NOW()
);

-- New table: notification_preferences
CREATE TABLE notification_preferences (
  client_email TEXT PRIMARY KEY,
  daily_checkin_method TEXT,  -- 'email', 'sms', 'push'
  daily_checkin_time TIME,
  phone_number TEXT
);
```

---

## Recommended Build Order

### Phase 1: Foundation (Week 1-2)
1. ✅ Create dev environment (copy Supabase schema)
2. Add anchor_action + activities to predictions table
3. Enhance QuickPredict to capture Permission layer
4. Test with Brian's own data

### Phase 2: Daily Loop (Week 2-3)
1. Build daily check-in component in Campfire
2. "Did you do it?" → tap → routes to Campfire
3. Campfire shows check-in status of connections
4. Basic email notification (daily prompt)

### Phase 3: Integration (Week 3-4)
1. Priority launches from Campfire context
2. Proof launches from Campfire context
3. Unified navigation (Campfire as hub)
4. Dashboard shows new metrics

### Phase 4: Polish (Week 4+)
1. SMS notifications for coaching clients
2. Paying client tier (AI chat access)
3. Dyad-specific features
4. Coach assignment system

---

## Questions for Brian Before Building

1. **Permission in Predict:** Should anchor action be required, or can users skip initially and add later?

2. **Activity granularity:** Up to 3 activities—are these free-form or template options?

3. **Daily check-in timing:** Default time for notification? User-configurable?

4. **Visibility defaults:** When someone does daily check-in, who sees it by default? (All connections? Selected people? Just dyad partner?)

5. **Coaching client identifier:** Manual flag in database, or tied to Stripe/payment?

---

*End of Gap Analysis*
