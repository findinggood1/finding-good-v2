import type { FiresElement, Zone } from '../types'

// FIRES Elements Array
export const FIRES_ELEMENTS: readonly FiresElement[] = [
  'feelings',
  'influence',
  'resilience',
  'ethics',
  'strengths',
] as const

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

// FIRES Display - Combined color, label, and description for UI
export const FIRES_DISPLAY: Record<FiresElement, {
  color: string
  label: string
  initial: string
  description: string
}> = {
  feelings: {
    color: '#E57373',
    label: 'Feelings',
    initial: 'F',
    description: 'Emotional awareness and expression',
  },
  influence: {
    color: '#64B5F6',
    label: 'Influence',
    initial: 'I',
    description: 'Impact on others and environment',
  },
  resilience: {
    color: '#81C784',
    label: 'Resilience',
    initial: 'R',
    description: 'Ability to recover and adapt',
  },
  ethics: {
    color: '#FFD54F',
    label: 'Ethics',
    initial: 'E',
    description: 'Values and moral principles',
  },
  strengths: {
    color: '#BA68C8',
    label: 'Strengths',
    initial: 'S',
    description: 'Core capabilities and talents',
  },
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
