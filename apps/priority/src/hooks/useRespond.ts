import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@finding-good/shared'

interface AskDetails {
  id: string
  requesterName: string | null
  recipientName: string | null
  personalMessage: string | null
  expiresAt: string
  status: 'pending' | 'responded' | 'expired'
}

interface FiresExtraction {
  element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths'
  evidence: string
}

interface AnalysisResult {
  priorityLine: string
  firesElements: FiresExtraction[]
  reflectionInsight: string
}

type AskStatus = 'loading' | 'valid' | 'expired' | 'already_responded' | 'not_found' | 'error'

export function useRespond(token: string | undefined) {
  const [askDetails, setAskDetails] = useState<AskDetails | null>(null)
  const [status, setStatus] = useState<AskStatus>('loading')
  const [submitting, setSubmitting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // Fetch ask details on mount
  useEffect(() => {
    if (!token) {
      setStatus('not_found')
      return
    }

    const fetchAsk = async () => {
      try {
        const supabase = getSupabase()

        const { data, error: fetchError } = await supabase
          .from('priority_asks')
          .select('id, requester_name, recipient_name, personal_message, expires_at, status')
          .eq('token', token)
          .single()

        if (fetchError || !data) {
          setStatus('not_found')
          return
        }

        // Check if expired
        const expiresAt = new Date(data.expires_at)
        if (expiresAt < new Date()) {
          setStatus('expired')
          return
        }

        // Check if already responded
        if (data.status === 'responded') {
          setStatus('already_responded')
          return
        }

        setAskDetails({
          id: data.id,
          requesterName: data.requester_name,
          recipientName: data.recipient_name,
          personalMessage: data.personal_message,
          expiresAt: data.expires_at,
          status: data.status,
        })
        setStatus('valid')
      } catch (err) {
        console.error('Error fetching ask:', err)
        setStatus('error')
        setError('Failed to load the request')
      }
    }

    fetchAsk()
  }, [token])

  const analyzeResponse = useCallback(async (answers: {
    whatWentWell: string
    yourPart: string
    impact: string
  }): Promise<AnalysisResult | null> => {
    setAnalyzing(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // Call the priority-analyze edge function
      const { data, error: fnError } = await supabase.functions.invoke('priority-analyze', {
        body: answers,
      })

      if (fnError) {
        throw new Error(fnError.message)
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      const result: AnalysisResult = {
        priorityLine: data.priorityLine,
        firesElements: data.firesElements,
        reflectionInsight: data.reflectionInsight,
      }

      setAnalysisResult(result)
      setAnalyzing(false)
      return result
    } catch (err) {
      console.error('Error analyzing response:', err)
      // Don't set error - we can still show a fallback
      setAnalyzing(false)
      return null
    }
  }, [])

  const submitResponse = useCallback(async (responseText: string): Promise<boolean> => {
    if (!askDetails || !token) {
      setError('Invalid request')
      return false
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // Insert the response
      const { error: insertError } = await supabase
        .from('priority_responses')
        .insert({
          ask_id: askDetails.id,
          response_text: responseText,
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Update the ask status to 'responded'
      const { error: updateError } = await supabase
        .from('priority_asks')
        .update({ status: 'responded' })
        .eq('id', askDetails.id)

      if (updateError) {
        console.error('Failed to update ask status:', updateError)
        // Don't throw - the response was saved
      }

      setSubmitting(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit response'
      setError(message)
      setSubmitting(false)
      return false
    }
  }, [askDetails, token])

  return {
    askDetails,
    status,
    submitting,
    analyzing,
    error,
    analysisResult,
    submitResponse,
    analyzeResponse,
  }
}
