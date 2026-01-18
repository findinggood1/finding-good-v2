import { useState } from 'react'
import type { FiresElement } from '@finding-good/shared'
import { FIRES_COLORS, FIRES_LABELS } from '@finding-good/shared'

export type FeedItemType = 'priority' | 'proof' | 'share' | 'prediction'

export interface FeedItem {
  id: string
  type: FeedItemType
  text: string
  fires_extracted: FiresElement[]
  prediction_id?: string
  created_at: string
  client_email: string
  client_name?: string
  isOwn: boolean
  targetName?: string  // For priorities about others
}

interface FeedCardProps {
  item: FeedItem
  onExpand?: (item: FeedItem) => void
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return diffMins + 'm ago'
  if (diffHours < 24) return diffHours + 'h ago'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return diffDays + 'd ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTypeLabel(type: FeedItemType): string {
  switch (type) {
    case 'priority': return 'Priority'
    case 'proof': return 'Proof'
    case 'share': return 'Share'
    case 'prediction': return 'Prediction'
  }
}

function PriorityIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ProofIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}

function PredictionIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function getTypeIcon(type: FeedItemType) {
  switch (type) {
    case 'priority': return <PriorityIcon />
    case 'proof': return <ProofIcon />
    case 'share': return <ShareIcon />
    case 'prediction': return <PredictionIcon />
  }
}

function FiresBadge({ element }: { element: FiresElement }) {
  const color = FIRES_COLORS[element]
  const label = FIRES_LABELS[element]
  
  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + '20', color }}
    >
      {label}
    </span>
  )
}

export function FeedCard({ item, onExpand }: FeedCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  const handleClick = () => {
    if (item.isOwn) {
      setExpanded(!expanded)
    } else if (onExpand) {
      onExpand(item)
    }
  }

  const displayName = item.isOwn ? 'You' : (item.client_name || item.client_email.split('@')[0])
  const cardClasses = 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-colors' + (item.isOwn ? ' cursor-pointer hover:bg-gray-50' : '')
  const nameClasses = 'font-medium text-sm ' + (item.isOwn ? 'text-brand-primary' : 'text-gray-700')
  const contentClasses = 'text-gray-700 text-sm' + (expanded ? '' : ' line-clamp-2')

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={nameClasses}>
            {displayName}'s {getTypeLabel(item.type)}
          </span>
          <span className="text-gray-400">
            {getTypeIcon(item.type)}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {formatTimeAgo(item.created_at)}
        </span>
      </div>
      
      <p className={contentClasses}>
        "{item.text}"
      </p>
      
      {item.fires_extracted && item.fires_extracted.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.fires_extracted.map((element) => (
            <FiresBadge key={element} element={element} />
          ))}
        </div>
      )}
      
      {item.isOwn && !expanded && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <span>Tap to expand</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  )
}
