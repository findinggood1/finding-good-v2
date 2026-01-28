interface LockedFeatureProps {
  /** Feature name to display */
  featureName: string
  /** Optional description of what this feature does */
  description?: string
  /** Optional icon to display */
  icon?: string
}

/**
 * Displays a message for features that are only available to coached clients.
 */
export function LockedFeature({
  featureName,
  description,
  icon = '🔒',
}: LockedFeatureProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <span className="text-4xl mb-4 block">{icon}</span>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {featureName}
          </h1>
          {description && (
            <p className="text-gray-600 mb-6">{description}</p>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Coaching Feature</p>
            <p>
              This feature is available for clients working with a Finding Good coach.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-4">
              Interested in working with a coach?
            </p>
            <a
              href="https://findinggood.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              Learn more about coaching
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
