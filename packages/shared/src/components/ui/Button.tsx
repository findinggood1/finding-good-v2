import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#0D7C66] text-white hover:bg-[#095c4d] active:bg-[#074a3e] focus:ring-[#0D7C66] border-2 border-[#0D7C66]',
  secondary: 'bg-[#BFD641] text-gray-900 hover:bg-[#a8bc39] active:bg-[#96a832] focus:ring-[#BFD641] border-2 border-[#BFD641]',
  ghost: 'bg-white text-[#0D7C66] border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white active:bg-[#095c4d] focus:ring-[#0D7C66]',
  outline: 'bg-transparent text-[#0D7C66] border-2 border-[#0D7C66] hover:bg-[#0D7C66]/10 active:bg-[#0D7C66]/20 focus:ring-[#0D7C66]',
}

const disabledStyles: Record<ButtonVariant, string> = {
  primary: 'disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500',
  secondary: 'disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400',
  ghost: 'disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400',
  outline: 'disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-400',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-semibold rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${disabledStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
