import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

type ToolType = 'impact' | 'improve' | 'inspire'

interface RecentEntry {
  id: string
  preview: string
  date: string
  type: 'self' | 'others'
}

interface UseRecentToolEntriesResult {
  entries: RecentEntry[]
  isLoading: boolean
  error: string | null
}

export function useRecentToolEntries(
  toolType: ToolType,
  limit: number = 5
): UseRecentToolEntriesResult {
  const { userEmail } = useAuth()
  const [entries, setEntries] = useState<RecentEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userEmail) {
      setIsLoading(false)
      return
    }

    const fetchEntries = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = getSupabase()
        const allEntries: RecentEntry[] = []

        if (toolType === 'impact') {
          // Fetch from priorities table (self entries)
          const { data: selfData, error: selfError } = await supabase
            .from('priorities')
            .select('id, priority_text, created_at')
            .eq('client_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (selfError) throw selfError

          if (selfData) {
            allEntries.push(
              ...selfData.map((item) => ({
                id: item.id,
                preview: item.priority_text || 'Impact entry',
                date: item.created_at,
                type: 'self' as const,
              }))
            )
          }

          // Fetch from recognitions table (others entries)
          const { data: othersData, error: othersError } = await supabase
            .from('recognitions')
            .select('id, to_name, what_they_did, created_at')
            .eq('from_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (othersError) {
            // Table might not exist yet, that's okay
            console.log('Recognitions table not available:', othersError.message)
          } else if (othersData) {
            allEntries.push(
              ...othersData.map((item) => ({
                id: item.id,
                preview: `Recognized ${item.to_name}: ${item.what_they_did?.slice(0, 50) || ''}...`,
                date: item.created_at,
                type: 'others' as const,
              }))
            )
          }
        } else if (toolType === 'improve') {
          // Fetch from validations table (self entries)
          const { data: selfData, error: selfError } = await supabase
            .from('validations')
            .select('id, goal_challenge, created_at')
            .eq('client_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (selfError) throw selfError

          if (selfData) {
            allEntries.push(
              ...selfData.map((item) => ({
                id: item.id,
                preview: item.goal_challenge || 'Improvement entry',
                date: item.created_at,
                type: 'self' as const,
              }))
            )
          }

          // Fetch from validation_invitations table (others entries)
          const { data: othersData, error: othersError } = await supabase
            .from('validation_invitations')
            .select('id, recipient_name, sender_context, created_at')
            .eq('sender_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (othersError) {
            console.log('Validation invitations table not available:', othersError.message)
          } else if (othersData) {
            allEntries.push(
              ...othersData.map((item) => ({
                id: item.id,
                preview: `For ${item.recipient_name}: ${item.sender_context?.slice(0, 50) || ''}...`,
                date: item.created_at,
                type: 'others' as const,
              }))
            )
          }
        } else if (toolType === 'inspire') {
          // Fetch from predictions table (self entries)
          const { data: selfData, error: selfError } = await supabase
            .from('predictions')
            .select('id, prediction_text, title, created_at')
            .eq('client_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (selfError) throw selfError

          if (selfData) {
            allEntries.push(
              ...selfData.map((item) => ({
                id: item.id,
                preview: item.title || item.prediction_text || 'Belief entry',
                date: item.created_at,
                type: 'self' as const,
              }))
            )
          }

          // Fetch from inspire_others table if it exists (others entries)
          const { data: othersData, error: othersError } = await supabase
            .from('inspire_others')
            .select('id, recipient_name, belief_text, created_at')
            .eq('sender_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (othersError) {
            // Table might not exist yet, that's okay
            console.log('Inspire others table not available:', othersError.message)
          } else if (othersData) {
            allEntries.push(
              ...othersData.map((item) => ({
                id: item.id,
                preview: `For ${item.recipient_name}: ${item.belief_text?.slice(0, 50) || ''}...`,
                date: item.created_at,
                type: 'others' as const,
              }))
            )
          }
        }

        // Sort all entries by date descending and limit
        allEntries.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setEntries(allEntries.slice(0, limit))
      } catch (err) {
        console.error(`Error fetching ${toolType} entries:`, err)
        setError(err instanceof Error ? err.message : 'Failed to fetch entries')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [userEmail, toolType, limit])

  return { entries, isLoading, error }
}
