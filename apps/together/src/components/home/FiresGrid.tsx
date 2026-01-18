import { Card } from '../ui'
import type { ZoneBreakdown } from '@finding-good/shared'

interface FiresGridProps {
  zoneBreakdown: ZoneBreakdown | null
  growthEdge: string | null // FIRES element that is growth edge
}

export function FiresGrid({ zoneBreakdown }: FiresGridProps) {
  // Stub - will be implemented in IMPLEMENT phase
  if (!zoneBreakdown) {
    return (
      <Card>
        <div className="text-sm font-medium text-gray-600 mb-3">YOUR FIRES</div>
        <div className="text-sm text-gray-500 text-center py-4">
          Complete an assessment to see your FIRES
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-600">YOUR FIRES</div>
        <span className="text-xs text-gray-400">tap for details →</span>
      </div>
      <div className="grid grid-cols-5 gap-2 text-center">
        {/* Grid items will be rendered here in IMPLEMENT */}
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    </Card>
  )
}
