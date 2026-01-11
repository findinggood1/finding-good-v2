import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, getSupabase, useAuth } from '@finding-good/shared'
import { useAsk } from '../hooks'

interface Prediction {
  id: string
  title: string
}

export function AskPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createAsk, loading, error } = useAsk()

  // Form state
  const [requesterName, setRequesterName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [linkedPredictionId, setLinkedPredictionId] = useState('')

  // Predictions for dropdown
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loadingPredictions, setLoadingPredictions] = useState(true)

  // Result state
  const [respondUrl, setRespondUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch user's predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) return

      try {
        const supabase = getSupabase()
        const { data, error: fetchError } = await supabase
          .from('predictions')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Error fetching predictions:', fetchError)
        } else {
          setPredictions(data || [])
        }
      } catch (err) {
        console.error('Error fetching predictions:', err)
      } finally {
        setLoadingPredictions(false)
      }
    }

    fetchPredictions()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await createAsk({
      requesterName,
      recipientName: name,
      recipientEmail: email,
      relationship: relationship || undefined,
      personalMessage: personalMessage || undefined,
      linkedPredictionId: linkedPredictionId || undefined,
    })

    if (result) {
      setRespondUrl(result.respondUrl)
    }
  }

  const handleCopyLink = async () => {
    if (respondUrl) {
      await navigator.clipboard.writeText(respondUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Success view
  if (respondUrl) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Share this link with {name} to invite them to reflect on what's been mattering to them.
            </p>

            {/* Link display */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 break-all font-mono">
                {respondUrl}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Share what matters to you',
                      text: `Hey ${name}, I'd love to hear what's been mattering to you lately. Take a few minutes to reflect and share.`,
                      url: respondUrl,
                    })
                  } else {
                    handleCopyLink()
                  }
                }}
              >
                Share Link
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="w-full text-gray-500"
                onClick={() => navigate('/')}
              >
                Return Home
              </Button>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              This link expires in 7 days
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <Card padding="lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invite Someone to Share
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Invite someone to reflect on what's been mattering to them.
            When they share, you'll both grow your understanding of what matters.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Your name (required) */}
            <div>
              <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">
                Your name
              </label>
              <input
                id="requesterName"
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Your first name"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors disabled:bg-gray-100"
              />
            </div>

            {/* Their name (required) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Who are you asking?
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Their name"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors disabled:bg-gray-100"
              />
            </div>

            {/* Email (required) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Their email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors disabled:bg-gray-100"
              />
            </div>

            {/* Relationship (optional) */}
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                How do you know them? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="relationship"
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., Colleague, Friend, Manager, Mentor"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors disabled:bg-gray-100"
              />
            </div>

            {/* Personal message (optional) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Add a personal note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Hey! I'm working on understanding what really matters to me right now and I value your perspective..."
                rows={3}
                disabled={loading}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors resize-none disabled:bg-gray-100"
              />
            </div>

            {/* Link to prediction (optional) */}
            <div>
              <label htmlFor="prediction" className="block text-sm font-medium text-gray-700 mb-1">
                What are you working on? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                id="prediction"
                value={linkedPredictionId}
                onChange={(e) => setLinkedPredictionId(e.target.value)}
                disabled={loading || loadingPredictions}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors disabled:bg-gray-100 bg-white"
              >
                <option value="">No linked prediction</option>
                {predictions.map((pred) => (
                  <option key={pred.id} value={pred.id}>
                    {pred.title}
                  </option>
                ))}
              </select>
              {predictions.length === 0 && !loadingPredictions && (
                <p className="text-xs text-gray-400 mt-1">
                  No active predictions yet
                </p>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading || !requesterName || !name || !email}
            >
              Create Ask Link
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-400 mt-6">
          They'll receive a link to reflect on and share what's been mattering to them.
        </p>
      </div>
    </div>
  )
}
