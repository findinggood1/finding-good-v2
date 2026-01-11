import { useState, useEffect, useCallback } from 'react'
import { getSupabase, type Prediction } from '@finding-good/shared'

interface UsePredictionsResult {
  predictions: Prediction[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePredictions(): UsePredictionsResult {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPredictions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const { data, error: fetchError } = await supabase
        .from('predictions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setPredictions([])
      } else {
        setPredictions(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions')
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  return {
    predictions,
    loading,
    error,
    refetch: fetchPredictions,
  }
}
