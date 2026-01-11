import { type PredictionFormData, type PastStory } from '../../types'
import { FIRES_COLORS } from '@finding-good/shared'

interface Step4PastStoryProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

interface QuestionConfig {
  key: keyof PastStory
  element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths' | null
  label: string
  placeholder: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'ps1_success',
    element: null,
    label: 'Describe a past success related to this goal',
    placeholder: 'A time when I succeeded at something similar was...',
  },
  {
    key: 'ps2_feelings',
    element: 'feelings',
    label: 'How did you feel when you achieved that success?',
    placeholder: 'I felt...',
  },
  {
    key: 'ps3_influence',
    element: 'influence',
    label: 'What was the most important action you took?',
    placeholder: 'The most important action I took was...',
  },
  {
    key: 'ps4_resilience',
    element: 'resilience',
    label: 'What obstacles did you overcome?',
    placeholder: 'I overcame...',
  },
  {
    key: 'ps5_ethics',
    element: 'ethics',
    label: 'What values guided you?',
    placeholder: 'The values that guided me were...',
  },
  {
    key: 'ps6_strengths',
    element: 'strengths',
    label: 'What strengths did you use?',
    placeholder: 'The strengths I used were...',
  },
]

export function Step4PastStory({ data, onChange }: Step4PastStoryProps) {
  const updateStory = (key: keyof PastStory, value: string) => {
    onChange({
      past_story: {
        ...data.past_story,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Reflect on a past experience where you achieved something similar. This helps identify patterns of success.
      </p>

      {QUESTIONS.map((q, index) => (
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
            value={data.past_story[q.key]}
            onChange={(e) => updateStory(q.key, e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
          />
        </div>
      ))}
    </div>
  )
}
