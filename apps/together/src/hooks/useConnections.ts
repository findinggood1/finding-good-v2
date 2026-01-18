import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface Connection {
  id: string
  email: string
  name?: string
  type: 'mutual' | 'you_invited' | 'invited_you'
  shareCount: number
  lastActivity: string
  createdAt: string
}

export function useConnections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setConnections([])
      setLoading(false)
      return
    }

    const fetchConnections = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email

        // Fetch share_visibility records where user is involved
        const { data: visibilityA } = await supabase
          .from('share_visibility')
          .select('*')
          .eq('user_a_email', userEmail)

        const { data: visibilityB } = await supabase
          .from('share_visibility')
          .select('*')
          .eq('user_b_email', userEmail)

        const connectionMap = new Map<string, Connection>()

        // Process connections where user initiated (user_a)
        if (visibilityA) {
          for (const v of visibilityA) {
            const otherEmail = v.user_b_email
            const existing = connectionMap.get(otherEmail)
            if (existing) {
              existing.type = 'mutual'
            } else {
              connectionMap.set(otherEmail, {
                id: v.id,
                email: otherEmail,
                type: 'you_invited',
                shareCount: 0,
                lastActivity: formatDate(v.created_at),
                createdAt: v.created_at,
              })
            }
          }
        }

        // Process connections where user received (user_b)
        if (visibilityB) {
          for (const v of visibilityB) {
            const otherEmail = v.user_a_email
            const existing = connectionMap.get(otherEmail)
            if (existing) {
              existing.type = 'mutual'
            } else {
              connectionMap.set(otherEmail, {
                id: v.id,
                email: otherEmail,
                type: 'invited_you',
                shareCount: 0,
                lastActivity: formatDate(v.created_at),
                createdAt: v.created_at,
              })
            }
          }
        }

        // Get share counts from inspiration_shares
        const connectionEmails = Array.from(connectionMap.keys())
        if (connectionEmails.length > 0) {
          const { data: shares } = await supabase
            .from('inspiration_shares')
            .select('client_email, created_at')
            .in('client_email', connectionEmails)
            .is('hidden_at', null)
            .order('created_at', { ascending: false })

          if (shares) {
            const shareCounts = new Map<string, number>()
            const lastDates = new Map<string, string>()
            
            for (const s of shares) {
              shareCounts.set(s.client_email, (shareCounts.get(s.client_email) || 0) + 1)
              if (!lastDates.has(s.client_email)) {
                lastDates.set(s.client_email, s.created_at)
              }
            }

            for (const [email, conn] of connectionMap) {
              conn.shareCount = shareCounts.get(email) || 0
              const lastShare = lastDates.get(email)
              if (lastShare) {
                conn.lastActivity = formatDate(lastShare)
              }
            }
          }
        }

        setConnections(Array.from(connectionMap.values()))
        setError(null)
      } catch (err) {
        console.error('Error fetching connections:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch connections')
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
  }, [user?.email])

  return { connections, loading, error }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return diffDays + ' days ago'
  if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
