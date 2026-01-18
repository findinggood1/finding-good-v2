import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface TrajectoryPoint {
  date: string
  predictability: number
  clarity: number
  confidence: number
  connection: number
}

export function useTrajectory() {
  const { user } = useAuth()
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setTrajectory([])
      setLoading(false)
      return
    }

    const fetchTrajectory = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email

        // Fetch all snapshots for this user, ordered by date
        const { data: snapshots, error: snapshotsError } = await supabase
          .from('snapshots')
          .select('id, created_at, predictability_score, total_confidence, total_alignment, connection_score, ai_clarity_scores, ai_confidence_scores')
          .eq('client_email', userEmail)
          .order('created_at', { ascending: true })

        if (snapshotsError) {
          throw snapshotsError
        }

        // Transform snapshots into trajectory points
        const points: TrajectoryPoint[] = (snapshots ?? []).map(s => {
          // Extract clarity and confidence from AI scores or total scores
          const aiClarity = s.ai_clarity_scores as Record<string, number> | null
          const aiConfidence = s.ai_confidence_scores as Record<string, number> | null

          // Calculate averages from AI scores if available
          let clarity = 0
          let confidence = 0

          if (aiClarity && Object.keys(aiClarity).length > 0) {
            const clarityValues = Object.values(aiClarity)
            clarity = Math.round(clarityValues.reduce((a, b) => a + b, 0) / clarityValues.length)
          } else if (s.total_alignment) {
            // Fallback to total_alignment normalized to 0-100
            clarity = Math.round((s.total_alignment / 30) * 100)
          }

          if (aiConfidence && Object.keys(aiConfidence).length > 0) {
            const confidenceValues = Object.values(aiConfidence)
            confidence = Math.round(confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length)
          } else if (s.total_confidence) {
            // Fallback to total_confidence normalized to 0-100
            confidence = Math.round((s.total_confidence / 30) * 100)
          }

          return {
            date: s.created_at,
            predictability: s.predictability_score ?? 0,
            clarity,
            confidence,
            connection: s.connection_score ?? 0,
          }
        })

        console.log('[useTrajectory] points:', points.length, points)
        setTrajectory(points)
        setError(null)
      } catch (err) {
        console.error('Error fetching trajectory:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch trajectory')
      } finally {
        setLoading(false)
      }
    }

    fetchTrajectory()
  }, [user?.email])

  return { trajectory, loading, error }
}
