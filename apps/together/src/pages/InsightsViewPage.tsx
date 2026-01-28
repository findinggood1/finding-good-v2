import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button, Card, Textarea, getSupabase, LoadingSpinner } from '@finding-good/shared'

interface ObservationData {
  id: string
  client_email: string
  recipient_name: string
  recipient_email: string | null
  relationship: string | null
  responses: {
    outcome: string
    how_they_did_it: string
    key_decision: string
    impact: string
  }
  recipe: {
    approach: string
    key_move: string
    why_it_worked: string
  } | null
  viewed_at: string | null
  thanked_at: string | null
  created_at: string
}

export function InsightsViewPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [observation, setObservation] = useState<ObservationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Thank you note state
  const [showThankYou, setShowThankYou] = useState(false)
  const [thankYouNote, setThankYouNote] = useState('')
  const [isSendingThanks, setIsSendingThanks] = useState(false)
  const [thanksSent, setThanksSent] = useState(false)

  // Derive sender name from email
  const senderName = observation?.client_email?.split('@')[0] || 'Someone'

  useEffect(() => {
    const fetchObservation = async () => {
      if (!shareId) {
        setError('Invalid link')
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabase()

        // Fetch the observation by share_id
        const { data, error: fetchError } = await supabase
          .from('validations')
          .select('*')
          .eq('share_id', shareId)
          .eq('mode', 'send_observation')
          .single()

        if (fetchError) {
          console.error('Fetch error:', fetchError)
          setError('This observation could not be found.')
          setLoading(false)
          return
        }

        setObservation(data)

        // Mark as viewed if not already
        if (!data.viewed_at) {
          await supabase
            .from('validations')
            .update({
              viewed_at: new Date().toISOString(),
            })
            .eq('share_id', shareId)
        }

        // Check if already thanked
        if (data.thanked_at) {
          setThanksSent(true)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchObservation()
  }, [shareId])

  const handleSendThanks = async () => {
    if (!observation || !thankYouNote.trim()) return

    setIsSendingThanks(true)

    try {
      const supabase = getSupabase()

      await supabase
        .from('validations')
        .update({
          thanked_at: new Date().toISOString(),
        })
        .eq('share_id', shareId)

      setThanksSent(true)
      setShowThankYou(false)
    } catch (err) {
      console.error('Error sending thanks:', err)
    } finally {
      setIsSendingThanks(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !observation) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This observation could not be found.'}
          </p>
          <Link to="/">
            <Button variant="primary">Go to Finding Good</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Thank you response form
  if (showThankYou) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💚</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Send a Thank You</h1>
            <p className="text-gray-600 mt-1">Let {senderName} know this meant something</p>
          </div>

          <Card padding="lg" className="mb-6">
            <Textarea
              value={thankYouNote}
              onChange={(e) => setThankYouNote(e.target.value)}
              placeholder="What does this observation mean to you? What will you do with this insight?"
              rows={5}
              showCharCount
              maxLength={500}
            />
          </Card>

          <div className="space-y-3">
            <button
              onClick={handleSendThanks}
              disabled={!thankYouNote.trim() || isSendingThanks}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                thankYouNote.trim() && !isSendingThanks
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSendingThanks ? 'Sending...' : 'Send Thank You'}
            </button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setShowThankYou(false)}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main observation view
  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📈</span>
          </div>
          <p className="text-sm text-green-700 font-medium uppercase tracking-wide mb-2">
            Someone Saw How You Work
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Hi {observation.recipient_name}
          </h1>
          <p className="text-gray-600 mt-1">
            {senderName} wanted to share what they observed
          </p>
        </div>

        {/* Observation Card */}
        <Card padding="lg" className="mb-6 border-green-300 border-2 bg-green-50">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                What You Accomplished
              </p>
              <p className="text-gray-900 leading-relaxed">
                {observation.responses.outcome}
              </p>
            </div>

            <div className="border-t border-green-200 pt-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                How You Approached It
              </p>
              <p className="text-gray-900 leading-relaxed">
                {observation.responses.how_they_did_it}
              </p>
            </div>

            <div className="border-t border-green-200 pt-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                The Decision That Stood Out
              </p>
              <p className="text-gray-900 leading-relaxed">
                {observation.responses.key_decision}
              </p>
            </div>

            <div className="border-t border-green-200 pt-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                The Impact
              </p>
              <p className="text-gray-900 leading-relaxed">
                {observation.responses.impact}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 italic text-right">
            — {senderName}
          </p>
        </Card>

        {/* The Recipe They Saw - only show if AI has generated it */}
        {observation.recipe && (
          <Card padding="lg" className="mb-6 bg-white border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🧪</span>
              <h2 className="text-lg font-semibold text-gray-900">The Recipe They Saw</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Here's what made your approach work — a formula you can repeat:
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Your Approach</p>
                <p className="text-gray-900 text-sm">{observation.recipe.approach}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">The Key Move</p>
                <p className="text-gray-900 text-sm">{observation.recipe.key_move}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Why It Worked</p>
                <p className="text-gray-900 text-sm">{observation.recipe.why_it_worked}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Encouraging message */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 text-center italic">
            When someone tells you how you succeeded, they're giving you a recipe for the future.
            This insight is a gift of clarity — now you can repeat what works.
          </p>
        </div>

        {/* Actions */}
        {!thanksSent ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowThankYou(true)}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Say Thank You
            </button>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full">
                Start Your Own Journey
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
              <p className="text-sm text-green-700">
                ✓ Your thank you has been sent to {senderName}
              </p>
            </div>
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full">
                Start Your Own Journey
              </Button>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <Link to="/" className="text-brand-primary hover:underline">
              Finding Good
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
