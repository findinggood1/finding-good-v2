import { useState, useCallback, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FIRES_COLORS, FIRES_LABELS, getSupabase } from '@finding-good/shared'
import { usePrediction } from '../hooks'

const FIRES_ORDER = ['feelings', 'influence', 'resilience', 'ethics', 'strengths'] as const
type FiresElement = typeof FIRES_ORDER[number]

const ZONE_VALUES: Record<string, number> = {
  'Exploring': 1,
  'Discovering': 2,
  'Performing': 3,
  'Owning': 4,
}

function categorizeZones(zoneScores: Record<string, string> | null) {
  if (!zoneScores) return { solid: [], building: [], edge: null }
  
  const solid: FiresElement[] = []
  const building: FiresElement[] = []
  let edge: FiresElement | null = null
  let lowestValue = 5
  
  for (const element of FIRES_ORDER) {
    const zone = zoneScores[element]
    if (!zone) continue
    const value = ZONE_VALUES[zone] || 1
    
    if (value < lowestValue) {
      lowestValue = value
      edge = element
    }
    
    if (zone === 'Owning') {
      solid.push(element)
    } else if (zone === 'Performing') {
      building.push(element)
    }
  }
  
  const buildingFiltered = building.filter(e => e !== edge)
  
  return { solid, building: buildingFiltered, edge }
}

