import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Textarea, getSupabase, useAuth, LoadingSpinner } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

type Step = 'home' | 'goal' | 'depth' | 'questions' | 'generating' | 'results' | 'history'
type Intensity = 'light' | 'balanced' | 'deeper'

interface Question {
  id: string
  element: FiresElement
  intensity: Intensity
  text: string
}

interface QuestionResponse {
  questionId: string
  questionText: string
  element: FiresElement
  answer: string
}

interface ProofResult {
  validationSignal: 'emerging' | 'developing' | 'grounded'
  validationInsight: string
  proofLine: string
  firesExtracted: Record<string, { present: boolean; strength: number }>
  scores: { confidence: number; clarity: number; ownership: number }
  pattern: { whatWorked: string; whyItWorked: string; howToRepeat: string }
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

const SIGNAL_INFO = {
  emerging: { label: 'Emerging', color: '#9E9E9E', description: 'You\'re starting to see the pattern' },
  developing: { label: 'Developing', color: '#2196F3', description: 'Good clarity on what worked' },
  grounded: { label: 'Grounded', color: '#4CAF50', description: 'Strong ownership of your process' },
}

const FIRES_INFO: Record<FiresElement, { label: string; color: string; description: string }> = {
  feelings: { label: 'Feelings', color: '#E57373', description: 'Emotional awareness' },
  influence: { label: 'Influence', color: '#64B5F6', description: 'Agency and control' },
  resilience: { label: 'Resilience', color: '#81C784', description: 'Persistence through difficulty' },
  ethics: { label: 'Ethics', color: '#FFD54F', description: 'Values and purpose' },
  strengths: { label: 'Strengths', color: '#BA68C8', description: 'Natural abilities' },
}

// FIRES Questions library - one question per element per intensity
const QUESTIONS: Question[] = [
  // Feelings
  { id: 'f-light', element: 'feelings', intensity: 'light', text: 'What felt satisfying about how this turned out?' },
  { id: 'f-balanced', element: 'feelings', intensity: 'balanced', text: 'What feeling told you that you were on the right track?' },
  { id: 'f-deeper', element: 'feelings', intensity: 'deeper', text: 'What vulnerability did you allow that made this possible?' },
  // Influence
  { id: 'i-light', element: 'influence', intensity: 'light', text: 'What action did you take that made a difference?' },
  { id: 'i-balanced', element: 'influence', intensity: 'balanced', text: 'What did you do that you initially hesitated on?' },
  { id: 'i-deeper', element: 'influence', intensity: 'deeper', text: 'What did you claim ownership of that others might not have?' },
  // Resilience
  { id: 'r-light', element: 'resilience', intensity: 'light', text: 'What obstacle did you work around to make this happen?' },
  { id: 'r-balanced', element: 'resilience', intensity: 'balanced', text: 'What did you have to let go of to succeed here?' },
  { id: 'r-deeper', element: 'resilience', intensity: 'deeper', text: 'What did this success cost you, and why was it worth it?' },
  // Ethics
  { id: 'e-light', element: 'ethics', intensity: 'light', text: 'What value did you honor in how you approached this?' },
  { id: 'e-balanced', element: 'ethics', intensity: 'balanced', text: 'How did your "why" shape the way you worked?' },
  { id: 'e-deeper', element: 'ethics', intensity: 'deeper', text: 'What would have been easier but felt wrong?' },
  // Strengths
  { id: 's-light', element: 'strengths', intensity: 'light', text: 'What skill or ability did you rely on here?' },
  { id: 's-balanced', element: 'strengths', intensity: 'balanced', text: 'What unique perspective or approach did you bring?' },
  { id: 's-deeper', element: 'strengths', intensity: 'deeper', text: 'What part of your identity showed up strongly here?' },
]

function selectQuestionsForSession(intensity: Intensity): Question[] {
  const count = intensity === 'light' ? 3 : intensity === 'balanced' ? 4 : 5
  const intensityQuestions = QUESTIONS.filter(q => q.intensity === intensity)

  // Shuffle and take required count
  const shuffled = [...intensityQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

interface ProofPageProps {
  pageTitle?: string
  toolName?: string
  mode?: 'self' | 'send'
}

export function ProofPage({ pageTitle = 'Proof', toolName = 'Proof', mode: propMode }: ProofPageProps) {
  const [searchParams] = useSearchParams()
  const { userEmail } = useAuth()
  const urlMode = searchParams.get('mode')
  const isSendMode = propMode === 'send' || urlMode === 'send'

  // Step state
  const [step, setStep] = useState<Step>('home')

  // Form state
  const [goalInput, setGoalInput] = useState('')
  const [intensity, setIntensity] = useState<Intensity | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  // Results state
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProofResult | null>(null)
  const [validationId, setValidationId] = useState<string | null>(null)

  // Share state
  const [shareToFeed, setShareToFeed] = useState(false)

  // History state
  const [entries, setEntries] = useState<any[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  // Current question
  const currentQuestion = selectedQuestions[currentQuestionIndex]

  // Fetch history
  useEffect(() => {
    async function fetchEntries() {
      if (!userEmail || step !== 'history') return

      setLoadingEntries(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from('validations')
          .select('*')
          .eq('client_email', userEmail)
          .eq('mode', 'self')
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
  }, [userEmail, step])

  const handleGoalSubmit = () => {
    if (goalInput.trim().length < 20) {
      setError('Please provide at least 20 characters')
      return
    }
    setError(null)
    setStep('depth')
  }

  const handleDepthSubmit = () => {
    if (!intensity) {
      setError('Please select an intensity level')
      return
    }
    setError(null)

    // Select questions based on intensity
    const questions = selectQuestionsForSession(intensity)
    setSelectedQuestions(questions)
    setAnswers(new Array(questions.length).fill(''))
    setCurrentQuestionIndex(0)
    setStep('questions')
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = value
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // All questions answered, generate results
      generateResults()
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const generateResults = async () => {
    setStep('generating')
    setError(null)

    try {
      const supabase = getSupabase()

      // Build responses
      const responses: QuestionResponse[] = selectedQuestions.map((q, i) => ({
        questionId: q.id,
        questionText: q.text,
        element: q.element,
        answer: answers[i]
      }))

      // Calculate which FIRES elements were addressed
      const firesExtracted: Record<string, { present: boolean; strength: number }> = {}
      const elementAnswers: Record<string, string[]> = {}

      responses.forEach(r => {
        if (!elementAnswers[r.element]) elementAnswers[r.element] = []
        if (r.answer.trim()) elementAnswers[r.element].push(r.answer)
      })

      Object.entries(elementAnswers).forEach(([element, answerList]) => {
        if (answerList.length > 0) {
          // Simple strength calculation based on answer length
          const avgLength = answerList.reduce((sum, a) => sum + a.length, 0) / answerList.length
          const strength = Math.min(5, Math.max(1, Math.round(avgLength / 50) + 2))
          firesExtracted[element] = { present: true, strength }
        }
      })

      // Generate proof line from goal and top answer
      const topAnswer = answers.find(a => a.trim().length > 20) || answers[0] || ''
      const proofLine = `I ${goalInput.substring(0, 60).toLowerCase()}${goalInput.length > 60 ? '...' : ''} by ${topAnswer.substring(0, 60).toLowerCase()}${topAnswer.length > 60 ? '...' : ''}`

      // Calculate scores based on answer quality
      const totalLength = answers.reduce((sum, a) => sum + a.trim().length, 0)
      const avgLength = totalLength / answers.length
      const baseScore = Math.min(5, Math.max(1, Math.round(avgLength / 40) + 1))

      const scores = {
        confidence: Math.min(5, baseScore + (answers.filter(a => a.length > 50).length > 2 ? 1 : 0)),
        clarity: Math.min(5, baseScore + (answers.filter(a => a.length > 30).length > 1 ? 1 : 0)),
        ownership: Math.min(5, baseScore + (Object.keys(firesExtracted).length > 2 ? 1 : 0)),
      }

      // Determine signal based on scores
      const totalScore = scores.confidence + scores.clarity + scores.ownership
      const validationSignal: 'emerging' | 'developing' | 'grounded' =
        totalScore >= 12 ? 'grounded' : totalScore >= 8 ? 'developing' : 'emerging'

      // Generate pattern insights
      const pattern = {
        whatWorked: `You approached this by focusing on ${Object.keys(firesExtracted).map(e => FIRES_INFO[e as FiresElement].label.toLowerCase()).join(', ')}.`,
        whyItWorked: `Your responses show awareness of how your actions created the outcome.`,
        howToRepeat: `Continue building on these patterns: notice what works, own your contribution, and track your progress.`,
      }

      const validationInsight = totalScore >= 12
        ? 'Your reflection shows strong ownership and clarity. You understand how you made this happen.'
        : totalScore >= 8
          ? 'You\'re developing good awareness of your patterns. Keep building on this foundation.'
          : 'You\'re starting to surface your patterns. The more you reflect, the clearer they\'ll become.'

      // Save to database
      const { data: savedData, error: saveError } = await supabase
        .from('validations')
        .insert({
          client_email: userEmail,
          mode: 'self',
          goal_challenge: goalInput,
          timeframe: 'week',
          intensity,
          responses,
          validation_signal: validationSignal,
          validation_insight: validationInsight,
          proof_line: proofLine,
          fires_extracted: firesExtracted,
          scores,
          pattern,
          share_to_feed: shareToFeed,
          shared_at: shareToFeed ? new Date().toISOString() : null,
        })
        .select('id')
        .single()

      if (saveError) {
        throw new Error(`Failed to save: ${saveError.message}`)
      }

      if (savedData) {
        setValidationId(savedData.id)
      }

      setResult({
        validationSignal,
        validationInsight,
        proofLine,
        firesExtracted,
        scores,
        pattern,
      })

      setStep('results')
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('questions')
    }
  }

  const handleShareToggle = async (newValue: boolean) => {
    if (!validationId) return

    try {
      const supabase = getSupabase()
      await supabase
        .from('validations')
        .update({
          share_to_feed: newValue,
          shared_at: newValue ? new Date().toISOString() : null
        })
        .eq('id', validationId)

      setShareToFeed(newValue)
    } catch (err) {
      console.error('Failed to update share status:', err)
    }
  }

  const resetFlow = () => {
    setGoalInput('')
    setIntensity(null)
    setSelectedQuestions([])
    setAnswers([])
    setCurrentQuestionIndex(0)
    setResult(null)
    setValidationId(null)
    setShareToFeed(false)
    setError(null)
    setStep('home')
  }

  // HOME VIEW
  if (step === 'home') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-brand-primary">
              {isSendMode ? 'Witness Someone' : pageTitle}
            </h1>
            <button
              onClick={() => setStep('history')}
              className="text-sm text-brand-primary hover:underline"
            >
              View History
            </button>
          </div>

          <Card padding="lg" className="mb-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{isSendMode ? '👁' : '📝'}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isSendMode ? 'Witness Growth' : `Validate Your ${toolName}`}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {isSendMode
                  ? 'Help someone else see how they made something happen.'
                  : 'Own the actions that created your outcome — so you can repeat them.'}
              </p>
            </div>

            <button
              onClick={() => setStep('goal')}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              Start Reflection
            </button>
          </Card>

          <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
            <h3 className="font-medium text-brand-primary mb-2">Why This Matters</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              "I don't care how you did it, as long as it's done" destroys proof.
              If you can't articulate how you got there, you can't repeat it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // HISTORY VIEW
  if (step === 'history') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep('home')}
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
              <LoadingSpinner size="lg" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No proofs yet</p>
              <button
                onClick={() => setStep('goal')}
                className="mt-4 text-brand-primary hover:underline"
              >
                Build your first proof
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={entry.id} padding="md">
                  <p className="text-gray-900 font-medium mb-2">"{entry.proof_line}"</p>
                  {entry.validation_signal && (
                    <span
                      className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full mb-2"
                      style={{ backgroundColor: SIGNAL_INFO[entry.validation_signal as keyof typeof SIGNAL_INFO]?.color }}
                    >
                      {SIGNAL_INFO[entry.validation_signal as keyof typeof SIGNAL_INFO]?.label}
                    </span>
                  )}
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

  // GOAL STEP
  if (step === 'goal') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep('home')}
              className="flex items-center gap-1 text-gray-500 hover:text-brand-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Step 1 of 3</h1>
            <div className="w-14" />
          </div>

          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Describe what you accomplished
            </h2>
            <p className="text-gray-600 mb-6">
              Include when it happened (e.g., "this week", "yesterday").
            </p>

            <Textarea
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g., I closed a major deal this week, I led that difficult meeting yesterday..."
              rows={4}
              showCharCount
              maxLength={500}
            />

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('home')}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGoalSubmit}
                disabled={goalInput.trim().length < 20}
                className={`flex-1 py-3 px-4 font-medium rounded-lg ${
                  goalInput.trim().length >= 20
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // DEPTH STEP
  if (step === 'depth') {
    const intensityOptions = [
      { value: 'light' as Intensity, label: 'Light', description: '3 questions · Quick and easy', questions: 3 },
      { value: 'balanced' as Intensity, label: 'Balanced', description: '4 questions · Thoughtful depth', questions: 4 },
      { value: 'deeper' as Intensity, label: 'Deeper', description: '5 questions · More vulnerable', questions: 5 },
    ]

    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep('goal')}
              className="flex items-center gap-1 text-gray-500 hover:text-brand-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Step 2 of 3</h1>
            <div className="w-14" />
          </div>

          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              How deep do you want to go?
            </h2>

            <div className="space-y-3 mb-6">
              {intensityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntensity(opt.value)}
                  className={`w-full py-4 px-4 rounded-lg border-2 text-left transition-all ${
                    intensity === opt.value
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.description}</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('goal')}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleDepthSubmit}
                disabled={!intensity}
                className={`flex-1 py-3 px-4 font-medium rounded-lg ${
                  intensity
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Questions
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // QUESTIONS STEP
  if (step === 'questions' && currentQuestion) {
    const elementInfo = FIRES_INFO[currentQuestion.element]

    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={currentQuestionIndex > 0 ? handlePrevQuestion : () => setStep('depth')}
              className="flex items-center gap-1 text-gray-500 hover:text-brand-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Question {currentQuestionIndex + 1} of {selectedQuestions.length}
            </h1>
            <div className="w-14" />
          </div>

          <Card padding="lg">
            {/* FIRES element badge */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: elementInfo.color }}
              />
              <span className="text-sm font-medium" style={{ color: elementInfo.color }}>
                {elementInfo.label}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.text}
            </h2>

            <Textarea
              value={answers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Take your time to reflect..."
              rows={5}
              showCharCount
              maxLength={500}
            />

            {/* Progress bar */}
            <div className="mt-6 mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={currentQuestionIndex > 0 ? handlePrevQuestion : () => setStep('depth')}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestionIndex]?.trim()}
                className={`flex-1 py-3 px-4 font-medium rounded-lg ${
                  answers[currentQuestionIndex]?.trim()
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex === selectedQuestions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // GENERATING STEP
  if (step === 'generating') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <Card padding="lg" className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Analyzing your reflection...
            </h2>
            <p className="text-gray-600 mt-2">
              Finding patterns in your success
            </p>
          </Card>
        </div>
      </div>
    )
  }

  // RESULTS STEP
  if (step === 'results' && result) {
    const signalData = SIGNAL_INFO[result.validationSignal]
    const totalScore = result.scores.confidence + result.scores.clarity + result.scores.ownership

    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Signal Badge */}
          <Card padding="lg">
            <div className="text-center">
              <span
                className="inline-block px-4 py-2 text-lg font-medium text-white rounded-full mb-3"
                style={{ backgroundColor: signalData.color }}
              >
                {signalData.label}
              </span>
              <p className="text-gray-600">{signalData.description}</p>
            </div>
          </Card>

          {/* Scores */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Scores</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-brand-primary">{result.scores.confidence}/5</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-primary">{result.scores.clarity}/5</div>
                <div className="text-xs text-gray-500">Clarity</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-primary">{result.scores.ownership}/5</div>
                <div className="text-xs text-gray-500">Ownership</div>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-gray-200">
              <div className="text-xl font-bold text-brand-primary">{totalScore}/15</div>
              <div className="text-xs text-gray-500">Total Score</div>
            </div>
          </Card>

          {/* FIRES Elements */}
          {result.firesExtracted && Object.keys(result.firesExtracted).length > 0 && (
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">FIRES Elements Detected</h3>
              <div className="space-y-3">
                {Object.entries(result.firesExtracted).map(([key, value]) => {
                  if (value.present) {
                    const elementInfo = FIRES_INFO[key as FiresElement]
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: elementInfo.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 flex-1">{elementInfo.label}</span>
                        <span className="text-sm font-semibold text-brand-primary">
                          {value.strength}/5
                        </span>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </Card>
          )}

          {/* Insight */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Insight</h3>
            <p className="text-gray-700 italic">"{result.validationInsight}"</p>
          </Card>

          {/* Proof Line */}
          {result.proofLine && (
            <Card padding="lg" className="border-2 border-brand-primary bg-brand-primary/5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Your Proof Line</h3>
              <p className="text-lg font-semibold text-gray-900">{result.proofLine}</p>
            </Card>
          )}

          {/* Pattern */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">The Pattern</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">What Worked</h4>
                <p className="text-gray-700">{result.pattern.whatWorked}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Why It Worked</h4>
                <p className="text-gray-700">{result.pattern.whyItWorked}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">How to Repeat</h4>
                <p className="text-gray-700">{result.pattern.howToRepeat}</p>
              </div>
            </div>
          </Card>

          {/* Share Toggle */}
          {validationId && (
            <Card padding="lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <Toggle checked={shareToFeed} onChange={handleShareToggle} />
                <div>
                  <span className="text-sm font-medium text-gray-700">Share to Campfire</span>
                  <p className="text-xs text-gray-500 mt-0.5">Your connections can learn from your process.</p>
                </div>
              </label>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => {
                setGoalInput('')
                setIntensity(null)
                setSelectedQuestions([])
                setAnswers([])
                setResult(null)
                setStep('goal')
              }}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-lg transition-colors"
            >
              Validate Another {toolName}
            </button>
            <button
              onClick={resetFlow}
              className="w-full py-3 px-6 bg-white text-brand-primary font-semibold rounded-lg border-2 border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
