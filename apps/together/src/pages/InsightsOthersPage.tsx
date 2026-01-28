import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Card, Textarea, Input, getSupabase, useAuth } from '@finding-good/shared'

// Helper framings for the "outcome" step
const OUTCOME_FRAMINGS = [
  "They accomplished...",
  "I watched them...",
  "They successfully...",
  "What they pulled off was...",
  "They managed to...",
]

// Helper framings for the "process" step
const PROCESS_FRAMINGS = [
  "Their approach was...",
  "I noticed they...",
  "What stood out was how they...",
  "They handled it by...",
  "Step by step, they...",
]

// Helper framings for the "key move" step
const KEY_MOVE_FRAMINGS = [
  "The turning point was when they...",
  "What made the difference was...",
  "The key decision was...",
  "Everything changed when they...",
  "The pivotal moment was...",
]

// Helper framings for the "impact" step
const IMPACT_FRAMINGS = [
  "Because of this...",
  "The result was...",
  "Others benefited by...",
  "It changed things because...",
  "The ripple effect was...",
]

interface InsightResult {
  shareId: string
  shareUrl: string
}

export function InsightsOthersPage() {
  const navigate = useNavigate()
  const { userEmail } = useAuth()
  const [step, setStep] = useState(1)

  // Derive display name from email
  const senderDisplayName = userEmail?.split('@')[0] || 'Someone'

  // Form state
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [outcome, setOutcome] = useState('')
  const [process, setProcess] = useState('')
  const [keyMove, setKeyMove] = useState('')
  const [impact, setImpact] = useState('')
  const [shareToFeed, setShareToFeed] = useState(false)

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<InsightResult | null>(null)
  const [clipboardSuccess, setClipboardSuccess] = useState(false)

  const handleHelperClick = (text: string, setter: (value: string) => void, current: string) => {
    const prefix = current ? `${current} ` : ''
    setter(`${prefix}${text}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = getSupabase()

      // Generate a unique share ID
      const shareId = crypto.randomUUID().slice(0, 8)

      // Save to validations table with mode='send_observation'
      const { error: saveError } = await supabase
        .from('validations')
        .insert({
          client_email: userEmail,
          mode: 'send_observation',
          intensity: 'balanced',
          recipient_name: recipientName,
          recipient_email: recipientEmail || null,
          relationship: relationship || null,
          responses: {
            outcome,
            how_they_did_it: process,
            key_decision: keyMove,
            impact,
          },
          share_id: shareId,
          share_to_feed: shareToFeed,
        })

      if (saveError) {
        console.error('Failed to save observation:', saveError)
        throw new Error('Failed to save. Please try again.')
      }

      const shareUrl = `${window.location.origin}/insights/view/${shareId}`

      setResult({
        shareId,
        shareUrl,
      })

      setStep(7) // Results step
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return recipientName.trim().length > 0
    if (step === 2) return outcome.trim().length >= 10
    if (step === 3) return process.trim().length >= 10
    if (step === 4) return keyMove.trim().length >= 10
    if (step === 5) return impact.trim().length >= 10
    return false
  }

  const copyShareLink = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result.shareUrl)
      setClipboardSuccess(true)
      setTimeout(() => setClipboardSuccess(false), 2000)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
      alert('Failed to copy. Please copy manually: ' + result.shareUrl)
    }
  }

  const handleShare = async () => {
    if (!result) return

    const shareText = `I wanted to share what I observed about how you work:\n\nWhat you accomplished: ${outcome}\n\nHow you did it: ${process}\n\nThe key move: ${keyMove}\n\nThe impact: ${impact}\n\nSee more at: ${result.shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Observation for ${recipientName}`,
          text: shareText,
        })
      } catch {
        // User cancelled or share failed - fall back to copy
        copyShareLink()
      }
    } else {
      copyShareLink()
    }
  }

  const startAnother = () => {
    setRecipientName('')
    setRecipientEmail('')
    setRelationship('')
    setOutcome('')
    setProcess('')
    setKeyMove('')
    setImpact('')
    setShareToFeed(false)
    setResult(null)
    setSubmitError(null)
    setStep(1)
  }

  // Results view (Step 7)
  if (step === 7 && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📈</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Observation Sent</h1>
            <p className="text-gray-600 mt-1">Share this with {recipientName}</p>
          </div>

          {/* Preview Card */}
          <Card padding="lg" className="mb-6 border-green-300 border-2 bg-green-50">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
              Observation for {recipientName}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase">What You Accomplished</p>
                <p className="text-gray-900">{outcome}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 uppercase">How You Approached It</p>
                <p className="text-gray-900">{process}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 uppercase">The Decision That Stood Out</p>
                <p className="text-gray-900">{keyMove}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 uppercase">The Impact</p>
                <p className="text-gray-900">{impact}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic text-right">
              — {senderDisplayName}
            </p>
          </Card>

          {/* Share Link */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Shareable Link:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-gray-300 truncate">
                {result.shareUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
              >
                {clipboardSuccess ? '✓ Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Why observation matters */}
          <p className="text-xs text-gray-500 text-center mb-6 italic">
            When you tell someone how they succeeded, you give them a recipe they can repeat.
            Your observation is a gift of clarity.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Share with {recipientName}
            </button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={startAnother}
            >
              Witness Someone Else
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/insights')}
            >
              Done
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/insights" className="text-sm text-brand-primary hover:underline">
              Back to Insights
            </Link>
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
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/insights')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  s <= step ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="w-14" />
        </div>

        {/* Intro banner - only on step 1 */}
        {step === 1 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 mb-4">
            <p className="text-sm font-medium text-green-800 mb-1">Witness Someone's Growth</p>
            <p className="text-sm text-green-700">
              When you tell someone how they succeeded, you give them a recipe for the future.
              Your observation helps them see what works.
            </p>
          </div>
        )}

        {/* Question Cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Who did you see do something?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                This person will receive your observation.
              </p>

              <div className="space-y-4">
                <Input
                  label="Their name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Elena, my team lead, etc."
                />
                <Input
                  label="Their email (optional)"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="For sharing later"
                />
                <Input
                  label="How do you know them? (optional)"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., colleague, team lead, mentor"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What outcome did you observe?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What did {recipientName} accomplish, handle, or create?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {OUTCOME_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setOutcome, outcome)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Describe the result you witnessed..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What did you notice about how {recipientName} did it?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Focus on the process, not just the result.
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PROCESS_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setProcess, process)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                placeholder="What approach, method, or actions did they take..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What decision or moment stood out?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What made the difference between success and not?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {KEY_MOVE_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setKeyMove, keyMove)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={keyMove}
                onChange={(e) => setKeyMove(e.target.value)}
                placeholder="What was the pivotal choice or turning point..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What impact did it have?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                On the work, on others, on you?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {IMPACT_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setImpact, impact)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="What changed because of how they did it..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Preview your observation
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Here's what {recipientName} will see:
              </p>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
                  {senderDisplayName} observed how you work
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase">What You Accomplished</p>
                    <p className="text-gray-900 text-sm">{outcome}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase">How You Approached It</p>
                    <p className="text-gray-900 text-sm">{process}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase">The Decision That Stood Out</p>
                    <p className="text-gray-900 text-sm">{keyMove}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase">The Impact</p>
                    <p className="text-gray-900 text-sm">{impact}</p>
                  </div>
                </div>
              </div>

              {/* Share to feed toggle */}
              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToFeed}
                  onChange={(e) => setShareToFeed(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Share to Campfire</span>
              </label>
            </>
          )}
        </Card>

        {/* Error message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="space-y-3">
          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProceed()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                !isSubmitting
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Observation'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
