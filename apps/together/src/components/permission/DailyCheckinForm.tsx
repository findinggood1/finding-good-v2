import { useState } from 'react'
import { Button } from '@finding-good/shared'
import type { FocusItem, FocusScore } from '@finding-good/shared'
import { CheckinFocusRow } from './CheckinFocusRow'
import { SomethingElseRow } from './SomethingElseRow'

interface DailyCheckinFormProps {
  focusItems: FocusItem[]
  onSubmit: (scores: FocusScore[]) => void
  submitting?: boolean
}

export function DailyCheckinForm({
  focusItems,
  onSubmit,
  submitting = false,
}: DailyCheckinFormProps) {
  // Initialize scores for each focus item
  const [scores, setScores] = useState<FocusScore[]>(
    focusItems.map((item) => ({
      focus_name: item.name,
      completed: false,
      engagement: null,
      emerged_text: null,
    }))
  )

  // "Something else emerged" state
  const [emergedChecked, setEmergedChecked] = useState(false)
  const [emergedText, setEmergedText] = useState('')

  const handleToggle = (index: number, completed: boolean) => {
    const updated = [...scores]
    updated[index] = {
      ...updated[index],
      completed,
      // Reset engagement if unchecked
      engagement: completed ? updated[index].engagement : null,
    }
    setScores(updated)
  }

  const handleEngagementChange = (index: number, engagement: number) => {
    const updated = [...scores]
    updated[index] = { ...updated[index], engagement }
    setScores(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Build final scores array including emerged text if applicable
    const finalScores: FocusScore[] = scores.map((s) => ({
      ...s,
      // Ensure we have proper null values
      engagement: s.completed ? s.engagement : null,
    }))

    // If something emerged, add it as a special entry
    if (emergedChecked && emergedText.trim()) {
      finalScores.push({
        focus_name: '_emerged',
        completed: true,
        engagement: null,
        emerged_text: emergedText.trim(),
      })
    }

    onSubmit(finalScores)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Focus Items */}
      {focusItems.map((item, index) => (
        <CheckinFocusRow
          key={item.name}
          focusName={item.name}
          score={scores[index]}
          onToggle={(completed) => handleToggle(index, completed)}
          onEngagementChange={(engagement) => handleEngagementChange(index, engagement)}
        />
      ))}

      {/* Something Else Emerged */}
      <SomethingElseRow
        checked={emergedChecked}
        text={emergedText}
        onToggle={setEmergedChecked}
        onTextChange={setEmergedText}
      />

      {/* Helper Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          It's OK to check in with 0 items completed. The check-in itself is the practice.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={submitting}
        loading={submitting}
      >
        Done
      </Button>
    </form>
  )
}
