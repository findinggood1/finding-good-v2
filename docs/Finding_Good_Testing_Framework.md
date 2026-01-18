# Finding Good V2: Testing Framework

**Created:** January 14, 2026  
**Updated:** January 16, 2026  
**Purpose:** Structured testing, debugging, demo data creation, and **development tracking** across all Finding Good tools  
**Status:** Active

---

## Quick Reference

### Live URLs
| Tool | URL | Status |
|------|-----|--------|
| Predict | https://predict.findinggood.com | ⚠️ Needs testing |
| Priority | https://priority.findinggood.com | ⚠️ Needs testing |
| Proof | https://proof.findinggood.com | ✅ Just deployed |
| Together (Client) | https://together.findinggood.com | ⚠️ Needs testing |
| Dashboard (Coach) | https://dashboard.findinggood.com | ⚠️ Needs testing |

### Database
- **Project ID:** mdsgkddrnqhhtncfeqxw
- **Primary Tables:** predictions, snapshots, validations, impact_verifications, prediction_connections, inspiration_shares

---

## Part 1: Test Personas

### Persona 1: Marcus Chen
| Attribute | Value |
|-----------|-------|
| **Email** | info@findinggood.com |
| **Role** | VP of Engineering, Tech Company |
| **Age** | 45 |
| **Archetype** | Burned out leader rebuilding trust |

**Background:**
Marcus had to lay off 40% of his team three months ago. The remaining team is scared, disengaged, and doesn't trust leadership. He knows the business reasons were sound, but he's carrying guilt and his team sees him as "the one who made the cuts." He's always been a high performer, but now he's questioning everything.

**Prediction (Goal/Challenge):**
"Rebuild trust with my team after the layoffs I had to make"

**FIRES Profile (Target Pattern):**
- **Feelings:** LOW - Suppressing guilt, not acknowledging his own emotional state
- **Influence:** MEDIUM - Knows he has authority but feels powerless to change perception
- **Resilience:** HIGH - Has survived hard things before (startup failure, career pivots)
- **Ethics:** HIGH - Strong values around honesty, but conflicted about corporate decisions
- **Strengths:** MEDIUM - Technical leadership clear, people leadership shaky

