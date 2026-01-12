import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface StoryData {
  storyPresent: string | null
  storyPast: string | null
  storyPotential: string | null
  superpowersClaimed: unknown
  superpowersEmerging: unknown
  superpowersHidden: unknown
  goals: string | null
  challenges: string | null
  hasEngagement: boolean
}

export function useStoryData() {
  const { user } = useAuth()
  const [data, setData] = useState<StoryData>({
    storyPresent: null,
    storyPast: null,
    storyPotential: null,
    superpowersClaimed: null,
    superpowersEmerging: null,
    superpowersHidden: null,
    goals: null,
    challenges: null,
    hasEngagement: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setData({
        storyPresent: null,
        storyPast: null,
        storyPotential: null,
        superpowersClaimed: null,
        superpowersEmerging: null,
        superpowersHidden: null,
        goals: null,
        challenges: null,
        hasEngagement: false,
      })
      setLoading(false)
      return
    }

    const fetchStoryData = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()

        const { data: engagement, error: fetchError } = await supabase
          .from('coaching_engagements')
          .select('story_present, story_past, story_potential, superpowers_claimed, superpowers_emerging, superpowers_hidden, goals, challenges')
          .eq('client_email', user.email)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (!engagement) {
          setData({
            storyPresent: null,
            storyPast: null,
            storyPotential: null,
            superpowersClaimed: null,
            superpowersEmerging: null,
            superpowersHidden: null,
            goals: null,
            challenges: null,
            hasEngagement: false,
          })
        } else {
          setData({
            storyPresent: engagement.story_present || null,
            storyPast: engagement.story_past || null,
            storyPotential: engagement.story_potential || null,
            superpowersClaimed: engagement.superpowers_claimed || null,
            superpowersEmerging: engagement.superpowers_emerging || null,
            superpowersHidden: engagement.superpowers_hidden || null,
            goals: engagement.goals || null,
            challenges: engagement.challenges || null,
            hasEngagement: true,
          })
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching story data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch story data')
      } finally {
        setLoading(false)
      }
    }

    fetchStoryData()
  }, [user?.email])

  return { ...data, loading, error }
}
