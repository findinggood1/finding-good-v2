// ============================================
// FIRES Framework Core Types
// ============================================

export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths'

export type Zone = 'Exploring' | 'Discovering' | 'Performing' | 'Owning'

export type ValidationSignal = 'emerging' | 'developing' | 'grounded'

// ============================================
// V4 Enums / Type Aliases
// ============================================

export type CoachingRelationshipStatus =
  | 'pending_coach_invite'
  | 'pending_client_request'
  | 'active'
  | 'paused'
  | 'completed'

export type ActivityStatus = 'pending' | 'evidence_found' | 'resolved' | 'deprioritized'

export type ActivitySource = 'focus' | 'session' | 'transcript'

export type ActivityVisibility = 'shared' | 'coach_only'

export type ContentType = 'priority' | 'proof' | 'predict'

export type CircleRelationshipType = 'sent_to' | 'received_from' | 'mutual'

export type FocusEndReason = 'paused' | 'evolved' | 'completed'

export type InspireRequestStatus = 'pending' | 'acknowledged'

export type ClientStatus = 'active' | 'moderate' | 'quiet' | 'needs_outreach'

export type UserRole = 'user' | 'client' | 'coach' | 'admin'

// ============================================
// Score Types (existing)
// ============================================

export interface FiresScore {
  present: boolean
  strength: number
  evidence: string
}

export interface ZoneBreakdown {
  feelings: Zone
  influence: Zone
  resilience: Zone
  ethics: Zone
  strengths: Zone
}

// ============================================
// Focus Types (V4)
// ============================================

export interface FocusItem {
  name: string
  linked_goal_id?: string
  order: number
}

export interface FocusScore {
  focus_name: string
  completed: boolean
  engagement?: number | null
  emerged_text?: string | null
}

// ============================================
// Prediction Types (updated for V4)
// ============================================

export interface Prediction {
  id: string
  client_email: string
  title: string
  description: string
  type: string
  status: string
  rank: number
  scores: Record<FiresElement, FiresScore>
  counts: Record<Zone, number>
  // V4 additions
  what_matters_most?: string | null
  share_to_feed?: boolean
  created_at: string
  updated_at: string
}

export interface PredictionConnection {
  id: string
  source_prediction_id: string
  target_prediction_id: string
  connection_type: string
  strength: number
  created_at: string
}

// ============================================
// Permission Types (V4)
// ============================================

export interface Permission {
  id: string
  client_email: string
  prediction_id?: string | null
  practice?: string | null
  permission?: string | null
  focus: FocusItem[]
  created_at: string
  updated_at: string
}

// ============================================
// Daily Check-in Types (V4)
// ============================================

export interface DailyCheckin {
  id: string
  client_email: string
  permission_id?: string | null
  check_date: string
  focus_scores: FocusScore[]
  created_at: string
}

// ============================================
// Coaching Relationship Types (V4)
// ============================================

