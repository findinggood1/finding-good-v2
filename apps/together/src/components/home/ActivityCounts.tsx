import { Card } from '../ui'
import type { ActivityCounts as ActivityCountsType } from '../../hooks/useActivityCounts'

interface ActivityCountsProps {
  counts: ActivityCountsType
  scope: 'week' | 'all'
}

export function ActivityCounts({ counts, scope }: ActivityCountsProps) {
  const title = scope === 'week' ? 'YOUR ACTIVITY' : 'YOUR ACTIVITY (ALL TIME)'

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">{title}</div>
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold text-lg text-gray-800">{counts.priorities}</div>
          <div className="text-gray-500">Priorities</div>
        </div>
        <div>
          <div className="font-semibold text-lg text-gray-800">{counts.proofs}</div>
          <div className="text-gray-500">Proofs</div>
        </div>
        <div>
          <div className="font-semibold text-lg text-gray-800">{counts.sent}</div>
          <div className="text-gray-500">Sent</div>
        </div>
        <div>
          <div className="font-semibold text-lg text-gray-800">{counts.received}</div>
          <div className="text-gray-500">Received</div>
        </div>
        <div>
          <div className={`font-semibold text-lg ${counts.pending > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
            {counts.pending}
          </div>
          <div className="text-gray-500">Pending</div>
        </div>
      </div>
    </Card>
  )
}
