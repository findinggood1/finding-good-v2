import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FeedItem } from '../components/FeedCard'

export function useFeed() {
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

    const fetchFeed = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email
        
        // Fetch user's proofs (validations)
        const { data: proofs, error: proofsError } = await supabase
          .from('validations')
          .select('id, proof_line, fires_extracted, prediction_id, created_at, client_email')
          .eq('client_email', userEmail)
          .order('created_at', { ascending: false })
          .limit(50)

        if (proofsError) console.warn('Proofs fetch:', proofsError.message)

        // Transform into FeedItems
        const feedItems: FeedItem[] = []

        if (proofs) {
          proofs.forEach(p => {
            feedItems.push({
              id: p.id,
              type: 'proof',
              text: p.proof_line || '',
              fires_extracted: p.fires_extracted || [],
              prediction_id: p.prediction_id,
              created_at: p.created_at,
              client_email: p.client_email,
              isOwn: true,
            })
          })
        }

        // Sort by date (most recent first)
        feedItems.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        setItems(feedItems.slice(0, 50))
        setError(null)
      } catch (err) {
        console.error('Error fetching feed:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch feed')
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [user?.email])

  return { items, loading, error }
}
