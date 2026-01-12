import { type PredictionFormData } from '../../types'
import { FIRES_COLORS } from '@finding-good/shared'

interface Step6AlignmentProps {
  data: PredictionFormData
  onChange: (updates: Partial<PredictionFormData>) => void
}

const FIRES_ELEMENTS = [
  { key: 'feelings', label: 'Feelings', fsKey: 'fs2', psKey: 'ps2' },
  { key: 'influence', label: 'Influence', fsKey: 'fs3', psKey: 'ps3' },
  { key: 'resilience', label: 'Resilience', fsKey: 'fs4', psKey: 'ps4' },
  { key: 'ethics', label: 'Ethics', fsKey: 'fs5', psKey: 'ps5' },
  { key: 'strengths', label: 'Strengths', fsKey: 'fs6', psKey: 'ps6' },
] as const

function getRatingLabel(value: number, type: 'confidence' | 'alignment'): string {
  if (value === 0) return 'Not rated'
  if (type === 'confidence') {
    return ['', 'Exploring', 'Considering', 'Confident', 'Certain'][value] || ''
  } else {
    return ['', 'Different', 'Related', 'Similar', 'Direct'][value] || ''
  }
}

function getRatingColor(value: number): string {
  if (value === 0) return 'bg-gray-200 text-gray-500'
  if (value <= 1) return 'bg-gray-300 text-gray-700'
  if (value === 2) return 'bg-amber-100 text-amber-700'
  if (value === 3) return 'bg-green-100 text-green-700'
  return 'bg-green-200 text-green-800'
}

export function Step6Alignment({ data }: Step6AlignmentProps) {
  // Calculate zone for each element based on confidence + alignment
  const getZone = (confidence: number, alignment: number): string => {
    const combined = confidence + alignment
    if (combined <= 2) return 'Exploring'
    if (combined <= 4) return 'Discovering'
    if (combined <= 6) return 'Performing'
    return 'Owning'
  }

  // Count connections
  const totalConnections = data.future_connections.length + data.past_connections.length

  return (
    <div className="space-y-6">
      {/* Educational intro */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <p className="text-sm font-medium text-amber-900 mb-1">Almost There</p>
        <p className="text-sm text-amber-800">
          You've connected your future vision to past evidence. Below is a summary of your ratings. When you complete this, you'll see your Predictability Score — how clearly you can see your path forward.
        </p>
      </div>

      {/* Goal Summary */}
      <div className="bg-brand-primary/5 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Goal</p>
        <p className="font-medium text-gray-900">{data.title}</p>
        {data.description && (
          <p className="text-sm text-gray-600 mt-1">{data.description}</p>
        )}
        <div className="flex gap-4 mt-3">
          <div>
            <span className="text-xs text-gray-500">Confidence</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRatingColor(data.future_story.fs1_confidence)}`}>
              {getRatingLabel(data.future_story.fs1_confidence, 'confidence')}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500">Alignment</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRatingColor(data.past_story.ps1_alignment)}`}>
              {getRatingLabel(data.past_story.ps1_alignment, 'alignment')}
            </span>
          </div>
        </div>
      </div>

      {/* FIRES Elements */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Zones</p>
        <p className="text-xs text-gray-500 -mt-2 mb-2">
          Based on your confidence (future) + alignment (past) ratings
        </p>
        
        {FIRES_ELEMENTS.map(({ key, label, fsKey, psKey }) => {
          const confidenceKey = `${fsKey}_confidence` as keyof typeof data.future_story
          const alignmentKey = `${psKey}_alignment` as keyof typeof data.past_story
          const confidence = data.future_story[confidenceKey] as number
          const alignment = data.past_story[alignmentKey] as number
          const zone = getZone(confidence, alignment)

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: FIRES_COLORS[key] }}
                  >
                    {key.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  zone === 'Owning' ? 'bg-green-100 text-green-700' :
                  zone === 'Performing' ? 'bg-blue-100 text-blue-700' :
                  zone === 'Discovering' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {zone}
                </span>
              </div>
              
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Confidence:</span>
                  <span className={`px-1.5 py-0.5 rounded ${getRatingColor(confidence)}`}>
                    {confidence || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Alignment:</span>
                  <span className={`px-1.5 py-0.5 rounded ${getRatingColor(alignment)}`}>
                    {alignment || '—'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Connections Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Support Network</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-brand-primary">{totalConnections}</span>
            <span className="text-gray-500 ml-1">of 8</span>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{data.future_connections.length} future supporters</div>
            <div>{data.past_connections.length} past supporters</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          +{Math.min(totalConnections * 2, 16)} points added to your score
        </p>
      </div>

      {/* What Happens Next */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">What Happens Next</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">→</span>
            <span>Your <strong>Predictability Score</strong> (0-100) based on clarity, confidence, and alignment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">→</span>
            <span>Patterns we see in your stories — <strong>in your own words</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">→</span>
            <span>Your <strong>Edge</strong> — where building more proof can increase your influence</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">→</span>
            <span>A <strong>question</strong> to carry with you</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
