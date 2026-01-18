import { Card, FiresBadge, FIRES_COLORS } from '../ui'
import type { ZoneBreakdown, FiresElement, Zone } from '@finding-good/shared'

interface FiresGridProps {
  zoneBreakdown: ZoneBreakdown | null
  growthEdge: string | null // FIRES element that is growth edge
}

// Map zone to progress level (1-4)
const ZONE_LEVELS: Record<Zone, number> = {
  Exploring: 1,
  Discovering: 2,
  Performing: 3,
  Owning: 4,
}

// Map element name to badge letter
const ELEMENT_TO_BADGE: Record<FiresElement, 'F' | 'I' | 'R' | 'E' | 'S'> = {
  feelings: 'F',
  influence: 'I',
  resilience: 'R',
  ethics: 'E',
  strengths: 'S',
}

const ELEMENTS: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']

export function FiresGrid({ zoneBreakdown, growthEdge }: FiresGridProps) {
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
      <div className="grid grid-cols-5 gap-3">
        {ELEMENTS.map(element => {
          const zone = zoneBreakdown[element]
          const level = ZONE_LEVELS[zone]
          const isGrowthEdge = growthEdge === element
          const badgeLetter = ELEMENT_TO_BADGE[element]
          const color = FIRES_COLORS[badgeLetter]

          return (
            <div key={element} className="flex flex-col items-center">
              <div className={`relative ${isGrowthEdge ? 'ring-2 ring-amber-400 ring-offset-2 rounded-full' : ''}`}>
                <FiresBadge element={badgeLetter} size="lg" />
                {isGrowthEdge && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" title="Growth Edge" />
                )}
              </div>
              {/* Zone progress dots */}
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4].map(dot => (
                  <div
                    key={dot}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: dot <= level ? color : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 mt-1">{zone}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
