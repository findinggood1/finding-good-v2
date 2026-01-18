import { Card, FiresBadge, FIRES_LABELS } from '../ui'
import type { FiresComparison } from '../../hooks/useYoursVsOthers'

interface YoursVsOthersChartProps {
  comparison: FiresComparison[]
  growthEdge?: string | null // FIRES element that is growth edge
}

// Map lowercase element names to badge letters
const ELEMENT_TO_BADGE: Record<string, 'F' | 'I' | 'R' | 'E' | 'S'> = {
  feelings: 'F',
  influence: 'I',
  resilience: 'R',
  ethics: 'E',
  strengths: 'S',
}

export function YoursVsOthersChart({ comparison, growthEdge }: YoursVsOthersChartProps) {
  if (comparison.length === 0) {
    return (
      <Card>
        <div className="text-sm font-medium text-gray-600 mb-3">YOUR FIRES</div>
        <div className="text-sm text-gray-500 text-center py-4">
          Complete entries to see your FIRES patterns
        </div>
      </Card>
    )
  }

  // Find max for scaling
  const maxYours = Math.max(...comparison.map(c => c.yours), 1)
  const maxOthers = Math.max(...comparison.map(c => c.others), 1)

  // Find element where others see more than you mention (for insight)
  const insightElement = comparison.find(c => c.others > c.yours)

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">YOUR FIRES</div>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-teal-600" />
          <span>In your entries</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Others saw in you</span>
        </div>
      </div>

      <div className="space-y-4">
        {comparison.map((item) => {
          const badgeLetter = ELEMENT_TO_BADGE[item.element]
          const label = FIRES_LABELS[badgeLetter]
          const isEdge = item.element === growthEdge

          return (
            <div key={item.element} className="flex items-center gap-3">
              <FiresBadge element={badgeLetter} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className={isEdge ? 'text-red-700 font-medium' : 'text-gray-700'}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.yours}x / {item.others}x
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${(item.yours / maxYours) * 100}%` }}
                    />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(item.others / maxOthers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              {isEdge && <span className="text-xs text-red-600">← edge</span>}
            </div>
          )
        })}
      </div>

      {insightElement && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 italic">
            💭 Others see your {FIRES_LABELS[ELEMENT_TO_BADGE[insightElement.element]]} more than you mention it. What might that mean?
          </div>
        </div>
      )}
    </Card>
  )
}
