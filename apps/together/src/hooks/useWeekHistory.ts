import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface DayHistory {
  date: Date
  dayLabel: string       // "Mon", "Tue", etc.
  checkedIn: boolean
  itemsCompleted: number
  itemsTotal: number
  isToday: boolean
  isWeekend: boolean
  avgEngagement: number | null
}

export interface FocusAverage {
  name: string
  average: number
  timesCompleted: number
  indicator: 'high' | 'moderate' | 'low'
}

export interface UseWeekHistoryReturn {
  days: DayHistory[]
  focusAverages: FocusAverage[]
  loading: boolean
  error: string | null
}

function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday

  // Start from Monday (or Sunday if you prefer)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)) // Go back to Monday
  monday.setHours(0, 0, 0, 0)

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function formatDateForQuery(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function useWeekHistory(): UseWeekHistoryReturn {
  const { user } = useAuth()
  const [days, setDays] = useState<DayHistory[]>([])
  const [focusAverages, setFocusAverages] = useState<FocusAverage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeekHistory = useCallback(async () => {
    if (!user?.email) {
      setDays([])
      setFocusAverages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()
      const weekDates = getWeekDates()

      const startDate = formatDateForQuery(weekDates[0])
      const endDate = formatDateForQuery(weekDates[6])

      // Fetch reflections for the week
      const { data, error: fetchError } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('client_email', user.email)
        .gte('reflection_date', startDate)
        .lte('reflection_date', endDate)

      if (fetchError) throw fetchError

      const reflections = data || []
      const reflectionsByDate = new Map<string, typeof reflections[0]>()

      for (const r of reflections) {
        reflectionsByDate.set(r.reflection_date, r)
      }

      // Build day history
      const dayHistory: DayHistory[] = weekDates.map(date => {
        const dateStr = formatDateForQuery(date)
        const reflection = reflectionsByDate.get(dateStr)

        // Calculate average engagement from item_engagements
        let avgEngagement: number | null = null
        if (reflection?.item_engagements) {
          const engagements = Object.values(reflection.item_engagements as Record<string, number>)
          if (engagements.length > 0) {
            avgEngagement = engagements.reduce((a, b) => a + b, 0) / engagements.length
          }
        }

        return {
          date,
          dayLabel: getDayLabel(date),
          checkedIn: !!reflection && (reflection.completed_items?.length > 0 || reflection.focus_items_completed > 0),
          itemsCompleted: reflection?.focus_items_completed || reflection?.completed_items?.length || 0,
          itemsTotal: reflection?.focus_items_total || 0,
          isToday: isToday(date),
          isWeekend: isWeekend(date),
          avgEngagement,
        }
      })

      setDays(dayHistory)

      // Calculate focus averages across the week
      const focusTotals = new Map<string, { sum: number; count: number }>()

      for (const r of reflections) {
        if (r.item_engagements) {
          const engagements = r.item_engagements as Record<string, number>
          for (const [name, level] of Object.entries(engagements)) {
            const existing = focusTotals.get(name) || { sum: 0, count: 0 }
            focusTotals.set(name, {
              sum: existing.sum + level,
              count: existing.count + 1,
            })
          }
        }
      }

      const averages: FocusAverage[] = Array.from(focusTotals.entries()).map(([name, { sum, count }]) => {
        const avg = sum / count
        let indicator: 'high' | 'moderate' | 'low' = 'moderate'
        if (avg >= 3.5) indicator = 'high'
        else if (avg < 2.5) indicator = 'low'

        return {
          name,
          average: Math.round(avg * 10) / 10,
          timesCompleted: count,
          indicator,
        }
      })

      // Sort by average descending
      averages.sort((a, b) => b.average - a.average)
      setFocusAverages(averages)

      setError(null)
    } catch (err) {
      console.error('Error fetching week history:', err)
      setError('Failed to load week history')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchWeekHistory()
  }, [fetchWeekHistory])

  return {
    days,
    focusAverages,
    loading,
    error,
  }
}