**Expected Zone:** Discovering (has proof from past but can't connect it to present)

**Expected Development Arc:**
- Week 1: Vague on Feelings, defaults to business language
- Week 2: Starts naming specific emotions after tool feedback
- Week 3: Resilience pattern emerges clearly across entries
- Week 4: Connects past turnaround proof to current situation

**Voice/Personality:**
- Direct, analytical, skeptical of "soft" approaches
- Uses business language, uncomfortable with emotional vocabulary
- Secretly hopes someone will just tell him what to do
- Self-critical, high standards

**Sample Responses (for testing):**
- Goal: "I need my team to trust me again. Right now they're just going through the motions waiting for the next shoe to drop."
- Feelings: "Honestly? I feel like a fraud. I keep saying 'we'll get through this together' but I'm the reason we're in this position."
- Past Success: "Five years ago I turned around a failing engineering team at my previous company. Inherited a mess, built it into the best team in the org."

---

### Persona 2: Sarah Okonkwo
| Attribute | Value |
|-----------|-------|
| **Email** | support@findinggood.com |
| **Role** | Director of Operations, Healthcare |
| **Age** | 38 |
| **Archetype** | Stuck in the middle, facing crossroads |

**Background:**
Sarah has been offered a path to VP at her company - it's the obvious "next step." But she's been dreaming about starting her own consulting practice for years. She keeps analyzing both options but can't commit to either. Meanwhile, she's burning out trying to be perfect at a job she's not sure she wants.

**Prediction (Goal/Challenge):**
"Decide whether to pursue the VP promotion or start my consulting practice"

**FIRES Profile (Target Pattern):**
- **Feelings:** MEDIUM - Aware of her feelings but dismisses them as "impractical"
- **Influence:** LOW - Feels trapped by golden handcuffs and others' expectations
- **Resilience:** MEDIUM - Has handled challenges but always within safe structures
- **Ethics:** HIGH - Knows exactly what matters, just afraid to act on it
- **Strengths:** HIGH - Very clear on her capabilities, maybe over-relies on competence

**Expected Zone:** Performing (confident but not aligned - knows what she CAN do, not what she SHOULD do)

**Expected Development Arc:**
- Week 1: Entries focus on competence, avoids the real question
- Week 2: Ethics starts showing up ("what I actually want")
- Week 3: Influence language shifts from trapped → choosing
- Week 4: Clarity on what she's deciding FOR, not just between

**Voice/Personality:**
- Thoughtful, measured, sees all sides of every argument
- Uses "should" a lot - attuned to expectations
- Asks good questions but struggles to answer them for herself
- Warm but guarded

**Sample Responses (for testing):**
- Goal: "I want to finally make this decision and stop living in limbo. Either path could work - I just need to commit."
- Feelings: "I feel pulled in two directions. Excited when I think about consulting, but then the fear kicks in. The VP path feels... safe but suffocating?"
- Past Success: "I led our department through a major system migration last year. Everyone said it couldn't be done in 6 months. We did it in 4."

---

### Persona 3: David Park
| Attribute | Value |
|-----------|-------|
| **Email** | brian@brianfretwell.com |
| **Role** | Plant Manager, Manufacturing |
| **Age** | 52 |
| **Archetype** | Old-school leader learning new ways |

**Background:**
David promoted Mike to be the day-to-day plant manager so David could focus on strategic issues. But Mike isn't getting buy-in from the floor supervisors. They keep going around Mike, coming straight to David. David's getting pulled back into stuff he shouldn't be in, and Mike is getting frustrated.

**Prediction (Goal/Challenge):**
"Get my plant manager and floor supervisors aligned so I can step back"

**FIRES Profile (Target Pattern):**
- **Feelings:** LOW - "Feelings are for HR" mindset, but actually quite intuitive
- **Influence:** HIGH - 30 years of knowing exactly how to get things done
- **Resilience:** HIGH - Has weathered recessions, strikes, supply chain disasters
- **Ethics:** MEDIUM - Practical values, sometimes compromises for efficiency
- **Strengths:** HIGH - Deep operational expertise, respected by everyone

**Expected Zone:** Owning on Influence/Resilience/Strengths, Exploring on Feelings

**Expected Development Arc:**
- Week 1: All entries about what others should do differently
- Week 2: Starts recognizing his own role in the dynamic
- Week 3: Influence entries shift from "my authority" to "their development"
- Week 4: Names a feeling without prompting

**Voice/Personality:**
- Practical, no-nonsense, slightly impatient with theory
- Tells stories from "back when" frequently
- Suspicious of anything that sounds like a fad
- Deeply loyal, protective of his people

**Sample Responses (for testing):**
- Goal: "I need issues to flow through Mike. Decisions come back through Mike. I need to stop getting end-runs to my office about floor problems."
- Feelings: "I feel... frustrated, I guess. I brought Mike up because he earned it, but the team won't give him a chance."
- Past Success: "When I took over this plant 15 years ago, it was bottom of the company. Three years later, best safety record, best productivity. We did that together."

---

### Persona 4: Elena Vasquez
| Attribute | Value |
|-----------|-------|
| **Email** | bfretwell7@hotmail.com |
| **Role** | Founder/CEO, Growth-Stage Startup |
| **Age** | 34 |
| **Archetype** | Founder scaling beyond herself |

**Background:**
Elena's company just closed Series B. She went from 12 people to 60 in 8 months. The scrappy startup culture that got them here is breaking. She's in every meeting, making every decision, and her leadership team is either waiting for her input or going rogue. She knows she needs to change but doesn't know how.

**Prediction (Goal/Challenge):**
"Build a leadership team that can run the company without me in every room"

**FIRES Profile (Target Pattern):**
- **Feelings:** HIGH - Very in touch with her intuition, trusts her gut
- **Influence:** MEDIUM - Has influence but spreads too thin, doesn't delegate
- **Resilience:** HIGH - Startup founder resilience, has survived near-death moments
- **Ethics:** HIGH - Clear founder vision, struggles to let others carry it
- **Strengths:** MEDIUM - Knows she's good at starting things, unsure about scaling

**Expected Zone:** Mixed - Owning on Feelings/Ethics, Exploring on Influence

**Expected Development Arc:**
- Week 1: Entries are scattered, everything feels urgent
- Week 2: Pattern emerges: delegation = loss of control anxiety
- Week 3: Proof entries surface past moments she let go successfully  
- Week 4: Influence reframes from "doing" to "enabling"

**Voice/Personality:**
- Fast-talking, high energy, interrupts herself
- Mixes vulnerability with confidence easily
- Thinks out loud, changes direction mid-sentence
- Inspiring but exhausting

**Sample Responses (for testing):**
- Goal: "I want to take a two-week vacation and not have the company fall apart. Actually, I want to take a vacation and not even CHECK my phone."
- Feelings: "I feel like I'm holding my breath all the time. Like if I stop running, everything will collapse. But also... excited? We're doing something real."
- Past Success: "We almost ran out of money twice. Both times I found a way. The second time, I had to let go of my co-founder. Hardest thing I've ever done, but the company needed it."

---

## Part 2: Testing Checklists

### Phase 1: Predict Tool Testing

#### 1A: First-Time User Experience (No Auth)
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Load homepage | See landing/login page | | |
| Clear value proposition | User understands what tool does | | |
| Magic link sends | Email arrives within 60 seconds | | |
| Magic link works | Redirects to app, logged in | | |

#### 1B: New Prediction Flow
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Click "+ New" | Starts prediction wizard | | |
| Step 1: Type selection | Can choose goal/challenge/experience | | |
| Step 2: Title & description | Text inputs work, saves | | |
| Step 3: Success Vision | Future story captures | | |
| Step 4-8: FIRES Future | All 5 FIRES questions render | | |
| Step 9: Future Connections | Can add 1-4 people | | |
| Step 10: Past Success | Past story captures | | |
| Step 11-15: FIRES Past | All 5 FIRES questions render | | |
| Step 16: Past Connections | Can add 1-4 people | | |
| Step 17: Alignment ratings | 1-4 scale works | | |
| Completion | Results page shows | | |
| AI Analysis | Narrative generates | | |
| Predictability Score | Score displays (0-100) | | |
| FIRES Map | Zones show for each element | | |
| Educational content | Growth/Owning sections display | | |

#### 1C: Quick Predict Flow
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Click "Quick" | Starts quick flow | ❌ | KNOWN ISSUE: Not working |
| Abbreviated questions | 3-5 questions only | | |
| Quick results | Simplified output | | |
| Convert to full | Option to expand | | |

#### 1D: Existing Predictions
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| List view | Shows all predictions | ✅ | Working |
| Card shows score | Predictability visible | ❌ | KNOWN ISSUE: Not showing |
| Card shows date | Created date visible | ✅ | Working |
| Click to view | Opens prediction detail | | |
| Edit prediction | Can modify | | |
| Delete prediction | Can remove | ❌ | KNOWN ISSUE: Not working |
| Archive prediction | Can archive vs delete | | |

#### 1E: Data Verification
| Test | Query/Check | Status | Notes |
|------|-------------|--------|-------|
| Prediction created | `SELECT * FROM predictions WHERE client_email = '[email]'` | | |
| Snapshot created | `SELECT * FROM snapshots WHERE client_email = '[email]'` | | |
| Connections saved | `SELECT * FROM prediction_connections WHERE prediction_id = '[id]'` | | |
| Score calculated | `snapshots.predictability_score IS NOT NULL` | | |
| Score linked | `predictions.current_predictability_score` matches | ❌ | KNOWN ISSUE |

---

### Phase 2: Priority Tool Testing

#### 2A: Self Mode (Confirm What Mattered)
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Load homepage | See start options | | |
| Start "Self" flow | Questions begin | | |
| Link to prediction | Can select active prediction | | |
| Question 1: What went well | Text input works | | |
| Question 2: Your part | Text input works | | |
| Question 3: Impact | Text input works | | |
| Helper framings | Chips display, selectable | | |
| AI Analysis | FIRES extracted, signals shown | | |
| Priority Line | Shareable summary generated | | |
| Share to Campfire | Toggle works | | |

#### 2B: Other Mode (Send Impact)
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Start "Other" flow | Recipient fields show | | |
| Enter recipient info | Name, email, relationship | | |
| Impact questions | What they did, showed, affected | | |
| Impact Card generated | Card displays | | |
| Share link created | URL generated | | |

#### 2C: Development Feedback Capture
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Clarity signal returned | emerging/developing/grounded | | |
| Ownership signal returned | emerging/developing/grounded | | |
| FIRES elements extracted | At least 1 element detected | | |
| AI insight displayed | Personalized feedback shown | | |

#### 2D: Data Verification
| Test | Query/Check | Status | Notes |
|------|-------------|--------|-------|
| Entry created | `SELECT * FROM impact_verifications WHERE client_email = '[email]'` | | |
| Type correct | `type = 'self'` or `type = 'other'` | | |
| Responses saved | `responses JSONB` populated | | |
| FIRES extracted | `fires_extracted JSONB` populated | | |
| Prediction linked | `prediction_id` matches if selected | | |
| Signals saved | `clarity_signal`, `ownership_signal` populated | | |

---

### Phase 3: Proof Tool Testing

#### 3A: Self Mode
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Load homepage | See mode options | | |
| Start "Self" flow | Questions begin | | |
| Goal/challenge input | Text captures | | |
| Intensity selection | Light/Balanced/Deeper | | |
| FIRES questions | Based on intensity | | |
| AI Analysis | Validation signal generated | | |
| Scores | Confidence/Clarity/Ownership | | |
| Pattern | What worked/Why/How to repeat | | |
| Proof Line | Shareable summary | | |

#### 3B: Request Mode
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Start "Request" flow | Recipient fields show | | |
| Enter context | What you did, who you're asking | | |
| Share link created | URL generated | | |
| Recipient can respond | Public form works | | |

#### 3C: Send to Others Mode
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Start "Send" flow | Recipient fields show | | |
| What you noticed | Context provided | | |
| Share link created | URL generated | | |
| Recipient can reflect | Their flow works | | |

#### 3D: Development Feedback Capture
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Validation signal returned | emerging/developing/grounded | | |
| Confidence score (1-5) | Numeric value saved | | |
| Clarity score (1-5) | Numeric value saved | | |
| Ownership score (1-5) | Numeric value saved | | |
| FIRES extracted with strength | Elements + 1-5 strength | | |
| Pattern generated | whatWorked, whyItWorked, howToRepeat | | |

#### 3E: Data Verification
| Test | Query/Check | Status | Notes |
|------|-------------|--------|-------|
| Validation created | `SELECT * FROM validations WHERE client_email = '[email]'` | | |
| Mode correct | `mode` = 'self'/'request'/'send' | | |
| Signal generated | `validation_signal` populated | | |
| Scores populated | `scores JSONB` has values | | |
| Prediction linked | `prediction_id` if selected | | |

---

### Phase 4: Dashboard Integration (Coach View)

#### 4A: Client List
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Load dashboard | Client list shows | | |
| See all test personas | Marcus, Sarah, David, Elena | | |
| Click client | Opens client view | | |

#### 4B: Client Detail View
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Overview tab | Summary displays | | |
| Predictions tab | Shows client predictions | | |
| Proof tab | Shows validations (mode='proof') | | |
| Priorities tab | Shows validations (mode='self') | | |
| Sessions tab | Session management | | |
| Notes tab | Coaching notes | | |
| Map tab | Clarity/integrity map | | |

#### 4C: Development Visibility
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Clarity trend visible | Can see improvement over time | | |
| FIRES patterns shown | Dominant elements highlighted | | |
| Exchange activity | Shares sent/received visible | | |
| Prediction Confidence trend | Score movement over time | | |

#### 4D: Data Flows
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Predictions appear | From predictions table | | |
| Scores show | current_predictability_score | | |
| Proof count accurate | Matches validations count | | |
| Priority count accurate | Matches impact_verifications | | |
| Activity feed | Recent entries show | | |

---

### Phase 5: Together Integration (Client View)

#### 5A: Home Page
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Load Together | Home page shows | | |
| Active predictions | Shows user's predictions | | |
| Zone cards | Current zone, growth, highlight | | |
| Recent activity | Latest entries | | |

#### 5B: Clarity Map
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Navigate to /map | Map page loads | | |
| FIRES progress bars | Based on validations | | |
| Zone indicators | Per FIRES element | | |

#### 5C: Story Sections
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Where I Am | Present story | | |
| Where I've Been | Past story | | |
| Where I'm Going | Future/potential | | |
| Superpowers | Claimed/Emerging/Hidden | | |

#### 5D: Campfire (Exchange Hub)
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Navigate to Campfire | Feed loads | | |
| Own shares visible | What I've shared | | |
| Connection shares visible | What others shared | | |
| Mutual impact shown | Both scores affected | | |
| Easy to respond | Can witness/react | | |

#### 5E: Prediction Confidence Display
| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Score visible | Current Prediction Confidence | | |
| Internal clarity component | Articulation count/quality | | |
| External validation component | Witnessed/shared count | | |
| Score updates on share | Goes up when exchange happens | | |

---

## Part 3: Known Issues (Pre-Testing)

### Predict Tool
| Issue | Severity | Details |
|-------|----------|---------|
| Delete not working | HIGH | Cannot remove predictions |
| Quick Predict broken | HIGH | Flow doesn't start |
| Score not on cards | MEDIUM | predictions.current_predictability_score is NULL |
| Educational content missing | MEDIUM | Growth/Owning explanations not showing |
| Duplicate predictions | LOW | Same title creates multiple records |

### Priority Tool
| Issue | Severity | Details |
|-------|----------|---------|
| Needs V2 testing | UNKNOWN | Not yet validated |

### Proof Tool
| Issue | Severity | Details |
|-------|----------|---------|
| Just deployed | UNKNOWN | Needs full validation |

### Dashboard
| Issue | Severity | Details |
|-------|----------|---------|
| Integration unknown | UNKNOWN | Data flow not verified |

### Together
| Issue | Severity | Details |
|-------|----------|---------|
| Integration unknown | UNKNOWN | Data flow not verified |
| Campfire exchange not built | HIGH | Core exchange hub functionality |
| Prediction Confidence display | HIGH | Doesn't show both components |

---

## Part 4: Data Verification Queries

### Check Persona Data Completeness

```sql
-- Marcus Chen (info@findinggood.com)
SELECT 
  'predictions' as table_name,
  COUNT(*) as count
FROM predictions WHERE client_email = 'info@findinggood.com'
UNION ALL
SELECT 'snapshots', COUNT(*) FROM snapshots WHERE client_email = 'info@findinggood.com'
UNION ALL
SELECT 'validations', COUNT(*) FROM validations WHERE client_email = 'info@findinggood.com'
UNION ALL
SELECT 'impact_verifications', COUNT(*) FROM impact_verifications WHERE client_email = 'info@findinggood.com'
UNION ALL
SELECT 'prediction_connections', COUNT(*) FROM prediction_connections WHERE client_email = 'info@findinggood.com'
UNION ALL
SELECT 'inspiration_shares', COUNT(*) FROM inspiration_shares WHERE client_email = 'info@findinggood.com';
```

### Check Score Linkage

```sql
-- Verify predictions have scores from snapshots
SELECT 
  p.id,
  p.title,
  p.current_predictability_score as prediction_score,
  s.predictability_score as snapshot_score,
  CASE 
    WHEN p.current_predictability_score IS NULL AND s.predictability_score IS NOT NULL 
    THEN 'MISMATCH - needs sync'
    ELSE 'OK'
  END as status
FROM predictions p
LEFT JOIN snapshots s ON s.id = p.latest_snapshot_id OR s.prediction_id = p.id
ORDER BY p.created_at DESC
LIMIT 20;
```

### Check Cross-Tool Integration

```sql
-- Entries that should show in Dashboard
SELECT 
  client_email,
  'validation' as source,
  mode,
  created_at
FROM validations
WHERE client_email IN ('info@findinggood.com', 'support@findinggood.com', 'brian@brianfretwell.com', 'bfretwell7@hotmail.com')
UNION ALL
SELECT 
  client_email,
  'impact' as source,
  type as mode,
  created_at
FROM impact_verifications
WHERE client_email IN ('info@findinggood.com', 'support@findinggood.com', 'brian@brianfretwell.com', 'bfretwell7@hotmail.com')
ORDER BY created_at DESC;
```

---

## Part 5: Test Data Cleanup

### Remove Garbage Test Data

```sql
-- Delete test predictions with gibberish titles
DELETE FROM prediction_connections 
WHERE prediction_id IN (
  SELECT id FROM predictions 
  WHERE title ~ '^[a-z]{6,}$' 
  AND title !~ '[aeiou].*[aeiou]'
);

DELETE FROM snapshots 
WHERE prediction_id IN (
  SELECT id FROM predictions 
  WHERE title ~ '^[a-z]{6,}$' 
  AND title !~ '[aeiou].*[aeiou]'
);

DELETE FROM predictions 
WHERE title ~ '^[a-z]{6,}$' 
AND title !~ '[aeiou].*[aeiou]';

-- Delete gibberish validations
DELETE FROM validations 
WHERE goal_challenge ~ '^[a-z]{10,}$';
```

### Reset Persona for Clean Testing

```sql
-- Reset Marcus Chen (run before fresh test)
DELETE FROM inspiration_shares WHERE client_email = 'info@findinggood.com';
DELETE FROM prediction_connections WHERE client_email = 'info@findinggood.com';
DELETE FROM snapshots WHERE client_email = 'info@findinggood.com';
DELETE FROM predictions WHERE client_email = 'info@findinggood.com';
DELETE FROM validations WHERE client_email = 'info@findinggood.com';
DELETE FROM impact_verifications WHERE client_email = 'info@findinggood.com';
```

---

## Part 6: Demo Data Building Plan

### Week 1 Simulation (Per Persona)

| Day | Activity | Data Created | Development Data to Capture |
|-----|----------|--------------|----------------------------|
| Mon | Completes Predict Tool | 1 prediction, 1 snapshot, 4 connections | Predictability Score, Zone per FIRES, AI narrative |
| Tue | Priority confirmation | 1 impact_verification | Clarity signal, Ownership signal, FIRES detected, AI insight |
| Wed | Priority confirmation | 1 impact_verification | Clarity signal, Ownership signal, FIRES detected, AI insight |
| Thu | Priority confirmation + **Shares to Campfire** | 1 impact_verification, 1 inspiration_share | Signals + share initiated |
| Fri | Proof Tool (weekly) | 1 validation | Confidence/Clarity/Ownership scores, Pattern, FIRES extracted |
| Sat | — | — | — |
| Sun | Priority confirmation | 1 impact_verification | Clarity signal, Ownership signal, FIRES detected |

### Week 2 Simulation (Per Persona)

| Day | Activity | Data Created | Development Data to Capture |
|-----|----------|--------------|----------------------------|
| Mon | Priority confirmation | 1 impact_verification | Compare signals to Week 1 |
| Tue | Priority confirmation + **Sends Impact to another persona** | 1 impact_verification (type='other') | Impact card generated, exchange initiated |
| Wed | Priority confirmation + **Witnesses a share** | 1 impact_verification | Note: exposed to other's clarity |
| Thu | Priority confirmation | 1 impact_verification | Track FIRES pattern emerging |
| Fri | Proof Tool (weekly) + **Shares to Campfire** | 1 validation, 1 inspiration_share | Compare scores to Week 1, share initiated |
| Sat | — | — | — |
| Sun | Priority confirmation | 1 impact_verification | |

### Week 3 Simulation (Per Persona)

| Day | Activity | Data Created | Development Data to Capture |
|-----|----------|--------------|----------------------------|
| Mon | Priority confirmation | 1 impact_verification | Clarity trending? |
| Tue | Priority confirmation + **Receives Impact from another persona** | 1 impact_verification | External validation received |
| Wed | Priority confirmation | 1 impact_verification | |
| Thu | Priority confirmation + **Shares to Campfire** | 1 impact_verification, 1 inspiration_share | |
| Fri | Proof Tool (weekly) + **Requests Proof from connection** | 1 validation, 1 proof_request | Asks for external validation |
| Sat | — | — | — |
| Sun | Priority confirmation | 1 impact_verification | |

### Week 4 Simulation (Per Persona)

| Day | Activity | Data Created | Development Data to Capture |
|-----|----------|--------------|----------------------------|
| Mon | Priority confirmation | 1 impact_verification | Should see development arc completing |
| Tue | Priority confirmation | 1 impact_verification | |
| Wed | **Re-assess with Predict Tool** | 1 snapshot (linked to existing prediction) | Compare to Week 1: Score change, Zone movement |
| Thu | Priority confirmation + **Shares to Campfire** | 1 impact_verification, 1 inspiration_share | |
| Fri | Proof Tool (weekly) | 1 validation | Final scores - compare full arc |
| Sat | — | — | — |
| Sun | Priority confirmation | 1 impact_verification | |

### Target Demo State (4 weeks simulated)

| Persona | Predictions | Snapshots | Priorities | Proofs | Shares Sent | Shares Witnessed | Impact Exchanged |
|---------|-------------|-----------|------------|--------|-------------|------------------|------------------|
| Marcus | 1 | 2 | 12-15 | 4 | 4 | 6+ | 2 sent, 2 received |
| Sarah | 1 | 2 | 12-15 | 4 | 4 | 6+ | 2 sent, 2 received |
| David | 1 | 2 | 12-15 | 4 | 4 | 6+ | 2 sent, 2 received |
| Elena | 1 | 2 | 12-15 | 4 | 4 | 6+ | 2 sent, 2 received |

### Exchange Matrix (Who Interacts With Whom)

| | Marcus | Sarah | David | Elena |
|---|--------|-------|-------|-------|
| **Marcus** | — | Sends Impact W2 | Receives Impact W3 | Witnesses W2 |
| **Sarah** | Receives Impact W2 | — | Witnesses W3 | Sends Impact W3 |
| **David** | Sends Impact W3 | Witnesses W2 | — | Receives Impact W2 |
| **Elena** | Witnesses W3 | Receives Impact W3 | Sends Impact W2 | — |

---

## Part 7: Session Start Prompts

### For Predict Tool Testing
```
I'm testing the Finding Good Predict Tool with the Marcus Chen persona.

Reference: Finding_Good_Testing_Framework_v2.md

Marcus's email: info@findinggood.com
His challenge: "Rebuild trust with my team after the layoffs I had to make"

Please help me:
1. Walk through the tool as Marcus
2. Verify data lands correctly in Supabase
3. Document any issues found
4. Capture Marcus's authentic reactions to each screen
5. **Record all development data: Predictability Score, Zone per FIRES, AI insights**
```

### For Priority Tool Testing
```
I'm testing the Finding Good Priority Tool with [PERSONA] persona.

Reference: Finding_Good_Testing_Framework_v2.md

[PERSONA]'s email: [EMAIL]
Their active prediction: [TITLE]

Please help me:
1. Walk through daily confirmation as [PERSONA]
2. Verify data lands correctly in Supabase
3. Test the "Send Impact" flow
4. Document any issues found
5. **Record development data: Clarity signal, Ownership signal, FIRES detected, AI insight text**
```

### For Integration Testing
```
I'm testing cross-tool integration for Finding Good.

Reference: Finding_Good_Testing_Framework_v2.md

I need to verify:
1. Predict data shows in Dashboard
2. Priority data shows in Dashboard
3. Proof data shows in Dashboard
4. Together shows user's complete picture
5. **Development trends are visible (clarity improving, FIRES patterns, exchange activity)**

Please query Supabase and help me trace data flow.
```

### For Development Arc Testing
```
I'm validating the development arc for [PERSONA] after 4 weeks of simulated usage.

Reference: Finding_Good_Testing_Framework_v2.md

Expected arc: [PASTE FROM PERSONA SECTION]

Please help me:
1. Query all entries for this persona
2. Track clarity/confidence scores over time
3. Identify FIRES patterns that emerged
4. Calculate exchange activity (shares sent, received, witnessed)
5. Compare Week 1 vs Week 4 Predictability Scores
6. **Write the development narrative this data tells**
```

---

## Part 8: Development Tracking

The persona testing must capture the *development story* - how users grow through tool engagement. Track these three layers:

---

### Layer 1: Within-Tool Feedback (Real-Time Development)

**What to capture per entry:**

| Tool | Metric | How to Track |
|------|--------|--------------|
| Priority | Clarity signal | emerging / developing / grounded |
| Priority | Ownership signal | emerging / developing / grounded |
| Priority | FIRES detected | Which elements AI extracts |
| Priority | AI insight | Actual text returned |
| Proof | Confidence score | 1-5 |
| Proof | Clarity score | 1-5 |
| Proof | Ownership score | 1-5 |
| Proof | Validation signal | emerging / developing / grounded |
| Proof | FIRES extracted | Which elements + strength (1-5) |
| Proof | Pattern | whatWorked, whyItWorked, howToRepeat |
| Predict | Predictability Score | 0-100 |
| Predict | Zone per FIRES | Exploring / Discovering / Performing / Owning |
| Predict | AI narrative | Key insights from generated text |

**Checklist per persona entry:**
- [ ] Captured signal/score values
- [ ] Noted FIRES elements detected
- [ ] Saved AI insight text
- [ ] Recorded persona's reaction to feedback

---

### Layer 2: Accumulation Over Time (Trend Development)

**Weekly tracking table (per persona):**

| Week | Avg Clarity | Avg Confidence | Avg Ownership | Dominant FIRES | Prediction Score | Zone Movement |
|------|-------------|----------------|---------------|----------------|------------------|---------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |

**Patterns to watch for:**
- Clarity scores trending up? (getting more specific in articulation)
- Confidence scores trending up? (owning the process more)
- Ownership scores trending up? (claiming actions vs. luck)
- FIRES patterns emerging? (same elements appearing repeatedly)
- Zone movement? (Exploring → Discovering → Performing → Owning)

**Expected development arcs:**

| Persona | Starting State | Week 2 Checkpoint | Expected Week 4 State |
|---------|----------------|-------------------|----------------------|
| Marcus | Low Feelings clarity, vague on emotions | Starts naming specific emotions | Feelings emerging in entries, Resilience pattern clear |
| Sarah | High competence language, avoids real question | Ethics showing up ("what I actually want") | Influence shifts from trapped → choosing |
| David | All entries about what others should do | Recognizes own role in dynamic | Names a feeling without prompting |
| Elena | Scattered, everything urgent | Pattern emerges: delegation = loss anxiety | Influence reframes from "doing" to "enabling" |

---

### Layer 3: Exchange with Others (Relational Development)

**What to track:**

| Action | Who Gets Credit | What It Builds |
|--------|-----------------|----------------|
| Share to Campfire | Sharer: Internal (+) | Articulation, courage to share |
| Witness a share | Witness: External (+), Sharer: External (+) | Exposure to clarity, feeling seen |
| Send Impact | Sender: Internal (+), Recipient: External (+) | Articulation for sender, validation for recipient |
| Receive Impact | Recipient: External (+) | External validation landed |
| Request Proof | Requester: External (+) | Asks for external validation |
| Respond to Request | Responder: Internal (+), Requester: External (+) | Articulation for responder, validation for requester |

**Exchange tracking table (per persona):**

| Week | Shares Sent | Shares Witnessed | Impact Sent | Impact Received | Proof Requested | Proof Responded |
|------|-------------|------------------|-------------|-----------------|-----------------|-----------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |

**Mutual exchange matrix (end of simulation):**

Track who has exchanged with whom and what type:

| | Marcus | Sarah | David | Elena |
|---|--------|-------|-------|-------|
| **Marcus** | — | | | |
| **Sarah** | | — | | |
| **David** | | | — | |
| **Elena** | | | | — |

*Cell format: S=Share witnessed, I=Impact sent, R=Impact received, P=Proof requested*

---

### Development Queries

```sql
-- Track clarity/confidence/ownership scores over time for a persona
SELECT 
  DATE(created_at) as date,
  (scores->>'clarity')::int as clarity,
  (scores->>'confidence')::int as confidence,
  (scores->>'ownership')::int as ownership,
  validation_signal,
  goal_challenge
FROM validations 
WHERE client_email = 'info@findinggood.com'
ORDER BY created_at;

-- Track Priority signals over time
SELECT
  DATE(created_at) as date,
  clarity_signal,
  ownership_signal,
  fires_extracted,
  interpretation
FROM impact_verifications
WHERE client_email = 'info@findinggood.com'
ORDER BY created_at;

-- Track FIRES patterns emerging (which elements appear most)
SELECT 
  fires_extracted,
  COUNT(*) as appearances
FROM (
  SELECT fires_extracted FROM validations WHERE client_email = 'info@findinggood.com' AND fires_extracted IS NOT NULL
  UNION ALL
  SELECT fires_extracted FROM impact_verifications WHERE client_email = 'info@findinggood.com' AND fires_extracted IS NOT NULL
) combined
GROUP BY fires_extracted
ORDER BY appearances DESC;

-- Track shares and exchanges
SELECT 
  client_email as sharer,
  content_type,
  share_text,
  created_at
FROM inspiration_shares
WHERE client_email IN ('info@findinggood.com', 'support@findinggood.com', 'brian@brianfretwell.com', 'bfretwell7@hotmail.com')
ORDER BY created_at;

-- Track Prediction Confidence over time (via snapshots)
SELECT
  DATE(created_at) as date,
  predictability_score,
  zone_breakdown,
  overall_zone
FROM snapshots
WHERE client_email = 'info@findinggood.com'
ORDER BY created_at;

-- Count exchange activity per persona
SELECT 
  client_email,
  COUNT(*) FILTER (WHERE content_type = 'priority') as priority_shares,
  COUNT(*) FILTER (WHERE content_type = 'proof') as proof_shares,
  COUNT(*) as total_shares
FROM inspiration_shares
WHERE client_email IN ('info@findinggood.com', 'support@findinggood.com', 'brian@brianfretwell.com', 'bfretwell7@hotmail.com')
GROUP BY client_email;
```

---

### The Story We Should Be Able to Tell

After 4 weeks of simulated usage, each persona should have a development narrative:

**Example (Marcus Chen):**
> "Week 1: Marcus's entries were vague on Feelings ('I feel like a fraud' - no specificity). Clarity signals: emerging. Ownership signals: emerging. FIRES detected: Resilience (3x), Ethics (2x). Predictability Score: 42.
> 
> Week 2: After receiving AI feedback about specificity, Marcus started naming specific emotions ('frustrated when Mike goes around the chain of command'). Clarity signals: developing. He sent impact to David (recognized David's patience with the transition). First share to Campfire.
> 
> Week 3: Received impact from Elena recognizing his transparency in a tough all-hands meeting. Clarity signals: developing → grounded on 2 entries. FIRES pattern clear: Resilience showed up in 8/12 priorities - he keeps drawing on past turnarounds.
> 
> Week 4: Re-assessed with Predict Tool. Predictability Score: 61 (+19). Feelings zone moved from Exploring → Discovering. Marcus's development narrative: 'I went from suppressing emotions to naming them. The resilience I used in past turnarounds is the same thing I need now - I just couldn't see it until I wrote it down and someone else witnessed it.'"

**This is the story the personas should generate. If we can't tell it, we're not tracking the right things.**

---

### Prediction Confidence Equation Tracking

For each persona, track the two components:

**Internal Clarity (Articulation)**
- How many Priority entries completed?
- How many Proof entries completed?
- Average clarity score trend
- Specificity of language improving?

**External Validation (Witnessed)**
- How many shares sent to Campfire?
- How many shares witnessed from others?
- How many Impact cards sent/received?
- How many Proof requests made/responded to?

**Prediction Confidence = f(Internal Clarity, External Validation)**

| Persona | Week 1 Internal | Week 1 External | Week 4 Internal | Week 4 External | Confidence Movement |
|---------|-----------------|-----------------|-----------------|-----------------|---------------------|
| Marcus | | | | | |
| Sarah | | | | | |
| David | | | | | |
| Elena | | | | | |

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| Jan 14, 2026 | Document created | Claude |
| Jan 16, 2026 | Added Part 8: Development Tracking | Claude |
| Jan 16, 2026 | Updated Part 6: Demo Data Building with development milestones and exchange matrix | Claude |
| Jan 16, 2026 | Added Expected Development Arc to each persona | Claude |
| Jan 16, 2026 | Added Development Feedback Capture to testing checklists | Claude |
| Jan 16, 2026 | Added Prediction Confidence Equation tracking | Claude |

---

**End of Testing Framework**
