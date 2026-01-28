// apps/together/src/hooks/useExchangeInvitations.ts

import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface PendingInvitation {
  id: string
  fromEmail: string
  fromName?: string
  message?: string
  invitedAt: string
}

export function useExchangeInvitations() {
  const { user } = useAuth()
  const [pending, setPending] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPending = useCallback(async () => {
    if (!user?.email) {
      setPending([])
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabase()

      const { data, error: fetchError } = await supabase
        .from('exchange_partnerships')
        .select('*')
        .eq('invitee_email', user.email)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false })

      if (fetchError) throw fetchError

      const transformed: PendingInvitation[] = (data ?? []).map(p => ({
        id: p.id,
        fromEmail: p.inviter_email,
        message: p.invitation_message,
        invitedAt: p.invited_at,
      }))

      setPending(transformed)
    } catch (err) {
      console.error('Error fetching pending invitations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const accept = useCallback(async (invitationId: string) => {
    try {
      const supabase = getSupabase()

      const { error: updateError } = await supabase
        .from('exchange_partnerships')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (updateError) throw updateError

      // Remove from pending list
      setPending(prev => prev.filter(p => p.id !== invitationId))
      return { success: true }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to accept' }
    }
  }, [])

  const decline = useCallback(async (invitationId: string) => {
    try {
      const supabase = getSupabase()

      const { error: updateError } = await supabase
        .from('exchange_partnerships')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (updateError) throw updateError

      // Remove from pending list
      setPending(prev => prev.filter(p => p.id !== invitationId))
      return { success: true }
    } catch (err) {
      console.error('Error declining invitation:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to decline' }
    }
  }, [])

  const invite = useCallback(async (email: string, message?: string) => {
    if (!user?.email) {
      return { success: false, error: 'Not logged in' }
    }

    // Validation
    if (email === user.email) {
      return { success: false, error: "You can't invite yourself" }
    }

    try {
      const supabase = getSupabase()

      // Check if already exists
      const { data: existing } = await supabase
        .from('exchange_partnerships')
        .select('id, status')
        .or(`and(inviter_email.eq.${user.email},invitee_email.eq.${email}),and(inviter_email.eq.${email},invitee_email.eq.${user.email})`)
        .single()

      if (existing) {
        if (existing.status === 'accepted') {
          return { success: false, error: 'Already connected with this person' }
        }
        if (existing.status === 'pending') {
          return { success: false, error: 'Invitation already pending' }
        }
      }

      const { error: insertError } = await supabase
        .from('exchange_partnerships')
        .insert({
          inviter_email: user.email,
          invitee_email: email,
          invitation_message: message || null,
          status: 'pending'
        })

      if (insertError) throw insertError

      return { success: true }
    } catch (err) {
      console.error('Error sending invitation:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send invitation' }
    }
  }, [user?.email])

  return { pending, loading, error, accept, decline, invite, refetch: fetchPending }
}
