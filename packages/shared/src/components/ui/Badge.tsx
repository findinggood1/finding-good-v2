import { type HTMLAttributes, forwardRef } from 'react'
import type { FiresElement } from '../../types'
import { FIRES_COLORS } from '../../constants'

type BadgeSize = 'sm' | 'md' | 'lg'
type BadgeVariant = 'default' | 'fires'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BadgeSize
  variant?: BadgeVariant
  firesElement?: FiresElement
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ size = 'md', variant = 'default', firesElement, className = '', style, children, ...props }, ref) => {
    const firesColor = firesElement ? FIRES_COLORS[firesElement] : undefined

    const baseStyles = variant === 'fires' && firesColor
      ? { backgroundColor: `${firesColor}20`, color: firesColor, borderColor: firesColor }
      : undefined

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full border
          ${variant === 'default' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'border'}
          ${sizeStyles[size]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{ ...baseStyles, ...style }}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
