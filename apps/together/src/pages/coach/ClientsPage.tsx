import { Link } from 'react-router-dom'
import { LoadingSpinner } from '@finding-good/shared'
import { useCoachClients } from '../../hooks/useCoachClients'

export function ClientsPage() {
  const { clients, loading } = useCoachClients()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Where your clients are</p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No active clients</h2>
          <p className="text-gray-600 text-sm">Your coaching engagements will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500">YOUR CLIENTS</h2>
          {clients.map((client) => (
            <Link
              key={client.id}
              to={'/coach/client/' + client.email}
              className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Week {client.engagement_week} · {client.phase} phase
                  </p>
                  <p className="text-sm text-gray-500">
                    {client.active_predictions} active prediction{client.active_predictions !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last activity: {client.last_activity ? formatRelativeTime(client.last_activity) : 'None'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {client.has_new_activity && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <span className="text-amber-500">&#9889;</span>
                      New activity
                    </span>
                  )}
                  {client.inactive_days >= 7 && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      <span>&#9888;&#65039;</span>
                      No activity this week
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return diffDays + ' days ago'
  if (diffDays < 14) return '1 week ago'
  return Math.floor(diffDays / 7) + ' weeks ago'
}
