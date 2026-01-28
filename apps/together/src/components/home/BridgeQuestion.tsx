import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui'

export interface BridgeQuestionData {
  focusItem: string
  question: string
  engagementLevel: number
}

interface BridgeQuestionProps {
  data: BridgeQuestionData
  savedAnswer: string | null
  onSave: (answer: string, question: string, focusItem: string) => Promise<void>
  onSkip: () => void
}

/**
 * Determines the bridge question based on check-in results.
 * Called after user completes their daily check-in with engagement level.
 */
export function getBridgeQuestionData(
  completedItems: string[],
  engagementLevel: number,
): BridgeQuestionData | null {
  // Nothing checked in - ask what got attention
  if (completedItems.length === 0) {
    return {
      focusItem: '',
      question: 'What got your attention today?',
      engagementLevel,
    }
  }

  // Check for "Something else emerged" pattern
  const emergedItem = completedItems.find(item =>
    item.toLowerCase().includes('something else') ||
    item.toLowerCase().includes('emerged')
  )
  if (emergedItem && completedItems.length === 1) {
    return {
      focusItem: emergedItem,
      question: 'Tell me about what emerged',
      engagementLevel,
    }
  }

  // High engagement (4-5) - ask what made it land
  if (engagementLevel >= 4) {
    const highlighted = completedItems[0]
    return {
      focusItem: highlighted,
      question: `What made "${highlighted}" land?`,
      engagementLevel,
    }
  }

  // Low engagement (1-2) - ask what became more important
  if (engagementLevel <= 2) {
    const highlighted = completedItems[0]
    return {
      focusItem: highlighted,
      question: `What became more important than "${highlighted}"?`,
      engagementLevel,
    }
  }

  // Moderate engagement (3) - use first item
  const highlighted = completedItems[0]
  return {
    focusItem: highlighted,
    question: `What made "${highlighted}" land?`,
    engagementLevel,
  }
}

export function BridgeQuestion({
  data,
  savedAnswer,
  onSave,
  onSkip,
}: BridgeQuestionProps) {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState(savedAnswer || '')
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(!!savedAnswer)

  const handleSave = async () => {
    if (!answer.trim()) return

    setSaving(true)
    try {
      await onSave(answer.trim(), data.question, data.focusItem)
      setIsSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const navigateToImpacts = () => {
    // Navigate to Impacts page with pre-fill data via URL params
    const params = new URLSearchParams({
      source: 'checkin',
      focus: data.focusItem,
      engagement: String(data.engagementLevel),
      answer: answer.trim(),
    })
    navigate(`/impacts/self?${params.toString()}`)
  }

  const engagementLabel = data.engagementLevel >= 4
    ? 'high'
    : data.engagementLevel <= 2
      ? 'low'
      : 'moderate'

  return (
    <Card className="bg-brand-primary/5 border-brand-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand-primary">✓</span>
        <span className="text-sm font-medium text-brand-primary">Check-in saved</span>
      </div>

      {data.focusItem && (
        <p className="text-sm text-gray-600 mb-2">
          {data.focusItem} landed today ({data.engagementLevel}/5 - {engagementLabel} engagement).
        </p>
      )}

      <p className="text-base font-medium text-gray-900 mb-3">
        {data.question}
      </p>

      <textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value)
          // If user edits after saving, reset saved state
          if (isSaved) setIsSaved(false)
        }}
        placeholder="Share your thoughts..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
        rows={3}
        disabled={isSaved}
      />

      <div className="flex justify-end gap-2 mt-3">
        {isSaved ? (
          <>
            <button
              type="button"
              onClick={onSkip}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Done
            </button>
            <button
              type="button"
              onClick={navigateToImpacts}
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors"
            >
              Continue to Impacts →
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSkip}
              disabled={saving}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !answer.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>
    </Card>
  )
}
