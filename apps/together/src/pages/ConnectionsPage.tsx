import { Link } from 'react-router-dom'
import { LoadingSpinner } from '@finding-good/shared'
import { useConnections, type Connection } from '../hooks'

export function ConnectionsPage() {
  const { connections, loading } = useConnections()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const mutual = connections.filter(c => c.type === 'mutual')
  const youInvited = connections.filter(c => c.type === 'you_invited')
  const invitedYou = connections.filter(c => c.type === 'invited_you')

  if (connections.length === 0) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Circle</h1>
          <p className="text-gray-600 text-sm mt-1">People you've shared with and who have shared with you</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Your circle is empty
          </h2>
          <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
            Invite someone to share priorities or ask for their proof to build your integrity network.
          </p>
          <a
            href="http://localhost:3002"
            className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Invite Someone
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Circle</h1>
        <p className="text-gray-600 text-sm mt-1">People you've shared with and who have shared with you</p>
      </div>

      <div className="space-y-6">
        {mutual.length > 0 && (
          <ConnectionSection title="Mutual" count={mutual.length} connections={mutual} />
        )}
        {youInvited.length > 0 && (
          <ConnectionSection title="You Invited" count={youInvited.length} connections={youInvited} />
        )}
        {invitedYou.length > 0 && (
          <ConnectionSection title="Invited You" count={invitedYou.length} connections={invitedYou} />
        )}
      </div>

      <div className="mt-6">
        <a
          href="http://localhost:3002"
          className="block w-full py-3 bg-brand-primary/10 text-brand-primary font-medium rounded-xl text-center hover:bg-brand-primary/20 transition-colors"
        >
          Invite Someone
        </a>
      </div>
    </div>
  )
}

function ConnectionSection({ title, count, connections }: { title: string; count: number; connections: Connection[] }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 mb-2">
        {title} ({count})
      </h2>
      <div className="space-y-2">
        {connections.map((connection) => (
          <Link
            key={connection.id}
            to={'/connection/' + connection.id}
            className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">
              {connection.name || connection.email.split('@')[0]}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {connection.shareCount} shares · Last: {connection.lastActivity}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
