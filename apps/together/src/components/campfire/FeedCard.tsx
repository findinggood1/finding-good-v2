import { Card, FiresBadge } from '../ui'

export interface CampfireFeedItem {
  id: string
  person: string
  personEmail: string
  contentType: 'proof' | 'priority' | 'recognition' | 'ask'
  content: string
  fires: ('F' | 'I' | 'R' | 'E' | 'S')[]
  question: string
  createdAt: string
  isRecognized: boolean
}

interface FeedCardProps {
  item: CampfireFeedItem
  onRecognize?: (id: string) => void
  onAsk?: (email: string) => void
  onShareYours?: () => void
}

const CONTENT_TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  proof: { icon: '🔍', label: 'Proof' },
  priority: { icon: '⭐', label: 'Priority' },
  recognition: { icon: '👁', label: 'Recognition' },
  ask: { icon: '❓', label: 'Ask' },
}

export function FeedCard({ item, onRecognize, onAsk, onShareYours }: FeedCardProps) {
  const typeInfo = CONTENT_TYPE_LABELS[item.contentType] || { icon: '📝', label: 'Share' }
  const timeAgo = formatTimeAgo(item.createdAt)

  return (
    <Card className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-gray-800">{item.person}</div>
        <div className="flex gap-1">
          {item.fires.map((f, i) => (
            <FiresBadge key={`${f}-${i}`} element={f} size="sm" />
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        {typeInfo.icon} {typeInfo.label} • {timeAgo}
      </div>
      <div className="text-gray-700 mb-3">{item.content}</div>
      <div className="text-sm text-gray-600 italic mb-4">💭 {item.question}</div>
      <div className="flex gap-2">
        <button
          className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-all ${
            item.isRecognized
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onRecognize?.(item.id)}
          disabled={item.isRecognized}
        >
          ✓ {item.isRecognized ? 'Recognized' : 'Recognize'}
        </button>
        <button
          className="flex-1 text-xs px-3 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          onClick={() => onAsk?.(item.personEmail)}
        >
          💬 Ask {item.person.split(' ')[0]}
        </button>
        <button
          className="flex-1 text-xs px-3 py-2 rounded-lg font-medium text-teal-700 hover:bg-teal-50 transition-all"
          onClick={onShareYours}
        >
          🔥 Share yours
        </button>
      </div>
    </Card>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}
