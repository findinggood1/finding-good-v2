import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner, getSupabase, useAuth } from '@finding-good/shared'
import type { Permission, Prediction, FocusItem } from '@finding-good/shared'
import { FocusSetupForm } from '../../components/permission'

export function FocusSetupPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [permission, setPermission] = useState<Permission | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing permission and predictions
  useEffect(() => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const supabase = getSupabase()

        // Fetch current permission
        const { data: permData, error: permError } = await supabase
          .from('permissions')
          .select('*')
          .eq('client_email', user.email)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        if (permError && permError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine for new users
          throw permError
        }

        if (permData) {
          setPermission(permData as Permission)
        }

        // Fetch user's active predictions for goal linking
        const { data: predData, error: predError } = await supabase
          .from('predictions')
          .select('id, title, client_email, description, type, status, rank, scores, counts, created_at, updated_at')
          .eq('client_email', user.email)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (predError) throw predError

        setPredictions((predData || []) as Prediction[])
      } catch (err) {
        console.error('Error loading permission data:', err)
        setError('Failed to load your focus data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.email])

  const handleSave = async (data: {
    practice: string
    permission: string
    focus: FocusItem[]
  }) => {
    if (!user?.email) return

    setSaving(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const today = new Date().toISOString().split('T')[0]

      // Track focus history changes
      const oldFocusNames = new Set(permission?.focus?.map((f) => f.name) || [])
      const newFocusNames = new Set(data.focus.map((f) => f.name))

      // Find removed focus items (in old but not in new)
      const removedFocus = [...oldFocusNames].filter((name) => !newFocusNames.has(name))

      // Find added focus items (in new but not in old)
      const addedFocus = [...newFocusNames].filter((name) => !oldFocusNames.has(name))

      // Create focus_history entries for removed items
      if (removedFocus.length > 0) {
        const removedEntries = removedFocus.map((focus_name) => ({
          client_email: user.email,
          focus_name,
          started_at: today, // We don't know when it started, use today as placeholder
          ended_at: today,
          reason: 'paused' as const,
        }))

        const { error: historyError } = await supabase
          .from('focus_history')
          .insert(removedEntries)

        if (historyError) {
          console.error('Error creating focus history for removed items:', historyError)
          // Non-blocking - continue with save
        }
      }

      // Create focus_history entries for new items (started today)
      if (addedFocus.length > 0) {
        const addedEntries = addedFocus.map((focus_name) => ({
          client_email: user.email,
          focus_name,
          started_at: today,
        }))

        const { error: historyError } = await supabase
          .from('focus_history')
          .insert(addedEntries)

        if (historyError) {
          console.error('Error creating focus history for new items:', historyError)
          // Non-blocking - continue with save
        }
      }

      if (permission?.id) {
        // Update existing permission
        const { error: updateError } = await supabase
          .from('permissions')
          .update({
            practice: data.practice || null,
            permission: data.permission || null,
            focus: data.focus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', permission.id)

        if (updateError) throw updateError
      } else {
        // Create new permission
        const { error: insertError } = await supabase.from('permissions').insert({
          client_email: user.email,
          practice: data.practice || null,
          permission: data.permission || null,
          focus: data.focus,
        })

        if (insertError) throw insertError

        // For brand new permissions, also create focus_history for initial items
        if (data.focus.length > 0) {
          const initialEntries = data.focus.map((f) => ({
            client_email: user.email,
            focus_name: f.name,
            started_at: today,
          }))

          const { error: historyError } = await supabase
            .from('focus_history')
            .insert(initialEntries)

          if (historyError) {
            console.error('Error creating initial focus history:', historyError)
          }
        }
      }

      // Navigate to home or today page after save
      navigate('/')
    } catch (err) {
      console.error('Error saving permission:', err)
      setError('Failed to save your focus. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Focus</h1>
          <p className="text-gray-600 text-sm mt-1">
            {permission ? 'Edit your daily focus' : 'Set up your daily focus'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <FocusSetupForm
        initialPermission={permission}
        predictions={predictions}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}
