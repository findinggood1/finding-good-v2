import { useState, useEffect, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface ActivityEntry {
  id: string
  type: 'impact' | 'improve' | 'inspire'
  direction: 'sent' | 'received'
  summary: string
  personName: string | null
  created_at: string
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export { timeAgo }

export function useRecentActivity() {
  const { user } = useAuth()
  const [sent, setSent] = useState<ActivityEntry[]>([])
  const [received, setReceived] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = getSupabase()

      // Sent: priorities where type='others' or has target_email
      const [sentPriorities, sentValidations, receivedPriorities] = await Promise.all([
        supabase
          .from('priorities')
          .select('id, target_name, target_email, integrity_line, created_at')
          .eq('client_email', user.email)
          .or('type.eq.others,target_email.not.is.null')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('validations')
          .select('id, mode, q0_response, created_at')
          .eq('client_email', user.email)
          .eq('mode', 'others')
          .order('created_at', { ascending: false })
          .limit(5),
        // Received: where recipient/target email is current user
        supabase
          .from('priorities')
          .select('id, client_email, target_name, integrity_line, created_at')
          .eq('recipient_email', user.email)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const sentItems: ActivityEntry[] = []
      for (const p of sentPriorities.data || []) {
        sentItems.push({
          id: p.id,
          type: 'impact',
          direction: 'sent',
          summary: p.integrity_line || 'Recognized impact',
          personName: p.target_name || p.target_email || null,
          created_at: p.created_at,
        })
      }
      for (const v of sentValidations.data || []) {
        sentItems.push({
          id: v.id,
          type: 'improve',
          direction: 'sent',
          summary: v.q0_response || 'Witnessed growth',
          personName: null,
          created_at: v.created_at,
        })
      }
      sentItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      const receivedItems: ActivityEntry[] = []
      for (const p of receivedPriorities.data || []) {
        receivedItems.push({
          id: p.id,
          type: 'impact',
          direction: 'received',
          summary: p.integrity_line || 'Recognized your impact',
          personName: p.target_name || p.client_email || null,
          created_at: p.created_at,
        })
      }
      // validations received intentionally empty for now
      receivedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setSent(sentItems.slice(0, 5))
      setReceived(receivedItems.slice(0, 5))
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { sent, received, loading }
}
