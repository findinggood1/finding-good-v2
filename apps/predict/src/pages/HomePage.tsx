import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, getSupabase } from '@finding-good/shared'
import { usePredictions } from '../hooks'
import { PredictionCard } from '../components'

export function HomePage() {
  const { userEmail, signOut } = useAuth()
  const { predictions, loading, error, refetch } = usePredictions()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleDeleteRequest = (id: string) => {
    const prediction = predictions.find(p => p.id === id)
    if (prediction) {
      setDeleteTarget({ id, title: prediction.title })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    
    setDeleting(true)
    try {
      const supabase = getSupabase()
      
      // Delete prediction (cascades to snapshots and connections via FK)
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', deleteTarget.id)
      
      if (error) {
        console.error('Failed to delete prediction:', error)
        alert('Failed to delete prediction. Please try again.')
      } else {
        await refetch()
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete prediction. Please try again.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-primary">Predict</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Welcome back,</p>
          <p className="font-medium text-gray-900">{userEmail}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            to="/new"
            className="flex items-center justify-center gap-2 bg-brand-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </Link>
          <Link
            to="/quick"
            className="flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-xl font-medium border border-gray-200 hover:border-brand-primary/30 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick
          </Link>
        </div>

        {/* Predictions List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Predictions</h2>

          {loading && (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              <p className="font-medium">Failed to load predictions</p>
              <p className="text-red-500 mt-1">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && predictions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">No predictions yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create your first prediction to get started</p>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 bg-brand-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Prediction
              </Link>
            </div>
          )}

          {!loading && !error && predictions.length > 0 && (
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <PredictionCard 
                  key={prediction.id} 
                  prediction={prediction} 
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Prediction?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "<span className="font-medium">{deleteTarget.title}</span>"? 
              This will also delete all associated snapshots and connections. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
