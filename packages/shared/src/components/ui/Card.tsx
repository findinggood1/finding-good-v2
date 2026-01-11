import { type HTMLAttributes, forwardRef } from 'react'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  hoverable?: boolean
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hoverable = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-xl border border-gray-200 shadow-sm
          ${paddingStyles[padding]}
          ${hoverable ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
