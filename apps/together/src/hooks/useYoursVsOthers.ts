import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase
import type { FiresElement } from '@finding-good/shared'

export interface FiresComparison {
  element: FiresElement
  yours: number  // Count in your entries
  others: number // Count others saw in you
}

export function useYoursVsOthers() {
  const { user } = useAuth()
  const [comparison, setComparison] = useState<FiresComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setComparison([])
      setLoading(false)
      return
    }

    const fetchComparison = async () => {
      try {
        setLoading(true)
        // TODO: Implement queries for:
        // "About you" = priorities(type='self') + priorities(recipient_email=user) → fires_extracted
        // "You noticed" = priorities(type='other', client_email=user) → fires_extracted
        setComparison([])
        setError(null)
      } catch (err) {
        console.error('Error fetching FIRES comparison:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch comparison')
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [user?.email])

  return { comparison, loading, error }
}
