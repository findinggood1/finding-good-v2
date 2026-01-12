import { useState } from 'react'

export function MyPracticePage() {
  const [view, setView] = useState<'journey' | 'practice'>('journey')

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Practice</h1>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setView('journey')}
            className={'px-4 py-2 text-sm font-medium rounded-lg transition-colors ' +
              (view === 'journey'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
          >
            My Journey
          </button>
          <button
            onClick={() => setView('practice')}
            className={'px-4 py-2 text-sm font-medium rounded-lg transition-colors ' +
              (view === 'practice'
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
          >
            Coaching Practice
          </button>
        </div>
      </div>

      {view === 'journey' ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Personal Journey</h2>
          <p className="text-gray-600 text-sm max-w-xs mx-auto">
            Your own predictions, priorities, and proofs will appear here — the same experience as your clients.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Coaching Practice Analysis</h2>
          <p className="text-gray-600 text-sm max-w-xs mx-auto">
            AI analysis of your coaching patterns, effectiveness, and growth areas coming soon.
          </p>
        </div>
      )}
    </div>
  )
}
