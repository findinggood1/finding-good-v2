import { Card, FiresBadge } from '../ui'
import type { FiresElement } from '@finding-good/shared'

interface NoticingCardProps {
  firesFrequency: Record<FiresElement, number>
  recentCount: number
  question: string
}

// Map lowercase element names to badge letters
const ELEMENT_TO_BADGE: Record<FiresElement, 'F' | 'I' | 'R' | 'E' | 'S'> = {
  feelings: 'F',
  influence: 'I',
  resilience: 'R',
  ethics: 'E',
  strengths: 'S',
}

export function NoticingCard({ firesFrequency, recentCount, question }: NoticingCardProps) {
  // Get non-zero frequencies sorted by count descending
  const sortedFrequencies = Object.entries(firesFrequency)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a) as [FiresElement, number][]

  if (sortedFrequencies.length === 0) {
    return (
      <Card>
        <div className="text-sm font-medium text-gray-600 mb-3">WHAT YOU'RE NOTICING IN OTHERS</div>
        <div className="text-sm text-gray-500 text-center py-4">
          Send recognitions to see patterns
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">WHAT YOU'RE NOTICING IN OTHERS</div>
      <div className="text-sm text-gray-700 mb-2">
        In your last {recentCount} recognitions, you noticed:
      </div>
      <div className="flex gap-4 mb-3">
        {sortedFrequencies.map(([element, count]) => (
          <div key={element} className="flex items-center gap-1">
            <FiresBadge element={ELEMENT_TO_BADGE[element]} />
            <span className="text-sm">{count}x</span>
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-600 italic">
        💭 {question}
      </div>
    </Card>
  )
}
