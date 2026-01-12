import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface ScheduledSession {
  id: string
  client_email: string
  coach_email: string
  scheduled_at: string
  status: string
  notes: string | null
  created_at: string
}

export interface SessionTranscript {
  id: string
  session_id: string | null
  client_email: string
  coach_email: string
  transcript: string
  ai_summary: string | null
  created_at: string
}

export interface CoachingSession {
  id: string
  client_email: string
  coach_email: string
  scheduled_at: string
  status: string
  notes: string | null
  transcript: SessionTranscript | null
  created_at: string
}

export function useCoachingSessions(clientEmail: string | undefined) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [transcripts, setTranscripts] = useState<SessionTranscript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!user?.email || !clientEmail) {
      setSessions([])
      setTranscripts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      // Fetch scheduled sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('coach_email', user.email)
        .eq('client_email', clientEmail)
        .order('scheduled_at', { ascending: false })

      if (sessionsError) throw sessionsError

      // Fetch transcripts
      const { data: transcriptsData, error: transcriptsError } = await supabase
        .from('session_transcripts')
        .select('*')
        .eq('coach_email', user.email)
        .eq('client_email', clientEmail)
        .order('created_at', { ascending: false })

      if (transcriptsError) throw transcriptsError

      setTranscripts(transcriptsData || [])

      // Combine sessions with their transcripts
      const combinedSessions: CoachingSession[] = (sessionsData || []).map(session => ({
        ...session,
        transcript: transcriptsData?.find(t => t.session_id === session.id) || null,
      }))

      setSessions(combinedSessions)
      setError(null)
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }, [user?.email, clientEmail])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const addSession = useCallback(async (session: {
    client_email: string
    scheduled_at: string
    notes?: string
    status?: string
  }) => {
    if (!user?.email) return null

    try {
      const supabase = getSupabase()

      const { data, error: insertError } = await supabase
        .from('scheduled_sessions')
        .insert({
          ...session,
          coach_email: user.email,
          status: session.status || 'scheduled',
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchSessions()
      return data
    } catch (err) {
      console.error('Error adding session:', err)
      setError(err instanceof Error ? err.message : 'Failed to add session')
      return null
    }
  }, [user?.email, fetchSessions])

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<Pick<ScheduledSession, 'scheduled_at' | 'status' | 'notes'>>
  ) => {
    if (!user?.email) return null

    try {
      const supabase = getSupabase()

      const { data, error: updateError } = await supabase
        .from('scheduled_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('coach_email', user.email)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchSessions()
      return data
    } catch (err) {
      console.error('Error updating session:', err)
      setError(err instanceof Error ? err.message : 'Failed to update session')
      return null
    }
  }, [user?.email, fetchSessions])

  const addTranscript = useCallback(async (
    sessionId: string | null,
    transcriptText: string
  ) => {
    if (!user?.email || !clientEmail) return null

    try {
      const supabase = getSupabase()

      const { data, error: insertError } = await supabase
        .from('session_transcripts')
        .insert({
          session_id: sessionId,
          client_email: clientEmail,
          coach_email: user.email,
          transcript: transcriptText,
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchSessions()
      return data
    } catch (err) {
      console.error('Error adding transcript:', err)
      setError(err instanceof Error ? err.message : 'Failed to add transcript')
      return null
    }
  }, [user?.email, clientEmail, fetchSessions])

  const updateTranscript = useCallback(async (
    transcriptId: string,
    updates: Partial<Pick<SessionTranscript, 'transcript' | 'ai_summary'>>
  ) => {
    if (!user?.email) return null

    try {
      const supabase = getSupabase()

      const { data, error: updateError } = await supabase
        .from('session_transcripts')
        .update(updates)
        .eq('id', transcriptId)
        .eq('coach_email', user.email)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchSessions()
      return data
    } catch (err) {
      console.error('Error updating transcript:', err)
      setError(err instanceof Error ? err.message : 'Failed to update transcript')
      return null
    }
  }, [user?.email, fetchSessions])

  const generateAISummary = useCallback(async (transcriptId: string, transcriptText: string) => {
    // Placeholder for AI summary generation - would call edge function
    const summary = 'AI summary generation coming soon. Transcript length: ' + transcriptText.length + ' characters.'
    return updateTranscript(transcriptId, { ai_summary: summary })
  }, [updateTranscript])

  return {
    sessions,
    transcripts,
    loading,
    error,
    addSession,
    updateSession,
    addTranscript,
    updateTranscript,
    generateAISummary,
    refetch: fetchSessions
  }
}
