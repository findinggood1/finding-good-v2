import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Textarea, LoadingSpinner, Badge, FIRES_LABELS, getSupabase } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'
import { useRespond } from '../hooks'

// Rotating awareness insights for each question
const AWARENESS_INSIGHTS = {
  whatWentWell: [
    "Sometimes what went well is simply feeling happy. Claiming this helps others claim happiness too.",
    "Small progress counts. Noticing it builds the muscle of noticing.",
    "Staying calm when you could have reacted IS something going well.",
    "Doing the right thing even when no one noticed - that is worth capturing.",
    "A good conversation is a win. Connection is progress.",
  ],
  yourPart: [
    "Sometimes not doing anything IS doing something.",
    "Noticing is enough. Awareness is an action.",
    "Asking for help is a contribution, not a weakness.",
    "Choosing not to compromise - that is agency.",
    "Showing up before you felt ready is a choice worth naming.",
  ],
  impact: [
    "Impact on YOU counts. How you feel matters.",
    "Even if no one said anything, something shifted.",
    "Sometimes the impact is just: you did not quit.",
    "Doing something well makes the next time easier. That is impact.",
    "Future you benefits from what present you just did.",
  ],
}

// Helper framing chips
const HELPER_FRAMINGS = {
  focus: [
    "A project I am pushing forward",
    "A relationship I am investing in",
    "A challenge I am working through",
    "A skill I am developing",
  ],
  whatWentWell: [
    "I showed up when...",
    "I followed through on...",
    "I spoke up about...",
    "I stayed calm during...",
  ],
  yourPart: [
    "I chose to...",
    "I prepared by...",
    "I asked for help with...",
    "I prioritized...",
  ],
  impact: [
    "It meant that...",
    "Others noticed...",
    "I felt...",
    "It opened up...",
  ],
}

interface RequesterPriority {
  proofLine: string
  firesElements?: Array<{ element: string; evidence: string }>
}

function getRandomInsight(insights: string[]): string {
  return insights[Math.floor(Math.random() * insights.length)]
}

// Home link component for consistency
function HomeLink() {
  return (
    <div className="mt-6 text-center">
      <Link to="/" className="text-sm text-brand-primary hover:underline">
        Go to Priority Builder
      </Link>
    </div>
  )
}

