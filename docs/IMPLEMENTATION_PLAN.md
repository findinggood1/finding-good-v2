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

## Phase 4: Together App (Complete)

### 5a: App Shell Setup (Complete)
- Vite + React + TypeScript configuration
- Tailwind CSS setup with brand colors
- AuthProvider integration
- Running on port 3003

### 5b: Routing (Complete)
Routes configured:
- `/` - Home (predictions header + feed)
- `/prediction/:id` - Prediction Detail
- `/campfire` - Campfire feed
- `/connections` - Connections list
- `/connection/:id` - Connection Detail
- `/maps` - Integrity Maps
- `/settings` - Settings
- `/login` - Public login
- `/auth/callback` - Auth callback

### 5c: Navigation Shell (Complete)
- Bottom navigation with 4 items: Home, Campfire, Connections, Maps
- Top bar with settings access
- AppLayout wrapper component
- All routes protected except login and auth callback

### 5d: Components (Complete)
- PredictionsHeader - Horizontal scrolling prediction cards with scores
- FeedCard - Priority/Proof/Share cards with FIRES badges
- AppLayout - Page wrapper with bottom nav

### 5e: Hooks (Complete)
- usePredictions - Fetch user's predictions from predictions table
- useFeed - Fetch proofs for activity feed from validations table
- useConnections - Fetch connections from share_visibility table
- useCampfire - Fetch connections' shares from inspiration_shares
- useIntegrityMaps - Fetch, generate, and display integrity maps
- useIsCoach - Check if user is a coach via coaches table
- useCoachClients - Fetch coach's clients from coaching_engagements
- useClientDetail - Fetch detailed client data for coach view
- useCoachingSessions - CRUD for coaching sessions with transcripts and AI summaries
- useClientDocuments - Upload/manage client documents with Supabase storage

### 5f: Core Screens (Complete)
- **HomePage** - Predictions header + activity feed with empty states
- **PredictionDetailPage** - Stats, counts, filtered activity, action buttons
- **CampfirePage** - Connections' shares from inspiration_shares table
- **ConnectionsPage** - Circle from share_visibility (Mutual/You Invited/Invited You)
- **ConnectionDetailPage** - Connection info, shares, notes, actions
- **MapsPage** - Integrity map generation with FIRES patterns, wins, focus areas
- **SettingsPage** - Account info + sign out
- **LoginPage** - Magic link authentication
- **AuthCallbackPage** - OAuth callback handler

### 5g: Empty States (Complete)
All screens have appropriate empty states per Dashboard Specification

### 5h: Database Tables (Complete)
Migration: `supabase/migrations/20260111_social_features.sql`
- `share_visibility` - Tracks connections between users
- `inspiration_shares` - Stores shared priorities/proofs for Campfire
- `integrity_maps` - Weekly AI-generated clarity snapshots

Migration: `supabase/migrations/20260111_coach_sessions_documents.sql`
- `coaching_sessions` - Session records with transcripts, AI summaries, notes
- `client_documents` - Uploaded documents (PDFs, assessments, notes)

### 5i: Coach Views (Complete)
Routes configured:
- `/coach/clients` - Coach dashboard with client list
- `/coach/client/:email` - Client detail with predictions, activity, FIRES signals
- `/coach/prepare` - Session preparation (placeholder)
- `/coach/practice` - My Practice with journey/coaching toggle (placeholder)
- `/coach/admin` - Admin dashboard (placeholder)

Components:
- CoachLayout - Bottom nav with Clients, Prepare, My Practice, Admin
- Coach icon in AppLayout top bar for users in coaches table

Screens:
- **ClientsPage** - List of coached clients with engagement info, activity alerts
- **ClientDetailPage** - Full client management:
  - Predictions with scores
  - Recent activity feed
  - FIRES signals visualization
  - Sessions section (add/view sessions, transcript upload, AI summary generation)
  - Documents section (upload/view/delete PDFs, notes, assessments)
- **PreparePage** - Placeholder for AI session prep
- **MyPracticePage** - Toggle between personal journey and coaching practice analysis
- **AdminPage** - Placeholder for system metrics and data health

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
