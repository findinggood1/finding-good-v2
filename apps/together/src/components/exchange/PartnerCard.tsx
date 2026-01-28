import { useNavigate } from 'react-router-dom'
import { Card } from '../ui'
import type { ExchangePartner } from '../../hooks/useExchangePartners'

interface PartnerCardProps {
  partner: ExchangePartner
  exchangeCount?: number
}

function ChevronRightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function PartnerCard({ partner, exchangeCount = 0 }: PartnerCardProps) {
  const navigate = useNavigate()

  // Get display name from email
  const displayName = partner.name || partner.email.split('@')[0]

  // Format connected date
  const connectedDate = new Date(partner.connectedAt)
  const timeAgo = getRelativeTime(connectedDate)

  const handleClick = () => {
    // Navigate to partnership view using encoded email
    navigate(`/exchange/${encodeURIComponent(partner.email)}`)
  }

  return (
    <Card
      className="cursor-pointer hover:border-gray-300 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{displayName}</p>
          <p className="text-sm text-gray-500">
            Connected {timeAgo}
            {exchangeCount > 0 && (
              <span className="ml-1">
                &bull; {exchangeCount} exchange{exchangeCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="text-gray-400 flex-shrink-0">
          <ChevronRightIcon />
        </div>
      </div>
    </Card>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays < 1) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''} ago`
}
