import { useState, useEffect } from 'react'
import { Textarea, Button } from '@finding-good/shared'
import type { Permission, FocusItem, Prediction } from '@finding-good/shared'
import { FocusItemInput } from './FocusItemInput'

interface FocusSetupFormProps {
  initialPermission?: Permission | null
  predictions?: Prediction[]
  onSave: (data: { practice: string; permission: string; focus: FocusItem[] }) => void
  saving?: boolean
}

const MAX_FOCUS_ITEMS = 3

export function FocusSetupForm({
  initialPermission,
  predictions = [],
  onSave,
  saving = false,
}: FocusSetupFormProps) {
  const [practice, setPractice] = useState(initialPermission?.practice || '')
  const [permission, setPermission] = useState(initialPermission?.permission || '')
  const [focusItems, setFocusItems] = useState<FocusItem[]>(
    initialPermission?.focus?.length
      ? initialPermission.focus
      : [{ name: '', order: 0 }]
  )

  // Sync with initialPermission when it changes
  useEffect(() => {
    if (initialPermission) {
      setPractice(initialPermission.practice || '')
      setPermission(initialPermission.permission || '')
      setFocusItems(
        initialPermission.focus?.length
          ? initialPermission.focus
          : [{ name: '', order: 0 }]
      )
    }
  }, [initialPermission])

  const handleUpdateFocus = (index: number, item: FocusItem) => {
    const updated = [...focusItems]
    updated[index] = { ...item, order: index }
    setFocusItems(updated)
  }

  const handleRemoveFocus = (index: number) => {
    if (focusItems.length <= 1) return
    const updated = focusItems.filter((_, i) => i !== index)
    // Re-order remaining items
    setFocusItems(updated.map((item, i) => ({ ...item, order: i })))
  }

  const handleAddFocus = () => {
    if (focusItems.length >= MAX_FOCUS_ITEMS) return
    setFocusItems([...focusItems, { name: '', order: focusItems.length }])
  }

  const hasValidFocus = focusItems.some((f) => f.name.trim())
  const [showValidationError, setShowValidationError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasValidFocus) {
      setShowValidationError(true)
      return
    }
    setShowValidationError(false)
    const validFocus = focusItems.filter((f) => f.name.trim())
    onSave({
      practice: practice.trim(),
      permission: permission.trim(),
      focus: validFocus,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Permission - What you want more of */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          YOUR PERMISSION
          <span className="text-gray-400 font-normal ml-2">(optional)</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">What do you want more of?</p>
        <Textarea
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
          placeholder="Build meaningful connections"
          rows={2}
          className="min-h-[60px]"
        />
      </div>

      {/* Practice - The theme */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          YOUR PRACTICE
          <span className="text-gray-400 font-normal ml-2">(optional)</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">The theme that runs through your days</p>
        <Textarea
          value={practice}
          onChange={(e) => setPractice(e.target.value)}
          placeholder="Showing up authentically"
          rows={2}
          className="min-h-[60px]"
        />
      </div>

      {/* Focus Items */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          YOUR FOCUS
          <span className="text-gray-400 font-normal ml-2">(1-3 items)</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">Specific things you're paying attention to daily</p>

        <div className="space-y-2">
          {focusItems.map((item, index) => (
            <FocusItemInput
              key={index}
              item={item}
              index={index}
              predictions={predictions}
              onUpdate={handleUpdateFocus}
              onRemove={handleRemoveFocus}
              canRemove={focusItems.length > 1}
            />
          ))}
        </div>

        {focusItems.length < MAX_FOCUS_ITEMS && (
          <button
            type="button"
            onClick={handleAddFocus}
            className="mt-3 flex items-center gap-2 text-[#0D7C66] hover:text-[#095c4d] font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add focus item
          </button>
        )}

        {showValidationError && !hasValidFocus && (
          <p className="text-sm text-red-600 mt-2">
            Please add at least one focus item with a name.
          </p>
        )}
      </div>

      {/* Helper Text */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          Don't know your Permission yet? That's OK. Start with just your Focus items.
          What emerges through daily check-ins will reveal your Practice.
        </p>
      </div>

      {/* Save Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!hasValidFocus || saving}
        loading={saving}
      >
        Save Focus
      </Button>
    </form>
  )
}
