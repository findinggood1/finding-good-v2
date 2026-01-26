import { type HTMLAttributes, forwardRef } from 'react'

type IndicatorSize = 'sm' | 'md' | 'lg'

interface EngagementIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  max?: number
  size?: IndicatorSize
  interactive?: boolean
  onChange?: (value: number) => void
}

const sizeStyles: Record<IndicatorSize, { dot: string; gap: string }> = {
  sm: { dot: 'w-2 h-2', gap: 'gap-1' },
  md: { dot: 'w-3 h-3', gap: 'gap-1.5' },
  lg: { dot: 'w-4 h-4', gap: 'gap-2' },
}

// Color gradient from red (low) to green (high)
const ENGAGEMENT_COLORS = [
  '#EF4444', // 1 - red
  '#F97316', // 2 - orange
  '#EAB308', // 3 - yellow
  '#84CC16', // 4 - lime
  '#22C55E', // 5 - green
]

export const EngagementIndicator = forwardRef<HTMLDivElement, EngagementIndicatorProps>(
  ({ value, max = 5, size = 'md', interactive = false, onChange, className = '', ...props }, ref) => {
    const styles = sizeStyles[size]
    const clampedValue = Math.max(0, Math.min(value, max))

    const handleClick = (index: number) => {
      if (interactive && onChange) {
        // If clicking the same value, toggle it off (set to 0)
        const newValue = index + 1 === clampedValue ? 0 : index + 1
        onChange(newValue)
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        handleClick(index)
      }
    }

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center ${styles.gap}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Engagement level ${clampedValue} of ${max}`}
        {...props}
      >
        {Array.from({ length: max }, (_, index) => {
          const isFilled = index < clampedValue
          const dotColor = isFilled ? ENGAGEMENT_COLORS[index] : undefined

          return (
            <span
              key={index}
              role={interactive ? 'radio' : undefined}
              aria-checked={interactive ? isFilled : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={() => handleClick(index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                rounded-full transition-all duration-150
                ${styles.dot}
                ${isFilled ? '' : 'bg-gray-200'}
                ${interactive ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0D7C66]' : ''}
              `.trim().replace(/\s+/g, ' ')}
              style={isFilled ? { backgroundColor: dotColor } : undefined}
            />
          )
        })}
      </div>
    )
  }
)

EngagementIndicator.displayName = 'EngagementIndicator'
