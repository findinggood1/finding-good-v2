import { type PredictionFormData, type FutureConnection } from '../../types'

interface Step3FutureConnectionsProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

const EMPTY_CONNECTION: FutureConnection = {
  name: '',
  relationship: '',
  support_type: '',
  email: '',
  working_on_similar: false,
}

const MAX_CONNECTIONS = 4

export function Step3FutureConnections({ data, onChange }: Step3FutureConnectionsProps) {
  const connections = data.future_connections

  const addConnection = () => {
    if (connections.length < MAX_CONNECTIONS) {
      onChange({
        future_connections: [...connections, { ...EMPTY_CONNECTION }],
      })
    }
  }

  const updateConnection = (index: number, updates: Partial<FutureConnection>) => {
    const updated = connections.map((conn, i) =>
      i === index ? { ...conn, ...updates } : conn
    )
    onChange({ future_connections: updated })
  }

  const removeConnection = (index: number) => {
    onChange({
      future_connections: connections.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Who can be involved in helping you achieve this goal? Add up to {MAX_CONNECTIONS} people.
      </p>

      {connections.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No connections added yet</p>
          <button
            type="button"
            onClick={addConnection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Person
          </button>
        </div>
      )}

      {connections.map((conn, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Person {index + 1}</span>
            <button
              type="button"
              onClick={() => removeConnection(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={conn.name}
                onChange={(e) => updateConnection(index, { name: e.target.value })}
                placeholder="Their name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={conn.relationship}
                onChange={(e) => updateConnection(index, { relationship: e.target.value })}
                placeholder="e.g., Mentor, Friend"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How They'll Be Involved
              </label>
              <input
                type="text"
                value={conn.support_type}
                onChange={(e) => updateConnection(index, { support_type: e.target.value })}
                placeholder="e.g., Advice, Collaboration, Accountability"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={conn.email}
                onChange={(e) => updateConnection(index, { email: e.target.value })}
                placeholder="their@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conn.working_on_similar}
                  onChange={(e) => updateConnection(index, { working_on_similar: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">Working on something similar</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      {connections.length > 0 && connections.length < MAX_CONNECTIONS && (
        <button
          type="button"
          onClick={addConnection}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Person
        </button>
      )}
    </div>
  )
}
