export function LearnPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">❓</span>
            <h1 className="text-xl font-semibold text-gray-900">Learn</h1>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="font-medium text-gray-900 mb-2">The Framework</h2>
              <p className="text-gray-600 text-sm">
                Finding Good is built on Brian Fretwell's Narrative Integrity methodology:
                <strong> Prioritize, Prove, Predict</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-gray-900 mb-2">Priority</h2>
              <p className="text-gray-600 text-sm">
                Name what actually matters. When you clarify your priorities, you create
                alignment between your actions and values.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-gray-900 mb-2">Proof</h2>
              <p className="text-gray-600 text-sm">
                Own the actions that created outcomes. Validating your growth builds
                confidence and reveals patterns.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-gray-900 mb-2">Predict</h2>
              <p className="text-gray-600 text-sm">
                Align with others on what's coming. Making predictions creates
                accountability and surfaces your true beliefs.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-gray-900 mb-2">Together</h2>
              <p className="text-gray-600 text-sm">
                The community layer that makes solo tools social. Share, recognize,
                and inspire others on their journey.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
