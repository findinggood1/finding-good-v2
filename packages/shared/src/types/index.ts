// FIRES Framework Types
export type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths'

export type Zone = 'Exploring' | 'Discovering' | 'Performing' | 'Owning'

export type ValidationSignal = 'emerging' | 'developing' | 'grounded'

// Score Types
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

// Prediction Types
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
