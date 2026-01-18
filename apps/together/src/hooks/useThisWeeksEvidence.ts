import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export interface EvidenceItem {
  id: string
  type: 'recognition' | 'pattern' | 'proof_line' | 'insight'
  text: string
  icon: 'check' | 'bolt'
  created_at: string
}

export function useThisWeeksEvidence() {
  const { user } = useAuth()
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setEvidence([])
      setLoading(false)
      return
    }

    const fetchEvidence = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()
        const userEmail = user.email

        // Calculate 7 days ago
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoISO = weekAgo.toISOString()

        // Fetch priorities about self (user's own entries)
        const { data: selfPriorities } = await supabase
          .from('priorities')
          .select('id, integrity_line, created_at')
          .eq('client_email', userEmail)
          .eq('type', 'self')
          .gte('created_at', weekAgoISO)
          .order('created_at', { ascending: false })
          .limit(10)

        // Fetch recognitions received from others
        const { data: receivedRecognitions } = await supabase
          .from('priorities')
          .select('id, integrity_line, target_name, created_at')
          .eq('recipient_email', userEmail)
          .not('client_email', 'eq', userEmail)
          .gte('created_at', weekAgoISO)
          .order('created_at', { ascending: false })
          .limit(10)

        // Fetch proofs (validations) with proof_line or pattern
        const { data: proofs } = await supabase
          .from('validations')
          .select('id, proof_line, pattern, created_at')
          .eq('client_email', userEmail)
          .gte('created_at', weekAgoISO)
          .order('created_at', { ascending: false })
          .limit(10)

        const items: EvidenceItem[] = []

        // Process self priorities as insights
        selfPriorities?.forEach(p => {
          if (p.integrity_line) {
            items.push({
              id: `priority-${p.id}`,
              type: 'insight',
              text: p.integrity_line,
              icon: 'bolt',
              created_at: p.created_at,
            })
          }
        })

        // Process received recognitions
        receivedRecognitions?.forEach(r => {
          if (r.integrity_line) {
            items.push({
              id: `recognition-${r.id}`,
              type: 'recognition',
              text: r.integrity_line,
              icon: 'check',
              created_at: r.created_at,
            })
          }
        })

        // Process proofs - proof_line and patterns
        proofs?.forEach(p => {
          if (p.proof_line) {
            items.push({
              id: `proof-${p.id}`,
              type: 'proof_line',
              text: p.proof_line,
              icon: 'check',
              created_at: p.created_at,
            })
          }
          // Extract pattern if available
          const pattern = p.pattern as { whatWorked?: string } | null
          if (pattern?.whatWorked) {
            items.push({
              id: `pattern-${p.id}`,
              type: 'pattern',
              text: pattern.whatWorked,
              icon: 'bolt',
              created_at: p.created_at,
            })
          }
        })

        // Sort by date (most recent first) and limit to 10 items
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const finalEvidence = items.slice(0, 10)

        console.log('[useThisWeeksEvidence] evidence items:', finalEvidence.length, finalEvidence)
        setEvidence(finalEvidence)
        setError(null)
      } catch (err) {
        console.error('Error fetching evidence:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch evidence')
      } finally {
        setLoading(false)
      }
    }

    fetchEvidence()
  }, [user?.email])

  return { evidence, loading, error }
}
