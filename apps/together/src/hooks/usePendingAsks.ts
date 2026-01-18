import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface PendingAsk {
  id: string
  type: 'proof_request' | 'priority_ask'
  requester_email: string
  requester_name: string | null
  question: string
  created_at: string
  share_id?: string
}

export function usePendingAsks() {
  const { user } = useAuth()
  const [asks, setAsks] = useState<PendingAsk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setAsks([])
      setLoading(false)
      return
    }

    const fetchAsks = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email!

        // Fetch pending proof_requests where user is the recipient
        const { data: proofRequests } = await supabase
          .from('proof_requests')
          .select('id, requester_email, requester_name, goal_challenge, created_at, share_id')
          .eq('recipient_email', userEmail)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        // Transform to PendingAsk format
        const pendingAsks: PendingAsk[] = []

        proofRequests?.forEach(pr => {
          pendingAsks.push({
            id: pr.id,
            type: 'proof_request',
            requester_email: pr.requester_email,
            requester_name: pr.requester_name,
            question: pr.goal_challenge || 'What would you tell them?',
            created_at: pr.created_at,
            share_id: pr.share_id,
          })
        })

        // Sort by date
        pendingAsks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setAsks(pendingAsks)
        setError(null)
      } catch (err) {
        console.error('Error fetching pending asks:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch asks')
      } finally {
        setLoading(false)
      }
    }

    fetchAsks()
  }, [user?.email])

  return { asks, loading, error }
}
