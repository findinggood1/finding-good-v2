import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LoadingSpinner,
  getSupabase,
  useAuth,
  getBridgeQuestion,
  BridgeQuestionCard,
} from '@finding-good/shared'
import type { Permission, DailyCheckin, FocusScore, BridgeQuestion } from '@finding-good/shared'
import { DailyCheckinForm } from '../../components/permission'

type PageState = 'loading' | 'no-focus' | 'already-checked-in' | 'checkin' | 'bridge'

export function DailyCheckinPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [permission, setPermission] = useState<Permission | null>(null)
  const [existingCheckin, setExistingCheckin] = useState<DailyCheckin | null>(null)
  const [bridgeQuestion, setBridgeQuestion] = useState<BridgeQuestion | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load permission and check for existing check-in
  useEffect(() => {
    if (!user?.email) {
      setPageState('loading')
      return
    }

    const loadData = async () => {
      try {
        const supabase = getSupabase()

        // Get current permission
        const { data: permData, error: permError } = await supabase
          .from('permissions')
          .select('*')
          .eq('client_email', user.email)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        if (permError && permError.code !== 'PGRST116') {
          throw permError
        }

        if (!permData || !permData.focus || permData.focus.length === 0) {
          setPageState('no-focus')
          return
        }

        setPermission(permData as Permission)

        // Check for existing check-in today
        const today = new Date().toISOString().split('T')[0]
        const { data: checkinData, error: checkinError } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('client_email', user.email)
          .eq('check_date', today)
          .single()

        if (checkinError && checkinError.code !== 'PGRST116') {
          throw checkinError
        }

        if (checkinData) {
          setExistingCheckin(checkinData as DailyCheckin)
          setPageState('already-checked-in')
        } else {
          setPageState('checkin')
        }
      } catch (err) {
        console.error('Error loading check-in data:', err)
        setError('Failed to load your focus data')
        setPageState('checkin')
      }
    }

    loadData()
  }, [user?.email])

  const handleSubmit = async (scores: FocusScore[]) => {
    if (!user?.email || !permission) return

    setSubmitting(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const today = new Date().toISOString().split('T')[0]

      // Save check-in
      const { error: insertError } = await supabase.from('daily_checkins').insert({
        client_email: user.email,
        permission_id: permission.id,
        check_date: today,
        focus_scores: scores,
      })

      if (insertError) throw insertError

      // Generate bridge question from scores
      const bridge = getBridgeQuestion(scores)
      if (bridge) {
        setBridgeQuestion(bridge)
        setPageState('bridge')
      } else {
        // No bridge question, go home
        navigate('/')
      }
    } catch (err) {
      console.error('Error saving check-in:', err)
      setError('Failed to save your check-in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBridgeRespond = () => {
    // Navigate to Priority tool with context
    // For now, just navigate to home (Priority integration is separate session)
    navigate('/')
  }

  const handleBridgeDismiss = () => {
    navigate('/')
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  // No focus setup
  if (pageState === 'no-focus') {
    return (
      <div className="p-4 pb-24">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your Focus First</h2>
          <p className="text-gray-600 mb-6">
            You need to define what you're focusing on before you can check in.
          </p>
          <button
            onClick={() => navigate('/focus')}
            className="px-6 py-3 bg-[#0D7C66] text-white font-semibold rounded-lg hover:bg-[#095c4d] transition-colors"
          >
            Set Up My Focus
          </button>
        </div>
      </div>
    )
  }

  // Already checked in today
  if (pageState === 'already-checked-in' && existingCheckin) {
    const completedCount = existingCheckin.focus_scores?.filter((s: FocusScore) => s.completed).length || 0
    const totalCount = existingCheckin.focus_scores?.filter((s: FocusScore) => s.focus_name !== '_emerged').length || 0

    return (
      <div className="p-4 pb-24">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Already Checked In Today</h2>
          <p className="text-gray-600 mb-6">
            You completed {completedCount} of {totalCount} focus items today.
          </p>
        </div>

        {/* Show what was checked */}
        <div className="space-y-2">
          {existingCheckin.focus_scores
            ?.filter((s: FocusScore) => s.focus_name !== '_emerged')
            .map((score: FocusScore) => (
              <div
                key={score.focus_name}
                className={`p-3 rounded-lg border ${
                  score.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={score.completed ? 'text-green-600' : 'text-gray-400'}>
                    {score.completed ? '✓' : '○'}
                  </span>
                  <span className={score.completed ? 'text-gray-900' : 'text-gray-500'}>
                    {score.focus_name}
                  </span>
                  {score.engagement && (
                    <span className="ml-auto text-sm text-gray-500">
                      {score.engagement}/5
                    </span>
                  )}
                </div>
              </div>
            ))}

          {/* Show emerged text if any */}
          {existingCheckin.focus_scores?.find((s: FocusScore) => s.focus_name === '_emerged')?.emerged_text && (
            <div className="p-3 rounded-lg border bg-purple-50 border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-1">Something emerged:</p>
              <p className="text-purple-900">
                {existingCheckin.focus_scores.find((s: FocusScore) => s.focus_name === '_emerged')?.emerged_text}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  // Bridge question after check-in
  if (pageState === 'bridge' && bridgeQuestion) {
    return (
      <div className="p-4 pb-24">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Check-in Complete</h2>
        </div>

        <BridgeQuestionCard
          question={bridgeQuestion}
          onRespond={handleBridgeRespond}
          onDismiss={handleBridgeDismiss}
        />
      </div>
    )
  }

  // Main check-in form
  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-600 text-sm mt-1">Where was your focus today?</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Check-in Form */}
      {permission && permission.focus && (
        <DailyCheckinForm
          focusItems={permission.focus}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  )
}
