import { type PredictionFormData, type FutureStory } from '../../types'
import { FIRES_COLORS } from '@finding-good/shared'

interface Step2FutureStoryProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

interface QuestionConfig {
  key: keyof FutureStory
  confidenceKey: keyof FutureStory
  element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths' | null
  label: string
  placeholder: string
  confidenceLabel: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'fs1_goal',
    confidenceKey: 'fs1_confidence',
    element: null,
    label: 'Describe your goal as if you\'ve already achieved it',
    placeholder: 'I have successfully...',
    confidenceLabel: 'How confident are you in this vision?',
  },
  {
    key: 'fs2_feelings',
    confidenceKey: 'fs2_confidence',
    element: 'feelings',
    label: 'When you imagine succeeding, how do you want to feel?',
    placeholder: 'I want to feel...',
    confidenceLabel: 'How confident are you this is the right feeling to aim for?',
  },
  {
    key: 'fs3_influence',
    confidenceKey: 'fs3_confidence',
    element: 'influence',
    label: 'What\'s the most important action you\'ll need to take?',
    placeholder: 'The most important action is...',
    confidenceLabel: 'How confident are you this is the right action?',
  },
  {
    key: 'fs4_resilience',
    confidenceKey: 'fs4_confidence',
    element: 'resilience',
    label: 'What challenges might you face, and how will you overcome them?',
    placeholder: 'I might face... and I will overcome by...',
    confidenceLabel: 'How confident are you in your ability to overcome these?',
  },
  {
    key: 'fs5_ethics',
    confidenceKey: 'fs5_confidence',
    element: 'ethics',
    label: 'What values will guide your decisions along the way?',
    placeholder: 'The values that will guide me are...',
    confidenceLabel: 'How confident are you these are the right values to prioritize?',
  },
  {
    key: 'fs6_strengths',
    confidenceKey: 'fs6_confidence',
    element: 'strengths',
    label: 'What personal strengths will you rely on most?',
    placeholder: 'The strengths I\'ll rely on are...',
    confidenceLabel: 'How confident are you these strengths will serve you?',
  },
]

const CONFIDENCE_OPTIONS = [
  { value: 1, label: '1', description: 'Exploring' },
  { value: 2, label: '2', description: 'Considering' },
  { value: 3, label: '3', description: 'Confident' },
  { value: 4, label: '4', description: 'Certain' },
]

interface ConfidenceRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
}

function ConfidenceRating({ value, onChange, label }: ConfidenceRatingProps) {
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex gap-2">
        {CONFIDENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              value === option.value
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-primary/50'
            }`}
            title={option.description}
          >
            {option.value}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">Exploring</span>
        <span className="text-xs text-gray-400">Certain</span>
      </div>
    </div>
  )
}

export function Step2FutureStory({ data, onChange }: Step2FutureStoryProps) {
  const updateStory = (key: keyof FutureStory, value: string | number) => {
    onChange({
      future_story: {
        ...data.future_story,
        [key]: value,
      },
    })
  }

  // Pre-fill goal from title if empty
  const goalValue = data.future_story.fs1_goal || data.title

  return (
    <div className="space-y-6">
      {/* Educational intro */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <p className="text-sm font-medium text-blue-900 mb-1">Future Story</p>
        <p className="text-sm text-blue-800">
          Describe success as if it's already happened. Research shows that vividly imagining your outcome — then connecting it to reality — increases follow-through significantly.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          After each answer, rate your confidence. This helps reveal where you're clear vs. still exploring.
        </p>
      </div>

      {QUESTIONS.map((q, index) => {
        const textValue = q.key === 'fs1_goal' ? goalValue : (data.future_story[q.key] as string)
        const confidenceValue = data.future_story[q.confidenceKey] as number
        const hasText = textValue.trim().length > 0

        return (
          <div key={q.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                {q.element && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: FIRES_COLORS[q.element] }}
                  >
                    {q.element.charAt(0).toUpperCase()}
                  </span>
                )}
                {index + 1}. {q.label}
              </span>
            </label>
            <textarea
              value={textValue}
              onChange={(e) => updateStory(q.key, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
            />
            
            {/* Show confidence rating only after they've written something */}
            {hasText && (
              <ConfidenceRating
                value={confidenceValue}
                onChange={(val) => updateStory(q.confidenceKey, val)}
                label={q.confidenceLabel}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
