import { Card, ProgressBar } from '../ui'

interface PredictabilityCardProps {
  score: number | null
  trend: number | null
  clarity: number | null
  confidence: number | null
  connection: number | null
}

export function PredictabilityCard({
  score,
  trend,
  clarity,
  confidence,
  connection,
}: PredictabilityCardProps) {
  // Stub - will be implemented in IMPLEMENT phase
  if (score === null) {
    return (
      <Card>
        <div className="text-sm text-gray-500 text-center py-4">
          Take a snapshot to see your score
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">PREDICTABILITY</div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-teal-700">{score}</span>
          {trend !== null && (
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}
            </span>
          )}
        </div>
      </div>
      <ProgressBar value={score} />
      <div className="flex justify-between mt-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-800">{clarity ?? '—'}</div>
          <div className="text-gray-500">Clarity</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-800">{confidence ?? '—'}</div>
          <div className="text-gray-500">Confidence</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-800">{connection ?? '—'}</div>
          <div className="text-gray-500">Connection</div>
        </div>
      </div>
    </Card>
  )
}
