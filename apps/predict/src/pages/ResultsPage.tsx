import { Link, useParams } from 'react-router-dom'
import { FIRES_COLORS, FIRES_LABELS } from '@finding-good/shared'
import { usePrediction } from '../hooks'

const FIRES_ORDER = ['feelings', 'influence', 'resilience', 'ethics', 'strengths'] as const

const ALIGNMENT_LABELS: Record<string, string> = {
  q1: 'Similarity to past',
  q2: 'Confidence from past',
  q3: 'Action clarity',
  q4: 'Values alignment',
  q5: 'Obstacle preparedness',
  q6: 'Support connection',
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { prediction, snapshot, connections, loading, error } = usePrediction(id)

  console.log('[ResultsPage] State:', { id, prediction, snapshot, connections, loading, error })

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prediction not found</h1>
          <p className="text-gray-600 mb-6">{error || 'This prediction may have been deleted.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const futureConnections = connections.filter(c => c.connection_time === 'future')
  const pastConnections = connections.filter(c => c.connection_time === 'past')

  const alignmentTotal = snapshot?.alignment_scores
    ? Object.values(snapshot.alignment_scores).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Results</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Title Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-brand-primary/10 text-brand-primary rounded-full capitalize">
                  {prediction.type}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(prediction.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{prediction.title}</h2>
              {prediction.description && (
                <p className="text-gray-600 mt-2">{prediction.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Pending - show when no AI results yet */}
        {!snapshot?.predictability_score && !snapshot?.zone_scores && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-amber-800">Analysis Pending</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your prediction has been saved. AI analysis will appear here once processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Predictability Score */}
        {snapshot?.predictability_score !== null && snapshot?.predictability_score !== undefined && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Predictability Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-brand-primary">
                {snapshot.predictability_score}%
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all"
                    style={{ width: `${snapshot.predictability_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zone Breakdown */}
        {snapshot?.zone_scores && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Zone Breakdown</h3>
            <div className="space-y-3">
              {FIRES_ORDER.map((element) => {
                const zone = snapshot.zone_scores?.[element]
                if (!zone) return null
                return (
                  <div key={element} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: FIRES_COLORS[element] }}
                    >
                      {element.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {FIRES_LABELS[element]}
                      </div>
                      <div className="text-sm text-gray-500">{zone}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Growth Opportunity */}
        {snapshot?.growth_opportunity && (
          <div className="bg-brand-accent/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Growth Opportunity</h3>
            <p className="text-gray-900">{snapshot.growth_opportunity}</p>
          </div>
        )}

        {/* 48-Hour Question */}
        {snapshot?.question_48hr && (
          <div className="bg-brand-primary/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-brand-primary mb-2">Your 48-Hour Question</h3>
            <p className="text-gray-900 font-medium">{snapshot.question_48hr}</p>
          </div>
        )}

        {/* Alignment Scores */}
        {snapshot?.alignment_scores && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Alignment Assessment</h3>
              <span className="text-lg font-bold text-brand-primary">{alignmentTotal}/24</span>
            </div>
            <div className="space-y-3">
              {Object.entries(snapshot.alignment_scores).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1 text-sm text-gray-700">
                    {ALIGNMENT_LABELS[key] || key}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          n <= value
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Future Story */}
        {snapshot?.fs_answers && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Future Story</h3>
            <div className="space-y-4">
              {snapshot.fs_answers.fs1 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Goal</div>
                  <p className="text-gray-900">{snapshot.fs_answers.fs1}</p>
                </div>
              )}
              {FIRES_ORDER.map((element, index) => {
                const key = `fs${index + 2}` as string
                const answer = snapshot.fs_answers?.[key]
                if (!answer) return null
                return (
                  <div key={key} className="flex gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: FIRES_COLORS[element] }}
                    >
                      {element.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-gray-900">{answer}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Past Story */}
        {snapshot?.ps_answers && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Past Story</h3>
            <div className="space-y-4">
              {snapshot.ps_answers.ps1 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Past Success</div>
                  <p className="text-gray-900">{snapshot.ps_answers.ps1}</p>
                </div>
              )}
              {FIRES_ORDER.map((element, index) => {
                const key = `ps${index + 2}` as string
                const answer = snapshot.ps_answers?.[key]
                if (!answer) return null
                return (
                  <div key={key} className="flex gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: FIRES_COLORS[element] }}
                    >
                      {element.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-gray-900">{answer}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Connections */}
        {(futureConnections.length > 0 || pastConnections.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Connections</h3>

            {futureConnections.length > 0 && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2">Future Support</div>
                <div className="space-y-2">
                  {futureConnections.map((conn) => (
                    <div key={conn.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-brand-primary-light/20 rounded-full flex items-center justify-center text-brand-primary font-medium">
                        {conn.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{conn.name}</div>
                        {conn.involvement_type && (
                          <div className="text-xs text-gray-500">{conn.involvement_type}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastConnections.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-2">Past Support</div>
                <div className="space-y-2">
                  {pastConnections.map((conn) => (
                    <div key={conn.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {conn.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{conn.name}</div>
                        {conn.how_involved && (
                          <div className="text-xs text-gray-500 truncate">{conn.how_involved}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Link
            to={`/${id}`}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors"
          >
            View Details
          </Link>
          <Link
            to="/"
            className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium text-center hover:bg-brand-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
