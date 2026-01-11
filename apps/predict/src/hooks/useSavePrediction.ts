import { useState, useCallback } from 'react'
import {
  getSupabase,
  useAuth,
  calculateZoneBreakdown,
  calculatePredictabilityScore,
  selectGrowthOpportunity,
  select48HourQuestion,
  generateGrowthOpportunityText,
  type AlignmentScores,
  type ZoneBreakdown,
} from '@finding-good/shared'
import type { PredictionFormData } from '../types'

interface SaveResult {
  success: boolean
  predictionId?: string
  error?: string
}

interface AIInput {
  snapshotId: string
  goal: string
  success: string | null
  fs_answers: Record<string, string>
  ps_answers: Record<string, string>
  zone_scores: ZoneBreakdown
  growth_opportunity: string
  alignment_scores: AlignmentScores
  connections: {
    future: Array<{ name: string; involvement_type?: string }>
    past: Array<{ name: string; how_involved?: string }>
  }
}

/**
 * Call the AI narrative edge function and update the snapshot
 * This runs asynchronously after the main save completes
 */
async function generateAINarrative(input: AIInput): Promise<void> {
  const supabase = getSupabase()

  // Get the edge function URL from environment or construct from Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const edgeFunctionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL as string | undefined

  const functionUrl = edgeFunctionUrl || `${supabaseUrl}/functions/v1/predict-analyze`

  console.log('[generateAINarrative] Calling edge function:', functionUrl)

  try {
    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        goal: input.goal,
        success: input.success,
        fs_answers: input.fs_answers,
        ps_answers: input.ps_answers,
        zone_scores: input.zone_scores,
        growth_opportunity: input.growth_opportunity,
        alignment_scores: input.alignment_scores,
        connections: input.connections,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Edge function error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (!result.success || !result.narrative) {
      throw new Error(result.error || 'No narrative returned')
    }

    console.log('[generateAINarrative] Received narrative:', result.narrative)

    // Update the snapshot with the AI narrative
    const { error: updateError } = await supabase
      .from('snapshots')
      .update({
        narrative: JSON.stringify(result.narrative),
      })
      .eq('id', input.snapshotId)

    if (updateError) {
      throw new Error(`Failed to save narrative: ${updateError.message}`)
    }

    console.log('[generateAINarrative] Narrative saved successfully')
  } catch (error) {
    console.error('[generateAINarrative] Error:', error)
    // Don't throw - we don't want to fail the whole save
  }
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
            client_email: userEmail,
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
            client_email: userEmail,
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

      // 4. Calculate AI values
      const alignmentScores: AlignmentScores = {
        q1: data.alignment.q1_clarity,
        q2: data.alignment.q2_motivation,
        q3: data.alignment.q3_confidence,
        q4: data.alignment.q4_support,
        q5: data.alignment.q5_obstacles,
        q6: data.alignment.q6_commitment,
      }

      // Count total connections
      const futureConnectionCount = data.future_connections.filter(c => c.name.trim()).length
      const pastConnectionCount = data.past_connections.filter(c => c.name.trim()).length
      const totalConnectionCount = futureConnectionCount + pastConnectionCount

      // Calculate zones and scores
      const zoneBreakdown = calculateZoneBreakdown(alignmentScores)
      const predictabilityScore = calculatePredictabilityScore(alignmentScores, totalConnectionCount)
      const growthElement = selectGrowthOpportunity(zoneBreakdown)
      const growthZone = zoneBreakdown[growthElement]
      const growthOpportunity = generateGrowthOpportunityText(growthElement, growthZone)
      const question48hr = select48HourQuestion(growthElement, growthZone)

      // Prepare snapshot data
      const fsAnswers = {
        fs1: data.future_story.fs1_goal,
        fs2: data.future_story.fs2_feelings,
        fs3: data.future_story.fs3_influence,
        fs4: data.future_story.fs4_resilience,
        fs5: data.future_story.fs5_ethics,
        fs6: data.future_story.fs6_strengths,
      }
      const psAnswers = {
        ps1: data.past_story.ps1_success,
        ps2: data.past_story.ps2_feelings,
        ps3: data.past_story.ps3_influence,
        ps4: data.past_story.ps4_resilience,
        ps5: data.past_story.ps5_ethics,
        ps6: data.past_story.ps6_strengths,
      }
      const goal = data.future_story.fs1_goal || data.title
      const success = data.past_story.ps1_success || null

      // 5. Create initial snapshot with calculated values
      const { data: snapshot, error: snapshotError } = await supabase
        .from('snapshots')
        .insert({
          prediction_id: predictionId,
          client_email: userEmail,
          goal,
          success,
          fs_answers: fsAnswers,
          ps_answers: psAnswers,
          alignment_scores: alignmentScores,
          zone_scores: zoneBreakdown,
          predictability_score: predictabilityScore,
          growth_opportunity: growthOpportunity,
          question_48hr: question48hr,
        })
        .select('id')
        .single()

      if (snapshotError) {
        console.error('Failed to save snapshot:', snapshotError)
      }

      // 6. Call AI narrative edge function (non-blocking)
      if (snapshot?.id) {
        // Prepare connections for the AI
        const futureConns = data.future_connections
          .filter(c => c.name.trim())
          .map(c => ({ name: c.name, involvement_type: c.support_type }))
        const pastConns = data.past_connections
          .filter(c => c.name.trim())
          .map(c => ({ name: c.name, how_involved: c.how_they_supported }))

        // Call edge function asynchronously (don't block the save)
        generateAINarrative({
          snapshotId: snapshot.id,
          goal,
          success,
          fs_answers: fsAnswers,
          ps_answers: psAnswers,
          zone_scores: zoneBreakdown,
          growth_opportunity: growthOpportunity,
          alignment_scores: alignmentScores,
          connections: {
            future: futureConns,
            past: pastConns,
          },
        }).catch(err => {
          console.error('AI narrative generation failed:', err)
        })
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
