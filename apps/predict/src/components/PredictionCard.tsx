import { Link } from 'react-router-dom'
import { type Prediction, type FiresElement, FIRES_COLORS } from '@finding-good/shared'

interface PredictionCardProps {
  prediction: Prediction
  onDelete?: (id: string) => void
}

const FIRES_ORDER: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']

export function PredictionCard({ prediction, onDelete }: PredictionCardProps) {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(prediction.id)
    }
  }

  return (
    <Link
      to={`/${prediction.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-brand-primary/20 transition-all group"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{prediction.title}</h3>
          {prediction.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{prediction.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(prediction.updated_at)}
          </span>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete prediction"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
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
