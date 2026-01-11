import { Link } from 'react-router-dom'
import { useAuth } from '@finding-good/shared'

export function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-brand-primary">Priority</h1>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-brand-primary"
          >
            Sign out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What matters most today?
          </h2>
          <p className="text-gray-600 mb-6">
            Take a moment to reflect on your priorities for today.
          </p>
          <Link
            to="/confirm"
            className="inline-block w-full py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Start Daily Check-in
          </Link>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            to="/ask"
            className="flex-1 py-3 bg-white text-brand-primary font-medium rounded-lg border border-brand-primary hover:bg-brand-primary/5 transition-colors text-center"
          >
            Ask Someone
          </Link>
          <Link
            to="/history"
            className="flex-1 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center"
          >
            History
          </Link>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Logged in as {user?.email}
        </p>
      </div>
    </div>
  )
}
