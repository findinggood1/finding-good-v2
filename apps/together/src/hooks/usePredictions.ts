import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { Prediction } from '@finding-good/shared'

export function usePredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setPredictions([])
      setLoading(false)
      return
    }

    const fetchPredictions = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        
        const { data, error: fetchError } = await supabase
          .from('predictions')
          .select('*')
          .eq('client_email', user.email)
          .order('rank', { ascending: true })
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        
        setPredictions(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching predictions:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions')
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [user?.email])

  return { predictions, loading, error }
}
