import { Link } from 'react-router-dom'
import { Card, Button } from '@finding-good/shared'

interface RecentEntry {
  id: string
  preview: string
  date: string
  type: 'self' | 'others'
}

interface ModeConfig {
  title: string
  description: string
  route: string
  buttonText: string
}

interface ToolLandingPageProps {
  title: string
  tagline: string
  description: string
  icon: string
  color: string
  selfMode: ModeConfig
  othersMode: ModeConfig
  recentEntries?: RecentEntry[]
  onViewAll?: () => void
}

export function ToolLandingPage({
  title,
  tagline,
  description,
  icon,
  color,
  selfMode,
  othersMode,
  recentEntries = [],
  onViewAll,
}: ToolLandingPageProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <h1 className="text-2xl font-bold" style={{ color }}>
          {title}
        </h1>
      </div>

      {/* Tagline */}
      <p className="text-lg text-gray-600 mb-2">{tagline}</p>

      {/* Description */}
      <p className="text-gray-500 mb-8">{description}</p>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Self Mode Card */}
        <Link to={selfMode.route} className="block group">
          <Card
            padding="lg"
            hoverable
            className="h-full border-2 border-transparent hover:border-gray-300"
          >
            <div className="mb-4">
              <span
                className="inline-block px-2 py-0.5 text-xs font-medium rounded"
                style={{ backgroundColor: `${color}20`, color }}
              >
                FOR YOURSELF
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {selfMode.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{selfMode.description}</p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              style={{ backgroundColor: color, borderColor: color }}
            >
              {selfMode.buttonText}
            </Button>
          </Card>
        </Link>

        {/* Others Mode Card */}
        <Link to={othersMode.route} className="block group">
          <Card
            padding="lg"
            hoverable
            className="h-full border-2 border-transparent hover:border-gray-300"
          >
            <div className="mb-4">
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                FOR OTHERS
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {othersMode.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{othersMode.description}</p>
            <Button variant="outline" size="sm" className="w-full">
              {othersMode.buttonText}
            </Button>
          </Card>
        </Link>
      </div>

      {/* Recent Entries Section */}
      {recentEntries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Recent Entries
            </h3>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                View All &rarr;
              </button>
            )}
          </div>

          <Card padding="none">
            <ul className="divide-y divide-gray-100">
              {recentEntries.slice(0, 5).map((entry) => (
                <li
                  key={entry.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {entry.preview}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(entry.date)}
                    </p>
                  </div>
                  <span
                    className={`ml-3 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded ${
                      entry.type === 'self'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {entry.type === 'self' ? 'Self' : 'Others'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Empty state when no recent entries */}
      {recentEntries.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-3xl mb-2 block">{icon}</span>
          <p className="text-sm text-gray-500">
            No entries yet. Start by recording your first one!
          </p>
        </div>
      )}
    </div>
  )
}
