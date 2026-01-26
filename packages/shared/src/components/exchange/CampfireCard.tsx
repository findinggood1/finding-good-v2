import { type HTMLAttributes, forwardRef } from 'react'
import type { CampfireItem } from '../../types'
import { Card } from '../ui/Card'
import { FiresBadge } from '../ui/FiresBadge'
import { RecognizeButton } from './RecognizeButton'

interface CampfireCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  item: CampfireItem
  onRecognize?: () => void
}

const TYPE_LABELS: Record<CampfireItem['type'], string> = {
  priority: 'Priority',
  proof: 'Proof',
  predict: 'Prediction',
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const CampfireCard = forwardRef<HTMLDivElement, CampfireCardProps>(
  ({ item, onRecognize, className = '', ...props }, ref) => {
    const { type, author_name, author_email, content, fires_element, recognized_count, has_recognized, shared_at } = item
    const displayName = author_name || author_email.split('@')[0] || 'User'

    return (
      <Card
        ref={ref}
        padding="md"
        className={`${className}`}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-[#0D7C66] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500">{formatTimeAgo(shared_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {fires_element && <FiresBadge element={fires_element} size="sm" />}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {TYPE_LABELS[type]}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <RecognizeButton
            count={recognized_count}
            recognized={has_recognized}
            onClick={onRecognize}
          />
        </div>
      </Card>
    )
  }
)

CampfireCard.displayName = 'CampfireCard'
