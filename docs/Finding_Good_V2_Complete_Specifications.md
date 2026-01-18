# Finding Good V2: Complete Build Specifications

**Version:** 1.0  
**Created:** January 11, 2026  
**Purpose:** Everything Claude Code needs to build V2 — no gaps, no guessing

---

## Document Structure

1. **Shared Foundation** — Auth, components, design tokens
2. **Predict Tool Spec** — Complete flow, questions, AI prompts
3. **Priority Builder Spec** — Complete flow, questions, AI prompts
4. **Proof Tool Updates** — Changes to existing tool
5. **Together (Dashboard) Spec** — Complete layout and features
6. **Edge Functions** — All AI prompts ready to deploy
7. **Database Operations** — Exact queries and mutations

---

# PART 1: SHARED FOUNDATION

## 1.1 Project Structure

```
/finding-good-v2
├── /public
│   ├── favicon.ico
│   └── logo.svg
├── /src
│   ├── /components
│   │   ├── /ui
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   ├── FiresBadge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── /layout
│   │   │   ├── TopBar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── /shared
│   │       ├── PredictionSelector.tsx
│   │       ├── PredictionCard.tsx
│   │       ├── FiresDisplay.tsx
│   │       ├── FiresBarChart.tsx
│   │       ├── ZoneIndicator.tsx
│   │       ├── ConnectionInput.tsx
│   │       ├── CampfireCard.tsx
│   │       └── EmptyState.tsx
│   ├── /contexts
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── /hooks
│   │   ├── useAuth.ts
│   │   ├── usePredictions.ts
│   │   ├── useSupabase.ts
│   │   └── useLocalStorage.ts
│   ├── /lib
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── questions/
│   │       ├── predict.ts
│   │       ├── priority.ts
│   │       └── proof.ts
│   ├── /pages
│   │   ├── /auth
│   │   │   ├── Login.tsx
│   │   │   ├── MagicLinkSent.tsx
│   │   │   └── AuthCallback.tsx
│   │   ├── /together
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Campfire.tsx
│   │   │   ├── Connections.tsx
│   │   │   ├── IntegrityMaps.tsx
│   │   │   └── Settings.tsx
│   │   ├── /predict
│   │   │   ├── index.tsx
│   │   │   ├── New.tsx
│   │   │   ├── Quick.tsx
│   │   │   ├── Send.tsx
│   │   │   ├── View.tsx
│   │   │   └── Results.tsx
│   │   ├── /priority
│   │   │   ├── index.tsx
│   │   │   ├── Confirm.tsx
│   │   │   ├── Ask.tsx
│   │   │   ├── SendImpact.tsx
│   │   │   ├── View.tsx
│   │   │   └── Respond.tsx
│   │   └── /proof
│   │       ├── index.tsx
│   │       ├── Self.tsx
│   │       ├── Request.tsx
│   │       ├── Send.tsx
│   │       ├── Results.tsx
│   │       └── Respond.tsx
│   ├── /types
│   │   ├── index.ts
│   │   ├── predictions.ts
│   │   ├── fires.ts
│   │   ├── priority.ts
│   │   ├── proof.ts
│   │   └── auth.ts
│   ├── /styles
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── /supabase
│   └── /functions
│       ├── /predict-analyze
│       │   └── index.ts
│       ├── /priority-analyze
│       │   └── index.ts
│       └── /validation-interpret
│           └── index.ts
├── tailwind.config.js
├── vite.config.ts
├── package.json
├── .env.local
└── .env.example
```

---

## 1.2 Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'fg-primary': '#1B5666',
        'fg-primary-dark': '#174552',
        'fg-secondary': '#678C95',
        'fg-secondary-light': '#3C7181',
        'fg-accent': '#CBC13D',
        'fg-background': '#EDF2F2',
        'fg-surface': '#FFFFFF',
        
        // Text colors
        'fg-text': '#1A1A1A',
        'fg-text-secondary': '#4A5568',
        'fg-text-muted': '#718096',
        
        // Border colors
        'fg-border': '#D1D5DB',
        'fg-border-light': '#E5E7EB',
        
        // FIRES colors
        'fires-feelings': '#E57373',
        'fires-influence': '#64B5F6',
        'fires-resilience': '#81C784',
        'fires-ethics': '#FFD54F',
        'fires-strengths': '#BA68C8',
        
        // Semantic colors
        'fg-success': '#CBC13D',
        'fg-warning': '#F6AD55',
        'fg-error': '#E53E3E',
        'fg-info': '#3C7181',
      },
      fontFamily: {
        'brand': ['Fjord One', 'Georgia', 'serif'],
        'body': ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'brand': ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
        'badge': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 3px rgba(27, 86, 102, 0.15)',
      },
    },
  },
  plugins: [],
}
```

---

## 1.3 TypeScript Types

```typescript
// src/types/index.ts

// FIRES Framework
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths';

export type Zone = 'Exploring' | 'Discovering' | 'Performing' | 'Owning';

export type ValidationSignal = 'emerging' | 'developing' | 'grounded';

export interface FiresScore {
  present: boolean;
  strength: number; // 1-5
  evidence?: string;
}

export interface FiresExtracted {
  feelings: FiresScore;
  influence: FiresScore;
  resilience: FiresScore;
  ethics: FiresScore;
  strengths: FiresScore;
}

export interface ZoneBreakdown {
  feelings: Zone;
  influence: Zone;
  resilience: Zone;
  ethics: Zone;
  strengths: Zone;
}

// Predictions (V2 First-Class Entity)
export interface Prediction {
  id: string;
  client_email: string;
  title: string;
  description?: string;
  type: 'goal' | 'challenge' | 'experience';
  status: 'active' | 'archived';
  rank?: 1 | 2 | 3;
  current_predictability_score?: number;
  current_fires_map?: ZoneBreakdown;
  baseline_snapshot_id?: string;
  latest_snapshot_id?: string;
  priority_count: number;
  proof_count: number;
  connection_count: number;
  history_summary?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PredictionConnection {
  id: string;
  prediction_id: string;
  client_email: string;
  name: string;
  email?: string;
  relationship?: string;
  support_type?: 'emotional' | 'direct' | 'indirect' | 'similar';
  working_on_similar: boolean;
  source: 'future' | 'past';
  how_they_supported?: string;
  engagement_count: number;
  last_engaged_at?: string;
  created_at: string;
}

// Snapshot (Predict Tool output)
export interface Snapshot {
  id: string;
  client_email: string;
  prediction_id?: string;
  event_code?: string;
  goal: string;
  success: string;
  fs_answers: FutureStoryAnswers;
  ps_answers: PastStoryAnswers;
  future_support?: string;
  past_support?: string;
  confidence_scores: ConfidenceScores;
  alignment_scores: AlignmentScores;
  ai_clarity_scores?: AiScores;
  ai_confidence_scores?: AiScores;
  total_confidence: number;
  total_alignment: number;
  connection_score?: number;
  predictability_score?: number;
  overall_zone: Zone;
  zone_breakdown: ZoneBreakdown;
  growth_opportunity_category: FiresElement;
  growth_opportunity_zone: Zone;
  owning_highlight_category: FiresElement;
  owning_highlight_zone: Zone;
  narrative?: SnapshotNarrative;
  forty_eight_hour_question?: string;
  created_at: string;
}

export interface FutureStoryAnswers {
  fs1_goal: string;
  fs2_feelings: string;
  fs3_influence: string;
  fs4_resilience: string;
  fs5_ethics: string;
  fs6_strengths: string;
  fs7_support?: string;
}

export interface PastStoryAnswers {
  ps1_success: string;
  ps2_feelings: string;
  ps3_influence: string;
  ps4_resilience: string;
  ps5_ethics: string;
  ps6_strengths: string;
  ps7_support?: string;
}

export interface ConfidenceScores {
  feelings: number; // 1-4
  influence: number;
  resilience: number;
  ethics: number;
  strengths: number;
  overall: number; // 1-4
}

export interface AlignmentScores {
  feelings: number; // 1-4
  influence: number;
  resilience: number;
  ethics: number;
  strengths: number;
  overall: number; // 1-4
}

export interface AiScores {
  overall: number; // 1-5
  feelings: number;
  influence: number;
  resilience: number;
  ethics: number;
  strengths: number;
}

export interface SnapshotNarrative {
  overall_zone_narrative: string;
  owning_interpretation: string;
  owning_if_yes: string;
  owning_if_no: string;
  growth_interpretation: string;
  growth_if_yes: string;
  growth_if_no: string;
  closing_reflection: string;
}

// Priority (Priority Builder output)
export interface Priority {
  id: string;
  client_email: string;
  prediction_id?: string;
  event_code?: string;
  type: 'self' | 'other';
  responses: PriorityResponses;
  helper_framings?: HelperFramings;
  fires_extracted?: FiresExtracted;
  priority_line?: string;
  interpretation?: string;
  ownership_signal?: ValidationSignal;
  clarity_signal?: ValidationSignal;
  share_to_feed: boolean;
  shared_at?: string;
  // For 'other' type
  target_name?: string;
  target_email?: string;
  target_relationship?: string;
  impact_card?: ImpactCard;
  share_id?: string;
  status: 'draft' | 'shared' | 'completed';
  created_at: string;
}

export interface PriorityResponses {
  what_went_well: string;
  your_part: string;
  impact: string;
}

export interface HelperFramings {
  went_well?: string[];
  your_part?: string[];
  impact?: string[];
}

export interface ImpactCard {
  action_statement: string;
  strength_statement: string;
  impact_statement: string;
}

// Validation (Proof Tool output)
export interface Validation {
  id: string;
  client_email: string;
  prediction_id?: string;
  engagement_id?: string;
  event_code?: string;
  mode: 'self' | 'request' | 'send';
  goal_challenge: string;
  timeframe?: string;
  intensity: 'light' | 'balanced' | 'deeper';
  responses: ValidationResponses;
  validation_signal?: ValidationSignal;
  validation_insight?: string;
  scores?: ValidationScores;
  pattern?: ValidationPattern;
  fires_extracted?: FiresExtracted;
  proof_line?: string;
  share_to_feed: boolean;
  shared_at?: string;
  created_at: string;
}

export interface ValidationResponses {
  q0?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
}

export interface ValidationScores {
  confidence: number; // 1-5
  clarity: number;
  ownership: number;
}

export interface ValidationPattern {
  what_worked: string;
  why_it_worked: string;
  how_to_repeat: string;
}

// Campfire
export interface InspirationShare {
  id: string;
  client_email: string;
  content_type: 'priority' | 'proof' | 'prediction';
  content_id: string;
  prediction_id?: string;
  share_text?: string;
  fires_extracted?: FiresExtracted;
  hidden_at?: string;
  created_at: string;
}

// Auth
export interface User {
  id: string;
  email: string;
  name?: string;
  coach_id?: string;
  is_coach: boolean;
  coach_visibility_level?: 'names' | 'engagement' | 'full';
  created_at: string;
}
```

---

## 1.4 Shared Components

### Button Component

```tsx
// src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-button focus:outline-none focus:ring-2 focus:ring-fg-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-fg-primary text-white hover:bg-fg-primary-dark',
      secondary: 'border border-fg-secondary text-fg-secondary hover:bg-fg-secondary hover:text-white',
      text: 'text-fg-primary underline hover:text-fg-primary-dark',
      danger: 'bg-fg-error text-white hover:bg-red-700',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4\" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);
```

### Card Component

```tsx
// src/components/ui/Card.tsx
import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'highlighted';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'bg-fg-surface rounded-card p-6';
    
