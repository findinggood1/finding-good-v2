import { LoadingSpinner } from '@finding-good/shared'
import { TrajectoryChart, YoursVsOthersChart } from '../components/map'
import { PredictabilityCard, FiresGrid, ActivityCounts } from '../components/home'
import { usePredictions } from '../hooks/usePredictions'
import { useTrajectory, useActivityCounts, useYoursVsOthers, useZoneData } from '../hooks'

export function MapPage() {
  const { predictions, loading: predictionsLoading } = usePredictions()
  const { trajectory, loading: trajectoryLoading } = useTrajectory()
  const { counts, loading: countsLoading } = useActivityCounts('all')
  const { comparison, loading: comparisonLoading } = useYoursVsOthers()
  const { zoneBreakdown, growthOpportunity, loading: zoneLoading } = useZoneData()

  const activePrediction = predictions.find(p => p.status === 'active')
  const predictabilityScore = (activePrediction as { current_predictability_score?: number } | undefined)?.current_predictability_score ?? null

  const loading = predictionsLoading || trajectoryLoading || countsLoading || comparisonLoading || zoneLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Map</h1>
        <p className="text-gray-600 text-sm mt-1">Your trajectory over time</p>
      </div>

      {/* Predictability Score */}
      <PredictabilityCard
        score={predictabilityScore}
        trend={null}
        clarity={null}
        confidence={null}
        connection={null}
      />

      {/* FIRES Grid */}
      <FiresGrid
        zoneBreakdown={zoneBreakdown}
        growthEdge={growthOpportunity?.element ?? null}
      />

      {/* Trajectory Chart */}
      <TrajectoryChart trajectory={trajectory} />

      {/* Activity Counts (All Time) */}
      <ActivityCounts counts={counts} scope="all" />

      {/* Yours vs Others FIRES Comparison */}
      <YoursVsOthersChart
        comparison={comparison}
        growthEdge={growthOpportunity?.element ?? null}
      />
    </div>
  )
}
