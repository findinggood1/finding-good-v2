import { type PredictionFormData, type AlignmentAssessment } from '../../types'

interface Step6AlignmentProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

interface QuestionConfig {
  key: keyof AlignmentAssessment
  label: string
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'q1_clarity',
    label: 'How similar is this goal to what you\'ve done before?',
  },
  {
    key: 'q2_motivation',
    label: 'How much does your past success make you confident about this goal?',
  },
  {
    key: 'q3_confidence',
    label: 'How clear are you on the specific actions needed?',
  },
  {
    key: 'q4_support',
    label: 'How aligned is this goal with your core values?',
  },
  {
    key: 'q5_obstacles',
    label: 'How prepared do you feel to handle obstacles?',
  },
  {
    key: 'q6_commitment',
    label: 'How connected do you feel to people who can help?',
  },
]

const RATING_LABELS = ['', 'Not at all', 'Somewhat', 'Mostly', 'Very']

export function Step6Alignment({ data, onChange }: Step6AlignmentProps) {
  const updateRating = (key: keyof AlignmentAssessment, value: number) => {
    onChange({
      alignment: {
        ...data.alignment,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Rate how your past experience connects to this future goal. This helps assess your alignment and readiness.
      </p>

      {QUESTIONS.map((q, index) => (
        <div key={q.key} className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {index + 1}. {q.label}
          </label>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => updateRating(q.key, rating)}
                className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all text-center ${
                  data.alignment[q.key] === rating
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-bold">{rating}</div>
                <div className="text-xs mt-1">{RATING_LABELS[rating]}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
