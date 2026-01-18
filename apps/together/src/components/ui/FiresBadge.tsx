// FIRES colors from design spec
export const FIRES_COLORS: Record<string, string> = {
  F: '#E57373', // Feelings - Red
  I: '#64B5F6', // Influence - Blue
  R: '#81C784', // Resilience - Green
  E: '#FFD54F', // Ethics - Yellow
  S: '#BA68C8', // Strengths - Purple
}

export const FIRES_LABELS: Record<string, string> = {
  F: 'Feelings',
  I: 'Influence',
  R: 'Resilience',
  E: 'Ethics',
  S: 'Strengths',
}

interface FiresBadgeProps {
  element: 'F' | 'I' | 'R' | 'E' | 'S'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function FiresBadge({ element, size = 'md', showLabel = false }: FiresBadgeProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center justify-center rounded-full font-bold text-white ${sizeClasses[size]}`}
        style={{ backgroundColor: FIRES_COLORS[element] }}
        title={FIRES_LABELS[element]}
      >
        {element}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-600">{FIRES_LABELS[element]}</span>
      )}
    </span>
  )
}
