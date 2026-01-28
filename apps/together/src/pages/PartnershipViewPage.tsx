import { useParams, useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '@finding-good/shared'
import { usePartnerInfluence } from '../hooks/usePartnerInfluence'
import { usePartnershipActivity, type PartnerActivityEntry } from '../hooks/usePartnershipActivity'
import { Card } from '../components/ui'

// Inline SVG icons
function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function TrendingUpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

// Activity entry card component
function ActivityEntryCard({ entry }: { entry: PartnerActivityEntry }) {
  const typeConfig = {
    impact: { icon: <ZapIcon />, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Impact' },
    improve: { icon: <TrendingUpIcon />, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Improve' },
    inspire: { icon: <SparklesIcon />, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Inspire' },
  }

  const config = typeConfig[entry.type]
  const timeAgo = getRelativeTime(new Date(entry.date))

  return (
    <div className={`p-3 rounded-lg ${config.bg} border border-gray-100`}>
      <div className="flex items-start gap-3">
        <div className={`${config.color} mt-0.5`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{entry.preview}</p>
        </div>
      </div>
    </div>
  )
}

export function PartnershipViewPage() {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()

  // Decode the partner email from URL
  const partnerEmail = partnerId ? decodeURIComponent(partnerId) : null

  const { influence, loading: influenceLoading, error: influenceError, isPartner } = usePartnerInfluence(partnerEmail)
  const { activity, loading: activityLoading, error: activityError } = usePartnershipActivity(partnerEmail)

  const isLoading = influenceLoading || activityLoading

  const handleBack = () => {
    navigate('/exchange')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  // Handle not found or not a partner
  if (!isPartner || !influence) {
    return (
      <div className="p-4 pb-20">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon />
          <span>Back to Exchange</span>
        </button>

        <Card className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400"><UserIcon /></span>
          </div>
          <h2 className="font-medium text-gray-900 mb-2">Partner not found</h2>
          <p className="text-sm text-gray-500">
            {influenceError || "This partnership doesn't exist or hasn't been accepted yet."}
          </p>
        </Card>
      </div>
    )
  }

  const displayName = influence.name || partnerEmail?.split('@')[0] || 'Partner'
  const hasInfluenceSet = influence.permission || influence.practice || influence.focus.length > 0
  const sentCount = activity.sentToPartner.length
  const receivedCount = activity.receivedFromPartner.length

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon />
        <span>Back to Exchange</span>
      </button>

      {/* Partner Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500">Exchange Partner</p>
        </div>
      </div>

      {/* Their Influence Section */}
      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          Their Influence
        </h2>
        <Card>
          {hasInfluenceSet ? (
            <div className="space-y-4">
              {influence.permission && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Permission</p>
                  <p className="text-gray-800 italic">"{influence.permission}"</p>
                </div>
              )}
              {influence.practice && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Practice</p>
                  <p className="text-gray-800 italic">"{influence.practice}"</p>
                </div>
              )}
              {influence.focus.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {influence.focus.map((f, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {displayName} hasn't set up their Influence declaration yet
            </p>
          )}

          {/* This Week Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">This Week</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{influence.weeklyStats.checkinDays}</span>
                <span className="text-gray-500">/7 check-ins</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{influence.weeklyStats.impactEntries}</span>
                <span className="text-gray-500"> impact {influence.weeklyStats.impactEntries === 1 ? 'entry' : 'entries'}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* What You've Seen In Them */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            What You've Seen In Them ({sentCount})
          </h2>
        </div>

        {sentCount > 0 ? (
          <div className="space-y-2">
            {activity.sentToPartner.slice(0, 5).map((entry) => (
              <ActivityEntryCard key={entry.id} entry={entry} />
            ))}
            {sentCount > 5 && (
              <p className="text-sm text-center text-gray-500 py-2">
                + {sentCount - 5} more
              </p>
            )}
          </div>
        ) : (
          <Card className="text-center py-6">
            <p className="text-sm text-gray-500">
              You haven't sent any observations to {displayName} yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Use Impact, Improve, or Inspire to share what you see
            </p>
          </Card>
        )}
      </section>

      {/* What They've Seen In You */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            What They've Seen In You ({receivedCount})
          </h2>
        </div>

        {receivedCount > 0 ? (
          <div className="space-y-2">
            {activity.receivedFromPartner.slice(0, 5).map((entry) => (
              <ActivityEntryCard key={entry.id} entry={entry} />
            ))}
            {receivedCount > 5 && (
              <p className="text-sm text-center text-gray-500 py-2">
                + {receivedCount - 5} more
              </p>
            )}
          </div>
        ) : (
          <Card className="text-center py-6">
            <p className="text-sm text-gray-500">
              {displayName} hasn't sent any observations to you yet
            </p>
          </Card>
        )}
      </section>

      {/* How You Complement Each Other (Placeholder) */}
      <section>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
          How You Complement Each Other
        </h2>
        <Card className="bg-gray-50 border-dashed">
          <p className="text-sm text-gray-500 text-center py-4">
            Coming soon: AI-generated insights about how your strengths complement each other
          </p>
        </Card>
      </section>

      {activityError && (
        <p className="text-sm text-red-500 text-center">{activityError}</p>
      )}
    </div>
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
