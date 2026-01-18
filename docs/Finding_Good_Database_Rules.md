# Finding Good: Database Management Rules

**Version:** 1.0  
**Last Updated:** January 2025

---

## Purpose

These rules ensure database changes don't break existing tools and maintain a clean, scalable data architecture across the Finding Good ecosystem.

---

## Core Principles

### 1. Single Source of Truth
- **One Supabase project** for all Finding Good tools
- **One schema document** (Master Schema) tracks all tables and columns
- **Update the schema doc** whenever you make database changes

### 2. Adding is Safe, Changing is Risky
- ✅ **Safe:** Add new tables, add new columns, add indexes
- ⚠️ **Risky:** Rename columns, delete columns, change types
- 🛑 **Dangerous:** Drop tables, change primary keys, alter foreign keys

### 3. Apps Are Independent
- Each app only reads/writes what it needs
- Adding a column doesn't require updating apps that don't use it
- New tables don't affect existing apps

---

## Rules for Schema Changes

### Rule 1: Always Use Nullable Columns for New Fields

**Why:** Existing rows don't have the new data. Nullable columns won't break existing apps.

```sql
-- ✅ CORRECT
ALTER TABLE clients ADD COLUMN timezone TEXT;

-- ❌ WRONG (will fail if table has data)
ALTER TABLE clients ADD COLUMN timezone TEXT NOT NULL;
```

**Exception:** If you need NOT NULL, add with a default:
```sql
ALTER TABLE clients ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';
```

---

### Rule 2: Never Rename Columns in Production

**Why:** Any app reading that column will break.

**Instead:**
1. Add new column with desired name
2. Copy data: `UPDATE table SET new_col = old_col`
3. Update all apps to use new column
4. Only after all apps updated, consider removing old column

---

### Rule 3: Never Delete Columns Without Checking All Apps

**Before deleting, verify:**
- [ ] Which apps reference this column?
- [ ] Have those apps been updated to not need it?
- [ ] Is there any historical reporting that needs it?

**Safe approach:** Leave unused columns rather than risk breaking something.

---

### Rule 4: Prefix App-Specific Columns (Optional)

For columns only one app uses, consider prefixing:

| Prefix | App |
|--------|-----|
| `snap_` | Alignment Builder (Snapshot) |
| `im_` | Impact Multiplier |
| `dr_` | Daily Reflections (third app) |

**Example:**
```sql
-- Only Impact Multiplier uses this
ALTER TABLE clients ADD COLUMN im_last_practice_date DATE;
```

**Shared columns have no prefix:**
```sql
-- All apps might use this
ALTER TABLE clients ADD COLUMN timezone TEXT;
```

---

### Rule 5: Document Before You Build

**Before adding new tables or columns:**

1. Update the Master Schema doc first
2. Note which app(s) will use it
3. Add to the "Reserved for Future" section if planned but not built yet

This prevents duplicate columns and keeps the team aligned.

---

### Rule 6: Use JSONB for Flexible Data

**When to use JSONB:**
- Data structure might change
- Different entries need different fields
- Nested or array data

**Example:**
```sql
-- Good for flexible settings
preferences JSONB  -- {"theme": "dark", "notifications": true}

-- Good for arrays
fires_focus JSONB  -- ["feelings", "influence"]

-- Good for nested data
responses JSONB    -- {"moment": "...", "role": "...", "impact": "..."}
```

**When NOT to use JSONB:**
- You need to query/filter by the value frequently
- It's a simple, stable value (use TEXT, INTEGER, etc.)

---

### Rule 7: Always Add Indexes for Query Performance

**Add indexes for columns used in:**
- WHERE clauses
- JOIN conditions
- ORDER BY clauses

**Standard indexes to add:**
```sql
-- For email lookups (almost every table)
CREATE INDEX idx_[table]_client ON [table](client_email);

-- For date sorting
CREATE INDEX idx_[table]_created ON [table](created_at DESC);

-- For status filtering
CREATE INDEX idx_[table]_status ON [table](status);
```

---

### Rule 8: Use Consistent Naming Conventions

**Tables:** lowercase, plural, underscores
```
✅ impact_verifications
✅ coaching_notes
❌ ImpactVerification
❌ coachingNotes
```

**Columns:** lowercase, underscores
```
✅ client_email
✅ created_at
❌ clientEmail
❌ CreatedAt
```

**Foreign keys:** `[referenced_table]_id`
```
✅ coach_id (references coaches.id)
✅ snapshot_id (references snapshots.id)
```

**Timestamps:** `[action]_at`
```
✅ created_at
✅ completed_at
✅ shared_at
❌ creation_date
❌ timestamp
```

---

### Rule 9: Keep `client_email` as Universal Identifier

**Why:** Email is the one thing that stays consistent across:
- Supabase Auth
- All Finding Good tools
- Event code entries
- Share links

**Never use:**
- `user_id` (different meaning in different contexts)
- `client_id` (UUID changes between entries)

**Always use:**
- `client_email` for linking entries to a person

---

### Rule 10: Test Schema Changes in Development First

**Before running SQL in production:**

1. Test in Supabase SQL Editor with a single row
2. Verify existing queries still work
3. Check that apps handle null values gracefully
4. Only then run on full table

---

## Change Request Process

### For New Tables

1. Define purpose and which app(s) will use it
2. Draft schema in Master Schema doc
3. Write SQL
4. Run in Supabase
5. Update Master Schema with "Date Added"

### For New Columns

1. Identify which table
2. Check Master Schema for naming conflicts
3. Determine if nullable or needs default
4. Add to Master Schema doc
5. Run ALTER TABLE in Supabase
6. Update apps that need it (leave others unchanged)

### For Breaking Changes (Rename/Delete)

1. Document why change is needed
2. List all affected apps
3. Create migration plan:
   - Add new column/table
   - Update all apps
   - Migrate data
   - (Optional) Remove old column/table
4. Execute in phases, testing between each

---

## Quick Reference

### Safe Changes (No App Updates Needed)
```sql
-- Add nullable column
ALTER TABLE clients ADD COLUMN timezone TEXT;

-- Add new table
CREATE TABLE daily_reflections (...);

-- Add index
CREATE INDEX idx_clients_timezone ON clients(timezone);
```

### Changes Requiring App Updates
```sql
-- Add NOT NULL column (needs default or app changes)
ALTER TABLE clients ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Any column that apps will read/write
ALTER TABLE snapshots ADD COLUMN coach_reviewed BOOLEAN;
-- Then update Snapshot app to use this field
```

### Dangerous Changes (Avoid in Production)
```sql
-- Rename column (breaks apps)
ALTER TABLE clients RENAME COLUMN email TO user_email;

-- Drop column (breaks apps)
ALTER TABLE clients DROP COLUMN timezone;

-- Change type (may break apps)
ALTER TABLE snapshots ALTER COLUMN total_confidence TYPE DECIMAL;
```

---

## Checklist for Any Database Change

- [ ] Updated Master Schema doc?
- [ ] Is the column nullable (or has default)?
- [ ] Are indexes needed?
- [ ] Which apps need code changes?
- [ ] Tested with sample data?
- [ ] Added to Schema Change Log?

---

**End of Database Management Rules**
