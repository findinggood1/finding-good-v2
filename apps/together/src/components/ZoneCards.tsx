import type { FiresElement, Zone } from '@finding-good/shared'
import { useZoneData } from '../hooks/useZoneData'

// V2 FIRES Colors
const FIRES_COLORS: Record<FiresElement, string> = {
  feelings: '#E63946',
  influence: '#2A9D8F',
  resilience: '#E9C46A',
  ethics: '#6A994E',
  strengths: '#4361EE',
}

const FIRES_LABELS: Record<FiresElement, string> = {
  feelings: 'Feelings',
  influence: 'Influence',
  resilience: 'Resilience',
  ethics: 'Ethics',
  strengths: 'Strengths',
}

// Zone colors (from brand)
const ZONE_COLORS: Record<Zone, string> = {
  Exploring: '#9CA3AF', // gray
  Discovering: '#3B82F6', // blue
  Performing: '#F59E0B', // amber
  Owning: '#10B981', // emerald
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return diffMins + 'm ago'
  if (diffHours < 24) return diffHours + 'h ago'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return diffDays + 'd ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ZoneCardProps {
  title: string
  value: string
  subtitle?: string
  color?: string
  icon: React.ReactNode
}

function ZoneCard({ title, value, subtitle, color, icon }: ZoneCardProps) {
  return (
    <div className="flex-shrink-0 w-36 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color ? `${color}20` : '#f3f4f6' }}
        >
          <span style={{ color: color || '#6b7280' }}>{icon}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{title}</p>
      <p
        className="text-sm font-semibold truncate"
        style={{ color: color || '#111827' }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      )}
    </div>
  )
}

function ZoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function GrowthIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function ZoneCards() {
  const { overallZone, growthOpportunity, owningHighlight, lastActivityDate, loading } = useZoneData()

  // Don't show anything if no data and not loading
  if (!loading && !overallZone && !lastActivityDate) {
    return null
  }

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="px-4 py-3 bg-gray-50/50">
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-36 h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 bg-gray-50/50">
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 md:grid md:grid-cols-4 md:gap-4">
        {/* Current Zone */}
        <ZoneCard
          title="Current Zone"
          value={overallZone || 'No data'}
          color={overallZone ? ZONE_COLORS[overallZone] : undefined}
          icon={<ZoneIcon />}
        />

        {/* Growth Opportunity */}
        <ZoneCard
          title="Growth Opportunity"
          value={growthOpportunity ? FIRES_LABELS[growthOpportunity.element] : 'No data'}
          subtitle={growthOpportunity ? growthOpportunity.zone : undefined}
          color={growthOpportunity ? FIRES_COLORS[growthOpportunity.element] : undefined}
          icon={<GrowthIcon />}
        />

        {/* Owning Highlight */}
        <ZoneCard
          title="Owning Highlight"
          value={owningHighlight ? FIRES_LABELS[owningHighlight.element] : 'No data'}
          subtitle={owningHighlight ? owningHighlight.zone : undefined}
          color={owningHighlight ? FIRES_COLORS[owningHighlight.element] : undefined}
          icon={<StarIcon />}
        />

        {/* Last Activity */}
        <ZoneCard
          title="Last Activity"
          value={lastActivityDate ? formatTimeAgo(lastActivityDate) : 'No activity'}
          color="#6B7280"
          icon={<ClockIcon />}
        />
      </div>
    </div>
  )
}
