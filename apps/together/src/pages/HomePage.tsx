import { LoadingSpinner } from '@finding-good/shared'
import { PredictionsHeader, FeedCard } from '../components'
import { InfluenceSection, DailyCheckin, ThisWeekSection, RecentActivitySection, InsightsSection } from '../components/home'
import { usePermission } from '../hooks/usePermission'
import { useDailyReflection } from '../hooks/useDailyReflection'
import { usePredictions } from '../hooks/usePredictions'
import { useFeed } from '../hooks/useFeed'
import { useWeeklyActivity } from '../hooks/useWeeklyActivity'
import { useRecentActivity } from '../hooks/useRecentActivity'

export function HomePage() {
  const { permission, loading: permissionLoading, savePermission } = usePermission()
  const {
    reflection, loading: reflectionLoading,
    toggleFocusItem, setEngagement, saveAnswer,
  } = useDailyReflection()
  const { predictions, loading: predictionsLoading } = usePredictions()
  const { items: feedItems, loading: feedLoading } = useFeed()
  const {
    activePredictions: weeklyPredictions, impactCount, improveCount, checkinCount,
    loading: weeklyLoading,
  } = useWeeklyActivity()
  const { sent, received, loading: recentLoading } = useRecentActivity()

  const loading = predictionsLoading || feedLoading

  if (loading && permissionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Your Influence */}
      <div className="px-4 pt-4">
        <InfluenceSection
          permission={permission}
          loading={permissionLoading}
          onSave={savePermission}
        />
      </div>

      {/* 2. What You're Creating (Predictions) */}
      <PredictionsHeader predictions={predictions} />

      {/* 3. Today's Check-in */}
      <div className="px-4">
        <DailyCheckin
          focusItems={permission?.focus || []}
          reflection={reflection}
          loading={reflectionLoading}
          weeklyCheckinCount={checkinCount}
          onToggleItem={toggleFocusItem}
          onSetEngagement={setEngagement}
          onSaveAnswer={saveAnswer}
        />
      </div>

      {/* 4. This Week */}
      <div className="px-4">
        <ThisWeekSection
          activePredictions={weeklyPredictions}
          impactCount={impactCount}
          improveCount={improveCount}
          loading={weeklyLoading}
        />
      </div>

      {/* 5. Recent Activity */}
      <div className="px-4">
        <RecentActivitySection
          sent={sent}
          received={received}
          loading={recentLoading}
        />
      </div>

      {/* 6. Insights */}
      <div className="px-4">
        <InsightsSection
          reflection={reflection}
          weeklyCheckinCount={checkinCount}
          weeklyActivity={{
            activePredictions: weeklyPredictions,
            impactCount,
            improveCount,
            checkinCount,
          }}
        />
      </div>

      {/* 7. Feed */}
      <div className="px-4 space-y-3">
        <div className="text-sm font-medium text-gray-600">FEED</div>
        {feedItems.length === 0 ? (
          <EmptyFeedState hasPredictions={predictions.length > 0} />
        ) : (
          feedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  )
}

function EmptyFeedState({ hasPredictions }: { hasPredictions: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-center">
      <p className="text-sm text-gray-500">
        {hasPredictions
          ? 'Your feed will fill as you record impact and improvements.'
          : 'Define a belief to start building clarity.'}
      </p>
      <a
        href={hasPredictions ? '/impact/self' : '/inspire/self'}
        className="inline-block mt-2 text-sm font-medium text-brand-primary hover:underline"
      >
        {hasPredictions ? 'Record your impact' : 'Define your first belief'}
      </a>
    </div>
  )
}
