import { ToolLandingPage } from '../components/tools'
import { useRecentToolEntries } from '../hooks/useRecentToolEntries'

const impactsConfig = {
  title: 'IMPACTS',
  tagline: 'What went well? Where did you or others make a difference?',
  description:
    'Impacts is about recognizing the positive difference being made — by you and by others. When you notice impact, you strengthen your ability to create more of it.',
  icon: '⚡',
  color: '#1B5666', // Deep Teal
  selfMode: {
    title: 'For Yourself',
    description:
      'Record the impact you had today. Reflect on what went well and what you contributed.',
    route: '/impacts/self',
    buttonText: 'Record My Impact',
  },
  othersMode: {
    title: 'For Others',
    description:
      'Recognize the impact someone had on you. Send acknowledgment to someone who made a difference.',
    route: '/impacts/others',
    buttonText: 'Recognize Someone',
  },
}

export function ImpactsLandingPage() {
  const { entries, isLoading } = useRecentToolEntries('impact')

  return (
    <ToolLandingPage
      {...impactsConfig}
      recentEntries={isLoading ? [] : entries}
    />
  )
}
