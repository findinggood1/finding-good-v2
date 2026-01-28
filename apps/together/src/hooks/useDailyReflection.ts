import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface DailyReflection {
  id: string
  client_email: string
  reflection_date: string
  question_shown: string
  answer: string | null
  engagement_level: number | null
  focus_items_completed: number
  focus_items_total: number
  completed_items: string[] | null
  item_engagements: Record<string, number> | null
  bridge_question: string | null
  bridge_answer: string | null
  bridge_focus_item: string | null
  created_at: string
  updated_at: string
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export interface UseDailyReflectionReturn {
  reflection: DailyReflection | null
  loading: boolean
  error: string | null
  toggleFocusItem: (itemName: string, focusTotal: number) => Promise<void>
  setEngagement: (level: number) => Promise<void>
  setItemEngagement: (itemName: string, level: number) => Promise<void>
  saveAnswer: (answer: string, questionShown: string) => Promise<void>
  saveBridgeAnswer: (answer: string, question: string, focusItem: string) => Promise<void>
}

export function useDailyReflection(): UseDailyReflectionReturn {
  const { user } = useAuth()
  const [reflection, setReflection] = useState<DailyReflection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReflection = useCallback(async () => {
    if (!user?.email) {
      setReflection(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: fetchError } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('client_email', user.email)
        .eq('reflection_date', getToday())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setReflection(data as DailyReflection | null)
      setError(null)
    } catch (err) {
      console.error('Error fetching daily reflection:', err)
      setError('Failed to load today\'s reflection')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchReflection()
  }, [fetchReflection])

  const ensureReflection = useCallback(async (questionShown?: string): Promise<DailyReflection | null> => {
    if (reflection) return reflection
    if (!user?.email) return null

    const supabase = getSupabase()
    const { data, error: insertError } = await supabase
      .from('daily_reflections')
      .insert({
        client_email: user.email,
        reflection_date: getToday(),
        question_shown: questionShown || '',
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        await fetchReflection()
        return reflection
      }
      throw insertError
    }

    const record = data as DailyReflection
    setReflection(record)
    return record
  }, [user?.email, reflection, fetchReflection])

  const toggleFocusItem = useCallback(async (itemName: string, focusTotal: number) => {
    if (!user?.email) return

    try {
      const record = await ensureReflection()
      if (!record) return

      const completed: string[] = record.completed_items || []
      const isCompleted = completed.includes(itemName)
      const newCompleted = isCompleted
        ? completed.filter(n => n !== itemName)
        : [...completed, itemName]

      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('daily_reflections')
        .update({
          completed_items: newCompleted,
          focus_items_completed: newCompleted.length,
          focus_items_total: focusTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.id)

      if (updateError) throw updateError

      setReflection(prev => prev ? {
        ...prev,
        completed_items: newCompleted,
        focus_items_completed: newCompleted.length,
        focus_items_total: focusTotal,
      } : null)
    } catch (err) {
      console.error('Error toggling focus item:', err)
    }
  }, [user?.email, ensureReflection])

  const setEngagement = useCallback(async (level: number) => {
    if (!user?.email) return

    try {
      const record = await ensureReflection()
      if (!record) return

      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('daily_reflections')
        .update({
          engagement_level: level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.id)

      if (updateError) throw updateError

      setReflection(prev => prev ? { ...prev, engagement_level: level } : null)
    } catch (err) {
      console.error('Error setting engagement:', err)
    }
  }, [user?.email, ensureReflection])

  const setItemEngagement = useCallback(async (itemName: string, level: number) => {
    if (!user?.email) return

    try {
      const record = await ensureReflection()
      if (!record) return

      const currentEngagements = record.item_engagements || {}
      const newEngagements = { ...currentEngagements, [itemName]: level }

      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('daily_reflections')
        .update({
          item_engagements: newEngagements,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.id)

      if (updateError) throw updateError

      setReflection(prev => prev ? { ...prev, item_engagements: newEngagements } : null)
    } catch (err) {
      console.error('Error setting item engagement:', err)
    }
  }, [user?.email, ensureReflection])

  const saveAnswer = useCallback(async (answer: string, questionShown: string) => {
    if (!user?.email) return

    try {
      const record = await ensureReflection(questionShown)
      if (!record) return

      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('daily_reflections')
        .update({
          answer,
          question_shown: questionShown,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.id)

      if (updateError) throw updateError

      setReflection(prev => prev ? { ...prev, answer, question_shown: questionShown } : null)
    } catch (err) {
      console.error('Error saving answer:', err)
    }
  }, [user?.email, ensureReflection])

  const saveBridgeAnswer = useCallback(async (answer: string, question: string, focusItem: string) => {
    if (!user?.email) return

    try {
      const record = await ensureReflection()
      if (!record) return

      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('daily_reflections')
        .update({
          bridge_answer: answer,
          bridge_question: question,
          bridge_focus_item: focusItem,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.id)

      if (updateError) throw updateError

      setReflection(prev => prev ? {
        ...prev,
        bridge_answer: answer,
        bridge_question: question,
        bridge_focus_item: focusItem,
      } : null)
    } catch (err) {
      console.error('Error saving bridge answer:', err)
    }
  }, [user?.email, ensureReflection])

  return {
    reflection,
    loading,
    error,
    toggleFocusItem,
    setEngagement,
    setItemEngagement,
    saveAnswer,
    saveBridgeAnswer,
  }
}
