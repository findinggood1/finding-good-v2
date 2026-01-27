import { Card } from '../ui'
interface ThisWeekSectionProps {
  activePredictions: Array<{
    id: string
    title: string
    status: string
    priority_count: number
    proof_count: number
  }>
  impactCount: number
  improveCount: number
  loading: boolean
}

export function ThisWeekSection({
  activePredictions,
  impactCount,
  improveCount,
  loading,
}: ThisWeekSectionProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </Card>
    )
  }

  const hasAnything = activePredictions.length > 0 || impactCount > 0 || improveCount > 0
  if (!hasAnything) {
    return null
  }

  const totalEvidence = impactCount + improveCount

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">THIS WEEK</div>

      {/* Active Beliefs */}
      {activePredictions.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Active Beliefs</div>
          <div className="space-y-2">
            {activePredictions.map((p) => {
              const total = (p.priority_count || 0) + (p.proof_count || 0)
              // Simple progress: cap at 10 evidence items = 100%
              const pct = Math.min(total * 10, 100)
              return (
                <a
                  key={p.id}
                  href={`/inspire/self`}
                  className="block hover:bg-gray-50 rounded -mx-1 px-1 py-0.5 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-800 truncate flex-1 mr-2">{p.title}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{total} evidence</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-brand-primary rounded-full h-1.5 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Evidence counts */}
      {totalEvidence > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Evidence Collected</div>
          <div className="space-y-1 text-sm text-gray-700">
            {impactCount > 0 && (
              <a href="/impact/self" className="block hover:text-brand-primary transition-colors">
                {impactCount} Impact {impactCount === 1 ? 'entry' : 'entries'} recorded
              </a>
            )}
            {improveCount > 0 && (
              <a href="/improve/self" className="block hover:text-brand-primary transition-colors">
                {improveCount} Improvement{improveCount === 1 ? '' : 's'} validated
              </a>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
