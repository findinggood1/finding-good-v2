import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Textarea, Badge, FIRES_LABELS, getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

// Rotating awareness insights for each question
const AWARENESS_INSIGHTS = {
  whatWentWell: [
    "Sometimes what went well is simply feeling happy. Claiming this helps others claim happiness too.",
    "Small progress counts. Noticing it builds the muscle of noticing.",
    "Staying calm when you could have reacted IS something going well.",
    "Doing the right thing even when no one noticed - that is worth capturing.",
    "Making someone else's job easier counts. Influence is not always visible.",
    "A good conversation is a win. Connection is progress.",
    "Not quitting is going well. Persistence is its own success.",
    "Learning something new - even something small - counts.",
  ],
  yourPart: [
    "Sometimes not doing anything IS doing something.",
    "Noticing is enough. Awareness is an action.",
    "Asking for help is a contribution, not a weakness.",
    "Choosing not to compromise - that is agency.",
    "Using what you are already good at counts.",
    "Showing up before you felt ready is a choice worth naming.",
    "Setting a boundary is doing something important.",
    "Listening without fixing is a skill you used.",
  ],
  impact: [
    "Impact on YOU counts. How you feel matters.",
    "Even if no one said anything, something shifted.",
    "Sometimes the impact is just: you did not quit.",
    "When you act with integrity, others notice - even if they do not say it.",
    "Doing something well makes the next time easier. That is impact.",
    "Your energy affected the room, even if you did not see it.",
    "Future you benefits from what present you just did.",
    "Someone else might try this because you did. That is influence.",
  ],
}

// FIRES element descriptions for info tooltips
const FIRES_DESCRIPTIONS: Record<FiresElement, string> = {
  feelings: "Emotional awareness - noticing and naming what you feel. Research shows naming emotions moves brain activity from reactive to reflective.",
  influence: "Taking action, making an impact, leading or contributing. This is about what you can actually control.",
  resilience: "Overcoming challenges, persistence, adaptability. Your ability to handle difficulty - and you have more evidence of this than you think.",
  ethics: "Acting with integrity, staying true to values. The why behind what you do - your deeper purpose.",
  strengths: "Using your natural talents and skills. What you bring to situations that others might not.",
}

// Helper framing chips for each question
const HELPER_FRAMINGS = {
  focus: [
    "A project I am pushing forward",
    "A relationship I am investing in",
    "A challenge I am working through",
    "A skill I am developing",
    "A commitment I am honoring",
  ],
  whatWentWell: [
    "I showed up when...",
    "I followed through on...",
    "I spoke up about...",
    "I stayed calm during...",
    "I made progress on...",
  ],
  yourPart: [
    "I chose to...",
    "I prepared by...",
    "I asked for help with...",
    "I said no to...",
    "I prioritized...",
  ],
  impact: [
    "It meant that...",
    "Others noticed...",
    "I felt...",
    "It opened up...",
    "It proved that...",
  ],
}

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

