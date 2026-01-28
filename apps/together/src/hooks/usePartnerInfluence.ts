// apps/together/src/hooks/usePartnerInfluence.ts

import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FocusItem } from '@finding-good/shared'

export interface PartnerInfluence {
  email: string
  name?: string
  permission: string | null
  practice: string | null
  focus: FocusItem[]
  // This week's activity stats
  weeklyStats: {
    checkinDays: number  // out of 7
    impactEntries: number
  }
}

export interface UsePartnerInfluenceReturn {
  influence: PartnerInfluence | null
  loading: boolean
  error: string | null
  isPartner: boolean  // Whether there's an accepted partnership
}

export function usePartnerInfluence(partnerEmail: string | null): UsePartnerInfluenceReturn {
  const { user } = useAuth()
  const [influence, setInfluence] = useState<PartnerInfluence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPartner, setIsPartner] = useState(false)

  useEffect(() => {
    if (!user?.email || !partnerEmail) {
      setInfluence(null)
      setLoading(false)
      setIsPartner(false)
      return
    }

    const fetchPartnerInfluence = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()

        // First, verify there's an accepted partnership
        const { data: partnership, error: partnershipError } = await supabase
          .from('exchange_partnerships')
          .select('id, status')
          .eq('status', 'accepted')
          .or(`and(inviter_email.eq.${user.email},invitee_email.eq.${partnerEmail}),and(inviter_email.eq.${partnerEmail},invitee_email.eq.${user.email})`)
          .single()

        if (partnershipError || !partnership) {
          setIsPartner(false)
          setInfluence(null)
          setError('No active partnership found')
          setLoading(false)
          return
        }

        setIsPartner(true)

        // Fetch partner's permission (their Influence declaration)
        const { data: permissionData } = await supabase
          .from('permissions')
          .select('permission, practice, focus')
          .eq('client_email', partnerEmail)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        // Fetch partner's name from clients table
        const { data: clientData } = await supabase
          .from('clients')
          .select('name')
          .eq('email', partnerEmail)
          .single()

        // Calculate this week's stats
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoDate = weekAgo.toISOString().split('T')[0]

        // Get check-in count for this week
        const { count: checkinCount } = await supabase
          .from('daily_checkins')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', partnerEmail)
          .gte('check_date', weekAgoDate)

        // Get impact entries count for this week
        const { count: impactCount } = await supabase
          .from('priorities')
          .select('id', { count: 'exact', head: true })
          .eq('client_email', partnerEmail)
          .gte('created_at', weekAgo.toISOString())

        setInfluence({
          email: partnerEmail,
          name: clientData?.name || undefined,
          permission: permissionData?.permission || null,
          practice: permissionData?.practice || null,
          focus: (permissionData?.focus as FocusItem[]) || [],
          weeklyStats: {
            checkinDays: checkinCount ?? 0,
            impactEntries: impactCount ?? 0,
          },
        })

        setError(null)
      } catch (err) {
        console.error('Error fetching partner influence:', err)
        setError(err instanceof Error ? err.message : 'Failed to load partner data')
      } finally {
        setLoading(false)
      }
    }

    fetchPartnerInfluence()
  }, [user?.email, partnerEmail])

  return { influence, loading, error, isPartner }
}
