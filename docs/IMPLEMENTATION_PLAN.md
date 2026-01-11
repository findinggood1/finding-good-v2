# Finding Good V2 - Implementation Plan

## Overview
Three mobile-first React apps sharing a common component library, backed by Supabase.

### Apps
- **Predict** - Prediction creation and management tool
- **Priority** - Priority builder for ranking predictions
- **Together** - Dashboard for viewing results and connections

---

## Phase 0: Foundation (Complete)

### 0a: Monorepo Structure
- pnpm workspaces
- apps/predict, apps/priority, apps/together
- packages/shared

### 0b: Shared Package Setup
- TypeScript strict mode configuration
- Base exports structure

### 0c: Shared Types
- FiresElement, Zone, ValidationSignal types
- Prediction, PredictionConnection interfaces
- FiresScore, ZoneBreakdown interfaces

### 0d: Shared Constants
- FIRES_COLORS, FIRES_LABELS
- ZONE_ORDER
- BRAND_COLORS

### 0e: Supabase Client
- createClient function
- getSupabase singleton
- Environment variable setup

### 0f: Auth Context
- AuthProvider component
- useAuth hook (user, session, loading, signIn, signOut)
- Magic link authentication

### 0g: UI Components
- Button (variants: primary, secondary, ghost)
- Input (label, error, helper text)
- Textarea (label, error, character count)
- Card (padding variants, hover state)
- Badge (FIRES colors support)
- LoadingSpinner (size variants)

### 0h: Layout Components
- TopBar (logo, title, actions slot)
- BottomNav (nav items, active state)
- PageContainer (max-width, padding, centered)
- ProtectedRoute (auth redirect)

### 0i: Documentation
- IMPLEMENTATION_PLAN.md
- COMPLETED.md
- CURRENT_PHASE.md

---

## Phase 1: Database SQL

Run in Supabase SQL Editor:

```sql
-- V2 Predictions table
CREATE TABLE predictions_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'prediction',
  status TEXT DEFAULT 'active',
  rank INTEGER DEFAULT 0,
  scores JSONB DEFAULT '{}',
  counts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- V2 Connections table
CREATE TABLE prediction_connections_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_prediction_id UUID REFERENCES predictions_v2(id) ON DELETE CASCADE,
  target_prediction_id UUID REFERENCES predictions_v2(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'related',
  strength INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_predictions_v2_client_email ON predictions_v2(client_email);
CREATE INDEX idx_predictions_v2_status ON predictions_v2(status);
CREATE INDEX idx_connections_v2_source ON prediction_connections_v2(source_prediction_id);
CREATE INDEX idx_connections_v2_target ON prediction_connections_v2(target_prediction_id);

-- RLS Policies
ALTER TABLE predictions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_connections_v2 ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own predictions
CREATE POLICY "Users can view own predictions"
  ON predictions_v2 FOR SELECT
  USING (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can insert own predictions"
  ON predictions_v2 FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can update own predictions"
  ON predictions_v2 FOR UPDATE
  USING (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can delete own predictions"
  ON predictions_v2 FOR DELETE
  USING (auth.jwt() ->> 'email' = client_email);

-- Connection policies (user owns source prediction)
CREATE POLICY "Users can view own connections"
  ON prediction_connections_v2 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM predictions_v2
      WHERE id = source_prediction_id
      AND client_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can insert own connections"
  ON prediction_connections_v2 FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM predictions_v2
      WHERE id = source_prediction_id
      AND client_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can delete own connections"
  ON prediction_connections_v2 FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM predictions_v2
      WHERE id = source_prediction_id
      AND client_email = auth.jwt() ->> 'email'
    )
  );
```

---

## Phase 2: Predict App

### 2a: App Shell
- Tailwind CSS setup
- AuthProvider integration
- Basic routing (/, /login, /new, /edit/:id)

### 2b: Login Page
- Email input for magic link
- Loading state during auth

### 2c: Prediction List
- Fetch user predictions from Supabase
- Card-based list view
- Empty state

### 2d: New Prediction Form
- Title, description inputs
- FIRES scoring interface
- Save to Supabase

### 2e: Edit Prediction
- Load existing prediction
- Update form
- Delete option

---

## Phase 3: Priority App

### 3a: App Shell
- Tailwind CSS setup
- AuthProvider integration
- Basic routing

### 3b: Priority Interface
- Drag-and-drop ranking
- Zone assignment
- Save rankings

---

## Phase 4: Together App

### 4a: App Shell
- Tailwind CSS setup
- AuthProvider integration
- Basic routing

### 4b: Dashboard View
- Prediction overview
- FIRES breakdown visualization
- Connection graph

---

## Phase 5: Polish

### 5a: Error Handling
- Global error boundaries
- Toast notifications

### 5b: Loading States
- Skeleton loaders
- Optimistic updates

### 5c: PWA Support
- Service worker
- Manifest files
- Offline support

---

## Environment Variables

Each app needs `.env` file:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Scripts

From monorepo root:
```bash
pnpm dev:predict    # Start Predict on :3001
pnpm dev:priority   # Start Priority on :3002
pnpm dev:together   # Start Together on :3003
pnpm build          # Build all apps
```
