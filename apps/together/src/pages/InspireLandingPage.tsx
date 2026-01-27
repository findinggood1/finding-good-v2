import { Link } from 'react-router-dom'
import { Card } from '@finding-good/shared'

export function InspireLandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-2">INSPIRE</h1>
      <p className="text-lg text-gray-600 mb-2">
        What do you believe is possible?
      </p>
      <p className="text-gray-500 mb-8">
        Inspiration comes from belief — in yourself and in others. When you name what you believe
        you can do, and when you tell others what you believe they can do, you create possibility.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/inspire/self" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h2 className="text-lg font-semibold mb-2">For Yourself</h2>
            <p className="text-sm text-gray-600">
              Define what you believe you can accomplish
            </p>
          </Card>
        </Link>
        <Link to="/inspire/others" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h2 className="text-lg font-semibold mb-2">For Others</h2>
            <p className="text-sm text-gray-600">
              Tell someone what you believe they can do
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
