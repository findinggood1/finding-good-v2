import { Card } from '../ui'
import type { DailyReflection } from '../../hooks/useDailyReflection'
import type { WeeklyActivity } from '../../hooks/useWeeklyActivity'

interface InsightsSectionProps {
  reflection: DailyReflection | null
  weeklyCheckinCount: number
  weeklyActivity: WeeklyActivity
}

interface Insight {
  icon: string
  text: string
}

function deriveInsights({
  reflection,
  weeklyCheckinCount,
  weeklyActivity,
}: InsightsSectionProps): Insight[] {
  const insights: Insight[] = []

  // Consistency insight
  if (weeklyCheckinCount >= 5) {
    insights.push({ icon: '🔥', text: "You've checked in every day this week — incredible consistency!" })
  } else if (weeklyCheckinCount >= 3) {
    insights.push({ icon: '💪', text: `You've checked in ${weeklyCheckinCount} days this week — great consistency!` })
  }

  // Engagement insight
  if (reflection?.engagement_level && reflection.engagement_level >= 4) {
    insights.push({ icon: '⚡', text: "Your engagement is high today — you're showing up fully." })
  }

  // Evidence insight
  const totalEvidence = weeklyActivity.impactCount + weeklyActivity.improveCount
  if (totalEvidence >= 5) {
    insights.push({ icon: '📈', text: `${totalEvidence} pieces of evidence collected this week — strong momentum.` })
  } else if (totalEvidence >= 2) {
    insights.push({ icon: '✨', text: `You've captured ${totalEvidence} entries this week. Keep building the pattern.` })
  }

  // Active beliefs insight
  if (weeklyActivity.activePredictions.length >= 3) {
    insights.push({ icon: '🎯', text: `${weeklyActivity.activePredictions.length} active beliefs — you're building on multiple fronts.` })
  }

  return insights.slice(0, 2)
}

export function InsightsSection(props: InsightsSectionProps) {
  const insights = deriveInsights(props)

  if (insights.length === 0) {
    return null
  }

  return (
    <Card className="bg-brand-primary/5 border-brand-primary/10">
      <div className="text-sm font-medium text-gray-600 mb-3">INSIGHTS</div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0">{insight.icon}</span>
            <span className="text-gray-700">{insight.text}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
