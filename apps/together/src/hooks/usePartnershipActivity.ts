// apps/together/src/hooks/usePartnershipActivity.ts

import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface PartnerActivityEntry {
  id: string
  type: 'impact' | 'improve' | 'inspire'
  preview: string
  date: string
  table: string  // For linking back to full entry
}

export interface PartnershipActivity {
  sentToPartner: PartnerActivityEntry[]
  receivedFromPartner: PartnerActivityEntry[]
  totalExchanges: number
}

export function usePartnershipActivity(partnerEmail: string | null) {
  const { user } = useAuth()
  const [activity, setActivity] = useState<PartnershipActivity>({
    sentToPartner: [],
    receivedFromPartner: [],
    totalExchanges: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email || !partnerEmail) {
      setActivity({ sentToPartner: [], receivedFromPartner: [], totalExchanges: 0 })
      setLoading(false)
      return
    }

    const fetchActivity = async () => {
      try {
        const supabase = getSupabase()
        const sent: PartnerActivityEntry[] = []
        const received: PartnerActivityEntry[] = []

        // Fetch priorities (Impact) - what I sent to partner
        const { data: sentPriorities } = await supabase
          .from('priorities')
          .select('id, created_at, responses')
          .eq('client_email', user.email)
          .eq('recipient_email', partnerEmail)
          .order('created_at', { ascending: false })
          .limit(10)

        for (const p of sentPriorities ?? []) {
          sent.push({
            id: p.id,
            type: 'impact',
            preview: p.responses?.what_i_did || p.responses?.what_mattered || 'Impact entry',
            date: p.created_at,
            table: 'priorities'
          })
        }

        // Fetch priorities - what partner sent to me
        const { data: receivedPriorities } = await supabase
          .from('priorities')
          .select('id, created_at, responses')
          .eq('client_email', partnerEmail)
          .eq('recipient_email', user.email)
          .order('created_at', { ascending: false })
          .limit(10)

        for (const p of receivedPriorities ?? []) {
          received.push({
            id: p.id,
            type: 'impact',
            preview: p.responses?.what_i_did || p.responses?.what_mattered || 'Impact entry',
            date: p.created_at,
            table: 'priorities'
          })
        }

        // Fetch validations (Improve) - what I sent to partner
        const { data: sentValidations } = await supabase
          .from('validations')
          .select('id, created_at, responses')
          .eq('client_email', user.email)
          .eq('recipient_email', partnerEmail)
          .order('created_at', { ascending: false })
          .limit(10)

        for (const v of sentValidations ?? []) {
          sent.push({
            id: v.id,
            type: 'improve',
            preview: v.responses?.what_happened || v.responses?.accomplishment || 'Improve entry',
            date: v.created_at,
            table: 'validations'
          })
        }

        // Fetch validations - what partner sent to me
        const { data: receivedValidations } = await supabase
          .from('validations')
          .select('id, created_at, responses')
          .eq('client_email', partnerEmail)
          .eq('recipient_email', user.email)
          .order('created_at', { ascending: false })
          .limit(10)

        for (const v of receivedValidations ?? []) {
          received.push({
            id: v.id,
            type: 'improve',
            preview: v.responses?.what_happened || v.responses?.accomplishment || 'Improve entry',
            date: v.created_at,
            table: 'validations'
          })
        }

        // Fetch inspire_others (Inspire) - what I sent to partner
        const { data: sentInspires } = await supabase
          .from('inspire_others')
          .select('id, created_at, belief_statement')
          .eq('sender_email', user.email)
          .eq('recipient_email', partnerEmail)
          .order('created_at', { ascending: false })
          .limit(10)

        for (const i of sentInspires ?? []) {
          sent.push({
            id: i.id,
            type: 'inspire',
            preview: i.belief_statement || 'Inspire entry',
            date: i.created_at,
            table: 'inspire_others'
          })
        }

        // Fetch inspire_others - what partner sent to me
        const { data: receivedInspires } = await supabase
          .from('inspire_others')
          .select('id, created_at, belief_statement')
          .eq('sender_email', partnerEmail)
          .eq('recipient_email', user.email)
          .order('created_at', { ascending: false })
          .limit(10)

        for (const i of receivedInspires ?? []) {
          received.push({
            id: i.id,
            type: 'inspire',
            preview: i.belief_statement || 'Inspire entry',
            date: i.created_at,
            table: 'inspire_others'
          })
        }

        // Sort by date
        sent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        received.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setActivity({
          sentToPartner: sent,
          receivedFromPartner: received,
          totalExchanges: sent.length + received.length
        })
      } catch (err) {
        console.error('Error fetching partnership activity:', err)
        setError(err instanceof Error ? err.message : 'Failed to load activity')
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [user?.email, partnerEmail])

  return { activity, loading, error }
}
