import { useState } from 'react'
import { Card } from '../ui'
import type { Permission, FocusItem } from '@finding-good/shared'

interface InfluenceSectionProps {
  permission: Permission | null
  loading: boolean
  onSave: (data: {
    practice: string
    permission: string
    focus: FocusItem[]
  }) => Promise<{ success: boolean; error?: string }>
}

type EditingField = 'permission' | 'practice' | 'focus' | null

export function InfluenceSection({ permission, loading, onSave }: InfluenceSectionProps) {
  const [editing, setEditing] = useState<EditingField>(null)
  const [editPermission, setEditPermission] = useState('')
  const [editPractice, setEditPractice] = useState('')
  const [editFocus, setEditFocus] = useState<FocusItem[]>([])
  const [newFocusName, setNewFocusName] = useState('')
  const [saving, setSaving] = useState(false)

  const startEdit = (field: EditingField) => {
    setEditPermission(permission?.permission || '')
    setEditPractice(permission?.practice || '')
    setEditFocus(permission?.focus || [])
    setNewFocusName('')
    setEditing(field)
  }

  const cancelEdit = () => {
    setEditing(null)
  }

  const saveField = async () => {
    setSaving(true)
    let focusToSave = editing === 'focus' ? editFocus : (permission?.focus || [])

    // Auto-add pending focus input before saving
    if (editing === 'focus') {
      const pending = newFocusName.trim()
      if (pending && focusToSave.length < 3) {
        focusToSave = [...focusToSave, { name: pending, order: focusToSave.length }]
      }
    }

    const data = {
      permission: editing === 'permission' ? editPermission : (permission?.permission || ''),
      practice: editing === 'practice' ? editPractice : (permission?.practice || ''),
      focus: focusToSave,
    }
    const result = await onSave(data)
    setSaving(false)
    if (result.success) {
      setNewFocusName('')
      setEditing(null)
    }
  }

  const addFocusItem = () => {
    const name = newFocusName.trim()
    if (!name) return
    setEditFocus(prev => [...prev, { name, order: prev.length }])
    setNewFocusName('')
  }

  const removeFocusItem = (index: number) => {
    setEditFocus(prev => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })))
  }

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

  const hasData = permission?.permission || permission?.practice || (permission?.focus && permission.focus.length > 0)

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600 mb-4">YOUR INFLUENCE</div>

      {/* Permission */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permission</div>
          {editing !== 'permission' && (
            <button
              onClick={() => startEdit('permission')}
              className="text-xs text-brand-primary hover:underline"
            >
              {permission?.permission ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
        {editing === 'permission' ? (
          <div className="space-y-2">
            <textarea
              value={editPermission}
              onChange={e => setEditPermission(e.target.value)}
              placeholder="What do you want to create more of in the world?"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveField}
                disabled={saving}
                className="px-3 py-1 text-xs bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800">
            {permission?.permission || (
              <span className="text-gray-400 italic">What do you want to create more of in the world?</span>
            )}
          </p>
        )}
      </div>

      {/* Practice */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Practice</div>
          {editing !== 'practice' && (
            <button
              onClick={() => startEdit('practice')}
              className="text-xs text-brand-primary hover:underline"
            >
              {permission?.practice ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
        {editing === 'practice' ? (
          <div className="space-y-2">
            <textarea
              value={editPractice}
              onChange={e => setEditPractice(e.target.value)}
              placeholder="How are you living this out with others?"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveField}
                disabled={saving}
                className="px-3 py-1 text-xs bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800">
            {permission?.practice || (
              <span className="text-gray-400 italic">How are you living this out with others?</span>
            )}
          </p>
        )}
      </div>

      {/* Focus Items */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Focus</div>
          {editing !== 'focus' && (
            <button
              onClick={() => startEdit('focus')}
              className="text-xs text-brand-primary hover:underline"
            >
              {permission?.focus && permission.focus.length > 0 ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
        {editing === 'focus' ? (
          <div className="space-y-2">
            {editFocus.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-gray-800 flex-1">{item.name}</span>
                <button
                  onClick={() => removeFocusItem(i)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {editFocus.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFocusName}
                  onChange={e => setNewFocusName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFocusItem()}
                  placeholder="Add a focus item..."
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <button
                  onClick={addFocusItem}
                  className="px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={saveField}
                disabled={saving}
                className="px-3 py-1 text-xs bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {permission?.focus && permission.focus.length > 0 ? (
              <ul className="space-y-1">
                {permission.focus.map((item, i) => (
                  <li key={i} className="text-sm text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full flex-shrink-0" />
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">Add 1-3 daily focus items</p>
            )}
          </div>
        )}
      </div>

      {/* Empty state guidance */}
      {!hasData && editing === null && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Define your influence to set your daily direction
          </p>
        </div>
      )}
    </Card>
  )
}
