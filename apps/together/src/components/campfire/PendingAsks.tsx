import { Card } from '../ui'
import type { PendingAsk } from '../../hooks/usePendingAsks'

interface PendingAsksProps {
  asks: PendingAsk[]
  onRespond?: (ask: PendingAsk) => void
}

export function PendingAsks({ asks, onRespond }: PendingAsksProps) {
  if (asks.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-orange-500">🔥</span>
          <span className="text-sm font-medium text-gray-600">ASKED OF YOU (0)</span>
        </div>
        <Card>
          <div className="text-sm text-gray-500 text-center py-4">
            No asks waiting for you
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-orange-500">🔥</span>
        <span className="text-sm font-medium text-gray-600">
          ASKED OF YOU ({asks.length})
        </span>
      </div>
      {asks.map((ask) => (
        <Card key={ask.id} className="border-amber-200 bg-amber-50 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-800">
              {ask.requester_name || ask.requester_email}
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            ❓ Ask • {formatTimeAgo(ask.created_at)}
          </div>
          <div className="text-gray-700 mb-3">"{ask.question}"</div>
          <div className="text-sm text-gray-600 italic mb-3">
            💭 What would you tell them?
          </div>
          <button
            className="w-full px-4 py-2 rounded-lg font-medium bg-teal-700 text-white hover:bg-teal-800 transition-all text-sm"
            onClick={() => onRespond?.(ask)}
          >
            Respond to {(ask.requester_name || ask.requester_email).split(' ')[0]} →
          </button>
        </Card>
      ))}
    </div>
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
