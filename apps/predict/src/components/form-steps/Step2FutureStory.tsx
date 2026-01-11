import { type PredictionFormData, type FutureStory } from '../../types'
import { FIRES_COLORS } from '@finding-good/shared'

interface Step2FutureStoryProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

interface QuestionConfig {
  key: keyof FutureStory
  element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths' | null
  label: string
  placeholder: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'fs1_goal',
    element: null,
    label: 'Describe your goal as if you\'ve already achieved it',
    placeholder: 'I have successfully...',
  },
  {
    key: 'fs2_feelings',
    element: 'feelings',
    label: 'When you imagine succeeding, how do you want to feel?',
    placeholder: 'I want to feel...',
  },
  {
    key: 'fs3_influence',
    element: 'influence',
    label: 'What\'s the most important action you\'ll need to take?',
    placeholder: 'The most important action is...',
  },
  {
    key: 'fs4_resilience',
    element: 'resilience',
    label: 'What challenges might you face, and how will you overcome them?',
    placeholder: 'I might face... and I will overcome by...',
  },
  {
    key: 'fs5_ethics',
    element: 'ethics',
    label: 'What values will guide your decisions along the way?',
    placeholder: 'The values that will guide me are...',
  },
  {
    key: 'fs6_strengths',
    element: 'strengths',
    label: 'What personal strengths will you rely on most?',
    placeholder: 'The strengths I\'ll rely on are...',
  },
]

export function Step2FutureStory({ data, onChange }: Step2FutureStoryProps) {
  const updateStory = (key: keyof FutureStory, value: string) => {
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
      <p className="text-sm text-gray-600">
        Imagine you've already achieved your goal. Answer these questions from that future perspective.
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
            value={q.key === 'fs1_goal' ? goalValue : data.future_story[q.key]}
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
