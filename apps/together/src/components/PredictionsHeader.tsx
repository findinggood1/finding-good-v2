import { Link } from 'react-router-dom'
import type { Prediction } from '@finding-good/shared'

interface PredictionsHeaderProps {
  predictions: Prediction[]
  maxDisplay?: number
  title?: string
}

function calculatePredictabilityScore(prediction: Prediction): number {
  return (prediction as any).current_predictability_score || 0
}

export function PredictionsHeader({ predictions, maxDisplay = 3, title = 'WHAT YOU\'RE CREATING' }: PredictionsHeaderProps) {
  const activePredictions = predictions
    .filter(p => p.status === 'active')
    .slice(0, maxDisplay)

  const showAddCard = activePredictions.length < maxDisplay

  if (activePredictions.length === 0 && !showAddCard) {
    return null
  }

  return (
    <div className="px-4 py-3">
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {activePredictions.map((prediction) => (
          <Link
            key={prediction.id}
            to={`/inspire/self`}
            className="flex-shrink-0 w-32 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
              {prediction.title}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-lg font-bold text-brand-primary">
                {calculatePredictabilityScore(prediction)}
              </span>
              <span className="text-xs text-gray-500">score</span>
            </div>
          </Link>
        ))}

        {showAddCard && (
          <Link
            to="/inspire/self"
            className="flex-shrink-0 w-32 bg-brand-primary/5 rounded-xl p-3 hover:bg-brand-primary/10 transition-colors flex flex-col items-center justify-center min-h-[5.5rem] border-2 border-dashed border-brand-primary/30"
          >
            <svg className="w-6 h-6 text-brand-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-brand-primary/60 mt-1 font-medium">Add</span>
          </Link>
        )}
      </div>
    </div>
  )
}
