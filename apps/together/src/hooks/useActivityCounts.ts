import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase

export interface ActivityCounts {
  priorities: number
  proofs: number
  sent: number
  received: number
  pending: number
}

export function useActivityCounts(scope: 'week' | 'all' = 'week') {
  const { user } = useAuth()
  const [counts, setCounts] = useState<ActivityCounts>({
    priorities: 0,
    proofs: 0,
    sent: 0,
    received: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setCounts({ priorities: 0, proofs: 0, sent: 0, received: 0, pending: 0 })
      setLoading(false)
      return
    }

    const fetchCounts = async () => {
      try {
        setLoading(true)
        // TODO: Implement queries with scope filtering
        // For now, return stub data
        setCounts({
          priorities: 0,
          proofs: 0,
          sent: 0,
          received: 0,
          pending: 0,
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching activity counts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch counts')
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [user?.email, scope])

  return { counts, loading, error }
}
