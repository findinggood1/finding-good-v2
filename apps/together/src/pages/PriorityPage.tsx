import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Textarea, Badge, FIRES_LABELS, getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

// FIRES element descriptions (for future use in tooltips)
// const FIRES_DESCRIPTIONS: Record<FiresElement, string> = {
//   feelings: "Emotional awareness - noticing and naming what you feel.",
//   influence: "Taking action, making an impact, leading or contributing.",
//   resilience: "Overcoming challenges, persistence, adaptability.",
//   ethics: "Acting with integrity, staying true to values.",
//   strengths: "Using your natural talents and skills.",
// }

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

// Toggle component
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-brand-primary' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`} />
    </button>
  )
}

type ViewMode = 'home' | 'form' | 'results' | 'history'

interface PriorityPageProps {
  pageTitle?: string
  toolName?: string
  mode?: 'self' | 'send'
}

export function PriorityPage({ pageTitle = 'Priority', toolName = 'Priority', mode: propMode }: PriorityPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { userEmail } = useAuth()

  // URL params for check-in flow
  const urlFocus = searchParams.get('focus')
  const urlEngagement = searchParams.get('engagement')
  const urlSource = searchParams.get('source')
  const urlAnswer = searchParams.get('answer')
  const urlMode = searchParams.get('mode')

  const isFromCheckin = urlSource === 'checkin' && urlFocus
  const isSendMode = propMode === 'send' || urlMode === 'send'

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>(isFromCheckin ? 'form' : 'home')

  // Form state
  const [context, setContext] = useState(urlFocus ? decodeURIComponent(urlFocus) : '')
  const [whatWentWell, setWhatWentWell] = useState(urlAnswer ? decodeURIComponent(urlAnswer) : '')
  const [yourPart, setYourPart] = useState('')
  const [impact, setImpact] = useState('')

  // Focus chips
  const [focusChips, setFocusChips] = useState<string[]>(DEFAULT_FOCUS_CHIPS)
  const [isLoadingChips, setIsLoadingChips] = useState(false)

  // Options
  const [shareToCampfire, setShareToCampfire] = useState(false)

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<PriorityResult | null>(null)

  // History state
  const [entries, setEntries] = useState<any[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  // Fetch user's Focus items
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
          const names = permission.focus
            .map((item: FocusItem) => item.name)
            .filter((name: string) => name && name.trim())
          if (names.length > 0) {
            setFocusChips(names)
          }
        }
      } catch (err) {
        console.log('No focus items found, using defaults')
      } finally {
        setIsLoadingChips(false)
      }
    }

    fetchFocusItems()
  }, [userEmail, isFromCheckin])

  // Fetch entries for history
  useEffect(() => {
    async function fetchEntries() {
      if (!userEmail || viewMode !== 'history') return

      setLoadingEntries(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from('priorities')
          .select('*')
          .eq('client_email', userEmail)
          .order('created_at', { ascending: false })
          .limit(20)

        setEntries(data || [])
      } catch (err) {
        console.error('Failed to fetch entries:', err)
      } finally {
        setLoadingEntries(false)
      }
    }

    fetchEntries()
  }, [userEmail, viewMode])

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

      const firesExtracted = (aiResult.firesElements || []).map((fe: FiresExtraction) => fe.element)

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
      }

      setResult({
        priorityLine: aiResult.priorityLine,
        firesElements: aiResult.firesElements || [],
        reflectionInsight: aiResult.reflectionInsight,
        yourPattern: aiResult.yourPattern,
        patternQuotes: aiResult.patternQuotes,
      })

      setViewMode('results')
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setContext('')
    setWhatWentWell('')
    setYourPart('')
    setImpact('')
    setShareToCampfire(false)
    setResult(null)
    setViewMode('home')
    navigate('/priority', { replace: true })
  }

  // HOME VIEW
  if (viewMode === 'home') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-brand-primary">
              {isSendMode ? 'Recognize Someone' : pageTitle}
            </h1>
            <button
              onClick={() => setViewMode('history')}
              className="text-sm text-brand-primary hover:underline"
            >
              View History
            </button>
          </div>

          {/* Main Card */}
          <Card padding="lg" className="mb-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{isSendMode ? '💬' : '⭐'}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isSendMode ? 'Recognize Someone' : 'Name What Matters'}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {isSendMode
                  ? 'Share what you noticed about someone in your circle.'
                  : 'Claim your focus. Capture what went well. Build evidence of how you show up.'}
              </p>
            </div>

            <button
              onClick={() => setViewMode('form')}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              Start Now
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Takes about 2 minutes
            </p>
          </Card>

          {/* Why This Matters */}
          <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
            <h3 className="font-medium text-brand-primary mb-2">Why This Matters</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Most people forget 90% of their small wins. Priority Builder captures them before they fade.
              Over time, patterns emerge that reveal how you naturally show up when it matters.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // HISTORY VIEW
  if (viewMode === 'history') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setViewMode('home')}
              className="flex items-center gap-1 text-gray-500 hover:text-brand-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">History</h1>
            <div className="w-14" />
          </div>

          {loadingEntries ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No entries yet</p>
              <button
                onClick={() => setViewMode('form')}
                className="mt-4 text-brand-primary hover:underline"
              >
                Create your first priority
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={entry.id} padding="md">
                  <p className="text-gray-900 font-medium mb-2">"{entry.integrity_line}"</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(entry.fires_extracted || []).map((element: FiresElement) => (
                      <Badge key={element} variant="fires" firesElement={element} size="sm">
                        {FIRES_LABELS[element]}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // RESULTS VIEW
  if (viewMode === 'results' && result) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{toolName} Saved</h1>
            <p className="text-gray-600 mt-1">Here is what you proved today</p>
          </div>

          {/* Integrity Line */}
          <Card padding="lg" className="mb-6 border-brand-primary border-2">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">
              Your Integrity Line
            </p>
            <p className="text-lg font-medium text-gray-900 italic">
              "{result.priorityLine}"
            </p>
          </Card>

          {/* FIRES Elements */}
          {result.firesElements && result.firesElements.length > 0 && (
            <Card padding="md" className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                FIRES Elements Present
              </p>
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
                    <Badge variant="fires" firesElement={element} size="sm">
                      {FIRES_LABELS[element]}
                    </Badge>
                    <span className="text-sm text-gray-600 flex-1">{evidence}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reflection Insight */}
          {result.reflectionInsight && (
            <Card padding="md" className="mb-6 bg-amber-50 border-amber-200">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                What This Shows
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.reflectionInsight}
              </p>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setContext('')
                setWhatWentWell('')
                setYourPart('')
                setImpact('')
                setShareToCampfire(false)
                setResult(null)
                setViewMode('form')
              }}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              Add Another
            </button>
            <button
              onClick={resetForm}
              className="w-full py-3 px-6 bg-white text-brand-primary font-semibold rounded-lg border-2 border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // FORM VIEW
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setViewMode('home')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
          <div className="w-14" />
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Question 1: Context */}
          <Card padding="lg">
            {isFromCheckin ? (
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
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  What mattered most today?
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  Tap a focus area or type your own.
                </p>

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

          {/* Question 2 */}
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

          {/* Question 3 */}
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

          {/* Question 4 */}
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
              <Toggle checked={shareToCampfire} onChange={setShareToCampfire} />
              <div>
                <span className="text-sm font-medium text-gray-700">Share to Campfire</span>
                <p className="text-xs text-gray-500 mt-0.5">Your connections can see and be inspired.</p>
              </div>
            </label>
          </Card>

          {/* Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
              canSubmit && !isSubmitting
                ? 'bg-brand-primary hover:bg-brand-primary/90 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : `Save ${toolName}`}
          </button>
        </div>
      </div>
    </div>
  )
}
