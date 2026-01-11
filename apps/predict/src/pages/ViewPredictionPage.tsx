import { Link, useParams } from 'react-router-dom'

export function ViewPredictionPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-blue-600">&larr; Back</Link>
        <h1 className="text-2xl font-bold">View Prediction</h1>
      </div>

      <p className="text-gray-500">Viewing prediction: {id}</p>

      <Link
        to={`/${id}/results`}
        className="mt-4 inline-block text-blue-600"
      >
        View Results &rarr;
      </Link>
    </div>
  )
}
