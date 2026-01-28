# Proof Tool Build Packet

**Created:** January 26, 2026  
**For Session:** Session 5 (Proof Updates)  
**Confidence Rating:** 🟢 High

---

## 1. OVERVIEW

### What This Session Builds
- Add share_to_feed toggle on completion
- Preserve existing modes (Self, Request, Send)
- Preserve FIRES extraction and proof_line generation
- Minimal UI changes — focus on integration hooks

### What This Session Does NOT Build
- Enhanced Witness mode UI (mark as P1)
- Impact marking on responses (mark as P2)
- Campfire feed display (Together session)
- Coach view of validations (Dashboard session)
- AI analysis enhancements (Future Enhancement)

### Priority
- **P0 (Must Have):** Share toggle on completion, preserve existing functionality
- **P1 (Should Have):** Question prompts by mode ("What worked?")
- **P2 (Nice to Have):** Impact marking, link to prediction

---

## 2. SCHEMA SLICE

### Tables This Tool READS

| Table | What It Reads |
|-------|---------------|
| `validations` | Existing proof entries |
| `validation_invitations` | Sent invitations |
| `proof_requests` | Request mode data |
| `predictions` | For optional linking |
| `clients` | User identity |

### Tables This Tool WRITES

| Table | What It Writes | Key Columns |
|-------|----------------|-------------|
| `validations` | Proof entries | `responses`, `proof_line`, `fires_extracted`, `share_to_feed`, `shared_at` |
| `validation_invitations` | Witness invitations | (no changes) |
| `proof_requests` | Request mode | (no changes) |

### Relevant Column Definitions (Already Exist in DB)

```sql
-- validations table — key columns
id UUID PRIMARY KEY
client_email TEXT NOT NULL
mode TEXT                        -- 'self' | 'request' | 'send'
responses JSONB                  -- Question answers
proof_line TEXT                  -- AI-generated summary
fires_extracted JSONB            -- AI-detected FIRES elements
scores JSONB                     -- {confidence, clarity, ownership}
pattern JSONB                    -- {whatWorked, whyItWorked, howToRepeat}
share_to_feed BOOLEAN DEFAULT false  -- Campfire visibility (V4)
shared_at TIMESTAMP              -- When shared (V4)
prediction_id UUID               -- Optional link to prediction
created_at TIMESTAMP
```

### Key Constraints
- `mode` determines which question flow was used
- `share_to_feed` defaults to false
- Both `share_to_feed` and `shared_to_feed` columns exist (legacy duplication)

🟡 **NOTE:** Database has both `share_to_feed` and `shared_to_feed`. Use `share_to_feed` (the V4 standard).

---

## 3. TYPES SLICE

### Types to Use (from @finding-good/shared)

