import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase

export interface PendingAsk {
  id: string
  type: 'proof_request' | 'priority_ask'
  requester_email: string
  requester_name: string | null
  question: string
  created_at: string
}

export function usePendingAsks() {
  const { user } = useAuth()
  const [asks, setAsks] = useState<PendingAsk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setAsks([])
      setLoading(false)
      return
    }

    const fetchAsks = async () => {
      try {
        setLoading(true)
        // TODO: Implement query for:
        // proof_requests WHERE recipient_email = user AND status = 'pending'
        // priority_asks WHERE recipient_email = user AND not completed
        setAsks([])
        console.log('[usePendingAsks] asks: [] (stub - P1)')
        setError(null)
      } catch (err) {
        console.error('Error fetching pending asks:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch asks')
      } finally {
        setLoading(false)
      }
    }

    fetchAsks()
  }, [user?.email])

  return { asks, loading, error }
}
