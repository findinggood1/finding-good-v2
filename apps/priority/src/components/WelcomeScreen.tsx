import { useState } from 'react'

interface WelcomeScreenProps {
  onComplete: () => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState(0)

  const steps = [
    // Step 0: What is Priority
    {
      title: 'Build Your Evidence',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong className="text-brand-primary">Priority Builder</strong> is a 2-minute daily practice that helps you notice what matters and build proof of how you show up.
          </p>
          <p className="text-gray-600">
            Most people forget 90% of their small wins. This tool captures them so you can see your patterns over time.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-500 italic">
              "The days compound. Small proof becomes big confidence."
            </p>
          </div>
        </div>
      ),
    },
    // Step 1: What you'll do
    {
      title: 'Four Questions',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">Each day, you answer four simple questions:</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">What mattered most?</p>
                <p className="text-sm text-gray-600">Name your focus for today</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">What went well?</p>
                <p className="text-sm text-gray-600">Something that worked out, big or small</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900">What was your part?</p>
                <p className="text-sm text-gray-600">What you did, decided, or contributed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
              <div>
                <p className="font-medium text-gray-900">What impact did it have?</p>
                <p className="text-sm text-gray-600">How it affected you, others, or the situation</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Step 2: What you'll get
    {
      title: 'What You\'ll Get',
      content: (
        <div className="space-y-4">
          <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
            <p className="text-sm font-medium text-brand-primary mb-2">Your Proof Line</p>
            <p className="text-gray-700 italic">
              "I showed up fully today, even when it was hard, and it made a real difference."
            </p>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">A <strong>pattern</strong> naming what you naturally do</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700"><strong>Elements</strong> present in your story (FIRES)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">An <strong>insight</strong> reflecting what you showed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Your words <strong>reflected back</strong> to you</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Studies show we remember self-generated content better than advice we receive. You create the raw material — we mirror it back.
          </p>
        </div>
      ),
    },
    // Step 3: Why it works
    {
      title: 'Why It Works',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Daily reflection isn't just journaling — it's building a library of evidence you can draw on when you need confidence most.
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">Self-Efficacy</p>
              <p className="text-xs text-blue-700">Your belief you can succeed grows from remembering times you have</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-900">Pattern Recognition</p>
              <p className="text-xs text-purple-700">Repeated entries reveal your natural approach to challenges</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm font-medium text-green-900">The Generation Effect</p>
              <p className="text-xs text-green-700">Writing it yourself makes it stick better than reading advice</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-4 italic">
            Two minutes a day. Over time, proof compounds.
          </p>
        </div>
      ),
    },
    // Step 4: How it connects
    {
      title: 'Part of a System',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Priority Builder feeds into the Finding Good ecosystem — daily proof becomes weekly patterns, which become predictable outcomes.
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="bg-white border-2 border-brand-primary rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Priority Builder</p>
              <p className="text-sm text-gray-600 mt-1">Daily — capture what mattered and your role in it</p>
            </div>
            <div className="flex justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Prove Tool</p>
              <p className="text-sm text-gray-600 mt-1">Weekly — build transferable evidence of how you do things</p>
            </div>
            <div className="flex justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Predict Tool</p>
              <p className="text-sm text-gray-600 mt-1">Goals — see how clearly you can predict your outcomes</p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Priority Builder</span>
          </div>
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-brand-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{currentStep.title}</h1>
        {currentStep.content}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (isLastStep) {
                onComplete()
              } else {
                setStep(step + 1)
              }
            }}
            className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
          >
            {isLastStep ? 'Start Your First Check-in' : 'Continue'}
          </button>
        </div>
      </footer>
    </div>
  )
}