```typescript
// From shared types
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';
export type ValidationMode = 'self' | 'request' | 'send';

// Validation (Proof) interface
export interface Validation {
  id: string;
  client_email: string;
  engagement_id?: string;
  entry_type?: string;
  intensity: string;
  source_impact_id?: string;
  source_invitation_id?: string;
  
  // Question responses (old format)
  q0_response?: string;
  q1_response?: string;
  q2_response?: string;
  q3_response?: string;
  q4_response?: string;
  
  // Structured data
  responses?: ValidationResponses;
  transferable_method?: string;
  method_clarity_level?: string;
  method_clarity_reflection?: string;
  fires_insight?: string;
  pattern_for_client?: string;
  pattern_for_coach?: string;
  fires_elements?: Record<FiresElement, boolean>;
  fires_extracted?: FiresElement[];
  
  // Output
  proof_line?: string;
  scores?: ValidationScores;
  pattern?: ValidationPattern;
  
  // Metadata
  goal_challenge?: string;
  mode?: ValidationMode;
  timeframe?: string;
  validation_signal?: string;
  validation_insight?: string;
  event_code?: string;
  prediction_id?: string;
  share_to_feed?: boolean;      // ← V4 addition
  shared_at?: string;           // ← V4 addition
  created_at: string;
}

// Score structure
export interface ValidationScores {
  confidence?: number;  // 1-5
  clarity?: number;     // 1-5
  ownership?: number;   // 1-5
}

// Pattern structure  
export interface ValidationPattern {
  whatWorked?: string;
  whyItWorked?: string;
  howToRepeat?: string;
}

// Response structure
export interface ValidationResponses {
  what_accomplished?: string;
  how_approached?: string;
  key_decision?: string;
  impact?: string;
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
| Badge | components/ui/Badge.tsx | FIRES badges |
| LoadingSpinner | components/ui/LoadingSpinner.tsx | Loading states |
| PageContainer | components/layout/PageContainer.tsx | Page wrapper |
| TopBar | components/layout/TopBar.tsx | Header navigation |
| ProtectedRoute | components/layout/ProtectedRoute.tsx | Auth wrapper |
| AuthContext | contexts/AuthContext.tsx | Auth state |
| supabase | lib/supabase.ts | DB client |

### Needs to Be Created (Foundation Session)

| Component | Purpose | Where It Goes |
|-----------|---------|---------------|
| FiresBadge | Display FIRES element with color | packages/shared/ |

### Existing in apps/prove (MINIMAL CHANGES)

| Component | Location | Change Needed |
|-----------|----------|---------------|
| ResultsPage | src/pages/ | Add share toggle |
| ProofSelf | src/pages/ or src/components/ | No changes |
| ProofWitness | src/pages/ or src/components/ | No changes |

---

## 5. INTEGRATION POINTS

### Data Flow IN (What Proof Reads)

| Source | Data | Via |
|--------|------|-----|
| Supabase | Existing validations | `@finding-good/shared` supabase client |
| Auth | User email | AuthContext |
| URL params | Mode (optional) | `?mode=self` or `?mode=send` |

### Data Flow OUT (What Proof Produces)

| Destination | Data | When |
|-------------|------|------|
| `validations` table | Proof entry | On save |
| Together Campfire | Shared proof (via feed query) | When share_to_feed = true |
| Dashboard | Proof entries for coach | Always |

### Connects To

| Other Tool/App | How |
|----------------|-----|
| Together | Proofs with share_to_feed = true appear in Campfire |
| Dashboard | Coach sees all client proofs |
| Predict | Can link proof to prediction_id |

---

## 6. UI SPEC

### Results Page Update (After Proof Completion)

**Add share toggle after results display:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ YOUR PROOF                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ [Existing results display - proof_line, FIRES badges, scores, etc.]     │
│                                                                         │
│ "You showed [proof_line here]..."                                       │
│                                                                         │
│ [F] [R] [S]                                                             │
│                                                                         │
│ THE RECIPE                                                              │
│ What worked: [whatWorked]                                               │
│ Why it worked: [whyItWorked]                                            │
│ How to repeat: [howToRepeat]                                            │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ SHARE                                                   (NEW SECTION)   │
│                                                                         │
│ [✓] Share to Campfire                                                   │
│     Your connections can see and learn from your process.               │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [Add Another]  [Go to Campfire]  [Done]                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Toggle Behavior:**
- Default: OFF (user opts in to share)
- Saves to `validations.share_to_feed`
- Sets `validations.shared_at` when toggled ON

---

### Question Prompt Display (P1)

When viewing a completed proof, show the relevant question prompt:

| Mode | Question Shown |
|------|----------------|
| Self | "What worked here?" |
| Send (Witness) | "What would you tell them?" |
| Request | "What did they see?" |

This helps the viewer engage with the content.

---

## 7. TEST SCENARIOS

### Scenario: Self Mode with Share Toggle (Marcus)

**Happy Path:**
1. Marcus starts new Proof (Self mode)
2. Completes all questions
3. Sees results with proof_line and FIRES badges
4. Toggles "Share to Campfire" ON
5. Clicks Done
6. Check database: `share_to_feed = true`, `shared_at` = now()
7. Proof appears in his circle's Campfire feed

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Toggle OFF | share_to_feed = false, shared_at = null |
| Edit later, toggle ON | Updates values |
| No proof_line generated | Entry still saves, toggle still works |

### Scenario: Existing Functionality Preserved (Sarah)

**Happy Path:**
1. Sarah opens Proof tool
2. Can select Self mode
3. Can select Send mode (Witness someone)
4. Can select Request mode
5. All question flows work unchanged
6. FIRES extraction still works
7. Proof_line generation still works
8. Scores display correctly

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Old entries without share_to_feed | Display correctly, show toggle as OFF |
| AI extraction fails | Entry saves, fires_extracted is null |

### Scenario: Witness Mode Entry (Elena)

**Happy Path:**
1. Elena clicks "Witness" in Together sidebar
2. Opens Proof in Send mode
3. Selects person to witness
4. Completes witness questions
5. Sees results with share toggle
6. Toggles ON, sends to recipient
7. Recipient receives notification

---

## 8. DONE CRITERIA

### P0 — Must Complete

- [ ] Share toggle visible on results page
- [ ] Toggle saves to `validations.share_to_feed`
- [ ] `shared_at` timestamp set when share_to_feed = true
- [ ] Self mode still works (unchanged)
- [ ] Send mode (Witness) still works (unchanged)
- [ ] Request mode still works (unchanged)
- [ ] FIRES extraction still works
- [ ] Proof_line generation still works
- [ ] Scores display correctly
- [ ] Existing entries load without errors
- [ ] No TypeScript errors
- [ ] No console errors

### P1 — Should Complete If Time

- [ ] Question prompt by mode ("What worked?" etc.)
- [ ] Link to prediction (optional dropdown)

### P2 — Defer

- [ ] Impact marking on responses
- [ ] Enhanced Witness mode UI
- [ ] "Recognized" capability

---

## CRITICAL FLAGS

🟢 **No blockers identified**

🟡 **NOTE:** Database has BOTH `share_to_feed` and `shared_to_feed` columns. Use `share_to_feed` (the V4 standard column). Ignore `shared_to_feed`.

🟡 **NOTE:** Proof tool is at `apps/prove/` (not `apps/proof/`). The folder name uses "prove" while the product name is "Proof".

🟡 **NOTE:** This is a minimal-change session. The existing Proof tool works well — we're just adding the share toggle for Campfire integration.

---

## FILES TO MODIFY

```
apps/prove/src/
├── pages/
│   └── Results.tsx (or ResultsPage.tsx, CompletionPage.tsx)
│       └── ADD share toggle section
├── hooks/
│   └── useValidation.ts (or data hooks)
│       └── UPDATE to save share_to_feed, shared_at
└── types/
    └── index.ts
        └── UPDATE Validation interface (if local types exist)
```

---

## DATABASE QUERIES

### Save with share toggle

```typescript
const { error } = await supabase
  .from('validations')
  .update({
    share_to_feed: isShared,
    shared_at: isShared ? new Date().toISOString() : null,
  })
  .eq('id', validationId);
```

### Load validation with share status

```typescript
const { data, error } = await supabase
  .from('validations')
  .select('*, share_to_feed, shared_at')
  .eq('id', validationId)
  .single();
```

### Update share toggle on existing entry

```typescript
const { error } = await supabase
  .from('validations')
  .update({
    share_to_feed: isShared,
    shared_at: isShared ? new Date().toISOString() : null,
  })
  .eq('id', validationId);
```

---

**End of Proof Tool Build Packet**
