import { Card } from '../ui'

export interface ActiveAsk {
  id: string
  type: 'respond' | 'waiting'
  personName: string
  personEmail: string
  question: string
  createdAt: string
}

interface ActiveAsksProps {
  respondAsks: ActiveAsk[]
  waitingAsks: ActiveAsk[]
  onRespond?: (ask: ActiveAsk) => void
}

export function ActiveAsks({ respondAsks, waitingAsks, onRespond }: ActiveAsksProps) {
  const hasAsks = respondAsks.length > 0 || waitingAsks.length > 0

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">ACTIVE ASKS</div>

      {!hasAsks ? (
        <div className="text-sm text-gray-500 text-center py-4">
          No active asks right now
        </div>
      ) : (
        <>
          {/* Respond section */}
          {respondAsks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500">📩</span>
                <span className="text-sm font-medium">RESPOND ({respondAsks.length})</span>
              </div>
              {respondAsks.map((ask) => (
                <div key={ask.id} className="p-3 bg-amber-50 rounded-lg mb-2">
                  <div className="font-medium text-sm">{ask.personName}:</div>
                  <div className="text-sm text-gray-700 mb-2">"{ask.question}"</div>
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                    onClick={() => onRespond?.(ask)}
                  >
                    Respond →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Waiting section */}
          {waitingAsks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400">⏳</span>
                <span className="text-sm font-medium text-gray-500">
                  WAITING ({waitingAsks.length})
                </span>
              </div>
              {waitingAsks.map((ask) => (
                <div key={ask.id} className="text-sm text-gray-500 mb-1">
                  You asked {ask.personName}: "{ask.question}" — {formatTimeAgo(ask.createdAt)}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}
