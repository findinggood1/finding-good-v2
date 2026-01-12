import { type PredictionFormData, type PastStory } from '../../types'
import { FIRES_COLORS } from '@finding-good/shared'

interface Step4PastStoryProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

interface QuestionConfig {
  key: keyof PastStory
  alignmentKey: keyof PastStory
  element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths' | null
  label: string
  placeholder: string
  alignmentLabel: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'ps1_success',
    alignmentKey: 'ps1_alignment',
    element: null,
    label: 'Describe a past success related to this goal',
    placeholder: 'A time when I succeeded at something similar was...',
    alignmentLabel: 'How aligned is this experience with your current goal?',
  },
  {
    key: 'ps2_feelings',
    alignmentKey: 'ps2_alignment',
    element: 'feelings',
    label: 'How did you feel when you achieved that success?',
    placeholder: 'I felt...',
    alignmentLabel: 'How aligned is this feeling with what you\'re aiming for now?',
  },
  {
    key: 'ps3_influence',
    alignmentKey: 'ps3_alignment',
    element: 'influence',
    label: 'What was the most important action you took?',
    placeholder: 'The most important action I took was...',
    alignmentLabel: 'How aligned is this action with what you need to do now?',
  },
  {
    key: 'ps4_resilience',
    alignmentKey: 'ps4_alignment',
    element: 'resilience',
    label: 'What obstacles did you overcome?',
    placeholder: 'I overcame...',
    alignmentLabel: 'How aligned is this experience with challenges you\'ll face?',
  },
  {
    key: 'ps5_ethics',
    alignmentKey: 'ps5_alignment',
    element: 'ethics',
    label: 'What values guided you?',
    placeholder: 'The values that guided me were...',
    alignmentLabel: 'How aligned are these values with your current goal?',
  },
  {
    key: 'ps6_strengths',
    alignmentKey: 'ps6_alignment',
    element: 'strengths',
    label: 'What strengths did you use?',
    placeholder: 'The strengths I used were...',
    alignmentLabel: 'How aligned are these strengths with what you\'ll need now?',
  },
]

const ALIGNMENT_OPTIONS = [
  { value: 1, label: '1', description: 'Different' },
  { value: 2, label: '2', description: 'Related' },
  { value: 3, label: '3', description: 'Similar' },
  { value: 4, label: '4', description: 'Direct' },
]

interface AlignmentRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
}

function AlignmentRating({ value, onChange, label }: AlignmentRatingProps) {
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex gap-2">
        {ALIGNMENT_OPTIONS.map((option) => (
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
        <span className="text-xs text-gray-400">Different</span>
        <span className="text-xs text-gray-400">Direct</span>
      </div>
    </div>
  )
}

export function Step4PastStory({ data, onChange }: Step4PastStoryProps) {
  const updateStory = (key: keyof PastStory, value: string | number) => {
    onChange({
      past_story: {
        ...data.past_story,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Educational intro */}
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <p className="text-sm font-medium text-purple-900 mb-1">Past Story</p>
        <p className="text-sm text-purple-800">
          Now connect your future to something you've already done. Your belief that you can succeed comes primarily from remembering similar wins. This isn't just reflection — it's building your own evidence.
        </p>
        <p className="text-xs text-purple-600 mt-2">
          After each answer, rate how aligned this past experience is with your current goal.
        </p>
      </div>

      {QUESTIONS.map((q, index) => {
        const textValue = data.past_story[q.key] as string
        const alignmentValue = data.past_story[q.alignmentKey] as number
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
            
            {/* Show alignment rating only after they've written something */}
            {hasText && (
              <AlignmentRating
                value={alignmentValue}
                onChange={(val) => updateStory(q.alignmentKey, val)}
                label={q.alignmentLabel}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
