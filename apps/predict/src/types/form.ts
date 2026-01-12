export type PredictionType = 'goal' | 'challenge' | 'experience'

export interface FutureConnection {
  name: string
  relationship: string
  support_type: string
  email: string
  working_on_similar: boolean
}

export interface PastConnection {
  name: string
  how_they_supported: string
}

export interface FutureStory {
  // Text responses
  fs1_goal: string
  fs2_feelings: string
  fs3_influence: string
  fs4_resilience: string
  fs5_ethics: string
  fs6_strengths: string
  // Confidence ratings (1-4, 0 = not rated)
  fs1_confidence: number
  fs2_confidence: number
  fs3_confidence: number
  fs4_confidence: number
  fs5_confidence: number
  fs6_confidence: number
}

export interface PastStory {
  // Text responses
  ps1_success: string
  ps2_feelings: string
  ps3_influence: string
  ps4_resilience: string
  ps5_ethics: string
  ps6_strengths: string
  // Alignment ratings (1-4, 0 = not rated)
  ps1_alignment: number
  ps2_alignment: number
  ps3_alignment: number
  ps4_alignment: number
  ps5_alignment: number
  ps6_alignment: number
}

// Legacy - keeping for backwards compatibility but may be removed
export interface AlignmentAssessment {
  q1_clarity: number
  q2_motivation: number
  q3_confidence: number
  q4_support: number
  q5_obstacles: number
  q6_commitment: number
}

export interface PredictionFormData {
  // Step 1: Basic Info
  title: string
  type: PredictionType
  description: string

  // Step 2: Future Story (with confidence ratings)
  future_story: FutureStory

  // Step 3: Future Connections
  future_connections: FutureConnection[]

  // Step 4: Past Story (with alignment ratings)
  past_story: PastStory

  // Step 5: Past Connections
  past_connections: PastConnection[]

  // Step 6: Alignment (legacy - may be removed)
  alignment: AlignmentAssessment
}

export const INITIAL_FORM_DATA: PredictionFormData = {
  title: '',
  type: 'goal',
  description: '',
  future_story: {
    fs1_goal: '',
    fs2_feelings: '',
    fs3_influence: '',
    fs4_resilience: '',
    fs5_ethics: '',
    fs6_strengths: '',
    fs1_confidence: 0,
    fs2_confidence: 0,
    fs3_confidence: 0,
    fs4_confidence: 0,
    fs5_confidence: 0,
    fs6_confidence: 0,
  },
  future_connections: [],
  past_story: {
    ps1_success: '',
    ps2_feelings: '',
    ps3_influence: '',
    ps4_resilience: '',
    ps5_ethics: '',
    ps6_strengths: '',
    ps1_alignment: 0,
    ps2_alignment: 0,
    ps3_alignment: 0,
    ps4_alignment: 0,
    ps5_alignment: 0,
    ps6_alignment: 0,
  },
  past_connections: [],
  alignment: {
    q1_clarity: 0,
    q2_motivation: 0,
    q3_confidence: 0,
    q4_support: 0,
    q5_obstacles: 0,
    q6_commitment: 0,
  },
}

export const STEP_TITLES = [
  'Basic Info',
  'Future Story',
  'Future Connections',
  'Past Story',
  'Past Connections',
  'Review',
] as const

export const TOTAL_STEPS = 6
