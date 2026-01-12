import { type PredictionFormData, type PredictionType } from '../../types'

interface Step1BasicInfoProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

const TYPE_OPTIONS: { value: PredictionType; label: string; description: string }[] = [
  { value: 'goal', label: 'Goal', description: 'Something you want to achieve' },
  { value: 'challenge', label: 'Challenge', description: 'An obstacle to overcome' },
  { value: 'experience', label: 'Experience', description: 'Something you want to try' },
]

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Educational intro */}
      <div className="bg-brand-primary/5 rounded-lg p-4 border border-brand-primary/10">
        <p className="text-sm text-gray-700">
          <span className="font-medium text-brand-primary">Predict</span> helps you see how ready you are to achieve something that matters. In about 10 minutes, you'll connect your future vision to past evidence — and get a clear picture of your path forward.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          What goal, challenge, or experience are you focused on? <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Launch my own business"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What type is this?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ type: option.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                data.type === option.value
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`font-medium ${data.type === option.value ? 'text-brand-primary' : 'text-gray-900'}`}>
                {option.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Add more details (optional)
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What's the context? Why does this matter now?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
        />
      </div>
    </div>
  )
}