// Get random insight from array
function getRandomInsight(insights: string[]): string {
  return insights[Math.floor(Math.random() * insights.length)]
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
  const { userEmail } = useAuth()
  const [step, setStep] = useState(1)

  // Form state
  const [focus, setFocus] = useState('')
  const [whatWentWell, setWhatWentWell] = useState('')
  const [yourPart, setYourPart] = useState('')
  const [impact, setImpact] = useState('')

  // Options state
  const [shareToCampfire, setShareToCampfire] = useState(false)

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<PriorityResult | null>(null)

  // Select random insights once per session (stable during form completion)
  const insights = useMemo(() => ({
    whatWentWell: getRandomInsight(AWARENESS_INSIGHTS.whatWentWell),
    yourPart: getRandomInsight(AWARENESS_INSIGHTS.yourPart),
    impact: getRandomInsight(AWARENESS_INSIGHTS.impact),
  }), [])

  const handleHelperClick = (text: string, setter: (value: string) => void, current: string) => {
    const prefix = current ? `${current} ` : ''
    setter(`${prefix}${text}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = getSupabase()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const functionUrl = `${supabaseUrl}/functions/v1/priority-analyze`

      const { data: { session } } = await supabase.auth.getSession()

      // Call the edge function
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          focus,
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

      // Build FIRES extracted object for database
      const firesExtracted: Record<string, { present: boolean; evidence: string; strength: number }> = {}
      for (const fe of aiResult.firesElements || []) {
        firesExtracted[fe.element] = {
          present: true,
          evidence: fe.evidence,
          strength: fe.strength || 3,
        }
      }

      // Save to validations table
      const { error: saveError } = await supabase
        .from('validations')
        .insert({
          client_email: userEmail,
          mode: 'self',
          responses: {
            focus,
            whatWentWell,
            yourPart,
            impact,
          },
          proof_line: aiResult.priorityLine,
          fires_extracted: firesExtracted,
          validation_signal: aiResult.validationSignal || 'developing',
          share_to_feed: shareToCampfire,
        })

      if (saveError) {
        console.error('Failed to save validation:', saveError)
        // Do not throw - still show results even if save fails
      }

      setResult({
        priorityLine: aiResult.priorityLine,
        firesElements: aiResult.firesElements || [],
        reflectionInsight: aiResult.reflectionInsight,
        yourPattern: aiResult.yourPattern,
        patternQuotes: aiResult.patternQuotes,
      })

      setStep(5) // Results step
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return focus.trim().length > 0
    if (step === 2) return whatWentWell.trim().length > 0
    if (step === 3) return yourPart.trim().length > 0
    if (step === 4) return impact.trim().length > 0
    return false
  }

  // Results view
  if (step === 5 && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Priority Confirmed</h1>
            <p className="text-gray-600 mt-1">Here is what you proved today</p>
          </div>

          {/* Priority Line */}
          <Card padding="lg" className="mb-6 border-brand-primary border-2">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">
                Your Proof Line
              </p>
              <InfoIcon content="A proof line is portable evidence - a one-sentence summary you can recall when confidence wavers. Research shows that articulating your wins helps you repeat them." />
            </div>
            <p className="text-lg font-medium text-gray-900 italic">
              &quot;{result.priorityLine}&quot;
            </p>
          </Card>

          {/* Pattern (if available) */}
          {result.yourPattern && (
            <Card padding="md" className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Your Pattern
                </p>
                <InfoIcon content="Patterns are the recurring ways you create positive outcomes. Over time, they reveal your natural strengths - how you consistently show up when it matters." />
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

          {/* FIRES Elements */}
          {result.firesElements && result.firesElements.length > 0 && (
            <Card padding="md" className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Elements Present
                </p>
                <InfoIcon content="FIRES = Feelings, Influence, Resilience, Ethics, Strengths. These are five internal navigation systems your brain uses when deciding how to act. We extract them from your natural language - you do not have to think about them." />
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

          {/* Reflection Insight */}
          {result.reflectionInsight && (
            <Card padding="md" className="mb-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  What This Shows
                </p>
                <InfoIcon content="This insight came from YOUR words - we just reflected it back. Studies show we remember self-generated content better than advice we receive. You created this." />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.reflectionInsight}
              </p>
            </Card>
          )}

          {/* Light science note */}
          <p className="text-xs text-gray-400 text-center mb-6 italic">
            Each entry builds your evidence library. Small proof compounds into real confidence.
          </p>

          {/* Your Responses Summary (collapsed by default) */}
          <details className="mb-6">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              View your original responses
            </summary>
            <Card padding="md" className="mt-2">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Focus:</span>
                  <p className="text-gray-600 mt-1">{focus}</p>
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
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-[#0D7C66] hover:bg-[#095c4d] text-white font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
            <button
              onClick={() => navigate('/ask')}
              className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors"
            >
              Get Inspired by Someone
            </button>
            <button
              onClick={() => navigate('/history')}
              className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header with back button and progress */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s <= step ? 'bg-brand-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="w-14" />
        </div>

        {/* Micro-education banner - only on step 1 */}
        {step === 1 && (
          <div className="bg-brand-primary/10 rounded-lg p-4 border border-brand-primary/20 mb-4">
            <p className="text-sm font-medium text-brand-primary mb-1">Daily Priority</p>
            <p className="text-sm text-gray-700">
              This 2-minute practice builds your evidence of how you show up. Over time, patterns emerge that reveal your natural strengths.
            </p>
          </div>
        )}

        {/* Question Cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What were you working on that mattered most today?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Name the focus area, project, or challenge.
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.focus.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setFocus, focus)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Start typing or tap a phrase above..."
                rows={3}
                showCharCount
                maxLength={300}
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What went well?
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                What happened that you want to remember?
              </p>
              
              {/* Rotating awareness insight */}
              <p className="text-xs text-gray-400 italic mb-4">
                {insights.whatWentWell}
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.whatWentWell.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setWhatWentWell, whatWentWell)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder="Start typing or tap a phrase above..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What was your part in making that happen?
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                What did you do, decide, or contribute?
              </p>
              
              {/* Rotating awareness insight */}
              <p className="text-xs text-gray-400 italic mb-4">
                {insights.yourPart}
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.yourPart.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setYourPart, yourPart)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={yourPart}
                onChange={(e) => setYourPart(e.target.value)}
                placeholder="Start typing or tap a phrase above..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What impact did it have?
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                How did it affect you, others, or the situation?
              </p>
              
              {/* Rotating awareness insight */}
              <p className="text-xs text-gray-400 italic mb-4">
                {insights.impact}
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.impact.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setImpact, impact)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-brand-primary/10 text-gray-700 hover:text-brand-primary rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="Start typing or tap a phrase above..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}
        </Card>

        {/* Options (shown on last step before submit) */}
        {step === 4 && (
          <Card padding="md" className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
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
              <span className="text-sm text-gray-700">Share to Campfire after confirming</span>
            </label>
          </Card>
        )}

        {/* Error message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="space-y-3">
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProceed()
                  ? 'bg-[#0D7C66] hover:bg-[#095c4d] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProceed() && !isSubmitting
                  ? 'bg-[#0D7C66] hover:bg-[#095c4d] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Analyzing...' : 'Confirm Priority'}
            </button>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-gray-500">
              Takes about 2 minutes
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
