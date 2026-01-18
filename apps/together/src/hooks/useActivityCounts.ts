import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface ActivityCounts {
  priorities: number
  proofs: number
  sent: number
  received: number
  pending: number
}

export function useActivityCounts(scope: 'week' | 'all' = 'week') {
  const { user } = useAuth()
  const [counts, setCounts] = useState<ActivityCounts>({
    priorities: 0,
    proofs: 0,
    sent: 0,
    received: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setCounts({ priorities: 0, proofs: 0, sent: 0, received: 0, pending: 0 })
      setLoading(false)
      return
    }

    const fetchCounts = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email

        // Calculate date threshold for 'week' scope
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoISO = weekAgo.toISOString()

        // Build queries with optional date filtering
        let prioritiesQuery = supabase
          .from('priorities')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', userEmail)

        let proofsQuery = supabase
          .from('validations')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', userEmail)

        let sentQuery = supabase
          .from('priorities')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', userEmail)
          .eq('type', 'other')

        let receivedQuery = supabase
          .from('priorities')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_email', userEmail)
          .not('client_email', 'eq', userEmail)

        // Pending asks don't have date scope - always show current pending
        const pendingQuery = supabase
          .from('proof_requests')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_email', userEmail)
          .eq('status', 'pending')

        // Apply date filter for 'week' scope
        if (scope === 'week') {
          prioritiesQuery = prioritiesQuery.gte('created_at', weekAgoISO)
          proofsQuery = proofsQuery.gte('created_at', weekAgoISO)
          sentQuery = sentQuery.gte('created_at', weekAgoISO)
          receivedQuery = receivedQuery.gte('created_at', weekAgoISO)
        }

        // Execute all queries in parallel
        const [prioritiesRes, proofsRes, sentRes, receivedRes, pendingRes] = await Promise.all([
          prioritiesQuery,
          proofsQuery,
          sentQuery,
          receivedQuery,
          pendingQuery,
        ])

        const newCounts: ActivityCounts = {
          priorities: prioritiesRes.count ?? 0,
          proofs: proofsRes.count ?? 0,
          sent: sentRes.count ?? 0,
          received: receivedRes.count ?? 0,
          pending: pendingRes.count ?? 0,
        }

        setCounts(newCounts)
        setError(null)
      } catch (err) {
        console.error('Error fetching activity counts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch counts')
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [user?.email, scope])

  return { counts, loading, error }
}
