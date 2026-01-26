import { type HTMLAttributes, forwardRef } from 'react'
import type { BridgeQuestion } from '../../types'
import { Card } from '../ui/Card'

interface BridgeQuestionCardProps extends HTMLAttributes<HTMLDivElement> {
  question: BridgeQuestion
  onDismiss?: () => void
  onRespond?: () => void
}

const TRIGGER_ICONS: Record<BridgeQuestion['trigger'], string> = {
  highest: '🔥',
  lowest: '💭',
  nothing: '🤔',
  emerged: '✨',
}

const TRIGGER_COLORS: Record<BridgeQuestion['trigger'], string> = {
  highest: 'border-l-green-500',
  lowest: 'border-l-amber-500',
  nothing: 'border-l-gray-400',
  emerged: 'border-l-purple-500',
}

export const BridgeQuestionCard = forwardRef<HTMLDivElement, BridgeQuestionCardProps>(
  ({ question, onDismiss, onRespond, className = '', ...props }, ref) => {
    const { trigger, focus_name, question: questionText, follow_up } = question
    const icon = TRIGGER_ICONS[trigger]
    const borderColor = TRIGGER_COLORS[trigger]

    return (
      <Card
        ref={ref}
        padding="md"
        className={`border-l-4 ${borderColor} ${className}`}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl" role="img" aria-hidden="true">
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            {focus_name && (
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                About: {focus_name}
              </p>
            )}
            <p className="text-gray-900 font-medium leading-snug">
              {questionText}
            </p>
          </div>
        </div>

        {/* Follow-up hint */}
        {follow_up && (
          <p className="text-sm text-gray-500 italic mb-4 ml-9">
            {follow_up}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-9">
          {onRespond && (
            <button
              onClick={onRespond}
              className="px-4 py-2 bg-[#0D7C66] text-white text-sm font-medium rounded-lg hover:bg-[#095c4d] transition-colors"
            >
              Reflect on this
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
            >
              Not now
            </button>
          )}
        </div>
      </Card>
    )
  }
)

BridgeQuestionCard.displayName = 'BridgeQuestionCard'
