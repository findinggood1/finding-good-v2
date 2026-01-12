import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface CoachingNote {
  id: string
  client_email: string
  coach_email: string
  note: string
  created_at: string
}

export function useCoachingNotes(clientEmail: string | undefined) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<CoachingNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!user?.email || !clientEmail) {
      setNotes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      const { data, error: fetchError } = await supabase
        .from('coaching_notes')
        .select('*')
        .eq('coach_email', user.email)
        .eq('client_email', clientEmail)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setNotes(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }, [user?.email, clientEmail])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = useCallback(async (noteText: string) => {
    if (!user?.email || !clientEmail) return null

    try {
      const supabase = getSupabase()

      const { data, error: insertError } = await supabase
        .from('coaching_notes')
        .insert({
          client_email: clientEmail,
          coach_email: user.email,
          note: noteText,
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchNotes()
      return data
    } catch (err) {
      console.error('Error adding note:', err)
      setError(err instanceof Error ? err.message : 'Failed to add note')
      return null
    }
  }, [user?.email, clientEmail, fetchNotes])

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user?.email) return false

    try {
      const supabase = getSupabase()

      const { error: deleteError } = await supabase
        .from('coaching_notes')
        .delete()
        .eq('id', noteId)
        .eq('coach_email', user.email)

      if (deleteError) throw deleteError

      await fetchNotes()
      return true
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete note')
      return false
    }
  }, [user?.email, fetchNotes])

  return { notes, loading, error, addNote, deleteNote, refetch: fetchNotes }
}