    const variants = {
      default: 'shadow-card',
      interactive: 'shadow-card cursor-pointer transition-all hover:shadow-card-hover hover:-translate-y-0.5',
      highlighted: 'shadow-card border-2 border-fg-accent bg-fg-accent/5',
    };
    
    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

### FIRES Badge Component

```tsx
// src/components/ui/FiresBadge.tsx
import { cn } from '@/lib/utils';
import { FiresElement } from '@/types';

interface FiresBadgeProps {
  element: FiresElement;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const FIRES_CONFIG = {
  feelings: { label: 'Feelings', color: 'bg-fires-feelings/20 text-fires-feelings', initial: 'F' },
  influence: { label: 'Influence', color: 'bg-fires-influence/20 text-fires-influence', initial: 'I' },
  resilience: { label: 'Resilience', color: 'bg-fires-resilience/20 text-fires-resilience', initial: 'R' },
  ethics: { label: 'Ethics', color: 'bg-fires-ethics/20 text-fires-ethics', initial: 'E' },
  strengths: { label: 'Strengths', color: 'bg-fires-strengths/20 text-fires-strengths', initial: 'S' },
};

export function FiresBadge({ element, showLabel = true, size = 'md' }: FiresBadgeProps) {
  const config = FIRES_CONFIG[element];
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-badge font-medium', config.color, sizes[size])}>
      <span className="font-bold">{config.initial}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
```

### Zone Indicator Component

```tsx
// src/components/shared/ZoneIndicator.tsx
import { cn } from '@/lib/utils';
import { Zone } from '@/types';

interface ZoneIndicatorProps {
  zone: Zone;
  size?: 'sm' | 'md' | 'lg';
}

const ZONE_CONFIG = {
  Exploring: { 
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Building clarity'
  },
  Discovering: { 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Connecting to proof'
  },
  Performing: { 
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Grounding confidence'
  },
  Owning: { 
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Ready to extend'
  },
};

export function ZoneIndicator({ zone, size = 'md' }: ZoneIndicatorProps) {
  const config = ZONE_CONFIG[zone];
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <span className={cn('inline-flex items-center rounded-badge font-medium border', config.color, sizes[size])}>
      {zone}
    </span>
  );
}
```

### Progress Steps Component

```tsx
// src/components/ui/Progress.tsx
import { cn } from '@/lib/utils';

interface ProgressProps {
  steps: string[];
  currentStep: number;
}

export function Progress({ steps, currentStep }: ProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              index < currentStep
                ? 'bg-fg-accent text-fg-text'
                : index === currentStep
                ? 'bg-fg-primary text-white'
                : 'bg-fg-border text-fg-text-muted'
            )}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 mx-1',
                index < currentStep ? 'bg-fg-accent' : 'bg-fg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 1.5 Authentication

### Auth Context

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Protected Route

```tsx
// src/components/layout/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-fg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

# PART 2: PREDICT TOOL SPECIFICATION

## 2.1 Overview

| Attribute | Value |
|-----------|-------|
| **Purpose** | Assess predictability of success on goals/challenges |
| **Time** | Standard: ~15 min, Quick: ~5 min |
| **Output** | Prediction + Predictability Score + FIRES Map |
| **URL** | `/predict` |

## 2.2 Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/predict` | PredictHome | List predictions, start new |
| `/predict/new` | PredictNew | Standard prediction flow |
| `/predict/quick` | PredictQuick | Workshop quick capture |
| `/predict/send` | PredictSend | Invite someone |
| `/predict/:id` | PredictView | View existing prediction |
| `/predict/:id/results` | PredictResults | Results with FIRES map |
| `/predict/:id/reassess` | PredictReassess | Re-assess existing |

## 2.3 Standard Prediction Flow

### Section 1: Future Story (7 questions)

```typescript
// src/lib/questions/predict.ts
// EXACT QUESTIONS FROM LIVE TOOL

export const FUTURE_STORY_QUESTIONS = [
  {
    id: 'fs1',
    element: null, // Goal setup
    question: "What's one important focus for you right now?",
    placeholder: "A goal, challenge, or experience you're working toward...",
    helper: "This becomes your prediction — something you want to see happen.",
  },
  {
    id: 'fs2',
    element: 'feelings',
    question: "As you pursue this, what emotion do you believe you'll need to sustain?",
    placeholder: "The feeling that tells you you're on the right track...",
    helper: "This is your internal signal — the emotion that shows up when things are working.",
  },
  {
    id: 'fs3',
    element: 'influence',
    question: "What factors will you need to take ownership of or influence?",
    placeholder: "What you can actually control...",
    helper: "Focus on what's in your power — the levers you can pull.",
  },
  {
    id: 'fs4',
    element: 'resilience',
    question: "When you face setbacks, what type of resilience will you need to draw on?",
    placeholder: "How you'll handle the hard parts...",
    helper: "Think about your approach to difficulty — how you bounce back.",
  },
  {
    id: 'fs5',
    element: 'ethics',
    question: "What is your deeper Why — what will keep you committed when things get hard?",
    placeholder: "What matters most to you about this...",
    helper: "The purpose beneath the goal — why it actually matters.",
  },
  {
    id: 'fs6',
    element: 'strengths',
    question: "What skill or strength will you need to rely on most?",
    placeholder: "What you bring to this...",
    helper: "Your capabilities — what you're naturally good at.",
  },
  {
    id: 'fs7',
    element: null, // Support (optional)
    question: "Who will you rely on as you pursue [GOAL]?",
    // Note: [GOAL] is dynamically replaced with their FS1 answer
    placeholder: "People who can support you...",
    helper: "Name 1-4 people. They don't need to be directly involved — just supportive.",
    optional: true,
  },
];
```

### Section 2: Future Connections (after FS7)

For each person named in FS7:

```typescript
export interface FutureConnection {
  name: string; // Required
  relationship?: string; // "friend", "colleague", "mentor", etc.
  support_type?: 'emotional' | 'direct' | 'indirect' | 'similar';
  email?: string; // For later outreach
  working_on_similar: boolean; // +1 to connection score if true
}

export const SUPPORT_TYPE_OPTIONS = [
  { value: 'emotional', label: 'Emotional support', description: 'Encouragement, listening, believing in me' },
  { value: 'direct', label: 'Direct help', description: 'Actively involved in the work' },
  { value: 'indirect', label: 'Indirect help', description: 'Resources, connections, advice' },
  { value: 'similar', label: 'Working on similar', description: 'Pursuing something related' },
];
```

### Section 3: Past Story (7 questions)

```typescript
// EXACT QUESTIONS FROM LIVE TOOL

export const PAST_STORY_QUESTIONS = [
  {
    id: 'ps1',
    element: null, // Success setup
    question: "Think of a meaningful success from your past.",
    placeholder: "A time when you accomplished something that mattered...",
    helper: "This becomes your proof — evidence that you've done hard things before.",
  },
  {
    id: 'ps2',
    element: 'feelings',
    question: "While working toward that success, what emotion showed up that told you you were on the right track?",
    placeholder: "The feeling that signaled progress...",
    helper: "The internal signal that appeared when things were working.",
  },
  {
    id: 'ps3',
    element: 'influence',
    question: "What key factors did you take ownership of that led to your success?",
    placeholder: "What you controlled that made the difference...",
    helper: "The things you did that created the outcome.",
  },
  {
    id: 'ps4',
    element: 'resilience',
    question: "How did you move through the challenges and difficulty?",
    placeholder: "How you handled the hard parts...",
    helper: "Your approach when things got tough.",
  },
  {
    id: 'ps5',
    element: 'ethics',
    question: "What about that success meant the most to you? What Why did it fulfill?",
    placeholder: "The deeper meaning of the accomplishment...",
    helper: "The purpose it served — why it actually mattered.",
  },
  {
    id: 'ps6',
    element: 'strengths',
    question: "What skill or talent did you rely on most, even if it came naturally?",
    placeholder: "What you brought to the situation...",
    helper: "Your capabilities that showed up — even ones you take for granted.",
  },
  {
    id: 'ps7',
    element: null, // Support (optional)
    question: "Who helped you succeed at [SUCCESS]?",
    // Note: [SUCCESS] is dynamically replaced with their PS1 answer
    placeholder: "People who supported you...",
    helper: "Name 1-4 people who were part of that success.",
    optional: true,
  },
];
```

### Section 4: Past Connections (after PS7)

For each person named in PS7:

```typescript
export interface PastConnection {
  name: string; // Required
  how_they_supported?: string; // Open text describing their support
}
```

### Section 5: Confidence Ratings (1-4 scale)

**V1 had explicit confidence ratings. V2 removes them — AI extracts confidence from response quality.**

For reference, V1 questions were:
- CR1: Confidence in overall goal
- CR2-CR6: Confidence in each FIRES element

### Section 6: Alignment Self-Assessment (6 questions, 1-4 scale)

These indirectly measure clarity and confidence:

```typescript
export const ALIGNMENT_QUESTIONS = [
  {
    id: 'ar1',
    element: null, // Overall
    question: "How clearly can you see [GOAL] succeeding the way [SUCCESS] did?",
    scale: [
      { value: 1, label: 'Not at all clear' },
      { value: 2, label: 'Somewhat unclear' },
      { value: 3, label: 'Fairly clear' },
      { value: 4, label: 'Very clear' },
    ],
  },
  {
    id: 'ar2',
    element: 'feelings',
    question: "How confident are you that the feeling from [PAST_FEELINGS] will show up when pursuing [GOAL]?",
    scale: [
      { value: 1, label: 'Not at all confident' },
      { value: 2, label: 'Somewhat unsure' },
      { value: 3, label: 'Fairly confident' },
      { value: 4, label: 'Very confident' },
    ],
  },
  {
    id: 'ar3',
    element: 'influence',
    question: "How clearly can you see applying what you controlled in [PAST_INFLUENCE] to [GOAL]?",
    scale: [
      { value: 1, label: 'Not at all clear' },
      { value: 2, label: 'Somewhat unclear' },
      { value: 3, label: 'Fairly clear' },
      { value: 4, label: 'Very clear' },
    ],
  },
  {
    id: 'ar4',
    element: 'resilience',
    question: "How confident are you that your approach to difficulty in [PAST_RESILIENCE] will work for [GOAL]?",
    scale: [
      { value: 1, label: 'Not at all confident' },
      { value: 2, label: 'Somewhat unsure' },
      { value: 3, label: 'Fairly confident' },
      { value: 4, label: 'Very confident' },
    ],
  },
  {
    id: 'ar5',
    element: 'ethics',
    question: "How clearly can you see your Why from [PAST_ETHICS] driving [GOAL]?",
    scale: [
      { value: 1, label: 'Not at all clear' },
      { value: 2, label: 'Somewhat unclear' },
      { value: 3, label: 'Fairly clear' },
      { value: 4, label: 'Very clear' },
    ],
  },
  {
    id: 'ar6',
    element: 'strengths',
    question: "How confident are you that [PAST_STRENGTHS] applies to [GOAL]?",
    scale: [
      { value: 1, label: 'Not at all confident' },
      { value: 2, label: 'Somewhat unsure' },
      { value: 3, label: 'Fairly confident' },
      { value: 4, label: 'Very confident' },
    ],
  },
];
```

## 2.4 Scoring Logic

### Zone Calculation (Per Element)

```typescript
// src/lib/questions/predict.ts

export function calculateZone(confidence: number, alignment: number): Zone {
  // confidence: 1-4, alignment: 1-4
  if (confidence >= 3 && alignment >= 3) return 'Owning';
  if (confidence >= 3 && alignment <= 2) return 'Performing';
  if (confidence <= 2 && alignment >= 3) return 'Discovering';
  return 'Exploring';
}

export function calculateOverallZone(totalConfidence: number, totalAlignment: number): Zone {
  // totalConfidence: 6-24, totalAlignment: 6-24
  if (totalConfidence >= 18 && totalAlignment >= 18) return 'Owning';
  if (totalConfidence >= 18 && totalAlignment <= 17) return 'Performing';
  if (totalConfidence <= 17 && totalAlignment >= 18) return 'Discovering';
  return 'Exploring';
}
```

### Predictability Score (V2)

```typescript
export function calculatePredictabilityScore(
  aiClarity: AiScores,      // AI-extracted from responses
  aiConfidence: AiScores,   // AI-extracted from responses
  alignmentScores: AlignmentScores,  // Self-rated
  connectionCount: number,
  workingOnSimilarCount: number
): number {
  // Component 1: AI Clarity (0-30 points)
  const clarityPoints = (
    aiClarity.feelings +
    aiClarity.influence +
    aiClarity.resilience +
    aiClarity.ethics +
    aiClarity.strengths +
    aiClarity.overall
  ); // Max 30 (6 elements × 5 max each)
  
  // Component 2: AI Confidence (0-30 points)
  const confidencePoints = (
    aiConfidence.feelings +
    aiConfidence.influence +
    aiConfidence.resilience +
    aiConfidence.ethics +
    aiConfidence.strengths +
    aiConfidence.overall
  ); // Max 30
  
  // Component 3: Self-rated Alignment (6-24 points, normalize to 0-24)
  const alignmentPoints = (
    alignmentScores.feelings +
    alignmentScores.influence +
    alignmentScores.resilience +
    alignmentScores.ethics +
    alignmentScores.strengths +
    alignmentScores.overall
  ) - 6; // Subtract 6 to make range 0-18, then scale
  const normalizedAlignment = Math.round((alignmentPoints / 18) * 24);
  
  // Component 4: Connection Score (0-8 points)
  const connectionBase = Math.min(connectionCount, 4); // 0-4 points
  const similarBonus = Math.min(workingOnSimilarCount, 4); // 0-4 points
  const connectionPoints = connectionBase + similarBonus;
  
  // Total: 0-92 points, scale to 0-100
  const rawTotal = clarityPoints + confidencePoints + normalizedAlignment + connectionPoints;
  const scaledScore = Math.round((rawTotal / 92) * 100);
  
  return Math.min(100, Math.max(0, scaledScore));
}
```

## 2.5 Quick Prediction Flow

```typescript
export const QUICK_PREDICTION_QUESTIONS = [
  {
    id: 'qp1',
    question: "What goal, challenge, or experience are you focused on?",
    placeholder: "What you're working toward...",
  },
  {
    id: 'qp2',
    question: "In one sentence, what will success look like?",
    placeholder: "When this works, you'll see...",
  },
  {
    id: 'qp3',
    question: "What's one thing you've done before that's similar?",
    placeholder: "A past success you can draw on...",
  },
  {
    id: 'qp4',
    question: "What made that work?",
    placeholder: "The key to that success...",
  },
  {
    id: 'qp5',
    question: "Who's supporting you?",
    placeholder: "1-2 names...",
  },
];
```

## 2.6 Results Display

### Predictability Score Card

```tsx
interface PredictabilityScoreProps {
  score: number;
  previousScore?: number;
}

// Visual: Large circular progress with score in center
// Color: 0-40 amber, 41-70 blue, 71-100 green
// Show trend arrow if previousScore provided
```

### FIRES Map Display

For each element, show:
- Element name with badge
- Zone (Owning/Performing/Discovering/Exploring)
- AI clarity score (1-5 dots)
- AI confidence score (1-5 dots)
- Key quote from their response

### Growth Opportunity

```typescript
// Select lowest scoring element
function selectGrowthOpportunity(zones: ZoneBreakdown, aiScores: AiScores): FiresElement {
  const elements: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths'];
  
  // Priority: Exploring zones first, then lowest AI scores
  const exploring = elements.filter(e => zones[e] === 'Exploring');
  if (exploring.length > 0) {
    return exploring.reduce((lowest, e) => 
      aiScores[e] < aiScores[lowest] ? e : lowest
    );
  }
  
  return elements.reduce((lowest, e) => 
    aiScores[e] < aiScores[lowest] ? e : lowest
  );
}
```

### Owning Highlight

```typescript
// Select highest scoring element
function selectOwningHighlight(zones: ZoneBreakdown, aiScores: AiScores): FiresElement {
  const elements: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths'];
  
  // Priority: Owning zones first, then highest AI scores
  const owning = elements.filter(e => zones[e] === 'Owning');
  if (owning.length > 0) {
    return owning.reduce((highest, e) => 
      aiScores[e] > aiScores[highest] ? e : highest
    );
  }
  
  return elements.reduce((highest, e) => 
    aiScores[e] > aiScores[highest] ? e : highest
  );
}
```

---

# PART 3: PRIORITY BUILDER SPECIFICATION

## 3.1 Overview

| Attribute | Value |
|-----------|-------|
| **Purpose** | Confirm what mattered today, inspire others |
| **Tagline** | "What we ask about becomes our priority" |
| **Time** | ~2-3 minutes |
| **Output** | Priority Line + FIRES extracted |
| **URL** | `/priority` |

## 3.2 V1 Question Structure (For Reference)

The live Impact tool organizes questions by FIRES element × intensity. Here's the actual structure:

```typescript
// V1 STRUCTURE - Organized by FIRES × Intensity
// Each combination has 3 questions: moment, role, impact

const V1_QUESTIONS = {
  feelings: {
    light: {
      moment: "What's one moment this week when you felt genuinely good or at ease?",
      role: "What was your part in creating that feeling?",
      impact: "Who or what benefited from you being in that state?",
    },
    balanced: {
      moment: "When did you notice a shift in how you felt this week?",
      role: "What did you do that contributed to that shift?",
      impact: "How did that emotional shift affect your actions or others?",
    },
    deeper: {
      moment: "What vulnerable feeling did you allow yourself to sit with this week?",
      role: "How did you choose to engage with that feeling rather than avoid it?",
      impact: "What became possible because you didn't push that feeling away?",
    },
  },
  influence: {
    light: {
      moment: "Where did you take ownership of something this week?",
      role: "What specific action did you take?",
      impact: "What changed because you stepped up?",
    },
    balanced: {
      moment: "What did you do that you initially hesitated on?",
      role: "What helped you move past the hesitation?",
      impact: "What was the result of taking that action?",
    },
    deeper: {
      moment: "Where did you step into influence you might have avoided before?",
      role: "What did it cost you to take ownership there?",
      impact: "What ripple effects are you starting to see?",
    },
  },
  resilience: {
    light: {
      moment: "What small challenge did you push through this week?",
      role: "How did you keep going?",
      impact: "What did you gain from not giving up?",
    },
    balanced: {
      moment: "What setback or challenge did you face recently?",
      role: "How did you choose to respond instead of react?",
      impact: "What did you learn or gain by handling it that way?",
    },
    deeper: {
      moment: "What difficulty tested you in a way that felt significant?",
      role: "What internal resource did you draw on to get through?",
      impact: "How has that experience changed what you believe about yourself?",
    },
  },
  ethics: {
    light: {
      moment: "When did you act in alignment with what matters to you?",
      role: "What choice did you make that reflected your values?",
      impact: "How did staying true to yourself affect the outcome?",
    },
    balanced: {
      moment: "Where did your 'why' guide a decision this week?",
      role: "How did you stay connected to what mattered?",
      impact: "What became possible because you didn't compromise?",
    },
    deeper: {
      moment: "Where did you maintain integrity even when it was hard?",
      role: "What did you have to sacrifice to stay true to your values?",
      impact: "What did that moment reveal about who you're becoming?",
    },
  },
  strengths: {
    light: {
      moment: "When did you use a skill or talent effectively this week?",
      role: "What did you actually do with that strength?",
      impact: "What was the result of applying that capability?",
    },
    balanced: {
      moment: "Where did you notice yourself operating in your zone of genius?",
      role: "What made that strength show up so naturally?",
      impact: "Who or what benefited from you being in that flow?",
    },
    deeper: {
      moment: "What unique gift did you bring to a situation this week?",
      role: "How did you lean into that strength even further?",
      impact: "What would have been different if you hadn't shown up that way?",
    },
  },
};
```

## 3.3 V2 Simplified Structure

**V2 Change:** We simplify to 3 universal questions. AI extracts FIRES automatically. Helper framings provide inspiration without forcing selection.

### Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/priority` | PriorityHome | Start confirmation, recent history |
| `/priority/confirm` | PriorityConfirm | Daily confirmation flow |
| `/priority/ask/:id` | PriorityAsk | Ask someone what mattered |
| `/priority/send` | PrioritySendImpact | Tell someone their impact |
| `/priority/view/:id` | PriorityView | View completed priority |
| `/priority/respond/:shareId` | PriorityRespond | Public: respond to ask |

### Confirm Flow

#### Step 1: Prediction Selector (Optional)

```tsx
// Optional: Link to active prediction
<PredictionSelector
  predictions={userPredictions}
  selected={selectedPrediction}
  onChange={setSelectedPrediction}
  allowNone={true}
  noneLabel="Just reflecting generally"
/>
```

#### Step 2-4: Three Questions with Helper Framings

```typescript
// src/lib/questions/priority.ts
// V2 SIMPLIFIED - 3 universal questions

export const PRIORITY_QUESTIONS = {
  what_went_well: {
    question: "What went well today?",
    placeholder: "Something that mattered, however small...",
    helper_framings: [
      { id: 'progress', label: 'Progress I made', icon: '📈' },
      { id: 'persistence', label: "Something I didn't give up on", icon: '💪' },
      { id: 'attempt', label: 'An attempt worth noting', icon: '🎯' },
      { id: 'resilience', label: 'Resilience I built', icon: '🌱' },
    ],
  },
  your_part: {
    question: "What was your part in that?",
    placeholder: "What you actually did...",
    helper_framings: [
      { id: 'action', label: 'Action I took', icon: '⚡' },
      { id: 'decision', label: 'Decision I made', icon: '🧭' },
      { id: 'previous', label: 'Something I did previously (paid off)', icon: '🔄' },
      { id: 'observed', label: 'Something I observed', icon: '👁️' },
    ],
  },
  impact: {
    question: "What impact did it have?",
    placeholder: "What changed because of this...",
    helper_framings: [
      { id: 'day_better', label: 'Made my day better', icon: '☀️' },
      { id: 'goal_forward', label: 'Moved goal/challenge forward', icon: '🚀' },
      { id: 'helped_someone', label: 'Helped someone else', icon: '🤝' },
    ],
  },
};
```

### Helper Framing UI Implementation

```tsx
// Helper framings appear as clickable chips below textarea
// Clicking tracks which inspired them (stored in helper_framings field)
// Does NOT modify their typed text - just records what they found helpful

interface HelperFramingChipProps {
  framing: { id: string; label: string; icon: string };
  selected: boolean;
  onToggle: () => void;
}

function HelperFramingChip({ framing, selected, onToggle }: HelperFramingChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
        selected
          ? 'bg-fg-accent/20 text-fg-text border border-fg-accent'
          : 'bg-fg-background text-fg-text-secondary border border-fg-border hover:border-fg-secondary'
      )}
    >
      <span>{framing.icon}</span>
      <span>{framing.label}</span>
    </button>
  );
}
```

### Step 5: Results + Ask

After AI analysis:
- Display Priority Line prominently
- Show FIRES detected as badges
- Show clarity/ownership signals subtly
- Toggle: "Share to Campfire"
- CTA: "Ask someone what mattered to them"

## 3.4 Ask Flow

After completing their own confirmation:

```tsx
// PriorityAsk.tsx
interface AskFormData {
  recipient_name: string; // Required
  recipient_email?: string; // Optional
  message?: string; // Optional personal note
}

// Generate share link
const shareUrl = `${window.location.origin}/priority/respond/${shareId}`;

// Recipient sees:
// - Who asked them
// - Same 3 questions (no prediction selector)
// - Their response feeds asker's Campfire
// - CTA to start their own
```

## 3.5 Send Impact Flow (Other Mode)

Recognizing someone else's impact on you:

```typescript
export const SEND_IMPACT_QUESTIONS = {
  who: {
    question: "Who are you recognizing?",
    fields: ['name', 'email', 'relationship'],
  },
  what_they_did: {
    question: "What did they do?",
    placeholder: "The specific action you noticed...",
  },
  what_it_showed: {
    question: "What did it show about them?",
    placeholder: "The quality or strength it revealed...",
  },
  how_it_affected_you: {
    question: "How did it affect you?",
    placeholder: "The impact it had on you...",
  },
};
```

Output: Impact Card sent to recipient with:
- Action statement
- Strength statement
- Impact statement
- Invitation to reflect themselves

---

# PART 4: PROOF TOOL UPDATES

## 4.1 Changes from Current

| Change | Details |
|--------|---------|
| Add prediction selector | Link proof to active prediction |
| Add Campfire toggle | Share to feed option |
| Remove history page | History now in Together |
| Update table reference | `predictions` → `outcome_predictions` |
| Integrate shared auth | Use AuthContext |
| Use shared components | Button, Card, etc. |

## 4.2 Current Questions (Preserve)

The current 45 questions organized by FIRES × intensity work well. Here's the complete set:

```typescript
// src/lib/questions/proof.ts
// EXACT QUESTIONS FROM LIVE TOOL

export const PROOF_QUESTIONS = {
  feelings: {
    light: [
      "What felt satisfying about how this turned out?",
      "When did you feel most 'in flow' during this?",
      "What emotional state helped you succeed here?",
    ],
    balanced: [
      "What feelings came up that surprised you?",
      "How did your emotional state shift throughout?",
      "What feeling do you want to remember from this?",
    ],
    deeper: [
      "What vulnerability did you allow that made this possible?",
      "What emotional risk did you take that paid off?",
      "What feeling did you have to move through to get here?",
    ],
  },
  influence: {
    light: [
      "What's one decision that made a real difference?",
      "Where did you take initiative that mattered?",
      "What did you control that led to this outcome?",
    ],
    balanced: [
      "What did you do that you initially hesitated on?",
      "Where did you step outside your comfort zone?",
      "What choice did you make that changed the trajectory?",
    ],
    deeper: [
      "What ownership did you take that others might have avoided?",
      "Where did you exercise influence you didn't know you had?",
      "What did you do that surprised even you?",
    ],
  },
  resilience: {
    light: [
      "What challenge did you push through?",
      "How did you handle a moment of doubt?",
      "What kept you going when it got hard?",
    ],
    balanced: [
      "What setback taught you something valuable?",
      "How did you adapt when things didn't go as planned?",
      "What did you learn about your own resilience?",
    ],
    deeper: [
      "What did this success cost you, and why was it worth it?",
      "What part of yourself did you have to strengthen to get here?",
      "What made you able to sustain effort when motivation faded?",
    ],
  },
  ethics: {
    light: [
      "What mattered most to you about this success?",
      "What value did this fulfill?",
      "Why was this worth doing?",
    ],
    balanced: [
      "How did your 'why' shape the way you worked?",
      "What integrity did you maintain even when it was hard?",
      "What deeper purpose did this success serve?",
    ],
    deeper: [
      "What did this reveal about what you truly value?",
      "Where did you stay true to yourself when it would have been easier not to?",
      "What about this success aligns with who you want to be?",
    ],
  },
  strengths: {
    light: [
      "What skill or ability did you use effectively?",
      "What strength came naturally here?",
      "What are you good at that helped?",
    ],
    balanced: [
      "What capability did you develop or sharpen?",
      "What strength did others notice in you?",
      "What did you do better than you expected?",
    ],
    deeper: [
      "What part of your identity showed up strongly here?",
      "What gift did you give that only you could give?",
      "What about who you are made this success possible?",
    ],
  },
};

// Weekly Pulse Questions (rotating set)
export const WEEKLY_PULSE_QUESTIONS = {
  clarity: {
    question: "How clear are you on what actually worked this week?",
    scale: ["Still fuzzy", "Getting clearer", "Pretty clear", "Crystal clear"],
    scaleValues: [1, 2, 3, 4],
  },
  confidence: {
    question: "How confident are you that you could repeat this success?",
    scale: ["Got lucky", "Somewhat confident", "Fairly confident", "I own this"],
    scaleValues: [1, 2, 3, 4],
  },
  influence: {
    question: "How much did your actions (vs. circumstances) create this outcome?",
    scale: ["Mostly luck", "Some me, some luck", "Mostly me", "All me"],
    scaleValues: [1, 2, 3, 4],
  },
};

// Select questions based on intensity
export function getProofQuestions(
  intensity: 'light' | 'balanced' | 'deeper',
  firesElement?: FiresElement
): string[] {
  if (firesElement) {
    return PROOF_QUESTIONS[firesElement][intensity];
  }
  
  // If no specific element, pick one question from each
  const elements: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths'];
  return elements.map(el => {
    const questions = PROOF_QUESTIONS[el][intensity];
    return questions[Math.floor(Math.random() * questions.length)];
  });
}
```

## 4.3 Integration Points

```typescript
// After validation completion, if prediction_id exists:
await supabase.rpc('increment_proof_count', { pred_id: prediction_id });

// If share_to_feed is true:
await supabase.from('inspiration_shares').insert({
  client_email: user.email,
  content_type: 'proof',
  content_id: validation.id,
  prediction_id: validation.prediction_id,
  share_text: validation.proof_line,
  fires_extracted: validation.fires_extracted,
});
```

---

# PART 5: TOGETHER (DASHBOARD) SPECIFICATION

## 5.1 Overview

| Attribute | Value |
|-----------|-------|
| **Purpose** | Home base — see predictions, activity, connections |
| **Who Uses It** | All users (different views for coached vs free) |
| **URL** | `/` (root) |

## 5.2 Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Dashboard | Main view |
| `/campfire` | Campfire | Inspiration feed |
| `/connections` | Connections | Your network |
| `/maps` | IntegrityMaps | Weekly PDFs |
| `/settings` | Settings | Account preferences |

## 5.3 Dashboard Layout

### Mobile Layout

```
┌─────────────────────────────────────┐
│  Finding Good     Together    [⚙]   │  ← Top bar
├─────────────────────────────────────┤
│                                     │
│  Welcome back, [Name]               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  MY PREDICTIONS             │    │
│  │                             │    │
│  │  [Prediction Card 1]        │    │
│  │  [Prediction Card 2]        │    │
│  │  [+ New Prediction]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  RECENT ACTIVITY            │    │
│  │  • Priority confirmed 2h    │    │
│  │  • Proof captured yesterday │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔥 CAMPFIRE                │    │
│  │  [2-3 recent shares]        │    │
│  │  View more →                │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  [🏠] [🔥] [👥] [⚙]                │  ← Bottom nav
└─────────────────────────────────────┘
```

### Desktop Layout

```
┌────────────┬────────────────────────────────────────────────┐
│            │  Together                    [Search] [🔔] [⚙] │
│  Finding   ├────────────────────────────────────────────────┤
│  Good      │                                                │
│            │  Welcome back, [Name]                          │
│  ────────  │                                                │
│            │  ┌──────────────────┐ ┌──────────────────┐     │
│  📊 Home   │  │ Prediction 1     │ │ Prediction 2     │     │
│  🔥 Fire   │  │ Score: 72 ↑      │ │ Score: 58        │     │
│  👥 People │  │ 5 priorities     │ │ 2 priorities     │     │
│  📄 Maps   │  └──────────────────┘ └──────────────────┘     │
│  ⚙ Settings│                                                │
│            │  Recent Activity                               │
│            │  ┌────────────────────────────────────────┐    │
│            │  │ Priority confirmed • 2h ago            │    │
│            │  │ Proof captured • Yesterday             │    │
│            │  │ Sarah shared to Campfire • 3h ago      │    │
│            │  └────────────────────────────────────────┘    │
│            │                                                │
│            │  🔥 Campfire                                   │
│            │  ┌────────────────────────────────────────┐    │
│            │  │ [Share Card 1]                         │    │
│            │  │ [Share Card 2]                         │    │
│            │  └────────────────────────────────────────┘    │
└────────────┴────────────────────────────────────────────────┘
```

## 5.4 Prediction Card Component

```tsx
// src/components/shared/PredictionCard.tsx

interface PredictionCardProps {
  prediction: Prediction;
  onClick?: () => void;
}

export function PredictionCard({ prediction, onClick }: PredictionCardProps) {
  return (
    <Card variant="interactive" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-heading text-h3 text-fg-text">
            {prediction.title}
          </h3>
          <p className="text-sm text-fg-text-muted mt-1">
            {prediction.type} • {prediction.priority_count} priorities • {prediction.proof_count} proofs
          </p>
        </div>
        {prediction.current_predictability_score && (
          <div className="text-right">
            <div className="text-2xl font-bold text-fg-primary">
              {prediction.current_predictability_score}
            </div>
            <div className="text-xs text-fg-text-muted">
              predictability
            </div>
          </div>
        )}
      </div>
      
      {/* FIRES mini-map */}
      {prediction.current_fires_map && (
        <div className="flex gap-1 mt-3">
          {Object.entries(prediction.current_fires_map).map(([element, zone]) => (
            <ZoneIndicator key={element} zone={zone} size="sm" />
          ))}
        </div>
      )}
    </Card>
  );
}
```

## 5.5 Campfire Feed

```tsx
// src/pages/together/Campfire.tsx

export function Campfire() {
  const { user } = useAuth();
  const [shares, setShares] = useState<InspirationShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    // Get shares from mutual connections only
    const { data } = await supabase
      .from('inspiration_shares')
      .select(`
        *,
        share_visibility!inner(user_a_email, user_b_email)
      `)
      .or(`user_a_email.eq.${user.email},user_b_email.eq.${user.email}`, 
          { foreignTable: 'share_visibility' })
      .is('hidden_at', null)
      .order('created_at', { ascending: false })
      .limit(20);
    
    setShares(data || []);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  if (shares.length === 0) {
    return (
      <EmptyState
        icon="🔥"
        title="Your Campfire is waiting"
        description="When you ask someone what mattered to them, or share what mattered to you, they become part of your circle."
        action={{
          label: "Confirm what mattered today",
          href: "/priority/confirm",
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="font-brand text-h1 text-fg-primary">🔥 Campfire</h1>
        <p className="text-fg-text-secondary">What's inspiring your circle</p>
      </div>
      
      {shares.map((share) => (
        <CampfireCard key={share.id} share={share} />
      ))}
    </div>
  );
}
```

## 5.6 Campfire Card Component

```tsx
// src/components/shared/CampfireCard.tsx

interface CampfireCardProps {
  share: InspirationShare;
}

export function CampfireCard({ share }: CampfireCardProps) {
  const timeAgo = formatTimeAgo(share.created_at);
  
  return (
    <Card className="bg-gradient-to-br from-white to-amber-50/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-fg-secondary text-white flex items-center justify-center text-sm font-medium">
            {share.client_email[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-fg-text">
            {share.client_email.split('@')[0]}
          </span>
        </div>
        <span className="text-xs text-fg-text-muted">{timeAgo}</span>
      </div>
      
      {/* Content */}
      <p className="text-fg-text mb-3">{share.share_text}</p>
      
      {/* FIRES detected */}
      {share.fires_extracted && (
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.entries(share.fires_extracted)
            .filter(([_, data]) => data.present)
            .map(([element]) => (
              <FiresBadge 
                key={element} 
                element={element as FiresElement} 
                size="sm"
                showLabel={false}
              />
            ))
          }
        </div>
      )}
      
      {/* Reactions (v2.0.5 - UI ready, functionality later) */}
      <div className="flex gap-2 pt-3 border-t border-fg-border-light">
        <button className="text-lg opacity-50 hover:opacity-100 transition-opacity" disabled>
          🔥
        </button>
        <button className="text-lg opacity-50 hover:opacity-100 transition-opacity" disabled>
          💡
        </button>
        <button className="text-lg opacity-50 hover:opacity-100 transition-opacity" disabled>
          🙌
        </button>
      </div>
    </Card>
  );
}
```

---

# PART 6: EDGE FUNCTIONS (AI PROMPTS)

## 6.1 Predict Analyze Function

```typescript
// supabase/functions/predict-analyze/index.ts
// ACTUAL FORMAT FROM LIVE TOOL - uses |||SECTION||| delimiters

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a warm, insightful coach generating personalized narrative pieces for a FIRES Alignment Map.

VOICE:
- Warm but direct — like a wise friend who sees you clearly
- Use "you" constantly
- Quote user's exact words — never paraphrase
- Short, punchy sentences

CRITICAL RULES:
1. NO markdown headers (no #, ##, ###) — write flowing prose only
2. Use the user's EXACT words in quotes
3. Never reference scores or data — interpret the experience
4. Frame Exploring as opportunity, not deficiency
5. Keep each piece SHORT and focused — this is modular content

RETURN EXACTLY 8 PIECES separated by |||SECTION|||

The pieces are:
1. OVERALL_ZONE_NARRATIVE (3-4 sentences about their overall state)
2. OWNING_INTERPRETATION (4-6 sentences about their strongest element)
3. OWNING_IF_YES (1 sentence affirmation if they resonate)
4. OWNING_IF_NO (1 sentence alternative if they don't resonate)
5. GROWTH_INTERPRETATION (4-6 sentences about their growth opportunity)
6. GROWTH_IF_YES (1 sentence if they want to explore this)
7. GROWTH_IF_NO (1 sentence if this doesn't feel right)
8. CLOSING_REFLECTION (2-3 sentences closing thought)`;

serve(async (req) => {
  const { 
    goal, success, fs_answers, ps_answers, 
    overall_zone, zone_breakdown,
    owning_highlight, growth_opportunity,
    confidence_scores, alignment_scores
  } = await req.json();

  // Build context for the AI
  const userPrompt = `
FUTURE GOAL: ${goal}

FUTURE STORY RESPONSES:
- Feelings: ${fs_answers.fs2_feelings}
- Influence: ${fs_answers.fs3_influence}
- Resilience: ${fs_answers.fs4_resilience}
- Ethics: ${fs_answers.fs5_ethics}
- Strengths: ${fs_answers.fs6_strengths}

PAST SUCCESS: ${success}

PAST STORY RESPONSES:
- Feelings: ${ps_answers.ps2_feelings}
- Influence: ${ps_answers.ps3_influence}
- Resilience: ${ps_answers.ps4_resilience}
- Ethics: ${ps_answers.ps5_ethics}
- Strengths: ${ps_answers.ps6_strengths}

CALCULATED ZONES:
- Overall Zone: ${overall_zone}
- Owning Highlight: ${owning_highlight.category} (${owning_highlight.zone})
- Growth Opportunity: ${growth_opportunity.category} (${growth_opportunity.zone})

Generate the 8 narrative pieces separated by |||SECTION|||`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: SYSTEM_PROMPT,
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Parse the |||SECTION||| delimited response
  const sections = responseText.split('|||SECTION|||').map(s => s.trim());
  
  const narrative = {
    overall_zone_narrative: sections[0] || '',
    owning_interpretation: sections[1] || '',
    owning_if_yes: sections[2] || '',
    owning_if_no: sections[3] || '',
    growth_interpretation: sections[4] || '',
    growth_if_yes: sections[5] || '',
    growth_if_no: sections[6] || '',
    closing_reflection: sections[7] || '',
  };

  return new Response(JSON.stringify({ narrative }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## 6.1.1 48-Hour Question Bank

The live tool includes 160 questions organized by Zone × FIRES (8 per combination). Examples:

```typescript
// src/lib/questions/questionBank.ts

export const FORTY_EIGHT_HOUR_QUESTIONS = {
  Exploring: {
    feelings: [
      "When have you seen me handle uncertainty well? What did you notice?",
      "What emotions do you see me move through most naturally?",
      "What do you notice about how I process difficult feelings?",
      "When have you seen me at my most calm or centered?",
      "What emotional patterns have you noticed in how I approach challenges?",
      "How do you see me managing stress or pressure?",
      "What feelings do you think I'm most comfortable expressing?",
      "When have you seen me show emotional courage?",
    ],
    influence: [
      "Where do you see me having impact I might not recognize?",
      "What decisions have you seen me make that showed leadership?",
      "Where do you think I have more influence than I realize?",
      "What have you seen me take ownership of effectively?",
      "Where do you see me stepping up when others don't?",
      "What initiatives have you seen me drive forward?",
      "How do you see me influencing others around me?",
      "Where have you seen me create change?",
    ],
    // ... resilience, ethics, strengths
  },
  Discovering: {
    // Similar structure
  },
  Performing: {
    // Similar structure
  },
  Owning: {
    feelings: [
      "How might I help others develop the emotional awareness I've built?",
      "Where could I share what I've learned about managing feelings?",
      "Who could benefit from understanding how I process emotions?",
      "How might my emotional steadiness help someone else right now?",
      // ...
    ],
    strengths: [
      "Where could I share this strength more intentionally with others?",
      "Who could benefit from learning what I know how to do?",
      "How might I mentor someone in developing this capability?",
      "What would it look like to teach this skill to others?",
      // ...
    ],
    // ... influence, resilience, ethics
  },
};

// Select question based on zone and category
export function get48HourQuestion(zone: Zone, category: FiresElement): string {
  const questions = FORTY_EIGHT_HOUR_QUESTIONS[zone]?.[category] || [];
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex] || "What question would help you gain clarity here?";
}
```

## 6.2 Priority Analyze Function

```typescript
// supabase/functions/priority-analyze/index.ts
// ACTUAL PROMPTS FROM LIVE IMPACT TOOL

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic();

// For Self Practice
const SELF_SYSTEM_PROMPT = `You are an interpretation coach for Priority Builder, helping people see evidence of their own impact.

Generate this JSON:
{
  "evidence": {
    "moment": "[Reflect back the moment. 1-2 sentences.]",
    "role": "[Name what they actually DID. 1-2 sentences.]",
    "impact": "[Make the impact concrete. 1-2 sentences.]"
  },
  "interpretation": "[2-3 sentence reflection that names what this reveals about them]",
  "priorityLine": "[First-person quotable sentence starting with 'I'. 8-15 words. Something they'd want to share.]",
  "firesExtracted": {
    "feelings": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
    "influence": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
    "resilience": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
    "ethics": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
    "strengths": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" }
  },
  "ownershipSignal": "emerging|developing|grounded",
  "claritySignal": "emerging|developing|grounded"
}

SIGNALS:
- emerging: Vague responses, luck-attributed, can't explain how
- developing: Some clarity but gaps in understanding
- grounded: Clear, specific, owns the process

TONE:
- Warm, not clinical
- Curious, not evaluative
- Frame everything as evidence they created
- No advice, no "you should", no prescriptions`;

// For Other Practice (recognizing someone else)
const OTHER_SYSTEM_PROMPT = `You are generating an impact card for someone being recognized.

Generate this JSON:
{
  "priorityLine": "A single powerful sentence (15-25 words) addressed to the recipient...",
  "interpretation": "2-3 sentences explaining the significance of this impact.",
  "impactCard": {
    "actionStatement": "What they did",
    "strengthStatement": "The quality or strength this showed",
    "impactStatement": "How it affected the sender"
  },
  "ownershipSignal": "emerging|developing|grounded",
  "claritySignal": "emerging|developing|grounded"
}

TONE:
- Warm and celebratory
- Specific to what was shared
- Makes the recipient feel seen`;

serve(async (req) => {
  const { type, responses, target_name, prediction_context } = await req.json();
  
  const isSelf = type === 'self';
  
  const userPrompt = isSelf
    ? `
${prediction_context ? `CONTEXT: Working on "${prediction_context}"` : ''}

WHAT WENT WELL:
${responses.what_went_well}

THEIR PART:
${responses.your_part}

IMPACT:
${responses.impact}

Analyze this and return the JSON response.`
    : `
RECOGNIZING: ${target_name}

WHAT THEY DID:
${responses.what_they_did}

WHAT IT SHOWED:
${responses.what_it_showed}

HOW IT AFFECTED SENDER:
${responses.how_it_affected_you}

Generate the impact card JSON.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: isSelf ? SELF_SYSTEM_PROMPT : OTHER_SYSTEM_PROMPT,
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## 6.3 Validation Interpret Function (Proof Tool)

```typescript
// supabase/functions/validation-interpret/index.ts
// This is the existing proven prompt — keep as-is

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are analyzing a reflection for the Finding Good Prove Tool. The user is building proof of how their success happened.

ANALYZE and return a JSON object with:

1. "validationSignal": One of "emerging", "developing", or "grounded"
   - emerging: Vague responses, luck-attributed, can't explain how
   - developing: Some clarity but gaps in understanding process
   - grounded: Clear, specific, owns the process, could teach others

2. "validationInsight": A 1-2 sentence insight that captures what they did well. Start with "You..." and be specific and warm.

3. "scores": {
   "confidence": 1-5 (Do you own the HOW? Can you explain the process vs just got lucky?)
   "clarity": 1-5 (how specific were they?),
   "ownership": 1-5 (did they own their actions?)
}

4. "pattern": {
   "whatWorked": What specifically worked (1-2 sentences),
   "whyItWorked": Why it worked (1-2 sentences),
   "howToRepeat": How to do it again (1-2 sentences)
}

5. "firesExtracted": {
   "feelings": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "influence": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "resilience": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "ethics": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" },
   "strengths": { "present": boolean, "strength": 1-5, "evidence": "quote or summary" }
}

6. "proofLine": A single shareable sentence summarizing their proof. Format: "I [achieved X] by [doing Y]."

Be warm, specific, and focus on what they actually did. Never give advice.`;

serve(async (req) => {
  const { goal_challenge, intensity, responses, fires_focus } = await req.json();

  const userPrompt = `
GOAL/CHALLENGE: ${goal_challenge}
INTENSITY: ${intensity}
${fires_focus ? `FIRES FOCUS: ${fires_focus}` : ''}

RESPONSES:
${Object.entries(responses).map(([key, value]) => `${key}: ${value}`).join('\n')}

Analyze this reflection and return the JSON response.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: SYSTEM_PROMPT,
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

# PART 7: DATABASE OPERATIONS

## 7.1 Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 7.2 Prediction Operations

```typescript
// src/lib/api/predictions.ts

export async function createPrediction(data: {
  title: string;
  description?: string;
  type: 'goal' | 'challenge' | 'experience';
  client_email: string;
}): Promise<Prediction> {
  // Check if user has 3 active predictions
  const { count } = await supabase
    .from('predictions')
    .select('*', { count: 'exact', head: true })
    .eq('client_email', data.client_email)
    .eq('status', 'active');
  
  if (count && count >= 3) {
    throw new Error('Maximum of 3 active predictions allowed');
  }
  
  const { data: prediction, error } = await supabase
    .from('predictions')
    .insert({
      ...data,
      status: 'active',
      priority_count: 0,
      proof_count: 0,
      connection_count: 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return prediction;
}

export async function getActivePredictions(client_email: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('client_email', client_email)
    .eq('status', 'active')
    .order('rank', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function archivePrediction(id: string, history_summary?: string): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      history_summary,
    })
    .eq('id', id);
  
  if (error) throw error;
}

export async function updatePredictionScore(
  id: string,
  score: number,
  fires_map: ZoneBreakdown,
  snapshot_id: string
): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .update({
      current_predictability_score: score,
      current_fires_map: fires_map,
      latest_snapshot_id: snapshot_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  
  if (error) throw error;
}
```

## 7.3 Snapshot Operations

```typescript
// src/lib/api/snapshots.ts

export async function createSnapshot(data: {
  client_email: string;
  prediction_id?: string;
  goal: string;
  success: string;
  fs_answers: FutureStoryAnswers;
  ps_answers: PastStoryAnswers;
  alignment_scores: AlignmentScores;
  future_connections: FutureConnection[];
  past_connections: PastConnection[];
}): Promise<Snapshot> {
  // 1. Create snapshot record
  const { data: snapshot, error: snapshotError } = await supabase
    .from('snapshots')
    .insert({
      client_email: data.client_email,
      prediction_id: data.prediction_id,
      goal: data.goal,
      success: data.success,
      fs_answers: data.fs_answers,
      ps_answers: data.ps_answers,
      alignment_scores: data.alignment_scores,
    })
    .select()
    .single();
  
  if (snapshotError) throw snapshotError;
  
  // 2. Create connections if prediction exists
  if (data.prediction_id) {
    const connections = [
      ...data.future_connections.map(c => ({
        prediction_id: data.prediction_id,
        client_email: data.client_email,
        name: c.name,
        email: c.email,
        relationship: c.relationship,
        support_type: c.support_type,
        working_on_similar: c.working_on_similar,
        source: 'future' as const,
      })),
      ...data.past_connections.map(c => ({
        prediction_id: data.prediction_id,
        client_email: data.client_email,
        name: c.name,
        source: 'past' as const,
        how_they_supported: c.how_they_supported,
        working_on_similar: false,
      })),
    ];
    
    if (connections.length > 0) {
      await supabase.from('prediction_connections').insert(connections);
    }
  }
  
  // 3. Call AI analysis
  const analysis = await supabase.functions.invoke('predict-analyze', {
    body: {
      goal: data.goal,
      success: data.success,
      fs_answers: data.fs_answers,
      ps_answers: data.ps_answers,
      future_connections: data.future_connections,
      past_connections: data.past_connections,
    },
  });
  
  // 4. Calculate scores
  const workingOnSimilarCount = data.future_connections.filter(c => c.working_on_similar).length;
  const connectionCount = data.future_connections.length + data.past_connections.length;
  
  const predictabilityScore = calculatePredictabilityScore(
    analysis.data.ai_clarity_scores,
    analysis.data.ai_confidence_scores,
    data.alignment_scores,
    connectionCount,
    workingOnSimilarCount
  );
  
  // 5. Calculate zones
  const zoneBreakdown = calculateZoneBreakdown(
    analysis.data.ai_confidence_scores,
    data.alignment_scores
  );
  
  const overallZone = calculateOverallZone(
    Object.values(analysis.data.ai_confidence_scores).reduce((a, b) => a + b, 0),
    Object.values(data.alignment_scores).reduce((a, b) => a + b, 0)
  );
  
  // 6. Update snapshot with analysis
  const { data: updatedSnapshot, error: updateError } = await supabase
    .from('snapshots')
    .update({
      ai_clarity_scores: analysis.data.ai_clarity_scores,
      ai_confidence_scores: analysis.data.ai_confidence_scores,
      predictability_score: predictabilityScore,
      overall_zone: overallZone,
      zone_breakdown: zoneBreakdown,
      narrative: analysis.data.narrative,
      connection_score: connectionCount + workingOnSimilarCount,
      growth_opportunity_category: selectGrowthOpportunity(zoneBreakdown, analysis.data.ai_clarity_scores),
      owning_highlight_category: selectOwningHighlight(zoneBreakdown, analysis.data.ai_clarity_scores),
    })
    .eq('id', snapshot.id)
    .select()
    .single();
  
  if (updateError) throw updateError;
  
  // 7. Update prediction if linked
  if (data.prediction_id) {
    await updatePredictionScore(
      data.prediction_id,
      predictabilityScore,
      zoneBreakdown,
      snapshot.id
    );
    
    await supabase
      .from('predictions')
      .update({ connection_count: connectionCount })
      .eq('id', data.prediction_id);
  }
  
  return updatedSnapshot;
}
```

## 7.4 Priority Operations

```typescript
// src/lib/api/priorities.ts

export async function createPriority(data: {
  client_email: string;
  prediction_id?: string;
  responses: PriorityResponses;
  helper_framings?: HelperFramings;
  share_to_feed: boolean;
}): Promise<Priority> {
  // 1. Create priority record
  const { data: priority, error: priorityError } = await supabase
    .from('priorities')
    .insert({
      client_email: data.client_email,
      prediction_id: data.prediction_id,
      type: 'self',
      responses: data.responses,
      helper_framings: data.helper_framings,
      status: 'completed',
      share_to_feed: data.share_to_feed,
    })
    .select()
    .single();
  
  if (priorityError) throw priorityError;
  
  // 2. Call AI analysis
  const analysis = await supabase.functions.invoke('priority-analyze', {
    body: {
      what_went_well: data.responses.what_went_well,
      your_part: data.responses.your_part,
      impact: data.responses.impact,
      prediction_context: data.prediction_id ? await getPredictionTitle(data.prediction_id) : null,
    },
  });
  
  // 3. Update with analysis
  const { data: updatedPriority, error: updateError } = await supabase
    .from('priorities')
    .update({
      fires_extracted: analysis.data.fires_extracted,
      priority_line: analysis.data.priority_line,
      interpretation: analysis.data.interpretation,
      ownership_signal: analysis.data.ownership_signal,
      clarity_signal: analysis.data.clarity_signal,
    })
    .eq('id', priority.id)
    .select()
    .single();
  
  if (updateError) throw updateError;
  
  // 4. Update prediction count if linked
  if (data.prediction_id) {
    await supabase.rpc('increment_priority_count', { pred_id: data.prediction_id });
  }
  
  // 5. Create inspiration share if opted in
  if (data.share_to_feed) {
    await supabase.from('inspiration_shares').insert({
      client_email: data.client_email,
      content_type: 'priority',
      content_id: priority.id,
      prediction_id: data.prediction_id,
      share_text: analysis.data.priority_line,
      fires_extracted: analysis.data.fires_extracted,
    });
  }
  
  return updatedPriority;
}
```

---

# APPENDIX: BUILD CHECKLIST

## Phase 0: Foundation
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind with design tokens
- [ ] Set up Supabase client
- [ ] Build AuthContext with magic link
- [ ] Build all shared UI components
- [ ] Build layout components
- [ ] Configure React Router
- [ ] Create TypeScript types

## Phase 1: Database
- [ ] Run Phase 1 SQL (safe additions)
- [ ] Verify new tables exist
- [ ] Verify new columns added

## Phase 2A: Predict Tool
- [ ] Build PredictHome
- [ ] Build PredictNew (multi-step flow)
- [ ] Build PredictQuick
- [ ] Build PredictResults
- [ ] Deploy predict-analyze edge function
- [ ] Test full flow

## Phase 2B: Priority Builder
- [ ] Build PriorityHome
- [ ] Build PriorityConfirm
- [ ] Build PriorityAsk
- [ ] Build PrioritySendImpact
- [ ] Build PriorityRespond (public)
- [ ] Deploy priority-analyze edge function
- [ ] Test full flow

## Phase 3: Database + Together
- [ ] Run Phase 2 SQL (renames)
- [ ] Build Dashboard
- [ ] Build Campfire
- [ ] Build Connections
- [ ] Build Settings
- [ ] Build navigation (sidebar + bottom nav)

## Phase 4: Proof Tool
- [ ] Migrate components into monorepo
- [ ] Update to shared auth
- [ ] Add prediction selector
- [ ] Add Campfire toggle
- [ ] Remove history page
- [ ] Update table references

## Phase 5: Campfire + Maps
- [ ] Complete share flow
- [ ] Build mutual visibility
- [ ] Add reaction UI
- [ ] Build Integrity Map generation
- [ ] Build Maps archive page

## Phase 6: Polish + Deploy
- [ ] Test all flows
- [ ] Mobile responsive check
- [ ] Accessibility check
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up redirects

---

# APPENDIX B: V1 → V2 CHANGES SUMMARY

## Predict Tool (Snapshot → Predict)

| Aspect | V1 | V2 |
|--------|----|----|
| **Name** | FIRES Snapshot / Alignment Builder | Predict Tool |
| **Questions** | Same 14 questions | Same questions, dynamic [GOAL]/[SUCCESS] replacement |
| **Confidence Ratings** | User self-rates 1-4 per element | **REMOVED** — AI extracts from response quality |
| **Alignment Ratings** | User self-rates 1-4 per element | **KEEP** — reframed as clarity/confidence questions |
| **Connections** | Single text field for support | **EXPANDED** — structured input, up to 4 people, "working on similar" bonus |
| **Output** | Overall Zone + Zone per element | **Predictability Score** (0-100) + Zone per element |
| **48-Hour Question** | Random from bank based on growth zone | **KEEP** |
| **AI Analysis** | Narrative only (8 sections) | Narrative + AI Clarity/Confidence scores |
| **Prediction Entity** | Not first-class | **NEW** — max 3 active, ranked, linked to tools |

## Priority Builder (Impact → Priority)

| Aspect | V1 | V2 |
|--------|----|----|
| **Name** | Impact Multiplier | Priority Builder |
| **Question Structure** | FIRES element × intensity (45+ questions) | **SIMPLIFIED** — 3 universal questions |
| **FIRES Selection** | User chooses element | **REMOVED** — AI extracts automatically |
| **Intensity Selection** | User chooses light/balanced/deeper | **REMOVED** |
| **Timeframe Selection** | User chooses | **REMOVED** |
| **Helper Framings** | Not present | **NEW** — clickable inspiration chips |
| **Prediction Link** | None | **NEW** — optional link to active prediction |
| **Campfire Sharing** | None | **NEW** — opt-in share to feed |
| **Ask Flow** | None | **NEW** — ask someone what mattered to them |
| **Output** | Integrity Line + signals | Priority Line + FIRES extracted + signals |

## Proof Tool (Validation → Proof)

| Aspect | V1 | V2 |
|--------|----|----|
| **Name** | Finding Good Validation | Proof Tool |
| **Questions** | 45 questions (5 FIRES × 3 intensity × 3 each) | **SAME** |
| **Modes** | Self, Request, Send to Others | **SAME** |
| **Weekly Pulse** | Yes | **SAME** |
| **Prediction Link** | None | **NEW** — optional link to active prediction |
| **Campfire Sharing** | None | **NEW** — opt-in share to feed |
| **History** | In-app history page | **MOVED** — history now in Together dashboard |

## Dashboard (New: Together)

| Aspect | V1 | V2 |
|--------|----|----|
| **Name** | Coach Dashboard | Together (user) + Coach Dashboard |
| **User View** | Limited (My Map PDF only) | **FULL DASHBOARD** — predictions, activity, Campfire, connections |
| **Predictions** | Not visible | **CENTRAL** — primary organizing principle |
| **Campfire** | None | **NEW** — inspiration feed from connections |
| **Connections** | None | **NEW** — see who you've engaged |
| **Integrity Map** | Weekly PDF | **ENHANCED** — richer content, connection data, trends |
| **Coach Features** | All in one dashboard | **SAME** — client view restructured around predictions |

## New Concepts in V2

| Concept | Description |
|---------|-------------|
| **Prediction** | First-class entity (goal/challenge/experience), max 3 active |
| **Predictability Score** | 0-100 aggregate replacing Overall Zone |
| **Campfire** | Social inspiration feed (not "social media" — intimate, no metrics obsession) |
| **Connections** | People linked through sharing and asking |
| **Mutual Visibility** | Two-way connection required to see each other's shares |
| **Integrity Map** | Weekly synthesis PDF with predictions, activity, connections, trends |
| **Helper Framings** | Inspiration chips that track what inspired responses |

## Database Changes

| Change Type | Details |
|-------------|---------|
| **New Tables** | `predictions`, `prediction_connections`, `quick_predictions`, `inspiration_shares`, `share_visibility`, `reactions` (v2.0.5), `comments` (v2.1) |
| **Renamed Tables** | `predictions` → `outcome_predictions`, `impact_verifications` → `priorities` |
| **New Columns** | `prediction_id` on snapshots/priorities/validations, `share_to_feed` on priorities/validations, AI score columns on snapshots |

## Edge Function Changes

| Function | V1 | V2 |
|----------|----|----|
| `generate-narrative` | 8 sections via `\|\|\|SECTION\|\|\|` | **SAME** + may add AI scores |
| `generate-interpretation` | Self and Other prompts | **RENAMED** to `priority-analyze`, same structure |
| `validation-interpret` | Full analysis with scores/pattern/FIRES | **SAME** |
| `predict-analyze` | None | **NEW** — or enhance existing narrative function |

---

**End of Complete Specifications**

*This document contains everything needed to build Finding Good V2. No gaps, no guessing.*

*Updated: January 11, 2026*  
*Contains: Exact questions from V1, AI prompts from edge functions, V2 architectural decisions*
