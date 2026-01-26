import { type HTMLAttributes, forwardRef } from 'react'
import type { CircleMember } from '../../types'

interface CircleStatusRowProps extends HTMLAttributes<HTMLDivElement> {
  member: CircleMember
  onNudge?: () => void
}

function formatLastShare(dateString?: string | null): string {
  if (!dateString) return 'No shares yet'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Shared today'
  if (diffDays === 1) return 'Shared yesterday'
  if (diffDays < 7) return `Shared ${diffDays} days ago`
  return `Shared ${date.toLocaleDateString()}`
}

export const CircleStatusRow = forwardRef<HTMLDivElement, CircleStatusRowProps>(
  ({ member, onNudge, className = '', ...props }, ref) => {
    const { email, name, has_checked_in_today, last_share_date } = member
    const displayName = name || email.split('@')[0] || 'User'

    return (
      <div
        ref={ref}
        className={`
          flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-100
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {/* Check-in indicator dot */}
            <span
              className={`
                absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white
                ${has_checked_in_today ? 'bg-green-500' : 'bg-gray-300'}
              `.trim().replace(/\s+/g, ' ')}
              title={has_checked_in_today ? 'Checked in today' : 'Not checked in today'}
            />
          </div>

          {/* Name and status */}
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500">{formatLastShare(last_share_date)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!has_checked_in_today && onNudge && (
            <button
              onClick={onNudge}
              className="text-xs px-3 py-1.5 rounded-full bg-[#0D7C66]/10 text-[#0D7C66] hover:bg-[#0D7C66]/20 transition-colors font-medium"
            >
              Inspire
            </button>
          )}
        </div>
      </div>
    )
  }
)

CircleStatusRow.displayName = 'CircleStatusRow'
