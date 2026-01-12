import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">About Priority</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-10">
        
        {/* Section 1: What is Priority */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Build Your Evidence</h2>
          <p className="text-gray-700 mb-4">
            <strong className="text-brand-primary">Priority</strong> is a 2-minute daily practice that helps you notice what matters and build proof of how you show up.
          </p>
          <p className="text-gray-600 mb-4">
            Most people forget 90% of their small wins. This tool captures them so you can see your patterns over time.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 italic">
              "The days compound. Small proof becomes big confidence."
            </p>
          </div>
        </section>

        {/* Section 2: Three Questions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Three Questions</h2>
          <p className="text-gray-600 mb-4">Each day, you answer three simple questions:</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">What went well?</p>
                <p className="text-sm text-gray-600">Something that worked out, big or small</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">What was your part?</p>
                <p className="text-sm text-gray-600">What you did, decided, or contributed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900">What impact did it have?</p>
                <p className="text-sm text-gray-600">How it affected you, others, or the situation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: What You Get */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">What You Get</h2>
          <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10 mb-4">
            <p className="text-sm font-medium text-brand-primary mb-2">Your Proof Line</p>
            <p className="text-gray-700 italic">
              "I showed up fully today, even when it was hard, and it made a real difference."
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">A <strong>pattern</strong> naming what you naturally do</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700"><strong>FIRES elements</strong> present in your story</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">An <strong>insight</strong> reflecting what you showed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Your words <strong>reflected back</strong> to you</span>
            </div>
          </div>
        </section>

        {/* Section 4: The Science */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why It Works</h2>
          <p className="text-gray-700 mb-4">
            Daily reflection isn't just journaling — it's building a library of evidence you can draw on when you need confidence most.
          </p>
          
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900">Self-Efficacy</p>
              <p className="text-sm text-blue-700 mt-1">
                Your belief that you can succeed grows from remembering times you have. Each entry adds to that evidence.
              </p>
              <p className="text-xs text-blue-600 mt-2 italic">— Albert Bandura</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900">Pattern Recognition</p>
              <p className="text-sm text-purple-700 mt-1">
                Repeated entries reveal your natural approach to challenges. You start seeing what you consistently do well.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900">The Generation Effect</p>
              <p className="text-sm text-green-700 mt-1">
                Writing it yourself makes it stick better than reading advice. You're not just consuming — you're creating.
              </p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900">Attribution Training</p>
              <p className="text-sm text-amber-700 mt-1">
                Naming your role in outcomes builds agency. You start seeing yourself as someone who makes things happen.
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-4 italic">
            Two minutes a day. Over time, proof compounds.
          </p>
        </section>

        {/* Section 5: FIRES Framework */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">The FIRES Framework</h2>
          <p className="text-gray-700 mb-4">
            Each reflection is analyzed through the FIRES lens — five elements that show up when people create positive outcomes:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">🔥</span>
              <div>
                <p className="font-semibold text-gray-900">Feelings</p>
                <p className="text-sm text-gray-600">Emotional awareness, managing emotions, staying grounded</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-semibold text-gray-900">Influence</p>
                <p className="text-sm text-gray-600">Taking action, making an impact, leading or contributing</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">🌱</span>
              <div>
                <p className="font-semibold text-gray-900">Resilience</p>
                <p className="text-sm text-gray-600">Overcoming challenges, persistence, adaptability</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="font-semibold text-gray-900">Ethics</p>
                <p className="text-sm text-gray-600">Acting with integrity, staying true to values</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">💪</span>
              <div>
                <p className="font-semibold text-gray-900">Strengths</p>
                <p className="text-sm text-gray-600">Using talents, skills, or natural abilities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: The Ecosystem */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Finding Good Ecosystem</h2>
          <p className="text-gray-600 mb-4">
            Priority feeds into a connected system — daily proof becomes weekly patterns, which become predictable outcomes:
          </p>
          
          <div className="space-y-3">
            <div className="bg-white border-2 border-brand-primary rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Priority Builder</p>
              <p className="text-sm text-gray-600 mt-1">Daily — capture what went well and your role in it</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Prove Tool</p>
              <p className="text-sm text-gray-600 mt-1">Weekly — build transferable evidence of how you do things</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Predict Tool</p>
              <p className="text-sm text-gray-600 mt-1">Goals — see how clearly you can predict your outcomes</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Each tool builds the others. Daily priorities become weekly proof. Weekly proof becomes predictable outcomes.
          </p>
        </section>

        {/* CTA */}
        <section className="pt-4 pb-8">
          <Link
            to="/confirm"
            className="block w-full py-3 px-4 bg-brand-primary text-white rounded-lg font-medium text-center hover:bg-brand-primary/90 transition-colors"
          >
            Start Daily Check-in
          </Link>
        </section>

      </main>
    </div>
  )
}
