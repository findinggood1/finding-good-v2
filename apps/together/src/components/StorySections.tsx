import { useStoryData } from '../hooks/useStoryData'

interface StorySectionCardProps {
  title: string
  subtitle: string
  content: string | null
}

function StorySectionCard({ title, subtitle, content }: StorySectionCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      {content ? (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">Not captured yet</p>
      )}
    </div>
  )
}

export function StorySections() {
  const { storyPresent, storyPast, storyPotential, hasEngagement, loading } = useStoryData()

  // Don't render if loading or no engagement exists
  if (loading || !hasEngagement) {
    return null
  }

  // Check if there's any story content at all
  const hasAnyContent = storyPresent || storyPast || storyPotential

  // Only show if engagement exists (will show empty states if no content)
  if (!hasEngagement && !hasAnyContent) {
    return null
  }

  return (
    <div className="px-4 py-2">
      <h2 className="text-sm font-medium text-gray-500 mb-3">My Story</h2>
      <div className="space-y-3">
        <StorySectionCard
          title="Where I Am"
          subtitle="Present moment"
          content={storyPresent}
        />
        <StorySectionCard
          title="Where I've Been"
          subtitle="Past experiences"
          content={storyPast}
        />
        <StorySectionCard
          title="Where I'm Going"
          subtitle="Future potential"
          content={storyPotential}
        />
      </div>
    </div>
  )
}
