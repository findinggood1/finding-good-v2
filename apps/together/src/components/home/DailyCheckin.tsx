import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui'
import { BridgeQuestion } from './BridgeQuestion'
import type { BridgeQuestionData } from './BridgeQuestion'
import type { FocusItem } from '@finding-good/shared'
import type { DailyReflection } from '../../hooks/useDailyReflection'

interface DailyCheckinProps {
  focusItems: FocusItem[]
  reflection: DailyReflection | null
  loading: boolean
  weeklyCheckinCount?: number
  onToggleItem: (itemName: string, focusTotal: number) => Promise<void>
  onSetItemEngagement: (itemName: string, level: number) => Promise<void>
  onSaveBridgeAnswer: (answer: string, question: string, focusItem: string) => Promise<void>
}

export function DailyCheckin({
  focusItems,
  reflection,
  loading,
  weeklyCheckinCount = 0,
  onToggleItem,
  onSetItemEngagement,
  onSaveBridgeAnswer,
}: DailyCheckinProps) {
  const navigate = useNavigate()
  // Track which items just got checked for animation
  const [justChecked, setJustChecked] = useState<Set<string>>(new Set())
  // Track if bridge question was skipped/dismissed
  const [bridgeDismissed, setBridgeDismissed] = useState(false)

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
  const itemEngagements: Record<string, number> = reflection?.item_engagements || {}
  const hasAnyCompleted = completedItems.length > 0

  // Check if all completed items have engagement ratings
  const allCheckedHaveEngagement = hasAnyCompleted && completedItems.every(
    item => itemEngagements[item] != null
  )

  // Find highest-rated item for bridge question
  const getHighestRatedItem = (): { name: string; level: number } | null => {
    if (!hasAnyCompleted) return null

    let highest = { name: completedItems[0], level: itemEngagements[completedItems[0]] || 0 }
    for (const item of completedItems) {
      const level = itemEngagements[item] || 0
      if (level > highest.level) {
        highest = { name: item, level }
      }
    }
    return highest
  }

  // Find lowest-rated item
  const getLowestRatedItem = (): { name: string; level: number } | null => {
    if (!hasAnyCompleted) return null

    let lowest = { name: completedItems[0], level: itemEngagements[completedItems[0]] || 5 }
    for (const item of completedItems) {
      const level = itemEngagements[item] || 5
      if (level < lowest.level) {
        lowest = { name: item, level }
      }
    }
    return lowest
  }

  const handleToggle = async (itemName: string) => {
    const wasChecked = completedItems.includes(itemName)
    if (!wasChecked) {
      setJustChecked(new Set([itemName]))
    }
    await onToggleItem(itemName, focusItems.length)
  }

  const handleEngagementClick = (e: React.MouseEvent, itemName: string, level: number) => {
    e.stopPropagation() // Don't toggle the item
    onSetItemEngagement(itemName, level)
  }

  // Get bridge question data when all items have engagement
  const bridgeData = allCheckedHaveEngagement
    ? getBridgeQuestionDataFromItems(completedItems, getHighestRatedItem, getLowestRatedItem)
    : null

  // Show bridge if: all have engagement, not dismissed, not already answered
  const showBridge = bridgeData && !bridgeDismissed && !reflection?.bridge_answer

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

      {/* Focus items with inline engagement */}
      <div className="space-y-2 mb-4">
        {focusItems.map((item) => {
          const isChecked = completedItems.includes(item.name)
          const isAnimating = justChecked.has(item.name)
          const engagement = itemEngagements[item.name]

          return (
            <div
              key={item.name}
              className={`
                rounded-lg transition-all duration-300 ease-out
                ${isChecked
                  ? 'bg-brand-primary/10 border border-brand-primary/20'
                  : 'bg-gray-50 border border-gray-100'
                }
                ${isAnimating ? 'scale-[1.02]' : ''}
              `}
            >
              <button
                type="button"
                onClick={() => handleToggle(item.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
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
                <span className={`text-sm font-medium transition-colors duration-300 flex-1 ${
                  isChecked ? 'text-brand-primary' : 'text-gray-700'
                }`}>
                  {item.name}
                </span>
              </button>

              {/* Inline engagement rating - shows when item is checked */}
              {isChecked && (
                <div className="px-3 pb-2.5 pt-0">
                  <div className="flex items-center gap-2 ml-8">
                    <span className="text-xs text-gray-500">Engagement:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={(e) => handleEngagementClick(e, item.name, level)}
                          className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                            engagement === level
                              ? 'bg-brand-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bridge question — shows when all checked items have engagement */}
      {showBridge && bridgeData && (
        <BridgeQuestion
          data={bridgeData}
          savedAnswer={reflection?.bridge_answer || null}
          onSave={onSaveBridgeAnswer}
          onSkip={() => setBridgeDismissed(true)}
        />
      )}

      {/* Show completion state after bridge is answered or skipped */}
      {allCheckedHaveEngagement && (bridgeDismissed || reflection?.bridge_answer) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Check-in complete</span>
            </div>
            {reflection?.bridge_answer && (
              <button
                type="button"
                onClick={() => {
                  const highest = getHighestRatedItem()
                  const params = new URLSearchParams({
                    source: 'checkin',
                    focus: highest?.name || '',
                    engagement: String(highest?.level || 3),
                    answer: reflection.bridge_answer || '',
                  })
                  navigate(`/impacts/self?${params.toString()}`)
                }}
                className="text-sm text-brand-primary hover:underline font-medium"
              >
                Continue to Impacts →
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

/**
 * Get bridge question data based on per-item engagements
 */
function getBridgeQuestionDataFromItems(
  completedItems: string[],
  getHighestRatedItem: () => { name: string; level: number } | null,
  getLowestRatedItem: () => { name: string; level: number } | null,
): BridgeQuestionData | null {
  if (completedItems.length === 0) {
    return {
      focusItem: '',
      question: 'What got your attention today?',
      engagementLevel: 0,
    }
  }

  const highest = getHighestRatedItem()
  const lowest = getLowestRatedItem()

  if (!highest) return null

  // High engagement (4-5) on highest item - ask what made it land
  if (highest.level >= 4) {
    return {
      focusItem: highest.name,
      question: `What made "${highest.name}" land?`,
      engagementLevel: highest.level,
    }
  }

  // Low engagement (1-2) on lowest item - ask what got in the way
  if (lowest && lowest.level <= 2) {
    return {
      focusItem: lowest.name,
      question: `What became more important than "${lowest.name}"?`,
      engagementLevel: lowest.level,
    }
  }

  // Moderate engagement - use highest item
  return {
    focusItem: highest.name,
    question: `What made "${highest.name}" land?`,
    engagementLevel: highest.level,
  }
}
