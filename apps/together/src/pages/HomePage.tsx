import { LoadingSpinner } from '@finding-good/shared'
import { PredictionsHeader, FeedCard, ZoneCards, StorySections, Superpowers } from '../components'
import { usePredictions } from '../hooks/usePredictions'
import { useFeed } from '../hooks/useFeed'

export function HomePage() {
  const { predictions, loading: predictionsLoading } = usePredictions()
  const { items: feedItems, loading: feedLoading } = useFeed()

  const loading = predictionsLoading || feedLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Predictions Header */}
      <PredictionsHeader predictions={predictions} />

      {/* Zone Cards */}
      <ZoneCards />

      {/* Story Sections */}
      <StorySections />

      {/* Superpowers */}
      <Superpowers />

      {/* Feed */}
      <div className="p-4 space-y-3">
        {feedItems.length === 0 ? (
          <EmptyFeedState hasPredictions={predictions.length > 0} />
        ) : (
          feedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  )
}

function EmptyFeedState({ hasPredictions }: { hasPredictions: boolean }) {
  if (!hasPredictions) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          What are you working on?
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Create your first prediction to start building clarity.
        </p>
        <a
          href="http://localhost:3001/new"
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          Create your first prediction
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
      <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Your feed will fill as you practice
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Add priorities and proofs to build your clarity journal.
      </p>
      <a
        href="http://localhost:3002"
        className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
      >
        Add a priority
      </a>
    </div>
  )
}
