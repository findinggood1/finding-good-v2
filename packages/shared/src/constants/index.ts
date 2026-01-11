import type { FiresElement, Zone } from '../types'

// FIRES Element Colors
export const FIRES_COLORS: Record<FiresElement, string> = {
  feelings: '#E57373',
  influence: '#64B5F6',
  resilience: '#81C784',
  ethics: '#FFD54F',
  strengths: '#BA68C8',
} as const

// FIRES Element Labels
export const FIRES_LABELS: Record<FiresElement, string> = {
  feelings: 'Feelings',
  influence: 'Influence',
  resilience: 'Resilience',
  ethics: 'Ethics',
  strengths: 'Strengths',
} as const

// Zone Order (progression)
export const ZONE_ORDER: readonly Zone[] = [
  'Exploring',
  'Discovering',
  'Performing',
  'Owning',
] as const

// Brand Colors
export const BRAND_COLORS = {
  primary: '#0D7C66',
  primaryLight: '#41B3A2',
  accent: '#BFD641',
  cream: '#FDF6E3',
} as const
