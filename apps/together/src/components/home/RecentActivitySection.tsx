import { Card } from '../ui'
import type { ActivityEntry } from '../../hooks/useRecentActivity'
import { timeAgo } from '../../hooks/useRecentActivity'

interface RecentActivitySectionProps {
  sent: ActivityEntry[]
  received: ActivityEntry[]
  loading: boolean
}

const TYPE_ICON: Record<string, string> = {
  impact: '⚡',
  improve: '📈',
  inspire: '✨',
}

function EntryRow({ entry }: { entry: ActivityEntry }) {
  const icon = TYPE_ICON[entry.type] || '•'
  const person = entry.personName
    ? entry.direction === 'sent'
      ? ` to ${entry.personName}`
      : ` from ${entry.personName}`
    : ''

  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-gray-800 line-clamp-1">
          {entry.summary}
          {person && <span className="text-gray-500">{person}</span>}
        </span>
        <div className="text-xs text-gray-400">{timeAgo(entry.created_at)}</div>
      </div>
    </div>
  )
}

export function RecentActivitySection({ sent, received, loading }: RecentActivitySectionProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </Card>
    )
  }

  if (sent.length === 0 && received.length === 0) {
    return (
      <Card>
        <div className="text-sm font-medium text-gray-600 mb-3">RECENT ACTIVITY</div>
        <p className="text-sm text-gray-400 italic">Start noticing impact in others</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">RECENT ACTIVITY</div>

      {sent.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">
            What you're noticing in others
          </div>
          <div className="space-y-2">
            {sent.map(entry => <EntryRow key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}

      {received.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">
            What they're noticing in you
          </div>
          <div className="space-y-2">
            {received.map(entry => <EntryRow key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}
    </Card>
  )
}
