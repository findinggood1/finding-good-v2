import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, FIRES_LABELS, getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

interface PriorityEntry {
  id: string
  created_at: string
  responses: {
    context?: string
    what_went_well?: string
    your_part?: string
    impact?: string
    // Support legacy field names too
    focus?: string
    whatWentWell?: string
    yourPart?: string
  }
  integrity_line: string
  fires_extracted: FiresElement[] | null
  share_to_feed: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { userEmail } = useAuth()
  const [entries, setEntries] = useState<PriorityEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      if (!userEmail) return

      try {
        const supabase = getSupabase()
        const { data, error: fetchError } = await supabase
          .from('priorities')
          .select('id, created_at, responses, integrity_line, fires_extracted, share_to_feed')
          .eq('client_email', userEmail)
          .eq('type', 'self')
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) throw fetchError
        setEntries(data || [])
      } catch (err) {
        console.error('Failed to fetch history:', err)
        setError('Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [userEmail])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Helper to get context field (supports both old and new field names)
  const getContext = (responses: PriorityEntry['responses']) => {
    return responses?.context || responses?.focus || ''
  }

  const getWhatWentWell = (responses: PriorityEntry['responses']) => {
    return responses?.what_went_well || responses?.whatWentWell || ''
  }

  const getYourPart = (responses: PriorityEntry['responses']) => {
    return responses?.your_part || responses?.yourPart || ''
  }

  const getImpact = (responses: PriorityEntry['responses']) => {
    return responses?.impact || ''
  }

  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="flex-1 text-center text-xl font-semibold text-gray-900">
            Your History
          </h1>
          <div className="w-14" />
        </div>

        {/* Stats summary */}
        {entries.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 text-center">
            <p className="text-2xl font-bold text-brand-primary">{entries.length}</p>
            <p className="text-sm text-gray-600">
              {entries.length === 1 ? 'priority' : 'priorities'} captured
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Each one builds your evidence library
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && entries.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No priorities yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't captured any priorities yet. Each entry builds your evidence of how you show up.
            </p>
            <button
              onClick={() => navigate('/confirm')}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
            >
              Create Your First Priority
            </button>
          </Card>
        )}

        {/* Entries list */}
        {!isLoading && entries.length > 0 && (
          <div className="space-y-4">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id
              const firesElements = entry.fires_extracted || []
              const contextText = getContext(entry.responses)

              return (
                <Card
                  key={entry.id}
                  padding="md"
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleExpand(entry.id)}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">{formatDate(entry.created_at)}</p>
                        {entry.share_to_feed && (
                          <span className="text-xs text-brand-primary">Shared</span>
                        )}
                      </div>
                      {contextText && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {contextText.length > 40
                            ? contextText.substring(0, 40) + '...'
                            : contextText}
                        </p>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Integrity line */}
                  <p className="text-gray-900 font-medium italic">
                    "{entry.integrity_line}"
                  </p>

                  {/* FIRES badges (collapsed view) */}
                  {!isExpanded && firesElements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {firesElements.map((element) => (
                        <Badge
                          key={element}
                          variant="fires"
                          firesElement={element}
                          size="sm"
                        >
                          {FIRES_LABELS[element]}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      <p className="text-xs text-gray-400">{formatFullDate(entry.created_at)}</p>

                      {/* FIRES badges */}
                      {firesElements.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            FIRES Elements
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {firesElements.map((element) => (
                              <Badge
                                key={element}
                                variant="fires"
                                firesElement={element}
                                size="sm"
                              >
                                {FIRES_LABELS[element]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Original responses */}
                      <div className="space-y-2 text-sm">
                        {getContext(entry.responses) && (
                          <div>
                            <span className="font-medium text-gray-700">What mattered:</span>
                            <p className="text-gray-600">{getContext(entry.responses)}</p>
                          </div>
                        )}
                        {getWhatWentWell(entry.responses) && (
                          <div>
                            <span className="font-medium text-gray-700">What went well:</span>
                            <p className="text-gray-600">{getWhatWentWell(entry.responses)}</p>
                          </div>
                        )}
                        {getYourPart(entry.responses) && (
                          <div>
                            <span className="font-medium text-gray-700">Your part:</span>
                            <p className="text-gray-600">{getYourPart(entry.responses)}</p>
                          </div>
                        )}
                        {getImpact(entry.responses) && (
                          <div>
                            <span className="font-medium text-gray-700">Impact:</span>
                            <p className="text-gray-600">{getImpact(entry.responses)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}
