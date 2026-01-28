import { ToolLandingPage } from '../components/tools'
import { useRecentToolEntries } from '../hooks/useRecentToolEntries'

const insightsConfig = {
  title: 'INSIGHTS',
  tagline: 'How did growth actually happen?',
  description:
    "Insights isn't just about outcomes — it's about understanding the process. When you validate how you grew, you can repeat it. When you help others see their growth, you multiply it.",
  icon: '📈',
  color: '#81C784', // Green (Resilience color)
  selfMode: {
    title: 'For Yourself',
    description:
      'Validate your improvement. Reflect on how you overcame a challenge or experienced growth.',
    route: '/insights/self',
    buttonText: 'Validate My Growth',
  },
  othersMode: {
    title: 'For Others',
    description:
      "Help someone see their improvement. Witness growth in another person and share what you observed.",
    route: '/insights/others',
    buttonText: "Witness Someone's Growth",
  },
}

export function InsightsLandingPage() {
  const { entries, isLoading } = useRecentToolEntries('improve')

  return (
    <ToolLandingPage
      {...insightsConfig}
      recentEntries={isLoading ? [] : entries}
    />
  )
}
