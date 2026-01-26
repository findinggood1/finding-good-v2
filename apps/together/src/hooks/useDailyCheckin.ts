import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { DailyCheckin, FocusScore } from '@finding-good/shared'

export interface UseDailyCheckinReturn {
  todaysCheckin: DailyCheckin | null
  hasCheckedInToday: boolean
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  saveCheckin: (
    permissionId: string,
    scores: FocusScore[]
  ) => Promise<{ success: boolean; error?: string }>
}

export function useDailyCheckin(): UseDailyCheckinReturn {
  const { user } = useAuth()
  const [todaysCheckin, setTodaysCheckin] = useState<DailyCheckin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodaysCheckin = useCallback(async () => {
    if (!user?.email) {
      setTodaysCheckin(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()
      const today = new Date().toISOString().split('T')[0]

      const { data, error: fetchError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('client_email', user.email)
        .eq('check_date', today)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setTodaysCheckin(data as DailyCheckin | null)
      setError(null)
    } catch (err) {
      console.error('Error fetching today\'s check-in:', err)
      setError('Failed to load check-in data')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchTodaysCheckin()
  }, [fetchTodaysCheckin])

  const saveCheckin = useCallback(
    async (permissionId: string, scores: FocusScore[]) => {
      if (!user?.email) {
        return { success: false, error: 'Not authenticated' }
      }

      try {
        const supabase = getSupabase()
        const today = new Date().toISOString().split('T')[0]

        const { error: insertError } = await supabase.from('daily_checkins').insert({
          client_email: user.email,
          permission_id: permissionId,
          check_date: today,
          focus_scores: scores,
        })

        if (insertError) {
          // Check for unique constraint violation (already checked in)
          if (insertError.code === '23505') {
            return { success: false, error: 'Already checked in today' }
          }
          throw insertError
        }

        await fetchTodaysCheckin()
        return { success: true }
      } catch (err) {
        console.error('Error saving check-in:', err)
        return { success: false, error: 'Failed to save check-in' }
      }
    },
    [user?.email, fetchTodaysCheckin]
  )

  return {
    todaysCheckin,
    hasCheckedInToday: !!todaysCheckin,
    loading,
    error,
    refetch: fetchTodaysCheckin,
    saveCheckin,
  }
}
