import { useAuth } from '@finding-good/shared'

export function ProfilePage() {
  const { user, signOut } = useAuth()

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">👤</span>
            <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          </div>

          {user && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
