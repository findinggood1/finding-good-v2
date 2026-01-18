import { Card } from '../ui'
import type { TrajectoryPoint } from '../../hooks/useTrajectory'

interface TrajectoryChartProps {
  trajectory: TrajectoryPoint[]
}

export function TrajectoryChart({ trajectory }: TrajectoryChartProps) {
  if (trajectory.length < 2) {
    return (
      <Card>
        <div className="text-sm font-medium text-gray-600 mb-4">WHEN YOU STARTED → NOW</div>
        <div className="text-sm text-gray-500 text-center py-4">
          Take more snapshots to see your journey
        </div>
      </Card>
    )
  }

  const first = trajectory[0]
  const last = trajectory[trajectory.length - 1]
  const change = last.predictability - first.predictability

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-4">WHEN YOU STARTED → NOW</div>

      {/* Main score trajectory */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Predictability</span>
          <span className="font-medium">
            {first.predictability} → {last.predictability}{' '}
            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
              ({change >= 0 ? '+' : ''}{change})
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Start</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full relative">
            <div
              className="absolute left-0 top-0 h-full bg-gray-300 rounded-full"
              style={{ width: `${first.predictability}%` }}
            />
            <div
              className="absolute left-0 top-0 h-full bg-teal-600 rounded-full"
              style={{ width: `${last.predictability}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">Now</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Clarity</span>
          <span>
            {first.clarity} → {last.clarity}{' '}
            <span className={last.clarity - first.clarity >= 0 ? 'text-green-600' : 'text-red-600'}>
              ({last.clarity - first.clarity >= 0 ? '+' : ''}{last.clarity - first.clarity})
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Confidence</span>
          <span>
            {first.confidence} → {last.confidence}{' '}
            <span className={last.confidence - first.confidence >= 0 ? 'text-green-600' : 'text-red-600'}>
              ({last.confidence - first.confidence >= 0 ? '+' : ''}{last.confidence - first.confidence})
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Connection</span>
          <span>
            {first.connection} → {last.connection}{' '}
            <span className={last.connection - first.connection >= 0 ? 'text-green-600' : 'text-red-600'}>
              ({last.connection - first.connection >= 0 ? '+' : ''}{last.connection - first.connection})
            </span>
          </span>
        </div>
      </div>
    </Card>
  )
}
