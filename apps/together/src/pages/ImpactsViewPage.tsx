import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button, Card, Textarea, getSupabase, LoadingSpinner } from '@finding-good/shared'

interface RecognitionData {
  id: string
  client_email: string
  target_name: string
  target_email: string | null
  target_relationship: string | null
  responses: {
    what_they_did: string
    what_it_showed: string
    how_it_affected: string
  }
  status: string
  viewed_at: string | null
  thanked_at: string | null
  created_at: string
}

export function ImpactsViewPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [recognition, setRecognition] = useState<RecognitionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Thank you note state
  const [showThankYou, setShowThankYou] = useState(false)
  const [thankYouNote, setThankYouNote] = useState('')
  const [isSendingThanks, setIsSendingThanks] = useState(false)
  const [thanksSent, setThanksSent] = useState(false)

  // Derive sender name from email
  const senderName = recognition?.client_email?.split('@')[0] || 'Someone'

  useEffect(() => {
    const fetchRecognition = async () => {
      if (!shareId) {
        setError('Invalid link')
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabase()

        // Fetch the recognition by share_id
        const { data, error: fetchError } = await supabase
          .from('priorities')
          .select('*')
          .eq('share_id', shareId)
          .eq('type', 'other')
          .single()

        if (fetchError) {
          console.error('Fetch error:', fetchError)
          setError('This recognition could not be found.')
          setLoading(false)
          return
        }

        setRecognition(data)

        // Mark as viewed if not already
        if (!data.viewed_at) {
          await supabase
            .from('priorities')
            .update({
              viewed_at: new Date().toISOString(),
              status: 'viewed',
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

    fetchRecognition()
  }, [shareId])

  const handleSendThanks = async () => {
    if (!recognition || !thankYouNote.trim()) return

    setIsSendingThanks(true)

    try {
      const supabase = getSupabase()

      await supabase
        .from('priorities')
        .update({
          recipient_responses: { thank_you_note: thankYouNote },
          thanked_at: new Date().toISOString(),
          status: 'thanked',
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

  if (error || !recognition) {
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
            {error || 'This recognition could not be found.'}
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
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💚</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Send a Thank You</h1>
            <p className="text-gray-600 mt-1">Let {senderName} know this meant something</p>
          </div>

          <Card padding="lg" className="mb-6">
            <Textarea
              value={thankYouNote}
              onChange={(e) => setThankYouNote(e.target.value)}
              placeholder="What does this recognition mean to you? How did it make you feel?"
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
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
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

  // Main recognition view
  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚡</span>
          </div>
          <p className="text-sm text-teal-700 font-medium uppercase tracking-wide mb-2">
            Someone Saw Your Impact
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Hi {recognition.target_name}
          </h1>
          <p className="text-gray-600 mt-1">
            {senderName} wanted to recognize something you did
          </p>
        </div>

        {/* Recognition Card */}
        <Card padding="lg" className="mb-6 border-teal-300 border-2 bg-teal-50">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                What You Did
              </p>
              <p className="text-gray-900 leading-relaxed">
                {recognition.responses.what_they_did}
              </p>
            </div>

            <div className="border-t border-teal-200 pt-4">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                What It Showed About You
              </p>
              <p className="text-gray-900 leading-relaxed">
                {recognition.responses.what_it_showed}
              </p>
            </div>

            <div className="border-t border-teal-200 pt-4">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                How It Affected Them
              </p>
              <p className="text-gray-900 leading-relaxed">
                {recognition.responses.how_it_affected}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 italic text-right">
            — {senderName}
          </p>
        </Card>

        {/* Encouraging message */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 text-center italic">
            When someone tells you the impact you had, they're helping you see a strength
            you might not see in yourself. This recognition is a mirror.
          </p>
        </div>

        {/* Actions */}
        {!thanksSent ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowThankYou(true)}
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
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
