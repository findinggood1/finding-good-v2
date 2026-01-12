import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Card, Textarea, Input, getSupabase, useAuth } from '@finding-good/shared'

// Helper framing chips for each question
const HELPER_FRAMINGS = {
  whatTheyDid: [
    "They showed up when...",
    "They spoke up about...",
    "They made time for...",
    "They helped me with...",
    "They listened when...",
  ],
  whatItShowed: [
    "It showed they care about...",
    "It showed their commitment to...",
    "It showed courage because...",
    "It showed integrity when...",
    "It showed patience with...",
  ],
  howItAffected: [
    "It helped me see...",
    "It made me feel...",
    "It gave me confidence to...",
    "It reminded me that...",
    "It inspired me to...",
  ],
}

interface RecognitionResult {
  impactLine: string
  whatItReveals: string
}

export function RecognizePage() {
  const navigate = useNavigate()
  const { userEmail } = useAuth()
  const [step, setStep] = useState(1)

  // Form state
  const [personName, setPersonName] = useState('')
  const [personEmail, setPersonEmail] = useState('')
  const [whatTheyDid, setWhatTheyDid] = useState('')
  const [whatItShowed, setWhatItShowed] = useState('')
  const [howItAffected, setHowItAffected] = useState('')

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<RecognitionResult | null>(null)

  const handleHelperClick = (text: string, setter: (value: string) => void, current: string) => {
    const prefix = current ? `${current} ` : ''
    setter(`${prefix}${text}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const supabase = getSupabase()
      
      // For now, generate a simple impact line client-side
      // TODO: Add AI analysis via edge function
      const impactLine = `${personName} made a real difference by showing up in a way that mattered.`
      const whatItReveals = `When ${personName} ${whatTheyDid.toLowerCase().replace(/^they /i, '')}, it showed something important about who they are. ${whatItShowed} And for you, ${howItAffected.toLowerCase()}`

      // Save to recognitions table
      const { error: saveError } = await supabase
        .from('recognitions')
        .insert({
          from_email: userEmail,
          to_name: personName,
          to_email: personEmail || null,
          what_they_did: whatTheyDid,
          what_it_showed: whatItShowed,
          how_it_affected: howItAffected,
          impact_line: impactLine,
        })

      if (saveError) {
        console.error('Failed to save recognition:', saveError)
        // Continue anyway - show results even if save fails
      }

      setResult({
        impactLine,
        whatItReveals,
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
    if (step === 1) return personName.trim().length > 0
    if (step === 2) return whatTheyDid.trim().length > 0
    if (step === 3) return whatItShowed.trim().length > 0
    if (step === 4) return howItAffected.trim().length > 0
    return false
  }

  const handleShare = async () => {
    if (!result) return
    
    const shareText = `I wanted you to know the impact you had on me:\n\n"${result.impactLine}"\n\n${result.whatItReveals}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Recognition for ${personName}`,
          text: shareText,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText)
      alert('Copied to clipboard!')
    }
  }

  // Results view
  if (step === 5 && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Impact Captured</h1>
            <p className="text-gray-600 mt-1">Share this with {personName}</p>
          </div>

          {/* Impact Card */}
          <Card padding="lg" className="mb-6 border-amber-300 border-2 bg-amber-50">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
              For {personName}
            </p>
            <p className="text-lg font-medium text-gray-900 mb-4">
              &quot;{result.impactLine}&quot;
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.whatItReveals}
            </p>
          </Card>

          {/* Why sharing matters */}
          <p className="text-xs text-gray-500 text-center mb-6 italic">
            When you tell someone the impact they had, you help them see what they might not see in themselves. The gift is in the telling.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Share with {personName}
            </button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Done
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-brand-primary hover:underline">
              Back to Priority Builder
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
                  s <= step ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="w-14" />
        </div>

        {/* Intro banner - only on step 1 */}
        {step === 1 && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-4">
            <p className="text-sm font-medium text-amber-800 mb-1">Recognize Impact</p>
            <p className="text-sm text-amber-700">
              When you name the impact someone had on you, you give them something valuable: evidence of who they are when it matters.
            </p>
          </div>
        )}

        {/* Question Cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Who had an impact on you?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Name the person you want to recognize.
              </p>

              <div className="space-y-4">
                <Input
                  label="Their name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g., Sarah, my manager, etc."
                />
                <Input
                  label="Their email (optional)"
                  type="email"
                  value={personEmail}
                  onChange={(e) => setPersonEmail(e.target.value)}
                  placeholder="For sharing later"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What did {personName} do?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Describe the specific action or moment.
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.whatTheyDid.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setWhatTheyDid, whatTheyDid)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={whatTheyDid}
                onChange={(e) => setWhatTheyDid(e.target.value)}
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
                What did it show about {personName}?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What quality or value did their action reveal?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.whatItShowed.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setWhatItShowed, whatItShowed)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={whatItShowed}
                onChange={(e) => setWhatItShowed(e.target.value)}
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
                How did it affect you?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                What changed for you because of what they did?
              </p>

              {/* Helper chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HELPER_FRAMINGS.howItAffected.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleHelperClick(text, setHowItAffected, howItAffected)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <Textarea
                value={howItAffected}
                onChange={(e) => setHowItAffected(e.target.value)}
                placeholder="Start typing or tap a phrase above..."
                rows={4}
                showCharCount
                maxLength={500}
              />
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
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
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
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Impact Card'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
