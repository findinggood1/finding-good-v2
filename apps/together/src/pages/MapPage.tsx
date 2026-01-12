import { LoadingSpinner } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'
import { useMapData } from '../hooks/useMapData'

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

const FIRES_DESCRIPTIONS: Record<FiresElement, string> = {
  feelings: 'Emotional awareness and expression',
  influence: 'Impact and agency in situations',
  resilience: 'Handling challenges and setbacks',
  ethics: 'Values alignment and integrity',
  strengths: 'Natural talents and abilities',
}

interface ProgressBarProps {
  element: FiresElement
  value: number
  maxValue: number
}

function ProgressBar({ element, value, maxValue }: ProgressBarProps) {
  const color = FIRES_COLORS[element]
  const label = FIRES_LABELS[element]
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

interface CalloutCardProps {
  title: string
  element: FiresElement | null
  description: string
  variant: 'highlight' | 'growth'
}

function CalloutCard({ title, element, variant }: CalloutCardProps) {
  if (!element) return null

  const color = FIRES_COLORS[element]
  const label = FIRES_LABELS[element]
  const elementDescription = FIRES_DESCRIPTIONS[element]

  const bgClass = variant === 'highlight' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
  const iconBgClass = variant === 'highlight' ? 'bg-emerald-100' : 'bg-amber-100'

  return (
    <div className={`rounded-xl p-4 border ${bgClass}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
          style={{ backgroundColor: color + '20' }}
        >
          {variant === 'highlight' ? (
            <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-lg font-semibold mt-0.5" style={{ color }}>{label}</p>
          <p className="text-sm text-gray-600 mt-1">{elementDescription}</p>
        </div>
      </div>
    </div>
  )
}

export function MapPage() {
  const { firesAverages, strongest, growthArea, totalValidations, loading, error } = useMapData()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 rounded-xl p-4">
          <p>Failed to load map data: {error}</p>
        </div>
      </div>
    )
  }

  // Get max value for scaling bars
  const maxValue = Math.max(...Object.values(firesAverages), 1)

  const hasData = totalValidations > 0

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Clarity Map</h1>
        <p className="text-gray-600 text-sm mt-1">
          Your FIRES patterns from {totalValidations} {totalValidations === 1 ? 'reflection' : 'reflections'}
        </p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Start building your map
          </h2>
          <p className="text-gray-600 text-sm max-w-xs mx-auto mb-6">
            Add priorities and proofs to see your FIRES patterns emerge over time.
          </p>
          <a
            href="http://localhost:3002"
            className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Add a reflection
          </a>
        </div>
      ) : (
        <>
          {/* FIRES Progress Bars */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-4">FIRES Strength</h2>
            <ProgressBar element="feelings" value={firesAverages.feelings} maxValue={maxValue} />
            <ProgressBar element="influence" value={firesAverages.influence} maxValue={maxValue} />
            <ProgressBar element="resilience" value={firesAverages.resilience} maxValue={maxValue} />
            <ProgressBar element="ethics" value={firesAverages.ethics} maxValue={maxValue} />
            <ProgressBar element="strengths" value={firesAverages.strengths} maxValue={maxValue} />
          </div>

          {/* Callout Cards */}
          <div className="space-y-3">
            <CalloutCard
              title="Strongest"
              element={strongest}
              description="This element shows up most in your reflections"
              variant="highlight"
            />
            <CalloutCard
              title="Growth Opportunity"
              element={growthArea}
              description="Consider exploring this element more"
              variant="growth"
            />
          </div>

          {/* Tip */}
          <div className="mt-6 bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-brand-primary">Tip:</span> Add more reflections to get a clearer picture of your FIRES patterns. Each priority and proof helps build your clarity map.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
