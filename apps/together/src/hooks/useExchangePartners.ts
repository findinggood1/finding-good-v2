// apps/together/src/hooks/useExchangePartners.ts

import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface ExchangePartner {
  id: string
  email: string
  name?: string
  direction: 'invited' | 'invited_by'  // Did I invite them, or did they invite me?
  connectedAt: string
  invitationMessage?: string
}

export function useExchangePartners() {
  const { user } = useAuth()
  const [partners, setPartners] = useState<ExchangePartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setPartners([])
      setLoading(false)
      return
    }

    const fetchPartners = async () => {
      try {
        const supabase = getSupabase()

        // Get all accepted partnerships where user is inviter OR invitee
        const { data, error: fetchError } = await supabase
          .from('exchange_partnerships')
          .select('*')
          .eq('status', 'accepted')
          .or(`inviter_email.eq.${user.email},invitee_email.eq.${user.email}`)
          .order('responded_at', { ascending: false })

        if (fetchError) throw fetchError

        // Transform to ExchangePartner format
        const transformed: ExchangePartner[] = (data ?? []).map(p => {
          const isInviter = p.inviter_email === user.email
          return {
            id: p.id,
            email: isInviter ? p.invitee_email : p.inviter_email,
            direction: isInviter ? 'invited' : 'invited_by',
            connectedAt: p.responded_at || p.invited_at,
            invitationMessage: p.invitation_message,
          }
        })

        // TODO: Fetch names from clients table if needed
        // For now, we'll get names in the component or add a join later

        setPartners(transformed)
      } catch (err) {
        console.error('Error fetching exchange partners:', err)
        setError(err instanceof Error ? err.message : 'Failed to load partners')
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [user?.email])

  return { partners, loading, error }
}
