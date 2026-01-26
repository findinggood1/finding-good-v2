import { useState } from 'react'
import { Input, Button } from '@finding-good/shared'
import type { FocusItem, Prediction } from '@finding-good/shared'

interface FocusItemInputProps {
  item: FocusItem
  index: number
  predictions?: Prediction[]
  onUpdate: (index: number, item: FocusItem) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

export function FocusItemInput({
  item,
  index,
  predictions = [],
  onUpdate,
  onRemove,
  canRemove,
}: FocusItemInputProps) {
  const [showGoalLink, setShowGoalLink] = useState(!!item.linked_goal_id)

  const handleNameChange = (name: string) => {
    onUpdate(index, { ...item, name })
  }

  const handleGoalLink = (goalId: string) => {
    onUpdate(index, { ...item, linked_goal_id: goalId || undefined })
  }

  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-400 font-medium mt-2">{index + 1}.</span>

      <div className="flex-1 space-y-2">
        <Input
          value={item.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="What are you focusing on?"
          className="bg-white"
        />

        {showGoalLink && predictions.length > 0 && (
          <select
            value={item.linked_goal_id || ''}
            onChange={(e) => handleGoalLink(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66]/20 focus:border-[#0D7C66]"
          >
            <option value="">No goal linked</option>
            {predictions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}

        {predictions.length > 0 && !showGoalLink && (
          <button
            type="button"
            onClick={() => setShowGoalLink(true)}
            className="text-sm text-[#0D7C66] hover:underline"
          >
            Link to a goal
          </button>
        )}
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="mt-1 text-gray-400 hover:text-red-500 border-none hover:bg-red-50"
          aria-label="Remove focus item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  )
}
