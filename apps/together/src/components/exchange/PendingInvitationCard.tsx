import { useState } from 'react'
import { Card } from '../ui'
import type { PendingInvitation } from '../../hooks/useExchangeInvitations'

interface PendingInvitationCardProps {
  invitation: PendingInvitation
  onAccept: (id: string) => Promise<{ success: boolean; error?: string }>
  onDecline: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function PendingInvitationCard({ invitation, onAccept, onDecline }: PendingInvitationCardProps) {
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    setLoading('accept')
    setError(null)
    const result = await onAccept(invitation.id)
    if (!result.success) {
      setError(result.error || 'Failed to accept')
    }
    setLoading(null)
  }

  const handleDecline = async () => {
    setLoading('decline')
    setError(null)
    const result = await onDecline(invitation.id)
    if (!result.success) {
      setError(result.error || 'Failed to decline')
    }
    setLoading(null)
  }

  // Get display name from email
  const displayName = invitation.fromName || invitation.fromEmail.split('@')[0]

  // Format date
  const invitedDate = new Date(invitation.invitedAt)
  const timeAgo = getRelativeTime(invitedDate)

  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex items-start gap-3">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-medium text-sm flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{displayName} wants to connect</p>
              <p className="text-xs text-gray-500">{timeAgo}</p>
            </div>
          </div>

          {invitation.message && (
            <p className="text-sm text-gray-600 mt-2 italic">"{invitation.message}"</p>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAccept}
              disabled={loading !== null}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'accept' ? 'Accepting...' : 'Accept'}
            </button>
            <button
              onClick={handleDecline}
              disabled={loading !== null}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'decline' ? 'Declining...' : 'Decline'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}
