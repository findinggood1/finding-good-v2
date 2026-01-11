import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getSupabase, FIRES_COLORS } from '@finding-good/shared'
import { usePrediction } from '../hooks'

const FIRES_ORDER = ['feelings', 'influence', 'resilience', 'ethics', 'strengths'] as const

const ALIGNMENT_LABELS: Record<string, string> = {
  q1: 'Similarity to past',
  q2: 'Confidence from past',
  q3: 'Action clarity',
  q4: 'Values alignment',
  q5: 'Obstacle preparedness',
  q6: 'Support connection',
}

export function ViewPredictionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { prediction, snapshot, connections, loading, error, refetch } = usePrediction(id)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleStartEdit = () => {
    if (prediction) {
      setEditTitle(prediction.title)
      setEditDescription(prediction.description || '')
      setIsEditing(true)
      setSaveError(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSaveError(null)
  }

  const handleSaveEdit = async () => {
    if (!id || !editTitle.trim()) return

    setSaving(true)
    setSaveError(null)

    try {
      const supabase = getSupabase()
      const { error: updateError } = await supabase
        .from('predictions')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setIsEditing(false)
      await refetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const supabase = getSupabase()

      // Delete connections first (foreign key constraint)
      await supabase
        .from('prediction_connections')
        .delete()
        .eq('prediction_id', id)

      // Delete snapshots
      await supabase
        .from('snapshots')
        .delete()
        .eq('prediction_id', id)

      // Delete prediction
      const { error: deleteError } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prediction not found</h1>
          <p className="text-gray-600 mb-6">{error || 'This prediction may have been deleted.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const futureConnections = connections.filter(c => c.connection_time === 'future')
  const pastConnections = connections.filter(c => c.connection_time === 'past')
  const hasAIResults = snapshot?.predictability_score || snapshot?.zone_scores

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Prediction</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete prediction"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Title Card - Editable */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="Prediction title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none"
                  placeholder="Optional description"
                />
              </div>
              {saveError && (
                <p className="text-sm text-red-600">{saveError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editTitle.trim()}
                  className="flex-1 py-2 px-4 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-brand-primary/10 text-brand-primary rounded-full capitalize">
                      {prediction.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(prediction.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{prediction.title}</h2>
                  {prediction.description && (
                    <p className="text-gray-600 mt-2">{prediction.description}</p>
                  )}
                </div>
                <button
                  onClick={handleStartEdit}
                  className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Edit prediction"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium text-gray-900 capitalize">{prediction.status}</div>
            </div>
            {hasAIResults ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI Analyzed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Analysis
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats - when AI processed */}
        {snapshot?.predictability_score !== null && snapshot?.predictability_score !== undefined && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Predictability Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-brand-primary">
                {snapshot.predictability_score}%
              </div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all"
                    style={{ width: `${snapshot.predictability_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zone Summary - when AI processed */}
        {snapshot?.zone_scores && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">FIRES Zones</h3>
            <div className="flex justify-center gap-2">
              {FIRES_ORDER.map((element) => {
                const zone = snapshot.zone_scores?.[element]
                if (!zone) return null
                return (
                  <div key={element} className="text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-1"
                      style={{ backgroundColor: FIRES_COLORS[element] }}
                    >
                      {element.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">{zone}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Alignment Summary */}
        {snapshot?.alignment_scores && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Alignment Score</h3>
              <span className="text-lg font-bold text-brand-primary">
                {Object.values(snapshot.alignment_scores).reduce((a, b) => a + b, 0)}/24
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {Object.entries(snapshot.alignment_scores).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                      value >= 3 ? 'bg-brand-primary text-white' : value >= 2 ? 'bg-brand-primary/30 text-brand-primary' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {value}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 truncate" title={ALIGNMENT_LABELS[key]}>
                    {ALIGNMENT_LABELS[key]?.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connections Summary */}
        {(futureConnections.length > 0 || pastConnections.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Connections</h3>
            <div className="flex gap-6">
              {futureConnections.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {futureConnections.slice(0, 3).map((conn, i) => (
                      <div
                        key={conn.id}
                        className="w-8 h-8 bg-brand-primary-light/20 border-2 border-white rounded-full flex items-center justify-center text-brand-primary font-medium text-sm"
                        style={{ zIndex: 3 - i }}
                      >
                        {conn.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {futureConnections.length} future
                  </span>
                </div>
              )}
              {pastConnections.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {pastConnections.slice(0, 3).map((conn, i) => (
                      <div
                        key={conn.id}
                        className="w-8 h-8 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center text-gray-600 font-medium text-sm"
                        style={{ zIndex: 3 - i }}
                      >
                        {conn.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {pastConnections.length} past
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link
            to={`/${id}/results`}
            className="block w-full py-3 px-4 bg-brand-primary text-white rounded-xl font-medium text-center hover:bg-brand-primary/90 transition-colors"
          >
            View Full Results
          </Link>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Prediction?</h3>
              <p className="text-gray-600 text-sm">
                This will permanently delete "{prediction.title}" and all its data. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <p className="text-sm text-red-600 text-center mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
