# Gap Analysis — Additional Items from Build Spec

**Date:** January 24, 2026  
**Source:** priority_proof_build_spec_jan24.md + predict_build_spec_jan24.md

---

## New Patterns Not in Current Codebase

### 1. Dual FIRES Extraction (Sender + Recipient)

**Current:** AI extracts FIRES for the person completing the form only.

**Needed:** AI extracts FIRES for BOTH parties:
- What does noticing this reveal about the SENDER?
- What does this suggest about the RECIPIENT?

**Affects:** All three tools (Priority, Proof, Predict witness modes)

**Database change:** Add `sender_fires` and `recipient_fires` JSONB columns (currently just `fires_extracted`)

---

### 2. Clarity Grading System

**Current:** Binary pass/fail or numeric scores.

**Needed:** Three-tier grading:
| Grade | Visual | Description |
|-------|--------|-------------|
| Emerging | ○○○ | Vague, general, lacks specifics |
| Developing | ●●○ | Some specifics but missing elements |
| Grounded | ●●● | Specific action + clear meaning + personal impact |

**Affects:** All tools with AI analysis

**Database change:** Add `clarity_grade` TEXT column

**UI change:** Add rubric explainer page at `/learn/clarity`

---

### 3. Go Deeper Question Generation

**Current:** No follow-up prompts generated.

**Needed:** AI generates a probing question based on:
- Recipient's strongest FIRES element
- Something specific from the sender's answers
- Templates by FIRES element

**Affects:** All witness modes

**Database change:** Add `go_deeper` JSONB column `{question, why}`

**AI prompt change:** New section in each edge function for question generation

---

### 4. Teaser → Verify → Reveal Flow

**Current:** Recipients go straight to content (or no recipient flow exists).

**Needed:** Three-step recipient experience:
1. Teaser (no login) — mystery + time-based variation
2. Email verification — magic link
3. Full reveal — complete content + FIRES insights

**Affects:** All witness modes (Priority, Proof, Predict)

**UI change:** New recipient landing pages with teaser state

**Email change:** New email templates for magic link + teaser content

---

### 5. Thank Action Workflow

**Current:** No recipient response mechanism beyond viewing.

**Needed:**
- "Thank [Sender]" button as primary CTA
- Thank triggers notification to sender
- Thank unlocks Go Deeper question
- Thank timestamp tracked

**Affects:** All witness modes

**Database change:** Add `thanked_at` TIMESTAMP column

**Notification:** New edge function for thank notifications

---

### 6. Recipe Output (Proof Only)

**Current:** Proof generates scores + FIRES + proof line.

**Needed:** Additional "Recipe" output:
```json
{
  "approach": "How they did it",
  "key_move": "The decision that mattered",
  "why_it_worked": "Connection between approach + decision + impact"
}
```

**Affects:** Proof tool only

**Database change:** Add `recipe` JSONB column to proofs table

**UI change:** "The Recipe They Saw" section on recipient results

---

### 7. Belief Statement (Predict Only)

**Current:** Predict generates predictability score + FIRES map.

**Needed:** Additional "Belief Statement" for witness mode:
```json
{
  "core": "One-sentence WHY they'll succeed",
  "evidence_anchor": "Specific thing sender saw",
  "capability_named": "Quality this will require"
}
```

**Affects:** Predict witness mode only

**Database change:** Add `belief_statement` JSONB column

---

### 8. Mode Column for Predictions

**Current:** Predictions table assumes all entries are "self" mode.

**Needed:** `mode` column to distinguish:
- `self` — defining own what matters most
- `witness` — sending belief to someone else

**Database change:** Add `mode` TEXT column with default 'self'

---

### 9. Recipient-Specific Fields

**Current:** Witness modes use different tables or no recipient tracking.

**Needed:** Consistent fields across all witness modes:
- `target_name` TEXT (required)
- `target_email` TEXT (required)
- `relationship` TEXT (optional)
- `share_id` TEXT (UUID for share link)
- `shared_to_feed` BOOLEAN (default true)
- `viewed_at` TIMESTAMP
- `thanked_at` TIMESTAMP

**Affects:** priorities, proofs, predictions tables

---

### 10. Self Mode New Fields (Predict)

**Current:** Predict captures goal + FIRES questions.

**Needed:** Permission layer fields:
- `what_matters_most` TEXT — the north star
- `anchor_action` TEXT — daily theme
- `activities` JSONB — array of daily activities
- `goals` JSONB — multiple goals (not just one title)
- `success_signals` TEXT — what tells them it's working
- `clarity_assessment` JSONB — AI grading of clarity per section
- `alignment_check` JSONB — do activities match anchor, do goals match north star

---

## New Edge Functions Needed

| Function | Tool | Purpose |
|----------|------|---------|
| `priority-recognition-analyze` | Priority | Witness mode analysis |
| `proof-observation-analyze` | Proof | Witness mode analysis with recipe |
| `predict-self-analyze` | Predict | Self mode with Permission layer |
| `predict-witness-analyze` | Predict | Witness mode with belief statement |
| `send-thank-notification` | All | Notify sender when recipient thanks |
| `send-teaser-email` | All | Magic link + teaser for recipients |

---

## New UI Components Needed

| Component | Location | Purpose |
|-----------|----------|---------|
| ClarityGrade | Shared | Visual ○○○ / ●●○ / ●●● display |
| GoDeeper | Shared | Question + why display with styling |
| TeaserPage | All tools | Pre-login mystery state |
| ThankButton | All tools | Primary CTA with notification trigger |
| RecipeCard | Proof | Display approach + key move + why it worked |
| BeliefCard | Predict | Display core belief + evidence + capability |
| DailyCheckin | Campfire | Activity checkboxes + prompts |
| ActivityEditor | Predict | Define/edit up to 3 activities |

---

## Migration Path

### Phase 1: Database Schema
1. Add new columns to existing tables
2. Create daily_checkins table
3. Add indexes for share_id lookups

### Phase 2: Edge Functions
1. Create new analysis functions
2. Update existing functions for dual FIRES
3. Add notification functions

### Phase 3: UI Updates
1. Build shared components (ClarityGrade, GoDeeper, etc.)
2. Update tool flows for new question structure
3. Add recipient teaser → reveal flow

### Phase 4: Integration
1. Connect daily check-in to Predict activities
2. Unified navigation from Campfire
3. Dashboard updates

---

## Questions This Raises

1. **Table structure:** Should witness mode entries be in the same table as self mode (with `mode` column) or separate tables? Same table is simpler but mixed concerns.

2. **Clarity grading:** Should this be AI-generated or rule-based? AI is more nuanced but less predictable.

3. **Go Deeper storage:** Store just the question, or also track if it was asked/answered?

4. **Recipe vs existing Proof output:** Replace current proof line with recipe, or add recipe as additional output?

5. **Notification throttling:** If someone gets 5 recognitions in a day, do they get 5 emails or a digest?

---

**End of Gap Analysis Additions**
