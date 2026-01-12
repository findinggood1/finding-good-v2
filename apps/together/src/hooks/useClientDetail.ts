import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { Prediction } from '@finding-good/shared'

export interface ClientDetail {
  email: string
  name: string | null
  engagement_week: number
  phase: string
  next_session: string | null
  predictions: Prediction[]
  recent_activity: ActivityItem[]
  fires_signals: Record<string, number>
}

export interface ActivityItem {
  id: string
  type: 'proof'
  text: string
  fires_extracted: string[]
  prediction_id: string | null
  created_at: string
}

export function useClientDetail(clientEmail: string | undefined) {
  const { user } = useAuth()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientDetail = useCallback(async () => {
    if (!user?.email || !clientEmail) {
      setClient(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      // First get the coach's ID from the coaches table
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (coachError) throw coachError
      if (!coach) {
        setError('Not authorized as a coach')
        setClient(null)
        setLoading(false)
        return
      }

      // Verify this coach has access to this client
      const { data: engagement, error: engError } = await supabase
        .from('coaching_engagements')
        .select('id, start_date, current_phase')
        .eq('coach_id', coach.id)
        .eq('client_email', clientEmail)
        .eq('status', 'active')
        .maybeSingle()

      if (engError) throw engError
      if (!engagement) {
        setError('Client not found or access denied')
        setClient(null)
        setLoading(false)
        return
      }

      // Fetch client info
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('email, name')
        .eq('email', clientEmail)
        .maybeSingle()

      // Fetch predictions
      const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('client_email', clientEmail)
        .eq('status', 'active')
        .order('rank', { ascending: true })

      // Fetch recent activity (validations from last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: validations } = await supabase
        .from('validations')
        .select('id, proof_line, fires_extracted, prediction_id, created_at')
        .eq('client_email', clientEmail)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      // Calculate FIRES signals from recent activity
      const firesSignals: Record<string, number> = {
        feelings: 0,
        influence: 0,
        resilience: 0,
        ethics: 0,
        strengths: 0,
      }

      validations?.forEach(v => {
        const fires = v.fires_extracted || []
        fires.forEach((element: string) => {
          if (firesSignals[element] !== undefined) {
            firesSignals[element]++
          }
        })
      })

      // Calculate engagement week
      const startDate = new Date(engagement.start_date)
      const now = new Date()
      const weekNum = Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))

      // Build activity items
      const activityItems: ActivityItem[] = (validations || []).map(v => ({
        id: v.id,
        type: 'proof' as const,
        text: v.proof_line || '',
        fires_extracted: v.fires_extracted || [],
        prediction_id: v.prediction_id,
        created_at: v.created_at,
      }))

      setClient({
        email: clientEmail,
        name: clientInfo?.name || clientEmail.split('@')[0],
        engagement_week: weekNum,
        phase: engagement.current_phase || 'PRIORITIZE',
        next_session: null, // Could be fetched from scheduled_sessions table if needed
        predictions: predictions || [],
        recent_activity: activityItems,
        fires_signals: firesSignals,
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching client detail:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch client')
    } finally {
      setLoading(false)
    }
  }, [user?.email, clientEmail])

  useEffect(() => {
    fetchClientDetail()
  }, [fetchClientDetail])

  return { client, loading, error, refetch: fetchClientDetail }
}
