import { useState, useEffect } from 'react'
import { Card } from '../ui'
import { ReflectionQuestion } from './ReflectionQuestion'
import type { FocusItem } from '@finding-good/shared'
import type { DailyReflection } from '../../hooks/useDailyReflection'

interface DailyCheckinProps {
  focusItems: FocusItem[]
  reflection: DailyReflection | null
  loading: boolean
  weeklyCheckinCount?: number
  onToggleItem: (itemName: string, focusTotal: number) => Promise<void>
  onSetEngagement: (level: number) => Promise<void>
  onSaveAnswer: (answer: string, questionShown: string) => Promise<void>
}

function getEngagementQuestion(
  level: number,
  completedItems: string[],
  focusItems: FocusItem[],
): string {
  if (level >= 4) {
    // Use first completed item name for the high-engagement question
    const highlighted = completedItems[0] || focusItems[0]?.name || 'that'
    return `What made "${highlighted}" land?`
  }
  if (level <= 2) {
    return 'How did you work through it?'
  }
  return 'What got your attention today?'
}

export function DailyCheckin({
  focusItems,
  reflection,
  loading,
  weeklyCheckinCount = 0,
  onToggleItem,
  onSetEngagement,
  onSaveAnswer,
}: DailyCheckinProps) {
  // Track which items just got checked for animation
  const [justChecked, setJustChecked] = useState<Set<string>>(new Set())

  // Clear animation after it plays
  useEffect(() => {
    if (justChecked.size === 0) return
    const timer = setTimeout(() => setJustChecked(new Set()), 600)
    return () => clearTimeout(timer)
  }, [justChecked])

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </Card>
    )
  }

  if (focusItems.length === 0) {
    return null
  }

  const completedItems: string[] = reflection?.completed_items || []
  const hasAnyCompleted = completedItems.length > 0
  const engagementLevel = reflection?.engagement_level || null
  const hasEngagement = engagementLevel !== null

  const handleToggle = async (itemName: string) => {
    const wasChecked = completedItems.includes(itemName)
    if (!wasChecked) {
      setJustChecked(new Set([itemName]))
    }
    await onToggleItem(itemName, focusItems.length)
  }

  const question = hasEngagement
    ? getEngagementQuestion(engagementLevel, completedItems, focusItems)
    : ''

  return (
    <Card className={hasAnyCompleted ? 'bg-amber-50/50 border-amber-100' : ''}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-600">TODAY'S CHECK-IN</div>
        {weeklyCheckinCount > 0 && (
          <div className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
            {weeklyCheckinCount} day{weeklyCheckinCount !== 1 ? 's' : ''} this week
          </div>
        )}
      </div>

      {/* Focus items — celebration pattern */}
      <div className="space-y-2 mb-4">
        {focusItems.map((item) => {
          const isChecked = completedItems.includes(item.name)
          const isAnimating = justChecked.has(item.name)

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleToggle(item.name)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-all duration-300 ease-out
                ${isChecked
                  ? 'bg-brand-primary/10 border border-brand-primary/20'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                }
                ${isAnimating ? 'scale-[1.02]' : ''}
              `}
            >
              <span className={`
                flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isChecked
                  ? 'bg-brand-primary text-white'
                  : 'border-2 border-gray-300'
                }
                ${isAnimating ? 'scale-125' : ''}
              `}>
                {isChecked && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isChecked ? 'text-brand-primary' : 'text-gray-700'
              }`}>
                {item.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Engagement rating — shows after checking any item */}
      {hasAnyCompleted && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            How engaged did you feel today?
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => onSetEngagement(level)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                  engagementLevel === level
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}

      {/* Reflection question — shows only after selecting engagement */}
      {hasEngagement && (
        <ReflectionQuestion
          question={question}
          savedAnswer={reflection?.answer || null}
          onSave={onSaveAnswer}
        />
      )}
    </Card>
  )
}
