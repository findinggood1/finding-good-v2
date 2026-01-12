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
  strength?: number
}

interface AnalysisResult {
  priorityLine: string
  firesElements: FiresExtraction[]
  reflectionInsight: string
  yourPattern?: string
  patternQuotes?: string[]
  validationSignal?: string
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
    focus: string
    whatWentWell: string
    yourPart: string
    impact: string
  }): Promise<AnalysisResult | null> => {
    setAnalyzing(true)
    setError(null)

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const functionUrl = `${supabaseUrl}/functions/v1/priority-analyze`
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      // Call the priority-analyze edge function directly
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(answers),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Analysis failed: ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      const result: AnalysisResult = {
        priorityLine: data.priorityLine,
        firesElements: data.firesElements || [],
        reflectionInsight: data.reflectionInsight,
        yourPattern: data.yourPattern,
        patternQuotes: data.patternQuotes,
        validationSignal: data.validationSignal,
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

  const submitResponse = useCallback(async (responseData: {
    focus: string
    whatWentWell: string
    yourPart: string
    impact: string
  }, analysisResult: AnalysisResult | null): Promise<boolean> => {
    if (!askDetails || !token) {
      setError('Invalid request')
      return false
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // Insert the response with structured data
      const { error: insertError } = await supabase
        .from('priority_responses')
        .insert({
          ask_id: askDetails.id,
          response_text: JSON.stringify(responseData),
          proof_line: analysisResult?.priorityLine || null,
          fires_extracted: analysisResult?.firesElements ? 
            analysisResult.firesElements.reduce((acc, fe) => {
              acc[fe.element] = { present: true, evidence: fe.evidence, strength: fe.strength || 3 }
              return acc
            }, {} as Record<string, unknown>) : null,
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
