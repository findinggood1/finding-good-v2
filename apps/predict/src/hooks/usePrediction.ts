import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@finding-good/shared'

interface Prediction {
  id: string
  client_email: string
  title: string
  description: string | null
  type: string
  status: string
  created_at: string
  updated_at: string
}

interface Snapshot {
  id: string
  prediction_id: string
  client_email: string
  goal: string | null
  success: string | null
  fs_answers: Record<string, string> | null
  ps_answers: Record<string, string> | null
  alignment_scores: Record<string, number> | null
  zone_scores: Record<string, string> | null
  predictability_score: number | null
  growth_opportunity: string | null
  question_48hr: string | null
  narrative: string | null
  created_at: string
}

// New narrative format (v3)
export interface AIResponse {
  // Core assessments
  clarity_level?: 'strong' | 'building' | 'emerging'
  clarity_rationale?: string
  confidence_level?: 'strong' | 'building' | 'emerging'
  confidence_rationale?: string
  alignment_level?: 'strong' | 'building' | 'emerging'
  alignment_rationale?: string
  
  // Pattern insight
  pattern_insight?: string
  
  // Edge insight
  edge_insight?: string
  edge_question?: string
  
  // Network
  network_insight?: string
  
  // Legacy format support (v1/v2)
  future_story_insight?: string
  past_story_insight?: string
  alignment_insight?: string
  growth_opportunity_text?: string
  strengths_recognition?: string
  connection_insight?: string
  next_steps?: string[]
  focus_area_insight?: string
  strengths_insight?: string
  reflection_prompts?: string[]
}

interface Connection {
  id: string
  prediction_id: string
  name: string
  relationship: string | null
  involvement_type: string | null
  how_involved: string | null
  email: string | null
  working_on_similar: boolean | null
  connection_time: 'future' | 'past'
}

interface UsePredictionResult {
  prediction: Prediction | null
  snapshot: Snapshot | null
  narrative: AIResponse | null
  connections: Connection[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePrediction(predictionId: string | undefined): UsePredictionResult {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!predictionId) {
      setLoading(false)
      setError('No prediction ID provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      console.log('[usePrediction] Fetching prediction:', predictionId)

      // Fetch prediction
      const { data: predictionData, error: predictionError } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', predictionId)
        .single()

      console.log('[usePrediction] Prediction result:', { predictionData, predictionError })

      if (predictionError) {
        throw new Error(`Failed to fetch prediction: ${predictionError.message}`)
      }

      setPrediction(predictionData)

      // Fetch snapshot
      const { data: snapshotData, error: snapshotError } = await supabase
        .from('snapshots')
        .select('*')
        .eq('prediction_id', predictionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('[usePrediction] Snapshot result:', { snapshotData, snapshotError })

      if (snapshotError) {
        console.error('Failed to fetch snapshot:', snapshotError)
      }
      setSnapshot(snapshotData || null)

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('prediction_connections')
        .select('*')
        .eq('prediction_id', predictionId)

      console.log('[usePrediction] Connections result:', { connectionsData, connectionsError })

      if (connectionsError) {
        console.error('Failed to fetch connections:', connectionsError)
      }
      setConnections(connectionsData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prediction')
      setPrediction(null)
      setSnapshot(null)
      setConnections([])
    } finally {
      setLoading(false)
    }
  }, [predictionId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Parse AI narrative from JSON string
  const narrative: AIResponse | null = snapshot?.narrative
    ? (() => {
        try {
          return JSON.parse(snapshot.narrative) as AIResponse
        } catch {
          console.error('Failed to parse AI narrative')
          return null
        }
      })()
    : null

  return {
    prediction,
    snapshot,
    narrative,
    connections,
    loading,
    error,
    refetch: fetchData,
  }
}
