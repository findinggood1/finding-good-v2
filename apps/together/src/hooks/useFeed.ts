import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FeedItem } from '../components/FeedCard'

interface UseFeedOptions {
  filterByCircle?: boolean  // When true, only show items from circle members
  includeOwn?: boolean      // When true, include user's own items
}

export function useFeed(options: UseFeedOptions = {}) {
  const { filterByCircle = false, includeOwn = true } = options
  const { user } = useAuth()
  const [items, setItems] = useState<FeedItem[]>([])
  const [circleEmails, setCircleEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setItems([])
      setCircleEmails([])
      setLoading(false)
      return
    }

    const fetchFeed = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email!

        // First, get the user's circle (people they've exchanged with)
        const { data: visibilityA } = await supabase
          .from('share_visibility')
          .select('user_b_email')
          .eq('user_a_email', userEmail)

        const { data: visibilityB } = await supabase
          .from('share_visibility')
          .select('user_a_email')
          .eq('user_b_email', userEmail)

        // Combine circle emails
        const circle = new Set<string>()
        visibilityA?.forEach(v => circle.add(v.user_b_email))
        visibilityB?.forEach(v => circle.add(v.user_a_email))
        const circleArray = Array.from(circle)
        setCircleEmails(circleArray)

        // Determine which emails to fetch for
        let emailsToFetch: string[] = []
        if (filterByCircle) {
          emailsToFetch = [...circleArray]
          if (includeOwn) {
            emailsToFetch.push(userEmail)
          }
        } else {
          emailsToFetch = includeOwn ? [userEmail] : []
        }

        if (emailsToFetch.length === 0) {
          setItems([])
          setLoading(false)
          return
        }

        // Fetch inspiration_shares from circle members
        const { data: shares, error: sharesError } = await supabase
          .from('inspiration_shares')
          .select('id, client_email, content_type, share_text, fires_extracted, prediction_id, created_at')
          .in('client_email', emailsToFetch)
          .is('hidden_at', null)
          .order('created_at', { ascending: false })
          .limit(50)

        if (sharesError) console.warn('Shares fetch:', sharesError.message)

        // Also fetch validations with share_to_feed = true
        const { data: proofs, error: proofsError } = await supabase
          .from('validations')
          .select('id, proof_line, fires_extracted, prediction_id, created_at, client_email')
          .in('client_email', emailsToFetch)
          .eq('share_to_feed', true)
          .order('created_at', { ascending: false })
          .limit(50)

        if (proofsError) console.warn('Proofs fetch:', proofsError.message)

        // Fetch priorities shared to feed
        const { data: priorities, error: prioritiesError } = await supabase
          .from('priorities')
          .select('id, integrity_line, fires_extracted, prediction_id, created_at, client_email, target_name')
          .in('client_email', emailsToFetch)
          .eq('share_to_feed', true)
          .order('created_at', { ascending: false })
          .limit(50)

        if (prioritiesError) console.warn('Priorities fetch:', prioritiesError.message)

        // Transform into FeedItems
        const feedItems: FeedItem[] = []

        // Add inspiration shares
        shares?.forEach(s => {
          feedItems.push({
            id: s.id,
            type: s.content_type as 'proof' | 'priority' | 'prediction',
            text: s.share_text || '',
            fires_extracted: s.fires_extracted || [],
            prediction_id: s.prediction_id,
            created_at: s.created_at,
            client_email: s.client_email,
            isOwn: s.client_email === userEmail,
          })
        })

        // Add validations (proofs)
        proofs?.forEach(p => {
          // Avoid duplicates if also in shares
          if (!feedItems.some(fi => fi.id === p.id)) {
            feedItems.push({
              id: p.id,
              type: 'proof',
              text: p.proof_line || '',
              fires_extracted: p.fires_extracted || [],
              prediction_id: p.prediction_id,
              created_at: p.created_at,
              client_email: p.client_email,
              isOwn: p.client_email === userEmail,
            })
          }
        })

        // Add priorities
        priorities?.forEach(p => {
          if (!feedItems.some(fi => fi.id === p.id)) {
            feedItems.push({
              id: p.id,
              type: 'priority',
              text: p.integrity_line || '',
              fires_extracted: p.fires_extracted || [],
              prediction_id: p.prediction_id,
              created_at: p.created_at,
              client_email: p.client_email,
              isOwn: p.client_email === userEmail,
              targetName: p.target_name,
            })
          }
        })

        // Sort by date (most recent first)
        feedItems.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        const finalItems = feedItems.slice(0, 50)
        console.log('[useFeed] filterByCircle:', filterByCircle, 'circle:', circleArray.length, 'items:', finalItems.length)
        setItems(finalItems)
        setError(null)
      } catch (err) {
        console.error('Error fetching feed:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch feed')
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [user?.email, filterByCircle, includeOwn])

  return { items, circleEmails, loading, error }
}
