import { useNavigate } from 'react-router-dom'

export function HistoryPage() {
  const navigate = useNavigate()

  // TODO: Fetch actual history
  const mockHistory = [
    { id: '1', date: 'Today', priority: 'Complete the project proposal', status: 'pending' },
    { id: '2', date: 'Yesterday', priority: 'Have a meaningful conversation with my team', status: 'completed' },
    { id: '3', date: '2 days ago', priority: 'Finish reading the chapter on leadership', status: 'completed' },
  ]

  return (
    <div className="min-h-screen bg-brand-cream p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-brand-primary"
          >
            Back
          </button>
          <h1 className="flex-1 text-center text-xl font-semibold text-gray-900">
            History
          </h1>
          <div className="w-10" />
        </div>

        <div className="space-y-4">
          {mockHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{item.date}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-gray-900 font-medium">{item.priority}</p>
            </div>
          ))}
        </div>

        {mockHistory.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No priorities recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
