import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Textarea, Badge, FIRES_LABELS } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

// Helper framing chips for each question
const HELPER_FRAMINGS = {
  whatWentWell: [
    'I showed up when...',
    'I followed through on...',
    'I spoke up about...',
    'I stayed calm during...',
    'I helped someone with...',
  ],
  yourPart: [
    'I chose to...',
    'I prepared by...',
    'I asked for help with...',
    'I said no to...',
    'I prioritized...',
  ],
  impact: [
    'It meant that...',
    'Others noticed...',
    'I felt...',
    'It opened up...',
    'It proved that...',
  ],
}

// Mock predictions for dropdown (will be replaced with real data)
const MOCK_PREDICTIONS = [
  { id: '1', title: 'Complete Q1 project deliverables' },
  { id: '2', title: 'Build stronger team relationships' },
  { id: '3', title: 'Improve public speaking skills' },
]

// Mock FIRES extraction result (placeholder for AI)
interface FiresExtraction {
  element: FiresElement
  evidence: string
}

interface PriorityResult {
  priorityLine: string
  firesElements: FiresExtraction[]
}

export function ConfirmPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Form state
  const [whatWentWell, setWhatWentWell] = useState('')
  const [yourPart, setYourPart] = useState('')
  const [impact, setImpact] = useState('')

  // Options state
  const [linkedPrediction, setLinkedPrediction] = useState<string>('')
  const [shareToCampfire, setShareToCampfire] = useState(false)

  // Results state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<PriorityResult | null>(null)

  const handleHelperClick = (text: string, setter: (value: string) => void, current: string) => {
    const prefix = current ? `${current} ` : ''
    setter(`${prefix}${text}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate AI processing (will be replaced with real API call)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock result (will come from AI)
    setResult({
      priorityLine: "I showed up fully today, contributing to something that mattered.",
      firesElements: [
        { element: 'resilience', evidence: 'Pushed through despite challenges' },
        { element: 'influence', evidence: 'Made an impact on others' },
        { element: 'ethics', evidence: 'Acted with integrity' },
      ],
    })

    setIsSubmitting(false)
    setStep(4) // Results step
  }

  const canProceed = () => {
    if (step === 1) return whatWentWell.trim().length > 0
    if (step === 2) return yourPart.trim().length > 0
    if (step === 3) return impact.trim().length > 0
    return false
  }

  // Results view
  if (step === 4 && result) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Priority Confirmed</h1>
            <p className="text-gray-600 mt-1">Here's your integrity statement</p>
          </div>

          {/* Priority Line */}
          <Card padding="lg" className="mb-6 border-brand-primary border-2">
            <p className="text-lg font-medium text-gray-900 text-center italic">
              "{result.priorityLine}"
            </p>
          </Card>

          {/* FIRES Elements */}
          <Card padding="md" className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">FIRES Elements Present</h3>
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

          {/* Your Responses Summary */}
          <Card padding="md" className="mb-6">
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

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                // TODO: Share functionality
                alert('Sharing coming soon!')
              }}
            >
              Share to Campfire
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return Home
            </Button>
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
            {[1, 2, 3].map((s) => (
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

        {/* Question Cards */}
        <Card padding="lg" className="mb-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What went well today?
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Reflect on something that worked out, big or small.
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
        {step === 3 && (
          <Card padding="md" className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Options</h3>

            {/* Link to prediction */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Link to a prediction (optional)
              </label>
              <select
                value={linkedPrediction}
                onChange={(e) => setLinkedPrediction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-colors text-sm"
              >
                <option value="">No linked prediction</option>
                {MOCK_PREDICTIONS.map((pred) => (
                  <option key={pred.id} value={pred.id}>
                    {pred.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Share to Campfire toggle */}
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
              loading={isSubmitting}
              disabled={!canProceed() || isSubmitting}
            >
              Confirm Priority
            </Button>
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
