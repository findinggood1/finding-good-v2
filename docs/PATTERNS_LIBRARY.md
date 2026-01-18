# PATTERNS LIBRARY
## Finding Good V2 - Learned Patterns & Reusable Solutions

**Purpose:** This is a living document. After each build, we add patterns that worked, mistakes to avoid, and templates to reuse. Over time, this becomes institutional knowledge that makes every build faster.

**Last updated:** January 17, 2026

---

## How to Use This Document

1. **Before building:** Scan relevant sections for existing patterns
2. **During building:** If you solve something tricky, note it for later
3. **After building:** Add new patterns from post-mortem

---

## Database Patterns

### Adding a New Table

**Checklist:**
1. Create migration file: `supabase/migrations/[YYYYMMDD]_[description].sql`
2. Include all constraints (NOT NULL, UNIQUE, REFERENCES)
3. Add RLS policies if user-specific data
4. Add indexes for frequently queried columns
5. Test locally before pushing

**Template:**
```sql
-- Migration: [description]
-- Created: [date]

CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [field] [TYPE] [CONSTRAINTS],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[table]_select_own" ON [table_name]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "[table]_insert_own" ON [table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_[table]_[field] ON [table_name]([field]);
```

**Mistakes to avoid:**
- [ ] Forgetting RLS policies (data leaks between users)
- [ ] Not adding `updated_at` trigger
- [ ] Using TEXT when ENUM would be better

---

### Modifying Existing Tables

**Checklist:**
1. Check what apps query this table
2. Ensure new columns have defaults or are nullable
3. Test that existing queries still work

**Mistakes to avoid:**
- [ ] Adding NOT NULL without a default (breaks existing rows)
- [ ] Changing column types without migration path

---

## Edge Function Patterns

### Creating a New Analysis Function

**Location:** `supabase/functions/[name]-analyze/index.ts`

**Template structure:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Input { /* define input shape */ }
interface Output { /* define output shape */ }

function buildPrompt(input: Input): string {
  return `[Your prompt here]`
}

async function callClaudeAPI(prompt: string, apiKey: string): Promise<Output> {
  // Standard Claude API call
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const input: Input = await req.json()
    // Validate input
    // Call Claude
    // Return response
  } catch (error) {
    // Handle error
  }
})
```

**Deployment:**
```bash
supabase functions deploy [function-name]
```

**Mistakes to avoid:**
- [ ] Forgetting CORS headers (frontend can't call it)
- [ ] Not validating input (garbage in, garbage out)
- [ ] Hardcoding API keys (use environment variables)

---

## Shared Package Patterns

### Adding New Types

**Location:** `packages/shared/src/types/index.ts`

**Pattern:**
```typescript
// Group related types together
export interface Recognition {
  id: string
  sender_email: string
  recipient_email: string
  recipient_name: string
  what_they_did: string
  what_it_showed: string
  how_it_affected: string
  fires_extracted: FiresExtraction[]
  created_at: string
}

// Export from index
export * from './recognition'
```

**Mistakes to avoid:**
- [ ] Not exporting from index.ts (import fails in apps)
- [ ] Inconsistent naming (camelCase vs snake_case)

---

### Adding New Hooks

**Location:** `packages/shared/src/hooks/` (if cross-app) or `apps/[app]/src/hooks/` (if app-specific)

**Template:**
```typescript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function use[Name](param: string) {
  const [data, setData] = useState<Type | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('table')
          .select('*')
          .eq('field', param)
        
        if (error) throw error
        setData(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }
    
    fetch()
  }, [param])

  return { data, loading, error }
}
```

**Mistakes to avoid:**
- [ ] Missing loading/error states
- [ ] Not including dependency in useEffect array
- [ ] Not handling null/undefined data

---

## UI Component Patterns

### Standard Component Structure

```typescript
import { useState } from 'react'

interface Props {
  // Define props with types
}

export function ComponentName({ prop1, prop2 }: Props) {
  // State
  const [state, setState] = useState()
  
  // Hooks
  const { data, loading, error } = useHook()
  
  // Early returns for loading/error
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return null
  
  // Main render
  return (
    <div>
      {/* Content */}
    </div>
  )
}
```

**Mistakes to avoid:**
- [ ] Not handling loading states (flash of empty content)
- [ ] Not handling error states (silent failures)
- [ ] Inline styles instead of Tailwind classes

---

## Integration Patterns

### Connecting UI to Edge Function

```typescript
async function callAnalyze(input: Input): Promise<Output> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/[function-name]`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(input),
    }
  )
  
  if (!response.ok) {
    throw new Error('Analysis failed')
  }
  
  return response.json()
}
```

---

## Common Mistakes (Cross-Cutting)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Missing env variable | "undefined" in URL | Check .env file |
| CORS error | "blocked by CORS policy" | Add corsHeaders to edge function |
| Type mismatch | Red squiggles everywhere | Check shared types match DB schema |
| Stale data | UI doesn't update | Add proper cache invalidation |
| Import error | "Module not found" | Check package.json exports, rebuild |

---

## Patterns to Add

*Capture these during post-mortems*

- [ ] [Pattern name] - [When discovered] - [Brief description]

---

*This document grows with every build. If you solved something tricky, add it here.*
