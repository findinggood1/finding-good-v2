import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Textarea, Badge, FIRES_LABELS, getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

// FIRES element descriptions for info tooltips
const FIRES_DESCRIPTIONS: Record<FiresElement, string> = {
  feelings: "Emotional awareness - noticing and naming what you feel. Research shows naming emotions moves brain activity from reactive to reflective.",
  influence: "Taking action, making an impact, leading or contributing. This is about what you can actually control.",
  resilience: "Overcoming challenges, persistence, adaptability. Your ability to handle difficulty - and you have more evidence of this than you think.",
  ethics: "Acting with integrity, staying true to values. The why behind what you do - your deeper purpose.",
  strengths: "Using your natural talents and skills. What you bring to situations that others might not.",
}

// Default chips when user has no Focus items set
const DEFAULT_FOCUS_CHIPS = [
  'A project I pushed forward',
  'A relationship I invested in',
  'A challenge I worked through',
  'A commitment I honored',
]

interface FiresExtraction {
  element: FiresElement
  evidence: string
  strength?: number
}

interface PriorityResult {
  priorityLine: string
  firesElements: FiresExtraction[]
  reflectionInsight: string
  yourPattern?: string
  patternQuotes?: string[]
}

interface FocusItem {
  name: string
  order?: number
}

// Info icon component with expandable tooltip
function InfoIcon({ content, className = '' }: { content: string; className?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <span className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 text-xs font-medium inline-flex items-center justify-center transition-colors"
        aria-label="More info"
      >
        i
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-6 z-20 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600 leading-relaxed">
            {content}
          </div>
        </>
      )}
    </span>
  )
}

