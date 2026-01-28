import type { FocusAverage } from '../../hooks/useWeekHistory'

interface WeeklyEngagementProps {
  focusAverages: FocusAverage[]
  loading?: boolean
}

/**
 * Weekly engagement averages per focus item.
 *
 * Indicators:
 * - ⚡ = High engagement (≥3.5)
 * - (none) = Moderate engagement (2.5-3.5)
 * - ⚠️ = Low engagement (<2.5)
 */
export function WeeklyEngagement({ focusAverages, loading }: WeeklyEngagementProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-gray-200 rounded w-2/3" />
          ))}
        </div>
      </div>
    )
  }

  if (focusAverages.length === 0) {
    return null
  }

  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Engagement This Week
      </div>
      <div className="space-y-2">
        {focusAverages.map((focus) => (
          <div key={focus.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{focus.name}</span>
            <span className={`text-sm font-medium ${getIndicatorColor(focus.indicator)}`}>
              {getIndicatorIcon(focus.indicator)} {focus.average} avg
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getIndicatorIcon(indicator: 'high' | 'moderate' | 'low'): string {
  switch (indicator) {
    case 'high':
      return '⚡'
    case 'low':
      return '⚠️'
    default:
      return ''
  }
}

function getIndicatorColor(indicator: 'high' | 'moderate' | 'low'): string {
  switch (indicator) {
    case 'high':
      return 'text-green-600'
    case 'low':
      return 'text-amber-600'
    default:
      return 'text-gray-600'
  }
}
