import { useState } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

export type ImpactLevel = 'helpful' | 'meaningful' | 'high_impact'

export function useExchangeActions() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Mark an entry as recognized (seen/acknowledged)
   */
  const recognizeEntry = async (
    entryType: 'priority' | 'proof' | 'share',
    entryId: string
  ): Promise<boolean> => {
    if (!user?.email) {
      setError('Must be logged in')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabase()

      const { error: insertError } = await supabase
        .from('recognized_entries')
        .insert({
          entry_type: entryType,
          entry_id: entryId,
          recognized_by_email: user.email,
        })

      if (insertError) {
        // Unique constraint violation means already recognized - that's ok
        if (insertError.code === '23505') {
          console.log('[useExchangeActions] Already recognized')
          return true
        }
        throw insertError
      }

      console.log('[useExchangeActions] Recognized:', entryType, entryId)
      return true
    } catch (err) {
      console.error('Error recognizing entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to recognize')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Record the impact level of content received from someone
   */
  const recordImpact = async (
    contentType: 'priority' | 'proof' | 'recognition',
    contentId: string,
    senderEmail: string,
    impactLevel: ImpactLevel,
    note?: string
  ): Promise<boolean> => {
    if (!user?.email) {
      setError('Must be logged in')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabase()

      const { error: insertError } = await supabase
        .from('exchange_impacts')
        .insert({
          content_type: contentType,
          content_id: contentId,
          sender_email: senderEmail,
          recipient_email: user.email,
          impact_level: impactLevel,
          note: note || null,
        })

      if (insertError) throw insertError

      console.log('[useExchangeActions] Impact recorded:', impactLevel, contentId)
      return true
    } catch (err) {
      console.error('Error recording impact:', err)
      setError(err instanceof Error ? err.message : 'Failed to record impact')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if an entry has been recognized by the current user
   */
  const checkRecognized = async (
    entryType: 'priority' | 'proof' | 'share',
    entryId: string
  ): Promise<boolean> => {
    if (!user?.email) return false

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('recognized_entries')
        .select('id')
        .eq('entry_type', entryType)
        .eq('entry_id', entryId)
        .eq('recognized_by_email', user.email)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error
      }

      return !!data
    } catch (err) {
      console.error('Error checking recognized:', err)
      return false
    }
  }

  return {
    recognizeEntry,
    recordImpact,
    checkRecognized,
    loading,
    error,
  }
}