export function RespondPage() {
  const { token } = useParams<{ token: string }>()
  const {
    askDetails,
    status,
    submitting,
    analyzing,
    error,
    analysisResult,
    submitResponse,
    analyzeResponse,
  } = useRespond(token)

  // Form state - 4 questions
  const [step, setStep] = useState(1)
  const [focus, setFocus] = useState('')
  const [whatWentWell, setWhatWentWell] = useState('')
  const [yourPart, setYourPart] = useState('')
  const [impact, setImpact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Requester's priority for side-by-side view
  const [requesterPriority, setRequesterPriority] = useState<RequesterPriority | null>(null)

  // Random insights - stable per session
  const insights = useMemo(() => ({
    whatWentWell: getRandomInsight(AWARENESS_INSIGHTS.whatWentWell),
    yourPart: getRandomInsight(AWARENESS_INSIGHTS.yourPart),
    impact: getRandomInsight(AWARENESS_INSIGHTS.impact),
  }), [])

  // Fetch requester's latest priority when ask details load
  useEffect(() => {
    async function fetchRequesterPriority() {
      if (!askDetails) return
      
      try {
        const supabase = getSupabase()
        
        // Get requester email from the ask
        const { data: askData } = await supabase
          .from('priority_asks')
          .select('requester_email')
          .eq('id', askDetails.id)
          .single()
        
        if (!askData?.requester_email) return

        // Get their most recent priority
        const { data: validation } = await supabase
          .from('validations')
          .select('proof_line, fires_extracted')
          .eq('client_email', askData.requester_email)
          .eq('mode', 'self')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (validation?.proof_line) {
          const firesElements = validation.fires_extracted 
            ? Object.entries(validation.fires_extracted as Record<string, { present: boolean; evidence: string }>)
                .filter(([_, v]) => v.present)
                .map(([element, v]) => ({ element, evidence: v.evidence }))
            : []
          
          setRequesterPriority({
            proofLine: validation.proof_line,
            firesElements,
          })
        }
      } catch (err) {
        console.error('Failed to fetch requester priority:', err)
      }
    }

    fetchRequesterPriority()
  }, [askDetails])

  const handleHelperClick = (text: string, setter: (value: string) => void, current: string) => {
    const prefix = current ? `${current} ` : ''
    setter(`${prefix}${text}`)
  }

  const handleSubmit = async () => {
    const responseData = { focus, whatWentWell, yourPart, impact }
    
    // Start analysis in parallel with submission
    const analysisPromise = analyzeResponse(responseData)
    const result = await analysisPromise
    
    const success = await submitResponse(responseData, result)
    if (success) {
      setSubmitted(true)
    }
  }

  const canProceed = () => {
    if (step === 1) return focus.trim().length > 0
    if (step === 2) return whatWentWell.trim().length > 0
    if (step === 3) return yourPart.trim().length > 0
    if (step === 4) return impact.trim().length > 0
    return false
  }

  const requesterName = askDetails?.requesterName || 'Someone'
  const recipientGreeting = askDetails?.recipientName ? `Hi ${askDetails.recipientName}!` : null

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  // Error states with home links
  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Not Found</h2>
            <p className="text-gray-600">This link does not exist or may have been removed.</p>
            <HomeLink />
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Expired</h2>
            <p className="text-gray-600">This invitation has expired. Ask them to send a new one.</p>
            <HomeLink />
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'already_responded') {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Shared</h2>
            <p className="text-gray-600">You have already shared your priority. Thank you!</p>
            <HomeLink />
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something Went Wrong</h2>
            <p className="text-gray-600">We could not load this invitation. Please try again later.</p>
            <HomeLink />
          </Card>
        </div>
      </div>
    )
  }

  // Success state - show results side by side
  if (submitted) {
    if (analyzing) {
      return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Generating your insights...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Priority Captured</h1>
            <p className="text-gray-600 mt-1">Here is what you both proved</p>
          </div>

          {/* Side by side view */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Your Priority */}
            <div>
              <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wide mb-3 text-center">
                Your Priority
              </h3>
              
              {/* Proof Line */}
              {analysisResult?.priorityLine && (
                <Card padding="md" className="mb-3 border-brand-primary border-2">
                  <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">Proof Line</p>
                  <p className="text-sm font-medium text-gray-900 italic">
                    &quot;{analysisResult.priorityLine}&quot;
                  </p>
                </Card>
              )}

              {/* FIRES Elements */}
              {analysisResult?.firesElements && analysisResult.firesElements.length > 0 && (
                <Card padding="sm" className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Elements</p>
                  <div className="space-y-2">
                    {analysisResult.firesElements.map(({ element, evidence }) => (
                      <div key={element} className="flex items-start gap-2">
                        <Badge variant="fires" firesElement={element as FiresElement} size="sm">
                          {FIRES_LABELS[element as FiresElement]}
                        </Badge>
                        <span className="text-xs text-gray-600 flex-1">{evidence}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Insight */}
              {analysisResult?.reflectionInsight && (
                <Card padding="sm" className="bg-amber-50 border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Insight</p>
                  <p className="text-xs text-gray-700">{analysisResult.reflectionInsight}</p>
                </Card>
              )}
            </div>

            {/* Requester's Priority */}
            <div>
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3 text-center">
                {requesterName}&apos;s Priority
              </h3>
              
              {requesterPriority ? (
                <>
                  <Card padding="md" className="mb-3 border-blue-500 border-2">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Proof Line</p>
                    <p className="text-sm font-medium text-gray-900 italic">
                      &quot;{requesterPriority.proofLine}&quot;
                    </p>
                  </Card>

                  {requesterPriority.firesElements && requesterPriority.firesElements.length > 0 && (
                    <Card padding="sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Elements</p>
                      <div className="space-y-2">
                        {requesterPriority.firesElements.map(({ element, evidence }) => (
                          <div key={element} className="flex items-start gap-2">
                            <Badge variant="fires" firesElement={element as FiresElement} size="sm">
                              {FIRES_LABELS[element as FiresElement]}
                            </Badge>
                            <span className="text-xs text-gray-600 flex-1">{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card padding="md" className="text-center text-gray-500">
                  <p className="text-sm">{requesterName} has not shared their priority yet.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Shared notification */}
          <Card padding="md" className="mb-6 text-center">
            <p className="text-gray-700">
              Your priority has been shared with <span className="font-medium">{requesterName}</span>
            </p>
          </Card>

          {/* CTA to join */}
          <Card padding="lg" className="text-center bg-brand-primary/5 border-brand-primary/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Want to start your own practice?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Join Priority Builder to capture what matters daily and build your evidence library.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 px-6 bg-[#0D7C66] hover:bg-[#095c4d] text-white font-semibold rounded-lg transition-colors"
            >
              Get Started Free
            </button>
          </Card>

          <p className="text-xs text-gray-400 text-center mt-6 italic">
            Each entry builds your evidence library. Small proof compounds into real confidence.
          </p>
        </div>
      </div>
    )
  }

  // Main 4-question flow
  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-brand-primary">Priority Builder</h1>
          <p className="text-gray-500 text-sm">Finding Good</p>
        </div>

        {/* Invitation context */}
        <Card padding="md" className="mb-4 bg-blue-50 border-blue-100">
          {recipientGreeting && (
            <p className="text-blue-900 text-center font-medium mb-1">{recipientGreeting}</p>
          )}
          <p className="text-blue-800 text-center text-sm">
            <span className="font-medium">{requesterName}</span> wants to learn from how you show up. Share what matters to you.
          </p>
          {askDetails?.personalMessage && (
            <p className="text-blue-700 text-sm mt-2 italic text-center">
              &quot;{askDetails.personalMessage}&quot;
            </p>
          )}
        </Card>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? 'bg-brand-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Question cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What were you working on that mattered most today?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Name the focus area, project, or challenge.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.focus.map((text) => (
                  <button
                    key={text}
                    type="button"
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
              
              <p className="text-xs text-gray-400 italic mb-4">{insights.whatWentWell}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.whatWentWell.map((text) => (
                  <button
                    key={text}
                    type="button"
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
              
              <p className="text-xs text-gray-400 italic mb-4">{insights.yourPart}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.yourPart.map((text) => (
                  <button
                    key={text}
                    type="button"
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
              
              <p className="text-xs text-gray-400 italic mb-4">{insights.impact}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.impact.map((text) => (
                  <button
                    key={text}
                    type="button"
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

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}
        </Card>

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
              disabled={!canProceed() || submitting || analyzing}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProceed() && !submitting && !analyzing
                  ? 'bg-[#0D7C66] hover:bg-[#095c4d] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting || analyzing ? 'Analyzing...' : 'Share My Priority'}
            </button>
          )}

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={submitting}
              className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Takes about 2 minutes
        </p>
      </div>
    </div>
  )
}
