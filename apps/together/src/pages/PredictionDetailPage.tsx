import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSupabase, useAuth, LoadingSpinner } from '@finding-good/shared'
import type { Prediction } from '@finding-good/shared'
import { FeedCard, type FeedItem } from '../components'

export function PredictionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [proofCount, setProofCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user?.email) return

    const fetchData = async () => {
      setLoading(true)
      const supabase = getSupabase()

      // Fetch prediction
      const { data: predData } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', id)
        .single()

      if (predData) setPrediction(predData)

      // Fetch proofs for this prediction
      const { data: proofs, count: prCount } = await supabase
        .from('validations')
        .select('id, proof_line, fires_extracted, created_at, client_email', { count: 'exact' })
        .eq('prediction_id', id)
        .order('created_at', { ascending: false })

      setProofCount(prCount || 0)

      // Build feed items
      const items: FeedItem[] = []
      if (proofs) {
        proofs.forEach(p => {
          items.push({
            id: p.id,
            type: 'proof',
            text: p.proof_line || '',
            fires_extracted: p.fires_extracted || [],
            prediction_id: id,
            created_at: p.created_at,
            client_email: p.client_email,
            isOwn: p.client_email === user.email,
          })
        })
      }
      setFeedItems(items)

      setLoading(false)
    }

    fetchData()
  }, [id, user?.email])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="p-4">
        <Link to="/" className="inline-flex items-center text-brand-primary text-sm mb-4 hover:underline">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">Prediction not found</p>
        </div>
      </div>
    )
  }

  const predictabilityScore = calculateScore(prediction)
  const showPracticeButton = proofCount >= 10

  return (
    <div className="p-4">
      <Link to="/" className="inline-flex items-center text-brand-primary text-sm mb-4 hover:underline">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{prediction.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {prediction.type} · {prediction.status} · #{prediction.rank || 1}
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-brand-primary">{predictabilityScore}</span>
          <p className="text-sm text-gray-500">Predictability</p>
        </div>
        <div className="flex justify-center gap-6 text-center text-sm">
          <div>
            <span className="font-semibold text-gray-900">{proofCount}</span>
            <p className="text-gray-500">Proofs</p>
          </div>
          <div>
            <span className="font-semibold text-gray-900">0</span>
            <p className="text-gray-500">Connections</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <a
          href="http://localhost:3002"
          className="flex-1 py-3 bg-brand-primary text-white font-medium rounded-xl text-center hover:bg-brand-primary/90 transition-colors"
        >
          Add Priority
        </a>
        <a
          href="http://localhost:3001"
          className="flex-1 py-3 bg-brand-primary/10 text-brand-primary font-medium rounded-xl text-center hover:bg-brand-primary/20 transition-colors"
        >
          Add Proof
        </a>
      </div>

      {showPracticeButton && (
        <a
          href={'http://localhost:3001/' + id}
          className="block w-full py-3 mb-4 bg-blue-50 text-blue-600 font-medium rounded-xl text-center hover:bg-blue-100 transition-colors"
        >
          Ready to practice predicting
        </a>
      )}

      {/* Activity */}
      <div className="mb-2">
        <h2 className="text-sm font-medium text-gray-500">Activity</h2>
      </div>
      {feedItems.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
          <p className="text-gray-500 text-sm">Start building evidence.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedItems.map(item => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function calculateScore(prediction: Prediction): number {
  const scores = prediction.scores
  if (!scores) return 0
  const elements = Object.values(scores)
  if (elements.length === 0) return 0
  const totalStrength = elements.reduce((sum, score) => sum + (score?.strength || 0), 0)
  return Math.round((totalStrength / elements.length) * 20)
}
