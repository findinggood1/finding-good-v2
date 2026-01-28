import { useState } from 'react'
import { LoadingSpinner } from '@finding-good/shared'
import { useExchangePartners } from '../hooks/useExchangePartners'
import { useExchangeInvitations } from '../hooks/useExchangeInvitations'
import { PartnerCard, PendingInvitationCard } from '../components/exchange'
import { Card } from '../components/ui'

// Inline SVG icons
function UserPlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )
}

function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function ExchangePage() {
  const { partners, loading: partnersLoading, error: partnersError } = useExchangePartners()
  const { pending, loading: invitationsLoading, accept, decline, invite } = useExchangeInvitations()

  // Invite modal state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const isLoading = partnersLoading || invitationsLoading

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviteLoading(true)
    setInviteError(null)
    setInviteSuccess(false)

    const result = await invite(inviteEmail.trim(), inviteMessage.trim() || undefined)

    if (result.success) {
      setInviteSuccess(true)
      setInviteEmail('')
      setInviteMessage('')
      // Hide success message after 3 seconds
      setTimeout(() => {
        setInviteSuccess(false)
        setShowInviteForm(false)
      }, 3000)
    } else {
      setInviteError(result.error || 'Failed to send invitation')
    }

    setInviteLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  const hasPartners = partners.length > 0
  const hasPending = pending.length > 0

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Exchange</h1>
        <p className="text-gray-600 text-sm mt-1">See the influence you share with others</p>
      </div>

      {/* Pending Invitations Section */}
      {hasPending && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600"><MailIcon /></span>
            <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Pending Invitations ({pending.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pending.map((invitation) => (
              <PendingInvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={accept}
                onDecline={decline}
              />
            ))}
          </div>
        </section>
      )}

      {/* Exchange Partners Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-600"><UsersIcon /></span>
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Your Exchange Partners
          </h2>
        </div>

        {partnersError && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-sm text-red-600">{partnersError}</p>
          </Card>
        )}

        {hasPartners ? (
          <div className="space-y-3">
            {partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                // TODO: Add exchange count once we track this
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400"><UsersIcon className="w-6 h-6" /></span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No exchange partners yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start building your exchange circle by inviting someone to connect
            </p>
          </Card>
        )}
      </section>

      {/* Invite Section */}
      <section>
        {!showInviteForm ? (
          <button
            onClick={() => setShowInviteForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <UserPlusIcon />
            <span className="font-medium">Invite Someone to Exchange</span>
          </button>
        ) : (
          <Card>
            <h3 className="font-medium text-gray-900 mb-3">Invite to Exchange</h3>

            {inviteSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckIcon />
                </div>
                <p className="text-green-600 font-medium">Invitation sent!</p>
                <p className="text-sm text-gray-500 mt-1">They'll see it when they log in</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="inviteMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Personal message (optional)
                  </label>
                  <textarea
                    id="inviteMessage"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Would love to share our journeys together..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                {inviteError && (
                  <p className="text-sm text-red-600">{inviteError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false)
                      setInviteEmail('')
                      setInviteMessage('')
                      setInviteError(null)
                    }}
                    className="py-2 px-4 text-gray-600 font-medium rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </Card>
        )}
      </section>
    </div>
  )
}
