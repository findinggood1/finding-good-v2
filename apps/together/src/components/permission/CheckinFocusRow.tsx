import { EngagementIndicator } from '@finding-good/shared'
import type { FocusScore } from '@finding-good/shared'

interface CheckinFocusRowProps {
  focusName: string
  score: FocusScore
  onToggle: (completed: boolean) => void
  onEngagementChange: (engagement: number) => void
}

export function CheckinFocusRow({
  focusName,
  score,
  onToggle,
  onEngagementChange,
}: CheckinFocusRowProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(e.target.checked)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Checkbox + Label */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={score.completed}
          onChange={handleCheckboxChange}
          className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#0D7C66] focus:ring-[#0D7C66] cursor-pointer"
        />
        <span className={`font-medium ${score.completed ? 'text-gray-900' : 'text-gray-600'}`}>
          {focusName}
        </span>
      </label>

      {/* Engagement indicator - only show when checked */}
      {score.completed && (
        <div className="mt-3 ml-8">
          <p className="text-sm text-gray-500 mb-2">How engaged were you?</p>
          <EngagementIndicator
            value={score.engagement || 0}
            max={5}
            size="lg"
            interactive
            onChange={onEngagementChange}
          />
          {score.engagement ? (
            <p className="text-xs text-gray-400 mt-1">{score.engagement}/5</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Tap to rate</p>
          )}
        </div>
      )}
    </div>
  )
}
