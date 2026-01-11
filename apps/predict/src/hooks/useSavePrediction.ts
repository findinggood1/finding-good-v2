import { useState, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { PredictionFormData } from '../types'

interface SaveResult {
  success: boolean
  predictionId?: string
  error?: string
}

interface UseSavePredictionResult {
  save: (data: PredictionFormData) => Promise<SaveResult>
  saving: boolean
  error: string | null
}

export function useSavePrediction(): UseSavePredictionResult {
  const { userEmail } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async (data: PredictionFormData): Promise<SaveResult> => {
    if (!userEmail) {
      return { success: false, error: 'Not authenticated' }
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // 1. Save prediction
      const { data: prediction, error: predictionError } = await supabase
        .from('predictions')
        .insert({
          client_email: userEmail,
          title: data.title,
          description: data.description || null,
          type: data.type,
          status: 'active',
        })
        .select('id')
        .single()

      if (predictionError) {
        throw new Error(`Failed to save prediction: ${predictionError.message}`)
      }

      const predictionId = prediction.id

      // 2. Save future connections
      if (data.future_connections.length > 0) {
        const futureConnections = data.future_connections
          .filter(conn => conn.name.trim())
          .map(conn => ({
            prediction_id: predictionId,
            name: conn.name,
            relationship: conn.relationship || null,
            involvement_type: conn.support_type || null,
            email: conn.email || null,
            working_on_similar: conn.working_on_similar,
            connection_time: 'future',
          }))

        if (futureConnections.length > 0) {
          const { error: futureConnError } = await supabase
            .from('prediction_connections')
            .insert(futureConnections)

          if (futureConnError) {
            console.error('Failed to save future connections:', futureConnError)
          }
        }
      }

      // 3. Save past connections
      if (data.past_connections.length > 0) {
        const pastConnections = data.past_connections
          .filter(conn => conn.name.trim())
          .map(conn => ({
            prediction_id: predictionId,
            name: conn.name,
            how_involved: conn.how_they_supported || null,
            connection_time: 'past',
          }))

        if (pastConnections.length > 0) {
          const { error: pastConnError } = await supabase
            .from('prediction_connections')
            .insert(pastConnections)

          if (pastConnError) {
            console.error('Failed to save past connections:', pastConnError)
          }
        }
      }

      // 4. Create initial snapshot
      const { error: snapshotError } = await supabase
        .from('snapshots')
        .insert({
          prediction_id: predictionId,
          client_email: userEmail,
          goal: data.future_story.fs1_goal || data.title,
          success: data.past_story.ps1_success || null,
          fs_answers: {
            fs1: data.future_story.fs1_goal,
            fs2: data.future_story.fs2_feelings,
            fs3: data.future_story.fs3_influence,
            fs4: data.future_story.fs4_resilience,
            fs5: data.future_story.fs5_ethics,
            fs6: data.future_story.fs6_strengths,
          },
          ps_answers: {
            ps1: data.past_story.ps1_success,
            ps2: data.past_story.ps2_feelings,
            ps3: data.past_story.ps3_influence,
            ps4: data.past_story.ps4_resilience,
            ps5: data.past_story.ps5_ethics,
            ps6: data.past_story.ps6_strengths,
          },
          alignment_scores: {
            q1: data.alignment.q1_clarity,
            q2: data.alignment.q2_motivation,
            q3: data.alignment.q3_confidence,
            q4: data.alignment.q4_support,
            q5: data.alignment.q5_obstacles,
            q6: data.alignment.q6_commitment,
          },
        })

      if (snapshotError) {
        console.error('Failed to save snapshot:', snapshotError)
      }

      setSaving(false)
      return { success: true, predictionId }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prediction'
      setError(errorMessage)
      setSaving(false)
      return { success: false, error: errorMessage }
    }
  }, [userEmail])

  return { save, saving, error }
}
