import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Card, Textarea, Input, getSupabase, useAuth } from '@finding-good/shared'

// Helper framings for the "what they did" step
const ACTION_FRAMINGS = [
  "They stepped up when...",
  "I noticed them...",
  "What stood out was...",
  "They took the time to...",
  "Without being asked, they...",
]

// Helper framings for the "what it showed" step
const MEANING_FRAMINGS = [
  "This showed their...",
  "It revealed how much they...",
  "This is who they are:",
  "It demonstrated their...",
  "I saw their true...",
]

// Helper framings for the "how it affected" step
const IMPACT_FRAMINGS = [
  "Because of this, I...",
  "It changed how I...",
  "The ripple effect was...",
  "Others noticed and...",
  "It made me realize...",
]

interface ImpactResult {
  shareId: string
  shareUrl: string
}

export function ImpactsOthersPage() {
  const navigate = useNavigate()
  const { userEmail } = useAuth()
  const [step, setStep] = useState(1)

  // Derive display name from email
  const senderDisplayName = userEmail?.split('@')[0] || 'Someone'

  // Form state
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [whatTheyDid, setWhatTheyDid] = useState('')
  const [whatItShowed, setWhatItShowed] = useState('')
  const [howItAffected, setHowItAffected] = useState('')
  const [shareToFeed, setShareToFeed] = useState(false)

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<ImpactResult | null>(null)
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

      // Save to priorities table with type='other'
      const { error: saveError } = await supabase
        .from('priorities')
        .insert({
          client_email: userEmail,
          type: 'other',
          target_name: recipientName,
          target_email: recipientEmail || null,
          target_relationship: relationship || null,
          responses: {
            what_they_did: whatTheyDid,
            what_it_showed: whatItShowed,
            how_it_affected: howItAffected,
          },
          share_id: shareId,
          share_to_feed: shareToFeed,
          status: 'sent',
        })

      if (saveError) {
        console.error('Failed to save recognition:', saveError)
        throw new Error('Failed to save. Please try again.')
      }

      const shareUrl = `${window.location.origin}/impacts/view/${shareId}`

      setResult({
        shareId,
        shareUrl,
      })

      setStep(6) // Results step
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return recipientName.trim().length > 0
    if (step === 2) return whatTheyDid.trim().length >= 10
    if (step === 3) return whatItShowed.trim().length >= 10
    if (step === 4) return howItAffected.trim().length >= 10
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

    const shareText = `I wanted to recognize something you did:\n\nWhat you did: ${whatTheyDid}\n\nWhat it showed: ${whatItShowed}\n\nHow it affected me: ${howItAffected}\n\nSee more at: ${result.shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Recognition for ${recipientName}`,
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
    setWhatTheyDid('')
    setWhatItShowed('')
    setHowItAffected('')
    setShareToFeed(false)
    setResult(null)
    setSubmitError(null)
    setStep(1)
  }

  // Results view (Step 6)
  if (step === 6 && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Recognition Sent</h1>
            <p className="text-gray-600 mt-1">Share this with {recipientName}</p>
          </div>

          {/* Preview Card */}
          <Card padding="lg" className="mb-6 border-teal-300 border-2 bg-teal-50">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">
              Recognition for {recipientName}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-teal-600 uppercase">What You Did</p>
                <p className="text-gray-900">{whatTheyDid}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-teal-600 uppercase">What It Showed</p>
                <p className="text-gray-900">{whatItShowed}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-teal-600 uppercase">How It Affected Me</p>
                <p className="text-gray-900">{howItAffected}</p>
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

          {/* Why recognition matters */}
          <p className="text-xs text-gray-500 text-center mb-6 italic">
            When you tell someone the impact they had, you help them see themselves more clearly.
            Recognition is a gift.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
            >
              Share with {recipientName}
            </button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={startAnother}
            >
              Recognize Someone Else
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/impacts')}
            >
              Done
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/impacts" className="text-sm text-brand-primary hover:underline">
              Back to Impacts
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
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/impacts')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s <= step ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="w-14" />
        </div>

        {/* Intro banner - only on step 1 */}
        {step === 1 && (
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 mb-4">
            <p className="text-sm font-medium text-teal-800 mb-1">Recognize Someone's Impact</p>
            <p className="text-sm text-teal-700">
              When you tell someone the impact they had, you help them see a strength they might
              not see in themselves. Your recognition is a mirror.
            </p>
          </div>
        )}

        {/* Question Cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Who are you recognizing?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                This person will receive what you share.
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
                <Input
                  label="How do you know them? (optional)"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., colleague, direct report, friend"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What did {recipientName} do that mattered?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Focus on something concrete they did or said.
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {ACTION_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setWhatTheyDid, whatTheyDid)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={whatTheyDid}
                onChange={(e) => setWhatTheyDid(e.target.value)}
                placeholder="Describe a specific moment or action..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What did this show about {recipientName}?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What quality or character did this reveal?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {MEANING_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setWhatItShowed, whatItShowed)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={whatItShowed}
                onChange={(e) => setWhatItShowed(e.target.value)}
                placeholder="What does this moment tell you about who they are..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                How did it affect you?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What changed because of what they did?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {IMPACT_FRAMINGS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setHowItAffected, howItAffected)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={howItAffected}
                onChange={(e) => setHowItAffected(e.target.value)}
                placeholder="Describe the impact on you, others, or the situation..."
                rows={4}
                showCharCount
                maxLength={500}
              />
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Preview your recognition
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Here's what {recipientName} will see:
              </p>

              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">
                  {senderDisplayName} recognized you
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-teal-600 uppercase">What You Did</p>
                    <p className="text-gray-900 text-sm">{whatTheyDid}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-600 uppercase">What It Showed</p>
                    <p className="text-gray-900 text-sm">{whatItShowed}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-600 uppercase">How It Affected Me</p>
                    <p className="text-gray-900 text-sm">{howItAffected}</p>
                  </div>
                </div>
              </div>

              {/* Share to feed toggle */}
              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToFeed}
                  onChange={(e) => setShareToFeed(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
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
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canProceed()
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
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
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Recognition'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
