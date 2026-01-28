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

### Phase 3: AI Integration
- [x] 3a: predict-analyze edge function
  - Claude API integration for prediction analysis
  - Calculates predictability score (0-100)
  - Extracts FIRES element zones
  - Generates growth guidance
  - Creates 48-hour action question
- [x] 3b: Predictability scoring algorithm
  - Zone breakdown per FIRES element
  - Validation signal detection
  - Growth opportunity identification
- [x] 3c: AI narrative integration
  - useSavePrediction calls generateAINarrative() async
  - Non-blocking background processing
  - Narrative stored in ai_narrative column
  - ResultsPage displays AI insights sections

### Phase 4: Priority Builder
- [x] 4a: Priority app routing
  - React Router with 7 routes (/, /confirm, /ask, /respond/:token, /history, /login, /auth/callback)
  - Placeholder pages created
  - AuthProvider and ProtectedRoute integration
  - Tailwind CSS configured
  - Runs on port 3002
- [x] 4b: Priority confirmation flow UI
  - 3-question flow (What went well, Your part, Impact)
  - Helper framing chips for inspiration
  - Optional prediction link dropdown
  - Share to Campfire toggle
  - Results view with Priority Line and FIRES elements
  - Uses shared components (Button, Card, Textarea, Badge)
- [x] 4c: Priority data persistence
  - Priority saves to database
  - AI generates Priority Line (integrity statement)
  - FIRES elements extracted from responses
  - No console errors
- [x] 4d: Ask and Respond flows
  - AskPage for creating invitation links
  - Fields: name, email, relationship, personal message, linked prediction
  - 7-day expiring token-based links
  - RespondPage with 3-question flow (same as ConfirmPage)
  - Helper framing chips for each question
  - Anonymous response submission
  - Status handling: loading, valid, expired, already_responded, not_found, error
  - Success states after submission
  - Database tables: priority_asks, priority_responses with RLS policies

### Phase 5: Together App (Exchange Hub)
- [x] 5a: Together app P0 + P1 (January 17, 2026)
  - 4-page structure: Home, Exchange, Campfire, Map
  - **Home page:** Predictability score, FIRES grid with zones, activity counts, this week's evidence, noticing in others
  - **Exchange page:** Growth edge card, exchange impact tracking, active asks
  - **Campfire page:** Circle feed with empty state, pending asks section
  - **Map page:** Activity counts (all-time), yours vs others comparison, trajectory chart
  - **Database tables:** exchange_impacts, recognized_entries, predictions.question column
  - **7 hooks:** useActivityCounts, useExchangeImpacts, useYoursVsOthers, useTrajectory, usePendingAsks, useThisWeeksEvidence, useNoticingInOthers
  - **15+ components:** PredictabilityCard, FiresGrid, FeedCard, GrowthEdgeCard, TrajectoryChart, YoursVsOthersChart, etc.
  - **Actions:** recognizeEntry(), recordImpact()
  - 34 new files (~1,400 lines)
  - Build verified: 456KB bundle
  - Pushed to origin/master
