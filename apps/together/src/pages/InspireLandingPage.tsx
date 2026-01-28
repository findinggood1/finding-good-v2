import { ToolLandingPage } from '../components/tools'
import { useRecentToolEntries } from '../hooks/useRecentToolEntries'

const inspireConfig = {
  title: 'INSPIRE',
  tagline: 'What do you believe is possible?',
  description:
    'Inspiration comes from belief — in yourself and in others. When you name what you believe you can do, and when you tell others what you believe they can do, you create possibility.',
  icon: '✨',
  color: '#FFD54F', // Yellow (Ethics color)
  selfMode: {
    title: 'For Yourself',
    description:
      "Define what you believe you can accomplish. Set intentions and predictions for what's possible.",
    route: '/inspire/self',
    buttonText: 'Define My Beliefs',
  },
  othersMode: {
    title: 'For Others',
    description:
      "Tell someone what you believe they can do. Share your belief in another person's potential.",
    route: '/inspire/others',
    buttonText: 'Inspire Someone',
  },
}

export function InspireLandingPage() {
  const { entries, isLoading } = useRecentToolEntries('inspire')

  return (
    <ToolLandingPage
      {...inspireConfig}
      recentEntries={isLoading ? [] : entries}
    />
  )
}
