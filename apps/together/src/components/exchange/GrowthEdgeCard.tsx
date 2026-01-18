import { Card, FiresBadge, FIRES_LABELS } from '../ui'
import type { FiresElement, Zone } from '@finding-good/shared'

interface GrowthEdgeCardProps {
  element: FiresElement | null
  zone: Zone | null
  description?: string
}

// Map lowercase element names to badge letters
const ELEMENT_TO_BADGE: Record<FiresElement, 'F' | 'I' | 'R' | 'E' | 'S'> = {
  feelings: 'F',
  influence: 'I',
  resilience: 'R',
  ethics: 'E',
  strengths: 'S',
}

// Default descriptions for growth edges by element
const DEFAULT_DESCRIPTIONS: Record<FiresElement, string> = {
  feelings: "You have proof but aren't connecting to it emotionally yet",
  influence: "You're doing the work but not seeing your impact on others",
  resilience: "Success is happening but you're not trusting the pattern",
  ethics: "Actions aren't yet tied to deeper purpose",
  strengths: "You're capable but not leveraging your natural abilities",
}

export function GrowthEdgeCard({ element, zone, description }: GrowthEdgeCardProps) {
  if (!element || !zone) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <div className="text-sm text-gray-500 text-center py-4">
          Complete an assessment to see your growth edge
        </div>
      </Card>
    )
  }

  const badgeLetter = ELEMENT_TO_BADGE[element]
  const label = FIRES_LABELS[badgeLetter]
  const desc = description || DEFAULT_DESCRIPTIONS[element]

  return (
    <Card className="bg-red-50 border-red-200">
      <div className="text-sm text-red-700 mb-1">YOUR GROWTH EDGE</div>
      <div className="flex items-center gap-2">
        <FiresBadge element={badgeLetter} />
        <span className="font-medium text-gray-800">{label} ({zone})</span>
      </div>
      <div className="text-sm text-gray-600 mt-2">"{desc}"</div>
    </Card>
  )
}
