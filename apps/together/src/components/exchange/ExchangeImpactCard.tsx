import { Card } from '../ui'
import type { ExchangeImpact } from '../../hooks/useExchangeImpacts'

interface ExchangeImpactCardProps {
  impacts: ExchangeImpact[]
  sentCount: number
  receivedCount: number
  impactfulCount: number
}

const IMPACT_STYLES: Record<string, { bg: string; border: string; badge: string }> = {
  high_impact: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-600' },
  meaningful: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600' },
  helpful: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-600' },
}

const IMPACT_LABELS: Record<string, string> = {
  high_impact: 'High Impact',
  meaningful: 'Meaningful',
  helpful: 'Helpful',
}

export function ExchangeImpactCard({
  impacts,
  sentCount,
  receivedCount,
  impactfulCount,
}: ExchangeImpactCardProps) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-3">EXCHANGE IMPACT</div>
      <div className="text-xs text-gray-500 mb-3">
        When someone marks your exchange as impactful
      </div>

      {impacts.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          Impact markers will appear when others rate what you've shared
        </div>
      ) : (
        <div className="space-y-3">
          {impacts.slice(0, 3).map((impact) => {
            const style = IMPACT_STYLES[impact.impact_level] || IMPACT_STYLES.helpful
            return (
              <div
                key={impact.id}
                className={`p-3 rounded-lg border ${style.bg} ${style.border}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {impact.sender_email.split('@')[0]} marked your exchange
                  </span>
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full ${style.badge}`}>
                    {IMPACT_LABELS[impact.impact_level]}
                  </span>
                </div>
                {impact.note && (
                  <div className="text-xs text-gray-600">"{impact.note}"</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-lg">{sentCount}</div>
            <div className="text-gray-500">Sent</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{receivedCount}</div>
            <div className="text-gray-500">Received</div>
          </div>
          <div>
            <div className="font-semibold text-lg text-green-600">{impactfulCount}</div>
            <div className="text-gray-500">Marked impactful</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
