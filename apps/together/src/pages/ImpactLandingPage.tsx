import { Link } from 'react-router-dom'
import { Card } from '@finding-good/shared'

export function ImpactLandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-2">IMPACT</h1>
      <p className="text-lg text-gray-600 mb-2">
        What went well? Where did you or others make a difference?
      </p>
      <p className="text-gray-500 mb-8">
        Impact is about recognizing the positive difference being made — by you and by others.
        When you notice impact, you strengthen your ability to create more of it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/impact/self" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h2 className="text-lg font-semibold mb-2">For Yourself</h2>
            <p className="text-sm text-gray-600">
              Record the impact you had today
            </p>
          </Card>
        </Link>
        <Link to="/impact/others" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h2 className="text-lg font-semibold mb-2">For Others</h2>
            <p className="text-sm text-gray-600">
              Recognize impact someone had on you
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
