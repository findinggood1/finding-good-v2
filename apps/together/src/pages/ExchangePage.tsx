import { LoadingSpinner } from '@finding-good/shared'
import { useZoneData } from '../hooks/useZoneData'
import { useExchangeImpacts } from '../hooks/useExchangeImpacts'
import { GrowthEdgeCard, ExchangeImpactCard, ActiveAsks } from '../components/exchange'

export function ExchangePage() {
  const { growthOpportunity, loading: zoneLoading } = useZoneData()
  const { impacts, loading: impactsLoading } = useExchangeImpacts()

  const isLoading = zoneLoading || impactsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Growth Edge */}
      <GrowthEdgeCard
        element={growthOpportunity?.element || null}
        zone={growthOpportunity?.zone || null}
      />

      {/* Exchange Impact */}
      <ExchangeImpactCard
        impacts={impacts}
        sentCount={0}
        receivedCount={0}
        impactfulCount={impacts.length}
      />

      {/* Active Asks */}
      <ActiveAsks
        respondAsks={[]}
        waitingAsks={[]}
      />
    </div>
  )
}
