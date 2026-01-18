import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

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
        const supabase = getSupabase()
        const userEmail = user.email!

        // Fetch exchange impacts where user is the recipient (impacts others reported on your content)
        const { data, error: fetchError } = await supabase
          .from('exchange_impacts')
          .select('*')
          .eq('recipient_email', userEmail)
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) throw fetchError

        setImpacts(data ?? [])
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
