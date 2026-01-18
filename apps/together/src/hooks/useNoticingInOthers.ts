import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

export interface NoticingData {
  firesFrequency: Record<FiresElement, number>
  recentCount: number
  question: string
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
        const supabase = getSupabase()
        const userEmail = user.email

        // Fetch priorities where type='other' (recognitions about others)
        const { data: priorities, error: prioritiesError } = await supabase
          .from('priorities')
          .select('id, fires_extracted, created_at')
          .eq('client_email', userEmail)
          .eq('type', 'other')
          .order('created_at', { ascending: false })

        if (prioritiesError) {
          throw prioritiesError
        }

        // Count FIRES elements from fires_extracted
        const frequency: Record<FiresElement, number> = {
          feelings: 0,
          influence: 0,
          resilience: 0,
          ethics: 0,
          strengths: 0,
        }

        priorities?.forEach(p => {
          const fires = p.fires_extracted as string[] | null
          if (fires && Array.isArray(fires)) {
            fires.forEach(f => {
              const element = FIRES_MAP[f] || FIRES_MAP[f.toLowerCase()]
              if (element) {
                frequency[element]++
              }
            })
          }
        })

        // Calculate recent count (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentCount = priorities?.filter(p =>
          new Date(p.created_at) >= thirtyDaysAgo
        ).length ?? 0

        // Generate question based on most noticed element
        const topElement = Object.entries(frequency)
          .sort(([, a], [, b]) => b - a)[0]

        let question = 'What does that tell you?'
        if (topElement && topElement[1] > 0) {
          const elementQuestions: Record<FiresElement, string> = {
            feelings: 'You notice feelings often. What draws you to emotional awareness?',
            influence: 'You spot influence patterns. How does that shape your leadership?',
            resilience: 'You recognize resilience in others. What builds yours?',
            ethics: 'Values matter to you. How do you live that out?',
            strengths: 'You see strengths clearly. What strengths do you want others to see in you?',
          }
          question = elementQuestions[topElement[0] as FiresElement]
        }

        const noticingData: NoticingData = {
          firesFrequency: frequency,
          recentCount,
          question,
        }

        console.log('[useNoticingInOthers] data:', noticingData)
        setData(noticingData)
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
