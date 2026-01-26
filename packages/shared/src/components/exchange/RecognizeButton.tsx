import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface RecognizeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  count: number
  recognized: boolean
}

export const RecognizeButton = forwardRef<HTMLButtonElement, RecognizeButtonProps>(
  ({ count, recognized, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
          transition-all duration-200
          ${recognized
            ? 'bg-[#BFD641] text-gray-900'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-pressed={recognized}
        {...props}
      >
        {/* Flame icon */}
        <svg
          className={`w-4 h-4 ${recognized ? 'text-orange-600' : 'text-gray-400'}`}
          fill={recognized ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
          />
        </svg>
        <span>{count > 0 ? count : ''}</span>
        <span className="sr-only">
          {recognized ? 'Remove recognition' : 'Recognize this'}
        </span>
      </button>
    )
  }
)

RecognizeButton.displayName = 'RecognizeButton'