export function ConfirmPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { userEmail } = useAuth()

  // Parse URL parameters for entry context
  const urlFocus = searchParams.get('focus')
  const urlEngagement = searchParams.get('engagement')
  const urlSource = searchParams.get('source')
  const urlAnswer = searchParams.get('answer')

  // Determine entry mode
  const isFromCheckin = urlSource === 'checkin' && urlFocus

  // Form state - initialized from URL params if available
  const [context, setContext] = useState(urlFocus ? decodeURIComponent(urlFocus) : '')
  const [whatWentWell, setWhatWentWell] = useState(urlAnswer ? decodeURIComponent(urlAnswer) : '')
  const [yourPart, setYourPart] = useState('')
  const [impact, setImpact] = useState('')

  // Focus chips for standalone mode
  const [focusChips, setFocusChips] = useState<string[]>(DEFAULT_FOCUS_CHIPS)
  const [isLoadingChips, setIsLoadingChips] = useState(false)

  // Options state
  const [shareToCampfire, setShareToCampfire] = useState(false)

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<PriorityResult | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Fetch user's Focus items from permissions table (for standalone mode)
  useEffect(() => {
    async function fetchFocusItems() {
      if (isFromCheckin || !userEmail) return

      setIsLoadingChips(true)
      try {
        const supabase = getSupabase()
        const { data: permission } = await supabase
          .from('permissions')
          .select('focus')
          .eq('client_email', userEmail)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        if (permission?.focus && Array.isArray(permission.focus) && permission.focus.length > 0) {
          // Extract focus item names
          const names = permission.focus
            .map((item: FocusItem) => item.name)
            .filter((name: string) => name && name.trim())
          if (names.length > 0) {
            setFocusChips(names)
          }
        }
      } catch (err) {
        // If no permissions found, keep default chips
        console.log('No focus items found, using defaults')
      } finally {
        setIsLoadingChips(false)
      }
    }

    fetchFocusItems()
  }, [userEmail, isFromCheckin])

  // Check if form is valid (all fields filled)
  const canSubmit = useMemo(() => {
    return (
      context.trim().length > 0 &&
      whatWentWell.trim().length > 0 &&
      yourPart.trim().length > 0 &&
      impact.trim().length > 0
    )
  }, [context, whatWentWell, yourPart, impact])

  const handleChipClick = (chipText: string) => {
    setContext(chipText)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = getSupabase()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const functionUrl = `${supabaseUrl}/functions/v1/priority-analyze`

      const { data: { session } } = await supabase.auth.getSession()

      // Call the edge function for AI analysis
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          focus: context,
          whatWentWell,
          yourPart,
          impact,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to analyze: ${errorText}`)
      }

      const aiResult = await response.json()

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'Analysis failed')
      }

      // Build FIRES extracted array for database
      const firesExtracted = (aiResult.firesElements || []).map((fe: FiresExtraction) => fe.element)

      // Save to priorities table
      const { error: saveError } = await supabase
        .from('priorities')
        .insert({
          client_email: userEmail,
          type: 'self',
          responses: {
            context,
            what_went_well: whatWentWell,
            your_part: yourPart,
            impact,
          },
          integrity_line: aiResult.priorityLine,
          fires_extracted: firesExtracted,
          share_to_feed: shareToCampfire,
          shared_at: shareToCampfire ? new Date().toISOString() : null,
        })

      if (saveError) {
        console.error('Failed to save priority:', saveError)
        // Still show results even if save fails
      }

      setResult({
        priorityLine: aiResult.priorityLine,
        firesElements: aiResult.firesElements || [],
        reflectionInsight: aiResult.reflectionInsight,
        yourPattern: aiResult.yourPattern,
        patternQuotes: aiResult.patternQuotes,
      })

      setShowResults(true)
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Results view
  if (showResults && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Priority Saved</h1>
            <p className="text-gray-600 mt-1">Here is what you proved today</p>
          </div>

          {/* Integrity Line */}
          <Card padding="lg" className="mb-6 border-brand-primary border-2">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">
                Your Integrity Line
              </p>
              <InfoIcon content="An integrity line is portable evidence - a one-sentence summary you can recall when confidence wavers." />
            </div>
            <p className="text-lg font-medium text-gray-900 italic">
              &quot;{result.priorityLine}&quot;
            </p>
          </Card>

          {/* FIRES Elements */}
          {result.firesElements && result.firesElements.length > 0 && (
            <Card padding="md" className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  FIRES Elements Present
                </p>
                <InfoIcon content="FIRES = Feelings, Influence, Resilience, Ethics, Strengths. These are extracted from your natural language." />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.firesElements.map(({ element }) => (
                  <Badge key={element} variant="fires" firesElement={element} size="sm">
                    {FIRES_LABELS[element]}
                  </Badge>
                ))}
              </div>
              <div className="space-y-3">
                {result.firesElements.map(({ element, evidence }) => (
                  <div key={element} className="flex items-start gap-3">
                    <div className="flex items-center gap-1">
                      <Badge variant="fires" firesElement={element} size="sm">
                        {FIRES_LABELS[element]}
                      </Badge>
                      <InfoIcon
                        content={FIRES_DESCRIPTIONS[element]}
                        className="ml-0.5"
                      />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">{evidence}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pattern (if available) */}
          {result.yourPattern && (
            <Card padding="md" className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your Pattern
                </p>
                <InfoIcon content="Patterns are recurring ways you create positive outcomes. Over time, they reveal your natural strengths." />
              </div>
              <p className="text-gray-900 font-medium mb-3">{result.yourPattern}</p>

              {result.patternQuotes && result.patternQuotes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">In your words:</p>
                  {result.patternQuotes.map((quote, i) => (
                    <p key={i} className="text-sm text-gray-600 italic border-l-2 border-brand-primary/30 pl-3">
                      &quot;{quote}&quot;
                    </p>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Reflection Insight */}
          {result.reflectionInsight && (
            <Card padding="md" className="mb-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  What This Shows
                </p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.reflectionInsight}
              </p>
            </Card>
          )}

          {/* Your Responses Summary (collapsed by default) */}
          <details className="mb-6">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              View your original responses
            </summary>
            <Card padding="md" className="mt-2">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">What mattered:</span>
                  <p className="text-gray-600 mt-1">{context}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">What went well:</span>
                  <p className="text-gray-600 mt-1">{whatWentWell}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Your part:</span>
                  <p className="text-gray-600 mt-1">{yourPart}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Impact:</span>
                  <p className="text-gray-600 mt-1">{impact}</p>
                </div>
              </div>
            </Card>
          </details>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // Reset form for another entry
                setContext('')
                setWhatWentWell('')
                setYourPart('')
                setImpact('')
                setShareToCampfire(false)
                setResult(null)
                setShowResults(false)
                // Clear URL params
                navigate('/confirm', { replace: true })
              }}
              className="w-full py-3 px-6 bg-[#0D7C66] hover:bg-[#095c4d] text-white font-semibold rounded-lg transition-colors"
            >
              Add Another
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main single-page form
  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Priority</h1>
          <div className="w-14" />
        </div>

        {/* All Questions - Single Page */}
        <div className="space-y-6">
          {/* Question 1: Context - Different UI based on entry path */}
          <Card padding="lg">
            {isFromCheckin ? (
              // Entry Path 1: From Daily Check-in (pre-populated)
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Reflecting on
                </p>
                <div className="flex items-center justify-between p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20 mb-4">
                  <span className="font-medium text-gray-900">{context}</span>
                  {urlEngagement && (
                    <span className="text-sm text-brand-primary font-medium">
                      {urlEngagement}/5 today
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  This was your focus from today's check-in.
                </p>
              </>
            ) : (
              // Entry Path 2: Standalone (with chips)
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  What mattered most today?
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  Tap a focus area or type your own.
                </p>

                {/* Focus chips */}
                {!isLoadingChips && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {focusChips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          context === chip
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-100 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Or type what mattered most..."
                  rows={2}
                  showCharCount
                  maxLength={300}
                />
              </>
            )}
          </Card>

          {/* Question 2: What went well */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What went well?
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              What happened that you want to remember?
            </p>
            <Textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder="Describe what went well..."
              rows={3}
              showCharCount
              maxLength={500}
            />
          </Card>

          {/* Question 3: Your part */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What was your part?
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              What did you do, decide, or contribute?
            </p>
            <Textarea
              value={yourPart}
              onChange={(e) => setYourPart(e.target.value)}
              placeholder="What was your contribution?"
              rows={3}
              showCharCount
              maxLength={500}
            />
          </Card>

          {/* Question 4: Impact */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What impact did it have?
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              How did it affect you, others, or the situation?
            </p>
            <Textarea
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="Describe the impact..."
              rows={3}
              showCharCount
              maxLength={500}
            />
          </Card>

          {/* Share Toggle */}
          <Card padding="md">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={shareToCampfire}
                  onChange={(e) => setShareToCampfire(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  shareToCampfire ? 'bg-brand-primary' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    shareToCampfire ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Share to Campfire</span>
                <p className="text-xs text-gray-500 mt-0.5">Your connections can see and be inspired.</p>
              </div>
            </label>
          </Card>

          {/* Error message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
              canSubmit && !isSubmitting
                ? 'bg-[#0D7C66] hover:bg-[#095c4d] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Priority'}
          </button>
        </div>
      </div>
    </div>
  )
}
