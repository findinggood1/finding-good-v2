import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase
import type { FiresElement } from '@finding-good/shared'

export interface NoticingData {
  firesFrequency: Record<FiresElement, number>
  recentCount: number
  question: string
}

export function useNoticingInOthers() {
  const { user } = useAuth()
  const [data, setData] = useState<NoticingData>({
    firesFrequency: {
      feelings: 0,
      influence: 0,
      resilience: 0,
      ethics: 0,
      strengths: 0,
    },
    recentCount: 0,
    question: 'What does that tell you?',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setData({
        firesFrequency: { feelings: 0, influence: 0, resilience: 0, ethics: 0, strengths: 0 },
        recentCount: 0,
        question: 'What does that tell you?',
      })
      setLoading(false)
      return
    }

    const fetchNoticing = async () => {
      try {
        setLoading(true)
        // TODO: Implement query for priorities WHERE type='other' AND client_email=user
        // Count FIRES elements in fires_extracted
        setData({
          firesFrequency: { feelings: 0, influence: 0, resilience: 0, ethics: 0, strengths: 0 },
          recentCount: 0,
          question: 'What does that tell you?',
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching noticing data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch noticing')
      } finally {
        setLoading(false)
      }
    }

    fetchNoticing()
  }, [user?.email])

  return { ...data, loading, error }
}
