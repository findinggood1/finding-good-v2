import { useState, useCallback } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'

interface AskRequest {
  requesterName: string
  recipientName: string
  recipientEmail: string
  relationship?: string
  personalMessage?: string
  linkedPredictionId?: string
}

interface AskResult {
  token: string
  respondUrl: string
}

export function useAsk() {
  const { user, userEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAsk = useCallback(async (request: AskRequest): Promise<AskResult | null> => {
    if (!user) {
      setError('You must be logged in to send an ask')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // Generate a unique token
      const token = crypto.randomUUID()

      // Calculate expiry (7 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Insert the ask record
      const { error: insertError } = await supabase
        .from('priority_asks')
        .insert({
          user_id: user.id,
          requester_email: userEmail,
          token,
          requester_name: request.requesterName,
          recipient_name: request.recipientName,
          recipient_email: request.recipientEmail,
          relationship: request.relationship || null,
          personal_message: request.personalMessage || null,
          linked_prediction_id: request.linkedPredictionId || null,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      const respondUrl = `${window.location.origin}/respond/${token}`

      setLoading(false)
      return { token, respondUrl }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create ask'
      setError(message)
      setLoading(false)
      return null
    }
  }, [user, userEmail])

  return {
    createAsk,
    loading,
    error,
  }
}
