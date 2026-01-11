import { STEP_TITLES, TOTAL_STEPS } from '../types'

interface ProgressIndicatorProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-1 bg-gray-200 rounded-full">
          <div
            className="h-1 bg-brand-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep
            const isCurrent = step === currentStep
            const isClickable = onStepClick && step < currentStep

            return (
              <button
                key={step}
                type="button"
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-brand-primary text-white cursor-pointer hover:bg-brand-primary/80'
                    : isCurrent
                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                    : 'bg-gray-200 text-gray-500'
                } ${!isClickable ? 'cursor-default' : ''}`}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Current step title */}
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-500">Step {currentStep} of {TOTAL_STEPS}</span>
        <h2 className="text-lg font-semibold text-gray-900 mt-1">
          {STEP_TITLES[currentStep - 1]}
        </h2>
      </div>
    </div>
  )
}
