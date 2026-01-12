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
          <h1 className="text-lg font-semibold text-gray-900">About Predict</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-10">
        
        {/* Section 1: What is Predict */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">See Where You're Going</h2>
          <p className="text-gray-700 mb-4">
            <strong className="text-brand-primary">Predict</strong> is a 10-minute reflection that helps you understand how ready you are to achieve something that matters.
          </p>
          <p className="text-gray-600 mb-4">
            Most tools ask you to set goals. This one helps you see whether you can actually get there — by connecting your future vision to evidence from your past.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 italic">
              "Prediction isn't fortune-telling. It's clarity plus confidence."
            </p>
          </div>
        </section>

        {/* Section 2: What You Do */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">What You Do</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">Future Story</p>
                <p className="text-sm text-gray-600">Describe what success looks like as if it's already happened</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">Past Story</p>
                <p className="text-sm text-gray-600">Connect it to a time you've done something similar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900">Your Network</p>
                <p className="text-sm text-gray-600">Name the people who will be part of this journey</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Along the way, you rate your confidence (how sure you are) and alignment (how connected to your past).
          </p>
        </section>

        {/* Section 3: What You Get */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">What You Get</h2>
          <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10 mb-4">
            <div className="text-center mb-3">
              <span className="text-4xl font-bold text-brand-primary">85%</span>
              <p className="text-sm text-gray-600">Predictability Score</p>
            </div>
            <p className="text-xs text-gray-500 text-center">
              How clearly you can see your path forward
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Your <strong>pattern</strong> — what you naturally do well</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Your <strong>edge</strong> — where building proof increases influence</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">A <strong>question</strong> to carry with you</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Insights <strong>in your own words</strong></span>
            </div>
          </div>
        </section>

        {/* Section 4: The Science */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why It Works</h2>
          <p className="text-gray-700 mb-4">
            The Predict Tool is built on research showing that connecting your future vision to past evidence changes how you pursue goals — and whether you achieve them.
          </p>
          
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900">Mental Contrasting</p>
              <p className="text-sm text-blue-700 mt-1">
                Imagining success AND connecting it to reality increases follow-through 2-3x compared to positive visualization alone.
              </p>
              <p className="text-xs text-blue-600 mt-2 italic">— Gabriele Oettingen, 20+ years of research</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900">Self-Efficacy</p>
              <p className="text-sm text-purple-700 mt-1">
                Your belief that you can succeed comes primarily from remembering times you've done something similar. This is the strongest predictor of behavior change.
              </p>
              <p className="text-xs text-purple-600 mt-2 italic">— Albert Bandura</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900">Social Accountability</p>
              <p className="text-sm text-green-700 mt-1">
                Goals shared with others are significantly more likely to be achieved. Having even one person who knows your goal improves outcomes.
              </p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900">The Generation Effect</p>
              <p className="text-sm text-amber-700 mt-1">
                Information you generate yourself is remembered better than information you receive. You write your stories; the tool mirrors them back.
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-4 italic">
            The act of completing this changes your relationship to your goal.
          </p>
        </section>

        {/* Section 5: Philosophy */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Finding Good Philosophy</h2>
          <p className="text-gray-700 mb-4">
            Most leaders unknowingly lose trust not because of what they're doing, but because of the questions they aren't asking.
          </p>
          
          <div className="border-l-4 border-brand-primary pl-4 my-6">
            <p className="text-lg font-semibold text-gray-900">Narrative Integrity</p>
            <p className="text-gray-600 mt-1">
              The alignment between what you believe, what you say, and what you do.
            </p>
          </div>
          
          <p className="text-gray-700 mb-4">The Predict Tool measures three components:</p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></span>
              <div>
                <span className="font-semibold text-gray-900">Clarity</span>
                <p className="text-sm text-gray-600">Can you articulate what matters, simply and specifically?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></span>
              <div>
                <span className="font-semibold text-gray-900">Confidence</span>
                <p className="text-sm text-gray-600">Do you have evidence from past experience you can repeat?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></span>
              <div>
                <span className="font-semibold text-gray-900">Alignment</span>
                <p className="text-sm text-gray-600">Does your past approach map to your future vision?</p>
              </div>
            </div>
          </div>
          
          <div className="bg-brand-primary/5 rounded-lg p-4 border border-brand-primary/10">
            <p className="text-gray-700">
              When these align, you don't just set goals. You see where you're going — together.
            </p>
          </div>
        </section>

        {/* Section 6: The Ecosystem */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Finding Good Ecosystem</h2>
          <p className="text-gray-600 mb-4">
            Predict is part of a connected system of tools that build on each other:
          </p>
          
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Priority Builder</p>
              <p className="text-sm text-gray-600 mt-1">Daily practice that sharpens clarity on what matters</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Prove Tool</p>
              <p className="text-sm text-gray-600 mt-1">Weekly reflection that builds evidence of how you do things</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-brand-primary">Predict Tool</p>
              <p className="text-sm text-gray-600 mt-1">Snapshot that shows how clearly you can see where you're going</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Each tool builds the others. Daily priorities become weekly proof. Weekly proof becomes predictable outcomes.
          </p>
        </section>

        {/* CTA */}
        <section className="pt-4 pb-8">
          <Link
            to="/new"
            className="block w-full py-3 px-4 bg-brand-primary text-white rounded-lg font-medium text-center hover:bg-brand-primary/90 transition-colors"
          >
            Start a New Prediction
          </Link>
        </section>

      </main>
    </div>
  )
}
