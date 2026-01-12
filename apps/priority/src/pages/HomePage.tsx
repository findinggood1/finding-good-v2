import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, getSupabase } from '@finding-good/shared'
import { WelcomeScreen } from '../components'

const ONBOARDING_KEY = 'priority_onboarding_complete'

// Modal component
function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        {children}
      </div>
    </div>
  )
}

export function HomePage() {
  const { user, userEmail, signOut } = useAuth()
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)
  const [hasCompletedOwn, setHasCompletedOwn] = useState(false)
  const [entryCount, setEntryCount] = useState(0)
  const [showCompleteFirstModal, setShowCompleteFirstModal] = useState(false)

  // Check if user has completed onboarding and has entries
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY) === 'true'
    setShowOnboarding(!hasCompletedOnboarding)

    // Check if user has at least one entry
    async function checkEntries() {
      if (!userEmail) return
      const supabase = getSupabase()
      const { count } = await supabase
        .from('validations')
        .select('*', { count: 'exact', head: true })
        .eq('client_email', userEmail)
        .eq('mode', 'self')
      
      setEntryCount(count || 0)
      setHasCompletedOwn((count || 0) > 0)
    }
    checkEntries()
  }, [userEmail])

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  const handleGetInspired = () => {
    if (!hasCompletedOwn) {
      setShowCompleteFirstModal(true)
    } else {
      navigate('/ask')
    }
  }

  // Show loading state while checking onboarding status
  if (showOnboarding === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <WelcomeScreen onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-brand-primary">Priority Builder</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="About Priority Builder"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-brand-primary"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Entry count badge */}
        {entryCount > 0 && (
          <div className="bg-white rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-brand-primary">{entryCount}</span> {entryCount === 1 ? 'entry' : 'entries'} captured
            </span>
            <Link to="/history" className="text-sm text-brand-primary hover:underline">
              View all
            </Link>
          </div>
        )}

        {/* Main Card - Name What Matters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Name What Matters
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Claim your focus. Capture what went well. Build evidence of how you show up.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/confirm')}
            className="w-full py-3 px-6 bg-[#0D7C66] hover:bg-[#095c4d] text-white font-semibold rounded-lg transition-colors"
          >
            Start Now
          </button>
          
          <p className="text-xs text-gray-400 text-center mt-3">
            Takes about 2 minutes
          </p>
        </div>

        {/* Secondary Options */}
        <div className="space-y-3">
          {/* Get Inspired by Someone */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Get Inspired by Someone</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Ask someone you admire to share what matters to them. See how they show up.
                </p>
                <button
                  onClick={handleGetInspired}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {hasCompletedOwn ? 'Send Request' : 'Complete yours first'} →
                </button>
              </div>
            </div>
          </div>

          {/* Recognize Someone's Impact */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Recognize Someone's Impact</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Name the impact someone else had on you. Create something you can share with them.
                </p>
                <Link
                  to="/recognize"
                  className="text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  Start Recognition →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Matters - Educational Block */}
        <div className="mt-6 bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
          <h3 className="font-medium text-brand-primary mb-2">Why This Matters</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Most people forget 90% of their small wins. Priority Builder captures them before they fade. 
            Over time, patterns emerge that reveal how you naturally show up when it matters.
          </p>
          <Link to="/about" className="text-sm text-brand-primary font-medium mt-2 inline-block hover:underline">
            Learn more about the science →
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Logged in as {user?.email}
        </p>
      </div>

      {/* Complete First Modal */}
      <Modal isOpen={showCompleteFirstModal} onClose={() => setShowCompleteFirstModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Name What Matters First
          </h3>
          <p className="text-gray-600 mb-6">
            Before you can ask someone else to share, take 2 minutes to capture your own priority. 
            This way, when they respond, you can compare how you both show up.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowCompleteFirstModal(false)
                navigate('/confirm')
              }}
              className="w-full py-3 px-6 bg-[#0D7C66] hover:bg-[#095c4d] text-white font-semibold rounded-lg transition-colors"
            >
              Start My Priority
            </button>
            <button
              onClick={() => setShowCompleteFirstModal(false)}
              className="w-full py-3 px-6 bg-white text-[#0D7C66] font-semibold rounded-lg border-2 border-[#0D7C66] hover:bg-[#0D7C66] hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
