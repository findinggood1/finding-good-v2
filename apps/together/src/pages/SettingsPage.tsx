import { useAuth } from '@finding-good/shared'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { userEmail, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Account</h2>
          <p className="text-gray-900">{userEmail}</p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
