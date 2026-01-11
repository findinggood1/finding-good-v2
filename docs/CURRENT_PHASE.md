## Current Task: Phase 4d Complete - Ask and Respond Flows

Phase 4d Complete - Ask and Respond flows for external perspectives.

### What Was Built:

#### 1. useAsk Hook (`apps/priority/src/hooks/useAsk.ts`)
- Creates ask requests with unique UUID tokens
- Saves to `priority_asks` table
- Returns shareable respond URL
- 7-day token expiry

#### 2. useRespond Hook (`apps/priority/src/hooks/useRespond.ts`)
- Validates token (exists, not expired, not used)
- Fetches ask details (custom question, recipient name)
- Submits response to `priority_responses` table
- Updates ask status to 'responded'

#### 3. AskPage Updates
- Email input (required)
- Name input (optional, for personalization)
- Custom question textarea (optional)
- Success view with:
  - Shareable link display
  - Copy Link button
  - Native Share button (mobile)
  - 7-day expiry notice

#### 4. RespondPage Updates
- Token validation with multiple states:
  - `loading` - Fetching ask details
  - `valid` - Show response form
  - `not_found` - Invalid token
  - `expired` - Token past 7 days
  - `already_responded` - Already used
  - `error` - Failed to load
- Personalized greeting if name provided
- Custom question display
- Response textarea with char count (1000 max)
- Anonymous submission
- Success confirmation

#### 5. Database Schema
New tables in `supabase/migrations/20240111_priority_asks.sql`:

**priority_asks:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (FK to auth.users) |
| token | UUID | Unique shareable token |
| recipient_email | TEXT | Who to ask |
| recipient_name | TEXT | Optional name |
| custom_question | TEXT | Optional custom question |
| status | TEXT | pending/responded/expired |
| expires_at | TIMESTAMPTZ | 7 days from creation |
| created_at | TIMESTAMPTZ | Timestamp |

**priority_responses:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ask_id | UUID | FK to priority_asks |
| response_text | TEXT | The response |
| created_at | TIMESTAMPTZ | Timestamp |

**RLS Policies:**
- Users can CRUD their own asks
- Anyone can view asks by token (for respond page)
- Anyone can create responses (anonymous)
- Users can view responses to their asks

### Files Created/Modified (Phase 4d):
```
apps/priority/src/
├── hooks/
│   ├── index.ts           # Hook exports
│   ├── useAsk.ts          # Create ask requests
│   └── useRespond.ts      # Validate and respond
├── pages/
│   ├── AskPage.tsx        # Full ask flow
│   └── RespondPage.tsx    # Full respond flow

supabase/migrations/
└── 20240111_priority_asks.sql  # Tables + RLS
```

### To Apply Migration:
```bash
# Run in Supabase SQL editor or via CLI
psql -h <host> -U postgres -d postgres -f supabase/migrations/20240111_priority_asks.sql
```

### Running the App:
```bash
cd apps/priority
pnpm run dev
# http://localhost:3002/ask
# http://localhost:3002/respond/:token
```

### Next Steps (Phase 4e):
1. View received responses in app
2. Link responses to priorities
3. Email notifications for asks
4. History page with asks and responses
