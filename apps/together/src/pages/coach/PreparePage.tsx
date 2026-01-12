export function PreparePage() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prepare</h1>
        <p className="text-gray-600 text-sm mt-1">Get ready for your sessions</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Session Prep Coming Soon</h2>
        <p className="text-gray-600 text-sm max-w-xs mx-auto">
          AI-powered session preparation will help you get ready for each client meeting.
        </p>
      </div>
    </div>
  )
}
