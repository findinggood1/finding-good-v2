import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Textarea, LoadingSpinner, Badge, FIRES_LABELS } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'
import { useRespond } from '../hooks'

// Helper framing chips (same as ConfirmPage)
const HELPER_FRAMINGS = {
  whatWentWell: [
    'I showed up when...',
    'I followed through on...',
    'I spoke up about...',
    'I stayed calm during...',
  ],
  yourPart: [
    'I chose to...',
    'I prepared by...',
    'I asked for help with...',
    'I prioritized...',
  ],
  impact: [
    'It meant that...',
    'Others noticed...',
    'I felt...',
    'It opened up...',
  ],
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

  // Form state - 3 questions
  const [step, setStep] = useState(1)
  const [whatWentWell, setWhatWentWell] = useState('')
  const [yourPart, setYourPart] = useState('')
  const [impact, setImpact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleHelperClick = (text: string, setter: (value: string) => void, current: string) => {
    const prefix = current ? `${current} ` : ''
    setter(`${prefix}${text}`)
  }

  const handleSubmit = async () => {
    // Combine answers into response
    const fullResponse = JSON.stringify({
      whatWentWell,
      yourPart,
      impact,
    })

    // Start analysis in parallel with submission
    const analysisPromise = analyzeResponse({ whatWentWell, yourPart, impact })

    const success = await submitResponse(fullResponse)
    if (success) {
      setSubmitted(true)
      // Wait for analysis to complete (it may already be done)
      await analysisPromise
    }
  }

  const canProceed = () => {
    if (step === 1) return whatWentWell.trim().length > 0
    if (step === 2) return yourPart.trim().length > 0
    if (step === 3) return impact.trim().length > 0
    return false
  }

  // recipientName is the responder's name (optional personalization)
  const greeting = askDetails?.recipientName ? `Hi ${askDetails.recipientName}!` : null
  const requesterName = askDetails?.requesterName || 'A friend'

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

  // Not found state
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Link Not Found
            </h2>
            <p className="text-gray-600">
              This link doesn't exist or may have been removed.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  // Expired state
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Link Expired
            </h2>
            <p className="text-gray-600">
              This invitation has expired. Ask them to send a new one if you'd still like to share.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  // Already responded state
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Already Shared
            </h2>
            <p className="text-gray-600">
              You've already shared your reflection. Thank you!
            </p>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600">
              We couldn't load this invitation. Please try again later.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  // Success state (after submission) - Show results
  if (submitted) {
    // Still analyzing - show loading
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

    // Show results
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Your Reflection</h1>
            <p className="text-gray-600 mt-1">Here's what you shared</p>
          </div>

          {/* Priority Line */}
          {analysisResult?.priorityLine && (
            <Card padding="lg" className="mb-4 border-brand-primary border-2">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 text-center">Your Priority Line</h3>
              <p className="text-lg font-medium text-gray-900 text-center italic">
                "{analysisResult.priorityLine}"
              </p>
            </Card>
          )}

          {/* FIRES Elements */}
          {analysisResult?.firesElements && analysisResult.firesElements.length > 0 && (
            <Card padding="md" className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">What You Demonstrated</h3>
              <div className="space-y-3">
                {analysisResult.firesElements.map(({ element, evidence }) => (
                  <div key={element} className="flex items-start gap-3">
                    <Badge variant="fires" firesElement={element as FiresElement} size="sm">
                      {FIRES_LABELS[element as FiresElement]}
                    </Badge>
                    <span className="text-sm text-gray-600 flex-1">{evidence}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reflection Insight */}
          {analysisResult?.reflectionInsight && (
            <Card padding="md" className="mb-4 bg-brand-primary/5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Insight</h3>
              <p className="text-gray-700 text-sm">
                {analysisResult.reflectionInsight}
              </p>
            </Card>
          )}

          {/* Fallback if no analysis */}
          {!analysisResult && (
            <Card padding="md" className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">What You Shared</h3>
              <div className="space-y-3 text-sm">
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
          )}

          {/* Shared notification */}
          <Card padding="md" className="mb-6 text-center">
            <p className="text-gray-700">
              Your reflection has been shared with <span className="font-medium">{requesterName}</span>
            </p>
          </Card>

          {/* CTA */}
          <Card padding="lg" className="text-center bg-brand-primary/5 border-brand-primary/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Want to start your own practice?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Join Priority to track what matters and build your own reflection practice.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              Get Started Free
            </Button>
          </Card>

          <p className="text-center text-sm text-gray-400 mt-6">
            Taking time to notice what matters is a gift—to yourself and to those around you.
          </p>
        </div>
      </div>
    )
  }

  // Valid - show 3-question flow
  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-primary">Priority</h1>
          <p className="text-gray-600 mt-1">Finding Good</p>
        </div>

        {/* Invitation context */}
        <Card padding="md" className="mb-4 bg-brand-primary/5 border-brand-primary/20">
          {greeting && (
            <p className="text-gray-700 text-center font-medium mb-1">
              {greeting}
            </p>
          )}
          <p className="text-gray-700 text-center">
            <span className="font-medium">{requesterName}</span> invited you to share what matters
          </p>
          {askDetails?.personalMessage && (
            <p className="text-gray-600 text-sm mt-2 italic text-center">
              "{askDetails.personalMessage}"
            </p>
          )}
        </Card>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
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
                What went well for you recently?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Think of something that worked out, big or small.
              </p>

              {/* Helper chips */}
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

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What was your part in making that happen?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What did you do, decide, or contribute?
              </p>

              {/* Helper chips */}
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

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What impact did it have?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                How did it affect you, others, or the situation?
              </p>

              {/* Helper chips */}
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

          {/* Error display */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}
        </Card>

        {/* Navigation buttons */}
        <div className="space-y-3">
          {step < 3 ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!canProceed() || submitting}
            >
              Share My Reflection
            </Button>
          )}

          {step > 1 && (
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={() => setStep(step - 1)}
              disabled={submitting}
            >
              Back
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Takes about 2 minutes
        </p>
      </div>
    </div>
  )
}
