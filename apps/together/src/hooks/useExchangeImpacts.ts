import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase

export interface ExchangeImpact {
  id: string
  content_type: 'priority' | 'proof' | 'recognition'
  content_id: string
  sender_email: string
  recipient_email: string
  impact_level: 'helpful' | 'meaningful' | 'high_impact'
  note: string | null
  created_at: string
}

export function useExchangeImpacts() {
  const { user } = useAuth()
  const [impacts, setImpacts] = useState<ExchangeImpact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setImpacts([])
      setLoading(false)
      return
    }

    const fetchImpacts = async () => {
      try {
        setLoading(true)
        // TODO: Implement query for exchange_impacts where recipient_email = user
        setImpacts([])
        console.log('[useExchangeImpacts] impacts: [] (stub - P1)')
        setError(null)
      } catch (err) {
        console.error('Error fetching exchange impacts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch impacts')
      } finally {
        setLoading(false)
      }
    }

    fetchImpacts()
  }, [user?.email])

  return { impacts, loading, error }
}
