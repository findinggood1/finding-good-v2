## Completed

### Phase 0: Foundation
- [x] 0a: Monorepo structure
- [x] 0b: Shared package setup
- [x] 0c: Shared types
- [x] 0d: Shared constants
- [x] 0e: Supabase client
- [x] 0f: Auth context
- [x] 0g: UI components
- [x] 0h: Layout components
- [x] 0i: Docs folder

### Phase 1: Database SQL
- [x] V2 tables created in Supabase (predictions_v2, prediction_connections_v2)
- [x] Indexes added
- [x] RLS policies configured

### Phase 2: Predict App
- [x] 2a: App shell and routing
  - React Router setup with 7 routes
  - Placeholder page components created
  - AuthProvider integration
  - ProtectedRoute on authenticated routes
- [x] 2b: Login page
  - Tailwind CSS configured with brand colors
  - LoginPage styled with magic link flow
  - AuthCallbackPage with loading/error states
  - Updated auth redirect to /auth/callback
- [x] 2c: Prediction list (HomePage)
  - usePredictions hook for Supabase data fetching
  - PredictionCard component with FIRES badges
  - HomePage with header, action buttons, prediction list
  - Empty state and loading/error states
  - Sign out functionality
- [x] 2d: New Prediction form (navigation only)
  - 6-step multi-step form structure
  - Form types and state management
  - Step 1: Basic Info (title, type, description)
  - Step 2: Future Story (FIRES questions)
  - Step 3: Future Connections (up to 4 people)
  - Step 4: Past Story (FIRES questions)
  - Step 5: Past Connections (up to 4 people)
  - Step 6: Alignment Assessment (1-4 ratings)
  - Progress indicator with step navigation
  - localStorage draft persistence
- [x] 2e: Form submission
  - useSavePrediction hook for Supabase saves
  - Saves to predictions table
  - Saves connections to prediction_connections table
  - Creates initial snapshot with fs_answers, ps_answers, alignment_scores
  - Loading state with spinner during save
  - Error handling with message display
  - Redirect to /:id/results on success
  - Clears localStorage draft on success
- [x] 2f: Results page
  - usePrediction hook fetches prediction, snapshot, and connections
  - Title card with type badge
  - Predictability score with progress bar (when available)
  - Zone breakdown per FIRES element (when available)
  - Growth opportunity display (when available)
  - 48-hour question display (when available)
  - Alignment assessment visualization
  - Future and Past story answers with FIRES badges
  - Connections lists (future and past)
  - AI analysis placeholder
  - View Details and Back to Home buttons
