import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Card, Textarea, Input, getSupabase, useAuth } from '@finding-good/shared'

// Helper framings for the belief step
const BELIEF_FRAMINGS = [
  "I believe you can...",
  "I see you becoming...",
  "You have what it takes to...",
  "I can picture you...",
  "The world needs your...",
]

// Helper framings for the reason step
const REASON_FRAMINGS = [
  "Because I've seen you...",
  "Because you've already shown...",
  "Because when things get hard, you...",
  "Because you care deeply about...",
  "Because your natural gift is...",
]

interface InspireResult {
  shareId: string
  shareUrl: string
}

export function InspirationsOthersPage() {
  const navigate = useNavigate()
  const { userEmail } = useAuth()
  const [step, setStep] = useState(1)

  // Derive display name from email
  const senderDisplayName = userEmail?.split('@')[0] || 'Someone'

  // Form state
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [beliefText, setBeliefText] = useState('')
  const [reasonText, setReasonText] = useState('')

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<InspireResult | null>(null)
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

      // Save to inspire_others table
      const { error: saveError } = await supabase
        .from('inspire_others')
        .insert({
          sender_email: userEmail,
          sender_name: senderDisplayName,
          recipient_name: recipientName,
          recipient_email: recipientEmail || null,
          belief_text: beliefText,
          reason_text: reasonText,
          share_id: shareId,
          status: 'sent',
        })

      if (saveError) {
        console.error('Failed to save inspiration:', saveError)
        throw new Error('Failed to save. Please try again.')
      }

      const shareUrl = `${window.location.origin}/inspirations/view/${shareId}`

      setResult({
        shareId,
        shareUrl,
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
    if (step === 1) return recipientName.trim().length > 0
    if (step === 2) return beliefText.trim().length >= 10
    if (step === 3) return reasonText.trim().length >= 10
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

    const shareText = `I wanted to share something I believe about you:\n\n"${beliefText}"\n\nWhy I believe this: ${reasonText}\n\nSee more at: ${result.shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `A belief for ${recipientName}`,
          text: shareText,
        })
      } catch (err) {
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
    setBeliefText('')
    setReasonText('')
    setResult(null)
    setSubmitError(null)
    setStep(1)
  }

  // Results view
  if (step === 5 && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Inspiration Sent</h1>
            <p className="text-gray-600 mt-1">Share this with {recipientName}</p>
          </div>

          {/* Preview Card */}
          <Card padding="lg" className="mb-6 border-yellow-300 border-2 bg-yellow-50">
            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">
              For {recipientName}
            </p>
            <p className="text-lg font-medium text-gray-900 mb-4">
              &quot;{beliefText}&quot;
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium">Why I believe this:</span> {reasonText}
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

          {/* Why sharing matters */}
          <p className="text-xs text-gray-500 text-center mb-6 italic">
            When you tell someone what you believe about them, you give them something to live into.
            The gift is in the telling.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
            >
              Share with {recipientName}
            </button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={startAnother}
            >
              Inspire Someone Else
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/inspirations')}
            >
              Done
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/inspirations" className="text-sm text-brand-primary hover:underline">
              Back to Inspirations
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
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/inspirations')}
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
                  s <= step ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="w-14" />
        </div>

        {/* Intro banner - only on step 1 */}
        {step === 1 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-1">Inspire Someone</p>
            <p className="text-sm text-yellow-700">
              When you tell someone what you believe about them, you give them something powerful:
              a vision of who they could become from someone who sees them.
            </p>
          </div>
        )}

        {/* Question Cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Who do you want to inspire?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Name the person you believe in.
              </p>

              <div className="space-y-4">
                <Input
                  label="Their name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Sarah, my teammate, etc."
                />
                <Input
                  label="Their email (optional)"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="For sharing later"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What do you believe {recipientName} can accomplish?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Share your belief about what they're capable of.
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {BELIEF_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setBeliefText, beliefText)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={beliefText}
                onChange={(e) => setBeliefText(e.target.value)}
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
                Why do you believe this about {recipientName}?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What have you seen that makes you confident?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {REASON_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setReasonText, reasonText)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
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
                Preview your message
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Here's what {recipientName} will see:
              </p>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">
                  A belief for {recipientName}
                </p>
                <p className="text-gray-900 font-medium mb-3">
                  "{beliefText}"
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Why I believe this:</span> {reasonText}
                </p>
                <p className="text-xs text-gray-500 mt-3 italic">
                  — {senderDisplayName}
                </p>
              </div>
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
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProceed()
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
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
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create & Share'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
