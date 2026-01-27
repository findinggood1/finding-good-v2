import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface WeeklyActivity {
  activePredictions: Array<{
    id: string
    title: string
    status: string
    priority_count: number
    proof_count: number
  }>
  impactCount: number
  improveCount: number
  checkinCount: number
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay()
  // Start on Monday (1), end on Sunday (0→7)
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return {
    start: monday.toISOString(),
    end: sunday.toISOString(),
  }
}

export function useWeeklyActivity() {
  const { user } = useAuth()
  const [data, setData] = useState<WeeklyActivity>({
    activePredictions: [],
    impactCount: 0,
    improveCount: 0,
    checkinCount: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()
      const { start, end } = getWeekRange()

      const [predictionsRes, prioritiesRes, validationsRes, reflectionsRes] = await Promise.all([
        supabase
          .from('predictions')
          .select('id, title, status, priority_count, proof_count')
          .eq('client_email', user.email)
          .eq('status', 'active')
          .order('rank', { ascending: true }),
        supabase
          .from('priorities')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', user.email)
          .gte('created_at', start)
          .lte('created_at', end),
        supabase
          .from('validations')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', user.email)
          .gte('created_at', start)
          .lte('created_at', end),
        supabase
          .from('daily_reflections')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', user.email)
          .gte('reflection_date', start.split('T')[0])
          .lte('reflection_date', end.split('T')[0]),
      ])

      setData({
        activePredictions: (predictionsRes.data || []) as WeeklyActivity['activePredictions'],
        impactCount: prioritiesRes.count || 0,
        improveCount: validationsRes.count || 0,
        checkinCount: reflectionsRes.count || 0,
      })
    } catch (err) {
      console.error('Error fetching weekly activity:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...data, loading }
}
