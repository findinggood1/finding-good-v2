import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

export interface FiresComparison {
  element: FiresElement
  yours: number  // Count in "About you" (self-entries + received)
  others: number // Count in "You noticed" (what you noticed in others)
}

// Map of FIRES letter codes to full element names
const FIRES_MAP: Record<string, FiresElement> = {
  F: 'feelings',
  I: 'influence',
  R: 'resilience',
  E: 'ethics',
  S: 'strengths',
  feelings: 'feelings',
  influence: 'influence',
  resilience: 'resilience',
  ethics: 'ethics',
  strengths: 'strengths',
}

const FIRES_ELEMENTS: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']

export function useYoursVsOthers() {
  const { user } = useAuth()
  const [comparison, setComparison] = useState<FiresComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setComparison([])
      setLoading(false)
      return
    }

    const fetchComparison = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email

        // "About you" - priorities about self
        const { data: selfPriorities } = await supabase
          .from('priorities')
          .select('fires_extracted')
          .eq('client_email', userEmail)
          .eq('type', 'self')

        // "About you" - recognitions received from others
        const { data: receivedPriorities } = await supabase
          .from('priorities')
          .select('fires_extracted')
          .eq('recipient_email', userEmail)
          .not('client_email', 'eq', userEmail)

        // "You noticed" - what user noticed in others
        const { data: noticedPriorities } = await supabase
          .from('priorities')
          .select('fires_extracted')
          .eq('client_email', userEmail)
          .eq('type', 'other')

        // Count FIRES elements for "About you" (yours)
        const yoursCount: Record<FiresElement, number> = {
          feelings: 0,
          influence: 0,
          resilience: 0,
          ethics: 0,
          strengths: 0,
        }

        // Count from self priorities
        selfPriorities?.forEach(p => {
          const fires = p.fires_extracted as string[] | null
          if (fires && Array.isArray(fires)) {
            fires.forEach(f => {
              const element = FIRES_MAP[f] || FIRES_MAP[f.toLowerCase()]
              if (element) {
                yoursCount[element]++
              }
            })
          }
        })

        // Count from received priorities
        receivedPriorities?.forEach(p => {
          const fires = p.fires_extracted as string[] | null
          if (fires && Array.isArray(fires)) {
            fires.forEach(f => {
              const element = FIRES_MAP[f] || FIRES_MAP[f.toLowerCase()]
              if (element) {
                yoursCount[element]++
              }
            })
          }
        })

        // Count FIRES elements for "You noticed" (others)
        const othersCount: Record<FiresElement, number> = {
          feelings: 0,
          influence: 0,
          resilience: 0,
          ethics: 0,
          strengths: 0,
        }

        noticedPriorities?.forEach(p => {
          const fires = p.fires_extracted as string[] | null
          if (fires && Array.isArray(fires)) {
            fires.forEach(f => {
              const element = FIRES_MAP[f] || FIRES_MAP[f.toLowerCase()]
              if (element) {
                othersCount[element]++
              }
            })
          }
        })

        // Build comparison array
        const comparisonData: FiresComparison[] = FIRES_ELEMENTS.map(element => ({
          element,
          yours: yoursCount[element],
          others: othersCount[element],
        }))

        setComparison(comparisonData)
        setError(null)
      } catch (err) {
        console.error('Error fetching FIRES comparison:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch comparison')
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [user?.email])

  return { comparison, loading, error }
}
