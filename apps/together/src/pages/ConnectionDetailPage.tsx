import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export function ConnectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [isMuted, setIsMuted] = useState(false)

  // TODO: Fetch connection data from share_visibility table
  const connection = {
    id,
    name: 'Connection Name',
    email: 'connection@example.com',
    type: 'mutual' as const,
    connectedDate: '3 months ago',
    shares: [] as Array<{ id: string; text: string; type: string }>,
  }

  return (
    <div className="p-4">
      <Link
        to="/connections"
        className="inline-flex items-center text-brand-primary text-sm mb-4 hover:underline"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{connection.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {connection.type === 'mutual' ? 'Mutual' : connection.type === 'you_invited' ? 'You invited' : 'Invited you'} · Connected {connection.connectedDate}
        </p>
      </div>

      {/* How We're Connected */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-2">How We're Connected</h2>
        <p className="text-gray-700 text-sm">Connection history will appear here</p>
      </div>

      {/* About This Connection */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-2">About This Connection</h2>
        <p className="text-gray-500 text-sm italic">Tap to add notes about this connection</p>
      </div>

      {/* Their Recent Shares */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Their Recent Shares</h2>
        {connection.shares.length === 0 ? (
          <p className="text-gray-500 text-sm">{connection.name} hasn't shared anything yet.</p>
        ) : (
          <div className="space-y-2">
            {/* Share cards will go here */}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <a
          href="http://localhost:3001"
          className="flex-1 py-3 bg-brand-primary text-white font-medium rounded-xl text-center hover:bg-brand-primary/90 transition-colors text-sm"
        >
          Ask for Proof
        </a>
        <a
          href="http://localhost:3002"
          className="flex-1 py-3 bg-brand-primary/10 text-brand-primary font-medium rounded-xl text-center hover:bg-brand-primary/20 transition-colors text-sm"
        >
          Send Priority
        </a>
      </div>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
      >
        {isMuted ? 'Unmute from Campfire' : 'Mute from Campfire'}
      </button>
    </div>
  )
}
