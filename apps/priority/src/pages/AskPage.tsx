import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, getSupabase, useAuth } from '@finding-good/shared'
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

  const canSubmit = requesterName && name && email && !loading

  // Success view
  if (respondUrl) {
    return (
      <div className="min-h-screen bg-brand-cream p-4">
        <div className="max-w-md mx-auto">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Share this link with <span className="font-medium">{name}</span> so they can share what matters to them. When they respond, you will both have proof of how they show up.
            </p>

            {/* Link display */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 break-all font-mono">
                {respondUrl}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-6 bg-[#0D7C66] hover:bg-[#095c4d] text-white font-semibold rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Share what matters to you',
                      text: `Hey ${name}, I would love to hear what has been mattering to you lately. It takes about 2 minutes.`,
                      url: respondUrl,
                    })
                  } else {
                    handleCopyLink()
                  }
                }}
                className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors"
              >
                Share Link
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors"
              >
                Return Home
              </button>
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

        {/* Education banner */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
          <h3 className="font-medium text-blue-900 mb-1">Get Inspired by Someone</h3>
          <p className="text-sm text-blue-800">
            Ask someone you admire to share what matters to them. They will answer the same questions you did and get their own proof line and insights. You will see how they show up.
          </p>
        </div>

        <Card padding="lg">
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
              <p className="text-xs text-gray-400 mt-1">This is how they will see who invited them</p>
            </div>

            {/* Their name (required) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Who do you want to hear from?
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

            {/* Personal message (optional) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Add a personal note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Hey! I admire how you show up and would love to learn from what matters to you..."
                rows={3}
                disabled={loading}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors resize-none disabled:bg-gray-100"
              />
            </div>

            {/* Link to prediction (optional) - keep but simplify */}
            {predictions.length > 0 && (
              <div>
                <label htmlFor="prediction" className="block text-sm font-medium text-gray-700 mb-1">
                  Connect to a goal <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  id="prediction"
                  value={linkedPredictionId}
                  onChange={(e) => setLinkedPredictionId(e.target.value)}
                  disabled={loading || loadingPredictions}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-colors disabled:bg-gray-100 bg-white"
                >
                  <option value="">No linked goal</option>
                  {predictions.map((pred) => (
                    <option key={pred.id} value={pred.id}>
                      {pred.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-colors ${
                canSubmit
                  ? 'bg-[#0D7C66] hover:bg-[#095c4d] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating...' : 'Send Invitation'}
            </button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          They will receive the same 4 questions you answered. When they respond, you will see their proof line and insights.
        </p>
      </div>
    </div>
  )
}
