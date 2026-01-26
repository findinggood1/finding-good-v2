import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { Permission, FocusItem } from '@finding-good/shared'

export interface UsePermissionReturn {
  permission: Permission | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  savePermission: (data: {
    practice: string
    permission: string
    focus: FocusItem[]
  }) => Promise<{ success: boolean; error?: string }>
}

export function usePermission(): UsePermissionReturn {
  const { user } = useAuth()
  const [permission, setPermission] = useState<Permission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermission = useCallback(async () => {
    if (!user?.email) {
      setPermission(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: fetchError } = await supabase
        .from('permissions')
        .select('*')
        .eq('client_email', user.email)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setPermission(data as Permission | null)
      setError(null)
    } catch (err) {
      console.error('Error fetching permission:', err)
      setError('Failed to load your focus data')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchPermission()
  }, [fetchPermission])

  const savePermission = useCallback(
    async (data: { practice: string; permission: string; focus: FocusItem[] }) => {
      if (!user?.email) {
        return { success: false, error: 'Not authenticated' }
      }

      try {
        const supabase = getSupabase()
        const today = new Date().toISOString().split('T')[0]

        // Track focus history changes
        const oldFocusNames = new Set(permission?.focus?.map((f) => f.name) || [])
        const newFocusNames = new Set(data.focus.map((f) => f.name))

        const removedFocus = [...oldFocusNames].filter((name) => !newFocusNames.has(name))
        const addedFocus = [...newFocusNames].filter((name) => !oldFocusNames.has(name))

        // Create focus_history entries for removed items
        if (removedFocus.length > 0) {
          await supabase.from('focus_history').insert(
            removedFocus.map((focus_name) => ({
              client_email: user.email,
              focus_name,
              started_at: today,
              ended_at: today,
              reason: 'paused',
            }))
          )
        }

        // Create focus_history entries for new items
        if (addedFocus.length > 0 && permission?.id) {
          await supabase.from('focus_history').insert(
            addedFocus.map((focus_name) => ({
              client_email: user.email,
              focus_name,
              started_at: today,
            }))
          )
        }

        if (permission?.id) {
          // Update existing
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
          // Create new
          const { error: insertError } = await supabase.from('permissions').insert({
            client_email: user.email,
            practice: data.practice || null,
            permission: data.permission || null,
            focus: data.focus,
          })

          if (insertError) throw insertError

          // Create initial focus_history for new permission
          if (data.focus.length > 0) {
            await supabase.from('focus_history').insert(
              data.focus.map((f) => ({
                client_email: user.email,
                focus_name: f.name,
                started_at: today,
              }))
            )
          }
        }

        await fetchPermission()
        return { success: true }
      } catch (err) {
        console.error('Error saving permission:', err)
        return { success: false, error: 'Failed to save your focus' }
      }
    },
    [user?.email, permission, fetchPermission]
  )

  return {
    permission,
    loading,
    error,
    refetch: fetchPermission,
    savePermission,
  }
}
