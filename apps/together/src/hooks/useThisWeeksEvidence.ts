import { useState, useEffect } from 'react'
import { getSupabase as _getSupabase, useAuth } from '@finding-good/shared'
// TODO: _getSupabase will be used in IMPLEMENT phase

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
        // TODO: Implement query for priorities, validations WHERE created_at > 7 days ago
        // Extract recognitions received, patterns, proof_lines
        setEvidence([])
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
