import { type HTMLAttributes, forwardRef } from 'react'
import type { FiresElement } from '../../types'
import { FIRES_COLORS, FIRES_LABELS } from '../../constants'

type BadgeSize = 'sm' | 'md' | 'lg'

interface FiresBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  element: FiresElement
  size?: BadgeSize
  showLabel?: boolean
}

const sizeStyles: Record<BadgeSize, { badge: string; text: string }> = {
  sm: { badge: 'w-5 h-5 text-xs', text: 'text-xs' },
  md: { badge: 'w-6 h-6 text-sm', text: 'text-sm' },
  lg: { badge: 'w-8 h-8 text-base', text: 'text-base' },
}

const FIRES_INITIALS: Record<FiresElement, string> = {
  feelings: 'F',
  influence: 'I',
  resilience: 'R',
  ethics: 'E',
  strengths: 'S',
}

export const FiresBadge = forwardRef<HTMLSpanElement, FiresBadgeProps>(
  ({ element, size = 'md', showLabel = false, className = '', ...props }, ref) => {
    const color = FIRES_COLORS[element]
    const label = FIRES_LABELS[element]
    const initial = FIRES_INITIALS[element]
    const styles = sizeStyles[size]

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        <span
          className={`
            inline-flex items-center justify-center rounded-full font-semibold
            ${styles.badge}
          `.trim().replace(/\s+/g, ' ')}
          style={{
            backgroundColor: `${color}20`,
            color: color,
            border: `2px solid ${color}`,
          }}
          title={label}
        >
          {initial}
        </span>
        {showLabel && (
          <span
            className={`font-medium ${styles.text}`}
            style={{ color }}
          >
            {label}
          </span>
        )}
      </span>
    )
  }
)

FiresBadge.displayName = 'FiresBadge'
