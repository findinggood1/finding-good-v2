import { Link } from 'react-router-dom'

export function QuickPredictPage() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-blue-600">&larr; Back</Link>
        <h1 className="text-2xl font-bold">Quick Prediction</h1>
      </div>

      <p className="text-gray-500">Workshop quick-entry form coming soon...</p>
    </div>
  )
}
