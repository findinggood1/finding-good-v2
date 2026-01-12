import { useState, useCallback } from 'react'
import {
  getSupabase,
  useAuth,
  selectGrowthOpportunity,
  select48HourQuestion,
  generateGrowthOpportunityText,
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
  alignment_scores: Record<string, number>
  confidence_ratings: Record<string, number>
  alignment_ratings: Record<string, number>
  connections: {
    future: Array<{ name: string; involvement_type?: string }>
    past: Array<{ name: string; how_involved?: string }>
  }
}

/**
 * Calculate zone based on confidence + alignment
 * Combined score of 2-8 maps to zone
 */
function calculateZone(confidence: number, alignment: number): string {
  const combined = (confidence || 0) + (alignment || 0)
  if (combined <= 2) return 'Exploring'
  if (combined <= 4) return 'Discovering'
  if (combined <= 6) return 'Performing'
  return 'Owning'
}

/**
 * Calculate zone breakdown from confidence and alignment ratings
 */
function calculateZoneBreakdownFromRatings(
  confidenceRatings: Record<string, number>,
  alignmentRatings: Record<string, number>
): ZoneBreakdown {
  return {
    feelings: calculateZone(confidenceRatings.fs2, alignmentRatings.ps2),
    influence: calculateZone(confidenceRatings.fs3, alignmentRatings.ps3),
    resilience: calculateZone(confidenceRatings.fs4, alignmentRatings.ps4),
    ethics: calculateZone(confidenceRatings.fs5, alignmentRatings.ps5),
    strengths: calculateZone(confidenceRatings.fs6, alignmentRatings.ps6),
  }
}

/**
 * Calculate predictability score from ratings and connections
 */
function calculatePredictabilityFromRatings(
  confidenceRatings: Record<string, number>,
  alignmentRatings: Record<string, number>,
  connectionCount: number
): number {
  // Sum all confidence ratings (6 questions, max 4 each = 24)
  const confidenceSum = Object.values(confidenceRatings).reduce((sum, val) => sum + (val || 0), 0)
  
  // Sum all alignment ratings (6 questions, max 4 each = 24)
  const alignmentSum = Object.values(alignmentRatings).reduce((sum, val) => sum + (val || 0), 0)
  
  // Combined base score (max 48)
  const baseScore = confidenceSum + alignmentSum
  
  // Normalize to 0-84 range (leaving room for connection bonus)
  const normalizedBase = Math.round((baseScore / 48) * 84)
  
  // Connection bonus: 2 points per connection, max 8 connections = 16 points
  const connectionBonus = Math.min(connectionCount * 2, 16)
  
  // Total score (max 100)
  return Math.min(normalizedBase + connectionBonus, 100)
}

/**
 * Call the AI narrative edge function and update the snapshot
 * This runs asynchronously after the main save completes
 */
async function generateAINarrative(input: AIInput): Promise<void> {
  const supabase = getSupabase()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const edgeFunctionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL as string | undefined
  const functionUrl = edgeFunctionUrl || `${supabaseUrl}/functions/v1/predict-analyze`

  console.log('[generateAINarrative] Calling edge function:', functionUrl)

  try {
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
        confidence_ratings: input.confidence_ratings,
        alignment_ratings: input.alignment_ratings,
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

      // 4. Extract ratings from form data
      const confidenceRatings: Record<string, number> = {
        fs1: data.future_story.fs1_confidence,
        fs2: data.future_story.fs2_confidence,
        fs3: data.future_story.fs3_confidence,
        fs4: data.future_story.fs4_confidence,
        fs5: data.future_story.fs5_confidence,
        fs6: data.future_story.fs6_confidence,
      }

      const alignmentRatings: Record<string, number> = {
        ps1: data.past_story.ps1_alignment,
        ps2: data.past_story.ps2_alignment,
        ps3: data.past_story.ps3_alignment,
        ps4: data.past_story.ps4_alignment,
        ps5: data.past_story.ps5_alignment,
        ps6: data.past_story.ps6_alignment,
      }

      // Count total connections
      const futureConnectionCount = data.future_connections.filter(c => c.name.trim()).length
      const pastConnectionCount = data.past_connections.filter(c => c.name.trim()).length
      const totalConnectionCount = futureConnectionCount + pastConnectionCount

      // Calculate zones and scores from new ratings
      const zoneBreakdown = calculateZoneBreakdownFromRatings(confidenceRatings, alignmentRatings)
      const predictabilityScore = calculatePredictabilityFromRatings(confidenceRatings, alignmentRatings, totalConnectionCount)
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

      // Legacy alignment scores (for backwards compatibility)
      // Map new ratings to old structure
      const legacyAlignmentScores = {
        q1: alignmentRatings.ps1 || 0,
        q2: alignmentRatings.ps2 || 0,
        q3: alignmentRatings.ps3 || 0,
        q4: alignmentRatings.ps4 || 0,
        q5: alignmentRatings.ps5 || 0,
        q6: alignmentRatings.ps6 || 0,
      }

      // 5. Create snapshot with calculated values
      const { data: snapshot, error: snapshotError } = await supabase
        .from('snapshots')
        .insert({
          prediction_id: predictionId,
          client_email: userEmail,
          goal,
          success,
          fs_answers: fsAnswers,
          ps_answers: psAnswers,
          alignment_scores: legacyAlignmentScores,
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
        const futureConns = data.future_connections
          .filter(c => c.name.trim())
          .map(c => ({ name: c.name, involvement_type: c.support_type }))
        const pastConns = data.past_connections
          .filter(c => c.name.trim())
          .map(c => ({ name: c.name, how_involved: c.how_they_supported }))

        generateAINarrative({
          snapshotId: snapshot.id,
          goal,
          success,
          fs_answers: fsAnswers,
          ps_answers: psAnswers,
          zone_scores: zoneBreakdown,
          growth_opportunity: growthOpportunity,
          alignment_scores: legacyAlignmentScores,
          confidence_ratings: confidenceRatings,
          alignment_ratings: alignmentRatings,
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
