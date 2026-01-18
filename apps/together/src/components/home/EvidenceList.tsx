import { Card } from '../ui'
import type { EvidenceItem } from '../../hooks/useThisWeeksEvidence'

interface EvidenceListProps {
  items: EvidenceItem[]
}

export function EvidenceList({ items }: EvidenceListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <div className="text-sm font-medium text-gray-600 mb-3">THIS WEEK'S EVIDENCE</div>
        <div className="text-sm text-gray-500 text-center py-4">
          Nothing captured yet this week
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">THIS WEEK'S EVIDENCE</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className={item.icon === 'check' ? 'text-green-600' : 'text-amber-500'}>
              {item.icon === 'check' ? '✓' : '⚡'}
            </span>
            <span className="text-sm text-gray-700">{item.text}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
