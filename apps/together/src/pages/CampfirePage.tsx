import { LoadingSpinner } from '@finding-good/shared'
import { FeedCard } from '../components'
import { useCampfire } from '../hooks'

export function CampfirePage() {
  const { items, loading } = useCampfire()

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
        <h1 className="text-2xl font-bold text-gray-900">Campfire</h1>
        <p className="text-gray-600 text-sm mt-1">What's alive in your circle</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">&#128293;</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Your campfire is warming up
          </h2>
          <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
            As you share priorities and ask others for their proof, their reflections will appear here.
          </p>
          <a
            href="http://localhost:3002"
            className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Invite Someone to Share
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
