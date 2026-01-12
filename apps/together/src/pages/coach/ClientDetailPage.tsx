import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LoadingSpinner, FIRES_COLORS, FIRES_LABELS } from '@finding-good/shared'
import { useClientDetail } from '../../hooks/useClientDetail'
import { useCoachingSessions, type CoachingSession } from '../../hooks/useCoachingSessions'
import { useCoachingNotes } from '../../hooks/useCoachingNotes'

export function ClientDetailPage() {
  const { email } = useParams<{ email: string }>()
  const { client, loading, error } = useClientDetail(email)
  const {
    sessions,
    transcripts,
    loading: sessionsLoading,
    addSession,
    addTranscript,
    generateAISummary
  } = useCoachingSessions(email)
  const {
    notes,
    loading: notesLoading,
    addNote,
    deleteNote
  } = useCoachingNotes(email)

  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showAddTranscript, setShowAddTranscript] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CoachingSession | null>(null)
  const [transcriptText, setTranscriptText] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [newNoteText, setNewNoteText] = useState('')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="p-4">
        <Link to="/coach/clients" className="inline-flex items-center text-brand-primary text-sm mb-4 hover:underline">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">{error || 'Client not found'}</p>
        </div>
      </div>
    )
  }

  const maxFires = Math.max(...Object.values(client.fires_signals), 1)

  const handleAddSession = async () => {
    if (!client) return

    const result = await addSession({
      client_email: client.email,
      scheduled_at: sessionDate + 'T10:00:00Z',
      notes: sessionNotes || undefined,
    })

    if (result) {
      setShowAddSession(false)
      setSessionNotes('')
      setSessionDate(new Date().toISOString().split('T')[0])
    }
  }

  const handleAddTranscript = async () => {
    if (!transcriptText.trim()) return

    const result = await addTranscript(null, transcriptText)

    if (result) {
      setShowAddTranscript(false)
      setTranscriptText('')
    }
  }

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return

    const result = await addNote(newNoteText)

    if (result) {
      setShowAddNote(false)
      setNewNoteText('')
    }
  }

  const handleGenerateSummary = async (transcriptId: string, text: string) => {
    await generateAISummary(transcriptId, text)
  }

  return (
    <div className="p-4 pb-24">
      <Link to="/coach/clients" className="inline-flex items-center text-brand-primary text-sm mb-4 hover:underline">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Week {client.engagement_week} · {client.phase} phase
          {client.next_session && ' · Next session: ' + formatDate(client.next_session)}
        </p>
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">PREDICTIONS</h2>
        {client.predictions.length === 0 ? (
          <p className="text-gray-500 text-sm">No active predictions</p>
        ) : (
          <div className="space-y-3">
            {client.predictions.slice(0, 3).map((pred, index) => {
              const score = calculateScore(pred)
              const activityCount = client.recent_activity.filter(a => a.prediction_id === pred.id).length
              return (
                <div key={pred.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">#{index + 1}: {pred.title}</p>
                      <p className="text-sm text-gray-500">Predictability: {score}</p>
                      <p className="text-sm text-gray-500">{activityCount} recent proofs</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">RECENT ACTIVITY</h2>
        {client.recent_activity.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {client.recent_activity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-2">
                <span className="text-gray-400 text-sm">•</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {activity.type === 'proof' ? 'Proof' : 'Priority'}: "{activity.text}"
                  </p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FIRES Signals */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">FIRES SIGNALS (last 30 days)</h2>
        <div className="space-y-2">
          {Object.entries(client.fires_signals)
            .sort((a, b) => b[1] - a[1])
            .map(([element, count]) => {
              const color = FIRES_COLORS[element as keyof typeof FIRES_COLORS] || '#888'
              const label = FIRES_LABELS[element as keyof typeof FIRES_LABELS] || element
              const width = (count / maxFires) * 100
              const strength = count >= 5 ? 'strong' : count >= 2 ? 'growing' : 'limited'
              return (
                <div key={element} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-600 w-20">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: width + '%', backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">({strength})</span>
                </div>
              )
            })}
        </div>
      </div>

      {/* Sessions Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500">SESSIONS</h2>
          <button
            onClick={() => setShowAddSession(true)}
            className="text-sm text-brand-primary font-medium hover:underline"
          >
            + Schedule Session
          </button>
        </div>

        {showAddSession && (
          <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Session agenda, topics to cover..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSession}
                  className="flex-1 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowAddSession(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {sessionsLoading ? (
          <div className="py-4 text-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions scheduled</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {formatDate(session.scheduled_at)}
                      </p>
                      <span className={'text-xs px-2 py-0.5 rounded-full ' +
                        (session.status === 'completed' ? 'bg-green-100 text-green-700' :
                         session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                         'bg-blue-100 text-blue-700')}>
                        {session.status}
                      </span>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{session.notes}</p>
                    )}
                    {session.transcript && (
                      <p className="text-xs text-gray-500 mt-1">
                        Transcript attached
                        {session.transcript.ai_summary && ' · AI summary available'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transcripts Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500">TRANSCRIPTS</h2>
          <button
            onClick={() => setShowAddTranscript(true)}
            className="text-sm text-brand-primary font-medium hover:underline"
          >
            + Upload Transcript
          </button>
        </div>

        {showAddTranscript && (
          <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Transcript Text</label>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste session transcript here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTranscript}
                  className="flex-1 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90"
                >
                  Save Transcript
                </button>
                <button
                  onClick={() => { setShowAddTranscript(false); setTranscriptText('') }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {transcripts.length === 0 ? (
          <p className="text-gray-500 text-sm">No transcripts uploaded</p>
        ) : (
          <div className="space-y-2">
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {formatRelativeTime(transcript.created_at)}
                    </p>
                    {transcript.ai_summary ? (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{transcript.ai_summary}</p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {transcript.transcript.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    {!transcript.ai_summary && (
                      <button
                        onClick={() => handleGenerateSummary(transcript.id, transcript.transcript)}
                        className="text-xs text-brand-primary font-medium hover:underline"
                      >
                        Generate Summary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500">COACHING NOTES</h2>
          <button
            onClick={() => setShowAddNote(true)}
            className="text-sm text-brand-primary font-medium hover:underline"
          >
            + Add Note
          </button>
        </div>

        {showAddNote && (
          <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="space-y-3">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add a note about this client..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90"
                >
                  Save Note
                </button>
                <button
                  onClick={() => { setShowAddNote(false); setNewNoteText('') }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {notesLoading ? (
          <div className="py-4 text-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 text-sm">No notes yet</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(note.created_at)}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-xs text-gray-400 hover:text-red-500 ml-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Session: {formatDate(selectedSession.scheduled_at)}
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                <span className={'text-sm px-2 py-1 rounded-full ' +
                  (selectedSession.status === 'completed' ? 'bg-green-100 text-green-700' :
                   selectedSession.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                   'bg-blue-100 text-blue-700')}>
                  {selectedSession.status}
                </span>
              </div>
              {selectedSession.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSession.notes}</p>
                </div>
              )}
              {selectedSession.transcript && (
                <>
                  {selectedSession.transcript.ai_summary && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">AI Summary</h4>
                      <p className="text-sm text-gray-700">{selectedSession.transcript.ai_summary}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Transcript</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                      {selectedSession.transcript.transcript}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function calculateScore(prediction: { scores?: Record<string, { strength?: number }> }): number {
  const scores = prediction.scores
  if (!scores) return 0
  const elements = Object.values(scores)
  if (elements.length === 0) return 0
  const totalStrength = elements.reduce((sum, score) => sum + (score?.strength || 0), 0)
  return Math.round((totalStrength / elements.length) * 20)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return diffDays + ' days ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
