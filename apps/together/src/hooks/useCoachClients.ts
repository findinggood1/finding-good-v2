import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface CoachClient {
  id: string
  email: string
  name: string | null
  engagement_week: number
  phase: string
  active_predictions: number
  last_activity: string | null
  has_new_activity: boolean
  inactive_days: number
}

export function useCoachClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<CoachClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    if (!user?.email) {
      setClients([])
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
        setClients([])
        setLoading(false)
        return
      }

      // Fetch coaching engagements for this coach using coach_id
      const { data: engagements, error: engError } = await supabase
        .from('coaching_engagements')
        .select('id, client_email, start_date, current_phase, status')
        .eq('coach_id', coach.id)
        .eq('status', 'active')

      if (engError) throw engError

      if (!engagements || engagements.length === 0) {
        setClients([])
        setLoading(false)
        return
      }

      const clientEmails = engagements.map(e => e.client_email)

      // Fetch client info
      const { data: clientsData } = await supabase
        .from('clients')
        .select('email, name')
        .in('email', clientEmails)

      // Fetch prediction counts
      const { data: predictions } = await supabase
        .from('predictions')
        .select('client_email')
        .in('client_email', clientEmails)
        .eq('status', 'active')

      // Fetch recent activity (last validation per client)
      const { data: recentValidations } = await supabase
        .from('validations')
        .select('client_email, created_at')
        .in('client_email', clientEmails)
        .order('created_at', { ascending: false })

      // Build client list
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const clientList: CoachClient[] = engagements.map(eng => {
        const clientInfo = clientsData?.find(c => c.email === eng.client_email)
        const predCount = predictions?.filter(p => p.client_email === eng.client_email).length || 0
        const lastValidation = recentValidations?.find(v => v.client_email === eng.client_email)

        const startDate = new Date(eng.start_date)
        const weekNum = Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))

        const lastActivityDate = lastValidation ? new Date(lastValidation.created_at) : null
        const inactiveDays = lastActivityDate
          ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (24 * 60 * 60 * 1000))
          : 999

        return {
          id: eng.id,
          email: eng.client_email,
          name: clientInfo?.name || eng.client_email.split('@')[0],
          engagement_week: weekNum,
          phase: eng.current_phase || 'PRIORITIZE',
          active_predictions: predCount,
          last_activity: lastValidation?.created_at || null,
          has_new_activity: lastActivityDate ? lastActivityDate > sevenDaysAgo : false,
          inactive_days: inactiveDays,
        }
      })

      // Sort by last activity (most recent first)
      clientList.sort((a, b) => {
        if (!a.last_activity && !b.last_activity) return 0
        if (!a.last_activity) return 1
        if (!b.last_activity) return -1
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
      })

      setClients(clientList)
      setError(null)
    } catch (err) {
      console.error('Error fetching coach clients:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return { clients, loading, error, refetch: fetchClients }
}
