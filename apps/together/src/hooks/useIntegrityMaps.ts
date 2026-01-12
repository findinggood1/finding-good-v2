import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface IntegrityMap {
  id: string
  date_range_start: string
  date_range_end: string
  summary: string | null
  predictions_data: Array<{
    id: string
    title: string
    activity_count: number
    score_change?: number
  }>
  fires_patterns: Record<string, number>
  connection_activity: Array<{
    email: string
    name?: string
    share_count: number
  }>
  wins: string[]
  focus_next: string[]
  created_at: string
}

export function useIntegrityMaps() {
  const { user } = useAuth()
  const [maps, setMaps] = useState<IntegrityMap[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMaps = useCallback(async () => {
    if (!user?.email) {
      setMaps([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: fetchError } = await supabase
        .from('integrity_maps')
        .select('*')
        .eq('client_email', user.email)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setMaps(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching maps:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch maps')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchMaps()
  }, [fetchMaps])

  const generateMap = useCallback(async () => {
    if (!user?.email) return null

    try {
      setGenerating(true)
      const supabase = getSupabase()
      const userEmail = user.email

      // Get date range (last 7 days or since last map)
      const now = new Date()
      const lastMap = maps[0]
      const startDate = lastMap 
        ? new Date(lastMap.date_range_end)
        : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Fetch proofs from the date range
      const { data: proofs } = await supabase
        .from('validations')
        .select('id, proof_line, fires_extracted, prediction_id, created_at')
        .eq('client_email', userEmail)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())

      // Fetch predictions
      const { data: predictions } = await supabase
        .from('predictions')
        .select('id, title, scores')
        .eq('client_email', userEmail)
        .eq('status', 'active')

      // Calculate FIRES patterns
      const firesPatterns: Record<string, number> = {
        feelings: 0,
        influence: 0,
        resilience: 0,
        ethics: 0,
        strengths: 0,
      }

      const allItems = proofs || []
      for (const item of allItems) {
        const fires = item.fires_extracted || []
        for (const element of fires) {
          if (firesPatterns[element] !== undefined) {
            firesPatterns[element]++
          }
        }
      }

      // Build predictions data
      const predictionsData = (predictions || []).map(p => ({
        id: p.id,
        title: p.title,
        activity_count: allItems.filter(i => i.prediction_id === p.id).length,
      }))

      // Generate summary (simple version - AI version would call edge function)
      const proofCount = proofs?.length || 0
      const topFires = Object.entries(firesPatterns)
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 0)
        .slice(0, 2)
        .map(([element]) => element)

      let summary = 'This week you '
      if (proofCount > 0) {
        summary += 'captured ' + proofCount + ' proofs'
      } else {
        summary = 'No activity recorded this week.'
      }

      if (topFires.length > 0) {
        summary += '. Your focus was on ' + topFires.join(' and ') + '.'
      }

      // Generate wins
      const wins: string[] = []
      if (proofCount >= 5) wins.push('Consistent daily practice')
      if (proofCount >= 2) wins.push('Building evidence of capability')

      // Generate focus areas
      const focusNext: string[] = []
      const lowFires = Object.entries(firesPatterns)
        .filter(([_, count]) => count === 0)
        .map(([element]) => element)
      if (lowFires.length > 0) {
        focusNext.push('Explore ' + lowFires[0] + ' in your reflections')
      }

      // Insert the map
      const { data: newMap, error: insertError } = await supabase
        .from('integrity_maps')
        .insert({
          client_email: userEmail,
          date_range_start: startDate.toISOString().split('T')[0],
          date_range_end: now.toISOString().split('T')[0],
          summary,
          predictions_data: predictionsData,
          fires_patterns: firesPatterns,
          connection_activity: [],
          wins,
          focus_next: focusNext,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh the list
      await fetchMaps()

      return newMap
    } catch (err) {
      console.error('Error generating map:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate map')
      return null
    } finally {
      setGenerating(false)
    }
  }, [user?.email, maps, fetchMaps])

  return { maps, loading, generating, error, generateMap, refetch: fetchMaps }
}
