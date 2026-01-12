import { useStoryData } from '../hooks/useStoryData'

interface SuperpowerObject {
  superpower?: string
  description?: string
  evidence?: string
  fires_element?: string
}

type SuperpowerData = string | SuperpowerObject | SuperpowerObject[] | null

function formatSuperpower(data: SuperpowerData): string | null {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    const items = data
      .map(item => item.superpower || item.description)
      .filter(Boolean)
    return items.length > 0 ? items.join('\n') : null
  }
  if (typeof data === 'object') {
    return data.superpower || data.description || null
  }
  return String(data)
}

const StarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

interface SuperpowerItemProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  content: SuperpowerData
}

function SuperpowerItem({ icon, title, subtitle, content }: SuperpowerItemProps) {
  const displayContent = formatSuperpower(content)

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <span className="text-xs text-gray-400">{subtitle}</span>
        </div>
        {displayContent ? (
          <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mt-1">Not discovered yet</p>
        )}
      </div>
    </div>
  )
}

export function Superpowers() {
  const { superpowersClaimed, superpowersEmerging, superpowersHidden, hasEngagement, loading } = useStoryData()

  // Don't render if loading or no engagement exists
  if (loading || !hasEngagement) {
    return null
  }

  return (
    <div className="px-4 py-2">
      <h2 className="text-sm font-medium text-gray-500 mb-3">Superpowers</h2>
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-5">
        <SuperpowerItem
          icon={<StarIcon />}
          title="Claimed"
          subtitle="what you know"
          content={superpowersClaimed}
        />
        <SuperpowerItem
          icon={<SparklesIcon />}
          title="Emerging"
          subtitle="what's developing"
          content={superpowersEmerging}
        />
        <SuperpowerItem
          icon={<EyeIcon />}
          title="Hidden"
          subtitle="what others see"
          content={superpowersHidden}
        />
      </div>
    </div>
  )
}
