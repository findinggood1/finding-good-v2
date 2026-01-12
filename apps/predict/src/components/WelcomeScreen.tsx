import { useState } from 'react'

interface WelcomeScreenProps {
  onComplete: () => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState(0)

  const steps = [
    // Step 0: What is Predict
    {
      title: 'See Where You\'re Going',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong className="text-brand-primary">Predict</strong> is a 10-minute reflection that helps you understand how ready you are to achieve something that matters.
          </p>
          <p className="text-gray-600">
            Most tools ask you to set goals. This one helps you see whether you can actually get there — by connecting your future vision to evidence from your past.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-500 italic">
              "Prediction isn't fortune-telling. It's clarity plus confidence."
            </p>
          </div>
        </div>
      ),
    },
    // Step 1: What you'll do
    {
      title: 'What You\'ll Do',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">Future Story</p>
                <p className="text-sm text-gray-600">Describe what success looks like as if it's already happened</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">Past Story</p>
                <p className="text-sm text-gray-600">Connect it to a time you've done something similar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900">Your Network</p>
                <p className="text-sm text-gray-600">Name the people who will be part of this journey</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Along the way, you'll rate your confidence and alignment — how sure you are about your vision and how connected it is to your past.
          </p>
        </div>
      ),
    },
    // Step 2: What you'll get
    {
      title: 'What You\'ll Get',
      content: (
        <div className="space-y-4">
          <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
            <div className="text-center mb-3">
              <span className="text-4xl font-bold text-brand-primary">85%</span>
              <p className="text-sm text-gray-600">Predictability Score</p>
            </div>
            <p className="text-xs text-gray-500 text-center">
              How clearly you can see your path forward
            </p>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Your <strong>pattern</strong> — what you naturally do well</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Your <strong>edge</strong> — where building proof increases influence</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">A <strong>question</strong> to carry with you</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Insights <strong>in your own words</strong></span>
            </div>
          </div>
        </div>
      ),
    },
    // Step 3: Why it works
    {
      title: 'Why It Works',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Predict Tool is built on research showing that connecting your future vision to past evidence changes how you pursue goals — and whether you achieve them.
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">Mental Contrasting</p>
              <p className="text-xs text-blue-700">Imagining success AND connecting to reality increases follow-through 2-3x</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-900">Self-Efficacy</p>
              <p className="text-xs text-purple-700">Your belief you can succeed comes from remembering times you have</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm font-medium text-green-900">Social Accountability</p>
              <p className="text-xs text-green-700">Goals shared with others are significantly more likely to be achieved</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 italic">
            The act of completing this changes your relationship to your goal.
          </p>
        </div>
      ),
    },
    // Step 4: Philosophy
    {
      title: 'The Finding Good Philosophy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Most leaders unknowingly lose trust not because of what they're doing, but because of the questions they aren't asking.
          </p>
          
          <div className="border-l-4 border-brand-primary pl-4 my-4">
            <p className="text-gray-900 font-medium">Narrative Integrity</p>
            <p className="text-sm text-gray-600 mt-1">
              The alignment between what you believe, what you say, and what you do.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
              <span className="text-sm text-gray-700"><strong>Clarity</strong> — Can you articulate what matters?</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
              <span className="text-sm text-gray-700"><strong>Confidence</strong> — Do you have proof you can do this?</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
              <span className="text-sm text-gray-700"><strong>Alignment</strong> — Does your past map to your future?</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            When these align, you don't just set goals. You see where you're going — together.
          </p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Predict</span>
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
            {isLastStep ? 'Start Your First Prediction' : 'Continue'}
          </button>
        </div>
      </footer>
    </div>
  )
}
