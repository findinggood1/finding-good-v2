import { Link } from 'react-router-dom'
import { type Prediction, type FiresElement, FIRES_COLORS } from '@finding-good/shared'

interface PredictionCardProps {
  prediction: Prediction
}

const FIRES_ORDER: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']

export function PredictionCard({ prediction }: PredictionCardProps) {
  const hasScores = prediction.scores && Object.keys(prediction.scores).length > 0

  const presentElements = hasScores
    ? FIRES_ORDER.filter((el) => prediction.scores[el]?.present)
    : []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Link
      to={`/${prediction.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-brand-primary/20 transition-all"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{prediction.title}</h3>
          {prediction.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{prediction.description}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDate(prediction.updated_at)}
        </span>
      </div>

      {presentElements.length > 0 && (
        <div className="flex gap-1.5 mt-3">
          {presentElements.map((element) => (
            <div
              key={element}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: FIRES_COLORS[element] }}
              title={element.charAt(0).toUpperCase() + element.slice(1)}
            >
              {element.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {prediction.status !== 'active' && (
        <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {prediction.status}
        </span>
      )}
    </Link>
  )
}
