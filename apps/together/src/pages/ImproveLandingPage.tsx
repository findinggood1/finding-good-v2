import { Link } from 'react-router-dom'
import { Card } from '@finding-good/shared'

export function ImproveLandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-2">IMPROVE</h1>
      <p className="text-lg text-gray-600 mb-2">
        How did growth actually happen?
      </p>
      <p className="text-gray-500 mb-8">
        Improvement isn't just about outcomes — it's about understanding the process.
        When you validate how you grew, you can repeat it. When you help others see their growth, you multiply it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/improve/self" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h2 className="text-lg font-semibold mb-2">For Yourself</h2>
            <p className="text-sm text-gray-600">
              Validate your improvement
            </p>
          </Card>
        </Link>
        <Link to="/improve/others" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h2 className="text-lg font-semibold mb-2">For Others</h2>
            <p className="text-sm text-gray-600">
              Help someone see their improvement
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
