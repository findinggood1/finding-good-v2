import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FeedItem } from '../components/FeedCard'

export function useCampfire() {
  const { user } = useAuth()
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setItems([])
      setLoading(false)
      return
    }

    const fetchCampfire = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email

        // First get all connected users (from share_visibility)
        const { data: visibilityA } = await supabase
          .from('share_visibility')
          .select('user_b_email')
          .eq('user_a_email', userEmail)
          .is('muted_at', null)

        const { data: visibilityB } = await supabase
          .from('share_visibility')
          .select('user_a_email')
          .eq('user_b_email', userEmail)
          .is('muted_at', null)

        const connectedEmails = new Set<string>()
        if (visibilityA) {
          visibilityA.forEach(v => connectedEmails.add(v.user_b_email))
        }
        if (visibilityB) {
          visibilityB.forEach(v => connectedEmails.add(v.user_a_email))
        }

        // Remove self
        if (userEmail) {
          connectedEmails.delete(userEmail)
        }

        if (connectedEmails.size === 0) {
          setItems([])
          setLoading(false)
          return
        }

        // Fetch inspiration_shares from connected users
        const { data: shares, error: sharesError } = await supabase
          .from('inspiration_shares')
          .select('*')
          .in('client_email', Array.from(connectedEmails))
          .is('hidden_at', null)
          .order('created_at', { ascending: false })
          .limit(50)

        if (sharesError) {
          console.warn('inspiration_shares fetch:', sharesError.message)
        }

        const feedItems: FeedItem[] = []
        if (shares) {
          for (const share of shares) {
            feedItems.push({
              id: share.id,
              type: share.content_type as 'priority' | 'proof',
              text: share.share_text,
              fires_extracted: share.fires_extracted || [],
              prediction_id: share.prediction_id,
              created_at: share.created_at,
              client_email: share.client_email,
              client_name: share.client_email.split('@')[0],
              isOwn: false,
            })
          }
        }

        setItems(feedItems)
        setError(null)
      } catch (err) {
        console.error('Error fetching campfire:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch campfire')
      } finally {
        setLoading(false)
      }
    }

    fetchCampfire()
  }, [user?.email])

  return { items, loading, error }
}
