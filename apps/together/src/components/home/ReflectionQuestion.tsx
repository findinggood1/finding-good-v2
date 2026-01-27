import { useState } from 'react'

interface ReflectionQuestionProps {
  question: string
  savedAnswer: string | null
  onSave: (answer: string, questionShown: string) => Promise<void>
}

export function ReflectionQuestion({ question, savedAnswer, onSave }: ReflectionQuestionProps) {
  const [answer, setAnswer] = useState(savedAnswer || '')
  const [saving, setSaving] = useState(false)
  const [isLocked, setIsLocked] = useState(!!savedAnswer)

  const handleSave = async () => {
    if (!answer.trim()) return
    setSaving(true)
    await onSave(answer.trim(), question)
    setSaving(false)
    setIsLocked(true)
  }

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Reflection
      </div>
      <p className="text-sm text-gray-700 mb-2 italic">{question}</p>

      {isLocked ? (
        <div>
          <p className="text-sm text-gray-800 bg-gray-50 rounded-md p-3">{answer}</p>
          <button
            onClick={() => setIsLocked(false)}
            className="mt-1 text-xs text-brand-primary hover:underline"
          >
            Edit
          </button>
        </div>
      ) : (
        <div>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Your thoughts..."
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
            rows={3}
            autoFocus={!savedAnswer}
          />
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleSave}
              disabled={saving || !answer.trim()}
              className="px-3 py-1 text-xs bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {savedAnswer && (
              <button
                onClick={() => { setAnswer(savedAnswer); setIsLocked(true) }}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
