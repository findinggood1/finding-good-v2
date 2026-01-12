import { useState } from 'react'
import { LoadingSpinner, FIRES_COLORS, FIRES_LABELS } from '@finding-good/shared'
import { useIntegrityMaps, type IntegrityMap } from '../hooks'

export function MapsPage() {
  const { maps, loading, generating, generateMap } = useIntegrityMaps()
  const [selectedMap, setSelectedMap] = useState<IntegrityMap | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (selectedMap) {
    return <MapDetailView map={selectedMap} onBack={() => setSelectedMap(null)} />
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrity Maps</h1>
        <p className="text-gray-600 text-sm mt-1">Snapshots of your clarity</p>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateMap}
        disabled={generating}
        className="w-full py-3 mb-6 bg-brand-primary text-white font-medium rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate New Map'}
      </button>

      {/* Maps List */}
      {maps.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Generate your first Integrity Map
          </h2>
          <p className="text-gray-600 text-sm max-w-xs mx-auto">
            Maps synthesize your priorities, proofs, and patterns into a weekly snapshot of your clarity journey.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500">Your Maps</h2>
          {maps.map((map) => {
            const activityCount = map.predictions_data?.reduce((sum, p) => sum + p.activity_count, 0) || 0
            return (
              <div key={map.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="font-medium text-gray-900">
                  {formatDateRange(map.date_range_start, map.date_range_end)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activityCount} activities · {map.wins?.length || 0} wins
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setSelectedMap(map)}
                    className="flex-1 py-2 text-sm text-brand-primary font-medium hover:bg-brand-primary/5 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button className="flex-1 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                    Share
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MapDetailView({ map, onBack }: { map: IntegrityMap; onBack: () => void }) {
  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="inline-flex items-center text-brand-primary text-sm mb-4 hover:underline"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Maps
      </button>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {formatDateRange(map.date_range_start, map.date_range_end)}
        </h1>
        {map.summary && (
          <p className="text-gray-600 mt-2">{map.summary}</p>
        )}
      </div>

      {/* FIRES Patterns */}
      {map.fires_patterns && Object.keys(map.fires_patterns).length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">FIRES Patterns</h2>
          <div className="space-y-2">
            {Object.entries(map.fires_patterns)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([element, count]) => {
                const color = FIRES_COLORS[element as keyof typeof FIRES_COLORS] || '#888'
                const label = FIRES_LABELS[element as keyof typeof FIRES_LABELS] || element
                const maxCount = Math.max(...Object.values(map.fires_patterns) as number[])
                const width = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0
                return (
                  <div key={element} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: width + '%', backgroundColor: color }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-6 text-right">{count as number}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Wins */}
      {map.wins && map.wins.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Wins</h2>
          <ul className="space-y-2">
            {map.wins.map((win, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-green-500">&#10003;</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Focus Next */}
      {map.focus_next && map.focus_next.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Focus for Next Week</h2>
          <ul className="space-y-2">
            {map.focus_next.map((focus, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-brand-primary">&#8594;</span>
                {focus}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return startDate.toLocaleDateString('en-US', options) + ' - ' + endDate.toLocaleDateString('en-US', options) + ', ' + endDate.getFullYear()
}
