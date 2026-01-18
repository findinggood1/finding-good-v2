import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase

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
        // TODO: Implement query for snapshots ordered by created_at
        // Extract predictability scores over time
        setTrajectory([])
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
