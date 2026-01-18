import { useState, useEffect } from 'react'
import { LoadingSpinner, getSupabase, useAuth } from '@finding-good/shared'
import { useZoneData } from '../hooks/useZoneData'
import { useExchangeImpacts } from '../hooks/useExchangeImpacts'
import { usePendingAsks } from '../hooks/usePendingAsks'
import { useActivityCounts } from '../hooks/useActivityCounts'
import { GrowthEdgeCard, ExchangeImpactCard, ActiveAsks, type ActiveAsk } from '../components/exchange'

export function ExchangePage() {
  const { user } = useAuth()
  const { growthOpportunity, loading: zoneLoading } = useZoneData()
  const { impacts, loading: impactsLoading } = useExchangeImpacts()
  const { asks: pendingAsks, loading: asksLoading } = usePendingAsks()
  const { counts, loading: countsLoading } = useActivityCounts('all')

  // State for asks user sent that are waiting for responses
  const [waitingAsks, setWaitingAsks] = useState<ActiveAsk[]>([])
  const [waitingLoading, setWaitingLoading] = useState(true)

  // Fetch asks the user sent that are waiting for responses
  useEffect(() => {
    if (!user?.email) {
      setWaitingAsks([])
      setWaitingLoading(false)
      return
    }

    const fetchWaitingAsks = async () => {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('proof_requests')
          .select('id, recipient_name, recipient_email, goal_challenge, created_at')
          .eq('requester_email', user.email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error

        const waiting: ActiveAsk[] = (data ?? []).map(pr => ({
          id: pr.id,
          type: 'waiting' as const,
          personName: pr.recipient_name || pr.recipient_email?.split('@')[0] || 'Someone',
          personEmail: pr.recipient_email || '',
          question: pr.goal_challenge || '',
          createdAt: pr.created_at,
        }))

        setWaitingAsks(waiting)
      } catch (err) {
        console.error('Error fetching waiting asks:', err)
      } finally {
        setWaitingLoading(false)
      }
    }

    fetchWaitingAsks()
  }, [user?.email])

  const isLoading = zoneLoading || impactsLoading || asksLoading || countsLoading || waitingLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  // Transform pendingAsks to ActiveAsk format for respond section
  const respondAsks: ActiveAsk[] = pendingAsks.map(ask => ({
    id: ask.id,
    type: 'respond' as const,
    personName: ask.requester_name || ask.requester_email.split('@')[0],
    personEmail: ask.requester_email,
    question: ask.question,
    createdAt: ask.created_at,
  }))

  return (
    <div className="p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Exchange</h1>
        <p className="text-gray-600 text-sm mt-1">Who's helping whom</p>
      </div>

      {/* Growth Edge */}
      <GrowthEdgeCard
        element={growthOpportunity?.element || null}
        zone={growthOpportunity?.zone || null}
      />

      {/* Exchange Impact */}
      <ExchangeImpactCard
        impacts={impacts}
        sentCount={counts.sent}
        receivedCount={counts.received}
        impactfulCount={impacts.length}
      />

      {/* Active Asks */}
      <ActiveAsks
        respondAsks={respondAsks}
        waitingAsks={waitingAsks}
      />
    </div>
  )
}
