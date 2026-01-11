import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCharCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCharCount = false, maxLength, value, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const hasError = Boolean(error)
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 rounded-lg border resize-y min-h-[100px]
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-[#0D7C66] focus:ring-[#0D7C66]/20'
            }
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        <div className="flex justify-between mt-1">
          <div>
            {error && (
              <p id={`${textareaId}-error`} className="text-sm text-red-600">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${textareaId}-helper`} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && (
            <p className={`text-sm ${maxLength && charCount >= maxLength ? 'text-red-600' : 'text-gray-500'}`}>
              {charCount}{maxLength ? `/${maxLength}` : ''}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