function getLevelDisplay(level: string | undefined) {
  switch (level) {
    case 'strong': return { label: 'Strong', width: '85%', color: 'bg-green-500' }
    case 'building': return { label: 'Building', width: '60%', color: 'bg-amber-500' }
    case 'emerging': return { label: 'Emerging', width: '35%', color: 'bg-gray-400' }
    default: return { label: 'Assessing...', width: '50%', color: 'bg-gray-300' }
  }
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { prediction, snapshot, narrative, connections, loading, error, refetch } = usePrediction(id)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)
  const [shareToFeed, setShareToFeed] = useState(false)
  const [savingShare, setSavingShare] = useState(false)

  // Initialize share state from prediction when loaded
  useEffect(() => {
    if (prediction?.share_to_feed !== undefined && prediction?.share_to_feed !== null) {
      setShareToFeed(prediction.share_to_feed)
    }
  }, [prediction?.share_to_feed])

  const toggleShareToFeed = useCallback(async () => {
    if (!prediction?.id) return

    const newValue = !shareToFeed
    setShareToFeed(newValue)
    setSavingShare(true)

    try {
      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('predictions')
        .update({ share_to_feed: newValue })
        .eq('id', prediction.id)

      if (updateError) {
        // Revert on error
        setShareToFeed(!newValue)
        console.error('Failed to update share preference:', updateError)
      }
    } catch (err) {
      setShareToFeed(!newValue)
      console.error('Failed to update share preference:', err)
    } finally {
      setSavingShare(false)
    }
  }, [prediction?.id, shareToFeed])

  const regenerateInsights = useCallback(async () => {
    if (!snapshot) return
    
    setRegenerating(true)
    setRegenerateError(null)

    try {
      const supabase = getSupabase()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const functionUrl = `${supabaseUrl}/functions/v1/predict-analyze`

      const { data: { session } } = await supabase.auth.getSession()

      const futureConns = connections
        .filter(c => c.connection_time === 'future')
        .map(c => ({ name: c.name, involvement_type: c.involvement_type }))
      const pastConns = connections
        .filter(c => c.connection_time === 'past')
        .map(c => ({ name: c.name, how_involved: c.how_involved }))

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          goal: snapshot.goal,
          success: snapshot.success,
          fs_answers: snapshot.fs_answers,
          ps_answers: snapshot.ps_answers,
          zone_scores: snapshot.zone_scores,
          growth_opportunity: snapshot.growth_opportunity,
          alignment_scores: snapshot.alignment_scores,
          connections: { future: futureConns, past: pastConns },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate insights: ${errorText}`)
      }

      const result = await response.json()

      if (!result.success || !result.narrative) {
        throw new Error(result.error || 'No narrative returned')
      }

      const { error: updateError } = await supabase
        .from('snapshots')
        .update({ narrative: JSON.stringify(result.narrative) })
        .eq('id', snapshot.id)

      if (updateError) {
        throw new Error(`Failed to save insights: ${updateError.message}`)
      }

      await refetch()
    } catch (err) {
      console.error('Regenerate error:', err)
      setRegenerateError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setRegenerating(false)
    }
  }, [snapshot, connections, refetch])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prediction not found</h1>
          <p className="text-gray-600 mb-6">{error || 'This prediction may have been deleted.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const { solid, building, edge } = categorizeZones(snapshot?.zone_scores || null)
  const futureConnections = connections.filter(c => c.connection_time === 'future')
  const pastConnections = connections.filter(c => c.connection_time === 'past')
  const totalConnections = futureConnections.length + pastConnections.length

  const isAnalysisPending = snapshot?.predictability_score === null || snapshot?.predictability_score === undefined
  const isNarrativePending = !isAnalysisPending && !narrative

  const clarityDisplay = getLevelDisplay(narrative?.clarity_level)
  const confidenceDisplay = getLevelDisplay(narrative?.confidence_level)
  const alignmentDisplay = getLevelDisplay(narrative?.alignment_level)

  // Check if we have the new structured format
  const hasStructuredPattern = narrative?.pattern_name && narrative?.pattern_quotes
  const hasStructuredEdge = narrative?.edge_why && narrative?.edge_meaning
  const hasStructuredNetwork = narrative?.network_summary && narrative?.network_why

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Your Results</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        
        {/* SECTION 1: THE GOAL */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded capitalize">
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
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{prediction.title}</h2>
          {prediction.description && (
            <p className="text-gray-600 mt-2 text-sm">{prediction.description}</p>
          )}
        </div>

        {/* SECTION 2: PREDICTABILITY SCORE */}
        {isAnalysisPending ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium text-amber-800">Analyzing your responses...</p>
                <p className="text-sm text-amber-700">This usually takes a few seconds.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Predictability</p>
              <div className="text-5xl font-bold text-brand-primary mb-1">
                {snapshot?.predictability_score}%
              </div>
              <p className="text-sm text-gray-500">
                How clearly you can see your path forward
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Most people start between 55-70%
              </p>
            </div>
            
            {/* Clarity / Confidence / Alignment breakdown */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              {/* Clarity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Clarity</span>
                  <span className="text-xs text-gray-500">{clarityDisplay.label}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${clarityDisplay.color} rounded-full transition-all duration-500`} style={{ width: clarityDisplay.width }} />
                </div>
                {narrative?.clarity_rationale && (
                  <p className="text-xs text-gray-500 mt-1">{narrative.clarity_rationale}</p>
                )}
              </div>
              
              {/* Confidence */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className="text-xs text-gray-500">{confidenceDisplay.label}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${confidenceDisplay.color} rounded-full transition-all duration-500`} style={{ width: confidenceDisplay.width }} />
                </div>
                {narrative?.confidence_rationale && (
                  <p className="text-xs text-gray-500 mt-1">{narrative.confidence_rationale}</p>
                )}
              </div>
              
              {/* Alignment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Alignment</span>
                  <span className="text-xs text-gray-500">{alignmentDisplay.label}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${alignmentDisplay.color} rounded-full transition-all duration-500`} style={{ width: alignmentDisplay.width }} />
                </div>
                {narrative?.alignment_rationale && (
                  <p className="text-xs text-gray-500 mt-1">{narrative.alignment_rationale}</p>
                )}
              </div>
              
              {/* Support Network contribution */}
              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Network</span>
                  <span className="text-sm font-medium text-brand-primary">+{Math.min(totalConnections * 2, 16)} pts</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalConnections} of 8 supporters identified — people who know your priorities increase predictability
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: GENERATE INSIGHTS (if missing) */}
        {isNarrativePending && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Ready to see your patterns?</p>
                  <p className="text-sm text-blue-700">Generate insights from your responses.</p>
                </div>
              </div>
              <button
                onClick={regenerateInsights}
                disabled={regenerating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {regenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'See Patterns'
                )}
              </button>
            </div>
            {regenerateError && (
              <p className="mt-2 text-sm text-red-600">{regenerateError}</p>
            )}
          </div>
        )}

        {/* SECTION 4: WHAT YOUR STORIES REVEAL (Pattern) - NEW STRUCTURED FORMAT */}
        {narrative && (hasStructuredPattern ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              What Your Stories Reveal
            </p>
            
            {/* Your Pattern */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Your Pattern</p>
              <p className="text-lg font-semibold text-gray-900">{narrative.pattern_name}</p>
            </div>
            
            {/* In Your Words */}
            {narrative.pattern_quotes && narrative.pattern_quotes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">In Your Words</p>
                <div className="space-y-2">
                  {narrative.pattern_quotes.map((quote, i) => (
                    <p key={i} className="text-sm text-gray-700 italic border-l-2 border-brand-primary/30 pl-3">
                      "{quote}"
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Where Curiosity Helps */}
            {narrative.pattern_curiosity && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Where Curiosity Helps</p>
                <p className="text-sm text-gray-600">{narrative.pattern_curiosity}</p>
              </div>
            )}
          </div>
        ) : narrative.pattern_insight ? (
          // Fallback to old format
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              What Your Stories Reveal
            </p>
            <p className="text-gray-700 leading-relaxed">
              {narrative.pattern_insight}
            </p>
          </div>
        ) : null)}

        {/* SECTION 5: WHERE YOU STAND (FIRES grouping) */}
        {snapshot?.zone_scores && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Where You Stand
            </p>
            
            {/* Clear + Confident */}
            {solid.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-green-700 mb-2">CLEAR + CONFIDENT</p>
                <div className="space-y-2">
                  {solid.map((element) => (
                    <div key={element} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: FIRES_COLORS[element] }}
                      >
                        {element.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">{FIRES_LABELS[element]}</span>
                      <span className="text-xs text-gray-400">— Owning</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Building */}
            {building.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-amber-700 mb-2">BUILDING</p>
                <div className="space-y-2">
                  {building.map((element) => (
                    <div key={element} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: FIRES_COLORS[element] }}
                      >
                        {element.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">{FIRES_LABELS[element]}</span>
                      <span className="text-xs text-gray-400">— {snapshot.zone_scores?.[element]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Your Edge */}
            {edge && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-brand-primary mb-2">YOUR EDGE</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: FIRES_COLORS[edge] }}
                  >
                    {edge.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{FIRES_LABELS[edge]}</span>
                  <span className="text-xs text-gray-400">— {snapshot.zone_scores?.[edge]}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: YOUR EDGE (detailed insight) - NEW STRUCTURED FORMAT */}
        {edge && narrative && (hasStructuredEdge ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: FIRES_COLORS[edge] }}
              >
                {edge.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                  Your Edge: {FIRES_LABELS[edge]}
                </p>
                
                {/* Why This Matters */}
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {narrative.edge_why}
                </p>
                
                {/* The Gap */}
                <div className="bg-white/50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-2">The Gap</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">Future: </span>
                      <span className="text-gray-700 italic">"{narrative.edge_gap_future}"</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Past: </span>
                      <span className="text-gray-700 italic">"{narrative.edge_gap_past}"</span>
                    </div>
                  </div>
                </div>
                
                {/* What This Means */}
                <p className="text-sm text-gray-700 mb-4">
                  {narrative.edge_meaning}
                </p>

                {/* Question */}
                {narrative.edge_question && (
                  <div className="pt-3 border-t border-amber-200">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                      Question to Consider
                    </p>
                    <p className="text-gray-900 font-medium">
                      {narrative.edge_question}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : narrative.edge_insight ? (
          // Fallback to old format
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: FIRES_COLORS[edge] }}
              >
                {edge.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                  Your Edge: {FIRES_LABELS[edge]}
                </p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  {narrative.edge_insight}
                </p>
                {narrative.edge_question && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                      Question to Consider
                    </p>
                    <p className="text-gray-900 font-medium">
                      {narrative.edge_question}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null)}

        {/* SECTION 7: WHO'S IN THIS WITH YOU - NEW STRUCTURED FORMAT */}
        {(futureConnections.length > 0 || pastConnections.length > 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Who's In This With You
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Your Supporters ({totalConnections} of 8)
            </p>

            {/* Structured supporter list */}
            {hasStructuredNetwork && narrative.network_summary ? (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid gap-2">
                  {narrative.network_summary.map((supporter, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{supporter.name}</span>
                      <span className="text-gray-500 text-xs">{supporter.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Fallback to simple list
              <div className="space-y-3 mb-4">
                {futureConnections.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Future</p>
                    <p className="text-sm text-gray-700">
                      {futureConnections.map(c => c.name).join(', ')}
                    </p>
                  </div>
                )}
                {pastConnections.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Past</p>
                    <p className="text-sm text-gray-700">
                      {pastConnections.map(c => c.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Why They Matter */}
            {hasStructuredNetwork && narrative.network_why && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Why They Matter</p>
                <p className="text-sm text-gray-600">{narrative.network_why}</p>
              </div>
            )}

            {/* Who Else */}
            {hasStructuredNetwork && narrative.network_who_else ? (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Who Else?</p>
                <p className="text-sm text-gray-600">{narrative.network_who_else}</p>
              </div>
            ) : narrative?.network_insight ? (
              <p className="text-sm text-gray-600 pt-3 border-t border-gray-100">
                {narrative.network_insight}
              </p>
            ) : null}
          </div>
        )}

        {/* SECTION 8: WHAT THIS SETS UP */}
        <div className="bg-gray-100 rounded-lg p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            This Snapshot Sets Your Focus
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-0.5">•</span>
              <span><strong>Priority Builder</strong> (daily) — Sharpen clarity on what matters as you work toward this</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-0.5">•</span>
              <span><strong>Prove Tool</strong> (weekly) — Build evidence of how you do things, so you can repeat them</span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Return here to see how your predictability changes.
          </p>
        </div>

        {/* SECTION 9: DISCOVER YOUR PRACTICE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Discover Your Practice</p>
              <p className="text-sm text-gray-600 mb-4">
                Turn this prediction into a daily practice that keeps you focused on what matters most.
              </p>
              <a
                href="https://permission.findinggood.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                Discover Your Practice
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 10: SHARE TO CAMPFIRE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Share
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={shareToFeed}
                onChange={toggleShareToFeed}
                disabled={savingShare}
                className="sr-only peer"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${shareToFeed ? 'bg-brand-primary' : 'bg-gray-200'} ${savingShare ? 'opacity-50' : ''}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${shareToFeed ? 'translate-x-4' : ''}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Share this prediction to your Campfire</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your connections can see and be inspired by your goal.
              </p>
            </div>
          </label>
        </div>

        {/* VIEW FULL DETAILS */}
        <button
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
        >
          {showFullDetails ? 'Hide' : 'View'} Full Details
          <svg 
            className={`w-4 h-4 transition-transform ${showFullDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFullDetails && (
          <div className="space-y-4">
            {/* Regenerate button */}
            {narrative && (
              <div className="flex justify-end">
                <button
                  onClick={regenerateInsights}
                  disabled={regenerating}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {regenerating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate Insights
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Alignment Assessment */}
            {snapshot?.alignment_scores && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Alignment Assessment
                </p>
                <div className="space-y-2 text-sm">
                  {Object.entries(snapshot.alignment_scores).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      q1: 'Similarity to past',
                      q2: 'Confidence from past',
                      q3: 'Action clarity',
                      q4: 'Values alignment',
                      q5: 'Obstacle preparedness',
                      q6: 'Support connection',
                    }
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-600">{labels[key] || key}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
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
                    )
                  })}
                </div>
              </div>
            )}

            {/* Future Story */}
            {snapshot?.fs_answers && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Your Future Story
                </p>
                <div className="space-y-3 text-sm">
                  {snapshot.fs_answers.fs1 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">What success looks like</p>
                      <p className="text-gray-700">{snapshot.fs_answers.fs1}</p>
                    </div>
                  )}
                  {FIRES_ORDER.map((element, index) => {
                    const key = `fs${index + 2}`
                    const answer = snapshot.fs_answers?.[key]
                    if (!answer) return null
                    return (
                      <div key={key} className="flex gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: FIRES_COLORS[element] }}
                        >
                          {element.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-700">{answer}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past Story */}
            {snapshot?.ps_answers && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Your Past Story
                </p>
                <div className="space-y-3 text-sm">
                  {snapshot.ps_answers.ps1 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Past similar success</p>
                      <p className="text-gray-700">{snapshot.ps_answers.ps1}</p>
                    </div>
                  )}
                  {FIRES_ORDER.map((element, index) => {
                    const key = `ps${index + 2}`
                    const answer = snapshot.ps_answers?.[key]
                    if (!answer) return null
                    return (
                      <div key={key} className="flex gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: FIRES_COLORS[element] }}
                        >
                          {element.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-700">{answer}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Connection Details */}
            {(futureConnections.length > 0 || pastConnections.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Connection Details
                </p>
                
                {futureConnections.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Future Support</p>
                    <div className="space-y-2">
                      {futureConnections.map((conn) => (
                        <div key={conn.id} className="text-sm">
                          <span className="font-medium text-gray-900">{conn.name}</span>
                          {conn.relationship && (
                            <span className="text-gray-500"> — {conn.relationship}</span>
                          )}
                          {conn.involvement_type && (
                            <p className="text-gray-600 text-xs mt-0.5">{conn.involvement_type}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastConnections.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Past Support</p>
                    <div className="space-y-2">
                      {pastConnections.map((conn) => (
                        <div key={conn.id} className="text-sm">
                          <span className="font-medium text-gray-900">{conn.name}</span>
                          {conn.how_involved && (
                            <p className="text-gray-600 text-xs mt-0.5">{conn.how_involved}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BACK BUTTON */}
        <div className="pt-4">
          <Link
            to="/"
            className="block w-full py-3 px-4 bg-brand-primary text-white rounded-lg font-medium text-center hover:bg-brand-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>

      </main>
    </div>
  )
}
