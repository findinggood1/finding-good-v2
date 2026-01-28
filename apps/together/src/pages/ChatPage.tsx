export function ChatPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💬</span>
            <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Connect directly with your coach for guidance and reflection.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>P2 Feature:</strong> Chat functionality is planned for a future release.
          </div>
        </div>
      </div>
    </div>
  )
}