export interface CoachingRelationship {
  id: string
  coach_id: string
  client_email: string
  status: CoachingRelationshipStatus
  started_at?: string | null
  ended_at?: string | null
  invite_code?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Weekly Snapshot Types (V4)
// ============================================

export interface WeeklySnapshot {
  id: string
  client_email: string
  coach_id?: string | null
  week_number?: number | null
  week_start: string
  week_end: string
  activity_counts?: Record<string, number> | null
  themes?: string[] | null
  language_patterns?: string[] | null
  fires_signals?: Record<FiresElement, string[]> | null
  exchanges?: unknown[] | null
  open_threads?: string[] | null
  coaching_questions?: string[] | null
  created_at: string
}

// ============================================
// Rolling Aggregate Types (V4)
// ============================================

export interface RollingAggregate {
  id: string
  client_email: string
  coach_id?: string | null
  coaching_start?: string | null
  total_weeks: number
  permission_evolution?: unknown[] | null
  persistent_themes?: string[] | null
  fires_trajectory?: Record<FiresElement, unknown[]> | null
  relationship_map?: unknown | null
  questions_explored?: string[] | null
  breakthroughs?: string[] | null
  updated_at: string
}

// ============================================
// Agreed Activity Types (V4)
// ============================================

export interface AgreedActivity {
  id: string
  client_email: string
  coach_id?: string | null
  source: ActivitySource
  activity_text: string
  status: ActivityStatus
  evidence_entries?: unknown[] | null
  coach_notes?: string | null
  visibility: ActivityVisibility
  created_at: string
  updated_at: string
}

// ============================================
// Session Transcript Types (V4)
// ============================================

export interface SessionTranscript {
  id: string
  client_email: string
  coach_id?: string | null
  session_date?: string | null
  transcript_text?: string | null
  transcript_source?: string | null
  extracted_themes?: string[] | null
  created_at: string
}

// ============================================
// Focus History Types (V4)
// ============================================

export interface FocusHistory {
  id: string
  client_email: string
  focus_name: string
  started_at: string
  ended_at?: string | null
  evolved_into?: string | null
  reason?: FocusEndReason | null
}

// ============================================
// Circle / Social Types (V4)
// ============================================

export interface UserCircle {
  id: string
  user_email: string
  circle_member_email: string
  relationship_type: CircleRelationshipType
  created_at: string
}

export interface InspirationShare {
  id: string
  client_email: string
  content_type: ContentType
  content_id: string
  share_text?: string | null
  recognized_count: number
  shared_at: string
}

export interface ShareRecognition {
  id: string
  share_id: string
  recognizer_email: string
  created_at: string
}

export interface InspireRequest {
  id: string
  requester_email: string
  recipient_email: string
  message?: string | null
  status: InspireRequestStatus
  created_at: string
}

// ============================================
// Chat Types (V4)
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatConversation {
  id: string
  client_email: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

// ============================================
// Client Types (V4 additions)
// ============================================

export interface Client {
  id: string
  email: string
  name?: string | null
  calendar_link?: string | null
  created_at: string
  updated_at?: string | null
}

// ============================================
// Composite / UI Types
// ============================================

export interface ClientEngagementSummary {
  client_email: string
  client_name?: string | null
  status: ClientStatus
  checkins_this_week: number
  avg_engagement: number
  last_checkin_date?: string | null
  current_permission?: string | null
  focus_count: number
}

export interface CampfireItem {
  id: string
  type: ContentType
  author_email: string
  author_name?: string | null
  content: string
  fires_element?: FiresElement | null
  recognized_count: number
  has_recognized: boolean
  shared_at: string
}

export type BridgeTrigger = 'highest' | 'lowest' | 'nothing' | 'emerged'

export interface BridgeQuestion {
  trigger: BridgeTrigger
  focus_name?: string | null
  question: string
  follow_up?: string | null
}

export interface CircleMember {
  email: string
  name?: string | null
  relationship_type: CircleRelationshipType
  last_share_date?: string | null
  has_checked_in_today: boolean
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate client engagement status based on check-in frequency and scores
 */
export function calculateClientStatus(
  checkinsThisWeek: number,
  avgEngagement: number
): ClientStatus {
  // Active: 5+ check-ins with good engagement
  if (checkinsThisWeek >= 5 && avgEngagement >= 3) {
    return 'active'
  }
  // Moderate: 3-4 check-ins or lower engagement
  if (checkinsThisWeek >= 3 || (checkinsThisWeek >= 1 && avgEngagement >= 2)) {
    return 'moderate'
  }
  // Quiet: 1-2 check-ins
  if (checkinsThisWeek >= 1) {
    return 'quiet'
  }
  // Needs outreach: No check-ins
  return 'needs_outreach'
}

/**
 * Generate a bridge question based on focus scores from a daily check-in
 */
export function getBridgeQuestion(focusScores: FocusScore[]): BridgeQuestion | null {
  if (!focusScores || focusScores.length === 0) {
    return null
  }

  // Check for emerged text first (something new surfaced)
  const emerged = focusScores.find(fs => fs.emerged_text)
  if (emerged) {
    return {
      trigger: 'emerged',
      focus_name: emerged.focus_name,
      question: `You mentioned "${emerged.emerged_text}" emerged today. What made that surface?`,
      follow_up: 'How does this connect to what matters most to you?'
    }
  }

  // Check if nothing was completed
  const completedCount = focusScores.filter(fs => fs.completed).length
  if (completedCount === 0) {
    return {
      trigger: 'nothing',
      question: 'None of your focus areas got attention today. What got in the way?',
      follow_up: 'What would need to shift for tomorrow to be different?'
    }
  }

  // Find highest and lowest engagement scores
  const withEngagement = focusScores.filter(fs => fs.engagement != null)
  if (withEngagement.length === 0) {
    return null
  }

  const sorted = [...withEngagement].sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0))
  const highest = sorted[0]!
  const lowest = sorted[sorted.length - 1]!

  // If there's meaningful variance, ask about the highest
  if (highest.engagement !== lowest.engagement && highest.engagement != null && highest.engagement >= 4) {
    return {
      trigger: 'highest',
      focus_name: highest.focus_name,
      question: `"${highest.focus_name}" had strong engagement today. What made that flow?`,
      follow_up: 'How might you bring more of that to other areas?'
    }
  }

  // Otherwise ask about the lowest
  if (lowest.engagement != null && lowest.engagement <= 2) {
    return {
      trigger: 'lowest',
      focus_name: lowest.focus_name,
      question: `"${lowest.focus_name}" felt harder today. What's making it difficult?`,
      follow_up: 'Is this still the right focus, or has something shifted?'
    }
  }

  return null
}
