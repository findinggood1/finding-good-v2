import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Card,
  getSupabase,
  useAuth,
  LoadingSpinner,
  FIRES_COLORS,
  selectGrowthOpportunity,
  select48HourQuestion,
  generateGrowthOpportunityText,
  type ZoneBreakdown,
  type Zone,
} from '@finding-good/shared'

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'list' | 'wizard' | 'results' | 'detail'
type PredictionType = 'goal' | 'challenge' | 'experience'
type FiresElement = 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths'

const FIRES_ORDER: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']
const FIRES_LABELS: Record<FiresElement, string> = {
  feelings: 'Feelings',
  influence: 'Influence',
  resilience: 'Resilience',
  ethics: 'Ethics',
  strengths: 'Strengths',
}

interface FutureConnection {
  name: string
  relationship: string
  support_type: string
  email: string
  working_on_similar: boolean
}

interface PastConnection {
  name: string
  how_they_supported: string
}

interface FutureStory {
  fs1_goal: string
  fs2_feelings: string
  fs3_influence: string
  fs4_resilience: string
  fs5_ethics: string
  fs6_strengths: string
  fs1_confidence: number
  fs2_confidence: number
  fs3_confidence: number
  fs4_confidence: number
  fs5_confidence: number
  fs6_confidence: number
}

interface PastStory {
  ps1_success: string
  ps2_feelings: string
  ps3_influence: string
  ps4_resilience: string
  ps5_ethics: string
  ps6_strengths: string
  ps1_alignment: number
  ps2_alignment: number
  ps3_alignment: number
  ps4_alignment: number
  ps5_alignment: number
  ps6_alignment: number
}

interface PredictionFormData {
  title: string
  type: PredictionType
  description: string
  what_matters_most: string
  future_story: FutureStory
  future_connections: FutureConnection[]
  past_story: PastStory
  past_connections: PastConnection[]
}

interface Prediction {
  id: string
  title: string
  type?: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  what_matters_most?: string
  share_to_feed?: boolean
  current_predictability_score?: number
  created_at: string
  updated_at: string
}

interface Snapshot {
  id: string
  prediction_id: string
  goal?: string
  success?: string
  fs_answers?: Record<string, string>
  ps_answers?: Record<string, string>
  alignment_scores?: Record<string, number>
  zone_scores?: Record<string, string>
  predictability_score?: number
  growth_opportunity?: string
  question_48hr?: string
  narrative?: string // JSON string of AIResponse
  created_at: string
}

// AI Narrative Response from predict-analyze edge function
interface AIResponse {
  // Score rationales
  clarity_level?: 'strong' | 'building' | 'emerging'
  clarity_rationale?: string
  confidence_level?: 'strong' | 'building' | 'emerging'
  confidence_rationale?: string
  alignment_level?: 'strong' | 'building' | 'emerging'
  alignment_rationale?: string

  // Pattern section
  pattern_name?: string
  pattern_quotes?: string[]
  pattern_curiosity?: string

  // Edge section
  edge_element?: string
  edge_why?: string
  edge_gap_future?: string
  edge_gap_past?: string
  edge_meaning?: string
  edge_question?: string

  // Network section
  network_summary?: Array<{ name: string; role: string }>
  network_why?: string
  network_who_else?: string

  // Legacy fallbacks
  pattern_insight?: string
  edge_insight?: string
  network_insight?: string
}

interface Connection {
  id: string
  prediction_id: string
  name: string
  relationship?: string
  involvement_type?: string
  how_involved?: string
  connection_time: 'future' | 'past'
}

const INITIAL_FORM_DATA: PredictionFormData = {
  title: '',
  type: 'goal',
  description: '',
  what_matters_most: '',
  future_story: {
    fs1_goal: '',
    fs2_feelings: '',
    fs3_influence: '',
    fs4_resilience: '',
    fs5_ethics: '',
    fs6_strengths: '',
    fs1_confidence: 0,
    fs2_confidence: 0,
    fs3_confidence: 0,
    fs4_confidence: 0,
    fs5_confidence: 0,
    fs6_confidence: 0,
  },
  future_connections: [],
  past_story: {
    ps1_success: '',
    ps2_feelings: '',
    ps3_influence: '',
    ps4_resilience: '',
    ps5_ethics: '',
    ps6_strengths: '',
    ps1_alignment: 0,
    ps2_alignment: 0,
    ps3_alignment: 0,
    ps4_alignment: 0,
    ps5_alignment: 0,
    ps6_alignment: 0,
  },
  past_connections: [],
}

const STEP_TITLES = [
  'Basic Info',
  'Future Story',
  'Future Connections',
  'Past Story',
  'Past Connections',
  'Review',
] as const

const TOTAL_STEPS = 6
const STORAGE_KEY = 'together-prediction-draft'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateZone(confidence: number, alignment: number): Zone {
  const combined = (confidence || 0) + (alignment || 0)
  if (combined <= 2) return 'Exploring'
  if (combined <= 4) return 'Discovering'
  if (combined <= 6) return 'Performing'
  return 'Owning'
}

function calculateZoneBreakdownFromRatings(
  confidenceRatings: Record<string, number>,
  alignmentRatings: Record<string, number>
): ZoneBreakdown {
  return {
    feelings: calculateZone(confidenceRatings.fs2, alignmentRatings.ps2),
    influence: calculateZone(confidenceRatings.fs3, alignmentRatings.ps3),
    resilience: calculateZone(confidenceRatings.fs4, alignmentRatings.ps4),
    ethics: calculateZone(confidenceRatings.fs5, alignmentRatings.ps5),
    strengths: calculateZone(confidenceRatings.fs6, alignmentRatings.ps6),
  }
}

function calculatePredictabilityFromRatings(
  confidenceRatings: Record<string, number>,
  alignmentRatings: Record<string, number>,
  connectionCount: number
): number {
  const confidenceSum = Object.values(confidenceRatings).reduce((sum, val) => sum + (val || 0), 0)
  const alignmentSum = Object.values(alignmentRatings).reduce((sum, val) => sum + (val || 0), 0)
  const baseScore = confidenceSum + alignmentSum
  const normalizedBase = Math.round((baseScore / 48) * 84)
  const connectionBonus = Math.min(connectionCount * 2, 16)
  return Math.min(normalizedBase + connectionBonus, 100)
}

// =============================================================================
// STEP COMPONENTS
// =============================================================================

// Progress Indicator
function ProgressIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick?: (step: number) => void }) {
  return (
    <div className="mb-8">
      <div className="relative">
        <div className="h-1 bg-gray-200 rounded-full">
          <div
            className="h-1 bg-brand-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep
            const isCurrent = step === currentStep
            const isClickable = onStepClick && step < currentStep

            return (
              <button
                key={step}
                type="button"
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-brand-primary text-white cursor-pointer hover:bg-brand-primary/80'
                    : isCurrent
                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                    : 'bg-gray-200 text-gray-500'
                } ${!isClickable ? 'cursor-default' : ''}`}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-500">Step {currentStep} of {TOTAL_STEPS}</span>
        <h2 className="text-lg font-semibold text-gray-900 mt-1">{STEP_TITLES[currentStep - 1]}</h2>
      </div>
    </div>
  )
}

// Confidence Rating Component
function ConfidenceRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const options = [
    { value: 1, description: 'Exploring' },
    { value: 2, description: 'Considering' },
    { value: 3, description: 'Confident' },
    { value: 4, description: 'Certain' },
  ]
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              value === opt.value
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-primary/50'
            }`}
            title={opt.description}
          >
            {opt.value}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">Exploring</span>
        <span className="text-xs text-gray-400">Certain</span>
      </div>
    </div>
  )
}

// Alignment Rating Component
function AlignmentRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const options = [
    { value: 1, description: 'Different' },
    { value: 2, description: 'Related' },
    { value: 3, description: 'Similar' },
    { value: 4, description: 'Direct' },
  ]
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              value === opt.value
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-primary/50'
            }`}
            title={opt.description}
          >
            {opt.value}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">Different</span>
        <span className="text-xs text-gray-400">Direct</span>
      </div>
    </div>
  )
}

// Step 1: Basic Info
function Step1BasicInfo({ data, onChange }: { data: PredictionFormData; onChange: (u: Partial<PredictionFormData>) => void }) {
  const typeOptions: { value: PredictionType; label: string; description: string }[] = [
    { value: 'goal', label: 'Goal', description: 'Something you want to achieve' },
    { value: 'challenge', label: 'Challenge', description: 'An obstacle to overcome' },
    { value: 'experience', label: 'Experience', description: 'Something you want to try' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-brand-primary/5 rounded-lg p-4 border border-brand-primary/10">
        <p className="text-sm text-gray-700">
          <span className="font-medium text-brand-primary">Predict</span> helps you see how ready you are to achieve something that matters. Connect your future vision to past evidence — and get a clear picture of your path forward.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          What goal, challenge, or experience are you focused on? <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Launch my own business"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">What type is this?</label>
        <div className="grid grid-cols-3 gap-3">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ type: option.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                data.type === option.value
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`font-medium ${data.type === option.value ? 'text-brand-primary' : 'text-gray-900'}`}>
                {option.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Add more details (optional)
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What's the context? Why does this matter now?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <label htmlFor="what_matters_most" className="block text-sm font-medium text-gray-700 mb-2">
          What do you want more of in your life right now?
        </label>
        <textarea
          id="what_matters_most"
          value={data.what_matters_most}
          onChange={(e) => onChange({ what_matters_most: e.target.value })}
          placeholder="e.g., More time with family, creative freedom, financial peace..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
        />
        <p className="mt-2 text-sm text-gray-500">
          This helps surface your Permission — what you're giving yourself permission to want more of.
        </p>
      </div>
    </div>
  )
}

// Step 2: Future Story
function Step2FutureStory({ data, onChange }: { data: PredictionFormData; onChange: (u: Partial<PredictionFormData>) => void }) {
  const questions: Array<{
    key: keyof FutureStory
    confidenceKey: keyof FutureStory
    element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths' | null
    label: string
    placeholder: string
    confidenceLabel: string
  }> = [
    { key: 'fs1_goal', confidenceKey: 'fs1_confidence', element: null, label: "Describe your goal as if you've already achieved it", placeholder: 'I have successfully...', confidenceLabel: 'How confident are you in this vision?' },
    { key: 'fs2_feelings', confidenceKey: 'fs2_confidence', element: 'feelings', label: 'When you imagine succeeding, how do you want to feel?', placeholder: 'I want to feel...', confidenceLabel: 'How confident are you this is the right feeling to aim for?' },
    { key: 'fs3_influence', confidenceKey: 'fs3_confidence', element: 'influence', label: "What's the most important action you'll need to take?", placeholder: 'The most important action is...', confidenceLabel: 'How confident are you this is the right action?' },
    { key: 'fs4_resilience', confidenceKey: 'fs4_confidence', element: 'resilience', label: 'What challenges might you face, and how will you overcome them?', placeholder: 'I might face... and I will overcome by...', confidenceLabel: 'How confident are you in your ability to overcome these?' },
    { key: 'fs5_ethics', confidenceKey: 'fs5_confidence', element: 'ethics', label: 'What values will guide your decisions along the way?', placeholder: 'The values that will guide me are...', confidenceLabel: 'How confident are you these are the right values to prioritize?' },
    { key: 'fs6_strengths', confidenceKey: 'fs6_confidence', element: 'strengths', label: 'What personal strengths will you rely on most?', placeholder: "The strengths I'll rely on are...", confidenceLabel: 'How confident are you these strengths will serve you?' },
  ]

  const updateStory = (key: keyof FutureStory, value: string | number) => {
    onChange({ future_story: { ...data.future_story, [key]: value } })
  }

  const goalValue = data.future_story.fs1_goal || data.title

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <p className="text-sm font-medium text-blue-900 mb-1">Future Story</p>
        <p className="text-sm text-blue-800">
          Describe success as if it's already happened. Research shows that vividly imagining your outcome — then connecting it to reality — increases follow-through significantly.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          After each answer, rate your confidence. This helps reveal where you're clear vs. still exploring.
        </p>
      </div>

      {questions.map((q, index) => {
        const textValue = q.key === 'fs1_goal' ? goalValue : (data.future_story[q.key] as string)
        const confidenceValue = data.future_story[q.confidenceKey] as number
        const hasText = textValue.trim().length > 0

        return (
          <div key={q.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                {q.element && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: FIRES_COLORS[q.element] }}
                  >
                    {q.element.charAt(0).toUpperCase()}
                  </span>
                )}
                {index + 1}. {q.label}
              </span>
            </label>
            <textarea
              value={textValue}
              onChange={(e) => updateStory(q.key, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
            />
            {hasText && (
              <ConfidenceRating
                value={confidenceValue}
                onChange={(val) => updateStory(q.confidenceKey, val)}
                label={q.confidenceLabel}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Step 3: Future Connections
function Step3FutureConnections({ data, onChange }: { data: PredictionFormData; onChange: (u: Partial<PredictionFormData>) => void }) {
  const connections = data.future_connections
  const MAX_CONNECTIONS = 4

  const addConnection = () => {
    if (connections.length < MAX_CONNECTIONS) {
      onChange({ future_connections: [...connections, { name: '', relationship: '', support_type: '', email: '', working_on_similar: false }] })
    }
  }

  const updateConnection = (index: number, updates: Partial<FutureConnection>) => {
    const updated = connections.map((conn, i) => (i === index ? { ...conn, ...updates } : conn))
    onChange({ future_connections: updated })
  }

  const removeConnection = (index: number) => {
    onChange({ future_connections: connections.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
        <p className="text-sm font-medium text-green-900 mb-1">Future Supporters</p>
        <p className="text-sm text-green-800">
          Who will be part of this journey? Goals shared with others are significantly more likely to be achieved. These aren't just helpers — they're witnesses to your priorities.
        </p>
        <p className="text-xs text-green-600 mt-2">
          Each supporter adds to your predictability score. You can add up to {MAX_CONNECTIONS} people here.
        </p>
      </div>

      {connections.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No connections added yet</p>
          <button type="button" onClick={addConnection} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Person
          </button>
        </div>
      )}

      {connections.map((conn, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Person {index + 1}</span>
            <button type="button" onClick={() => removeConnection(index)} className="text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" value={conn.name} onChange={(e) => updateConnection(index, { name: e.target.value })} placeholder="Their name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <input type="text" value={conn.relationship} onChange={(e) => updateConnection(index, { relationship: e.target.value })} placeholder="e.g., Mentor, Friend" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How They'll Help</label>
              <input type="text" value={conn.support_type} onChange={(e) => updateConnection(index, { support_type: e.target.value })} placeholder="e.g., Advice, Accountability" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input type="email" value={conn.email} onChange={(e) => updateConnection(index, { email: e.target.value })} placeholder="their@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={conn.working_on_similar} onChange={(e) => updateConnection(index, { working_on_similar: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                <span className="text-sm text-gray-700">Working on something similar</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      {connections.length > 0 && connections.length < MAX_CONNECTIONS && (
        <button type="button" onClick={addConnection} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Another Person
        </button>
      )}
    </div>
  )
}

// Step 4: Past Story
function Step4PastStory({ data, onChange }: { data: PredictionFormData; onChange: (u: Partial<PredictionFormData>) => void }) {
  const questions: Array<{
    key: keyof PastStory
    alignmentKey: keyof PastStory
    element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths' | null
    label: string
    placeholder: string
    alignmentLabel: string
  }> = [
    { key: 'ps1_success', alignmentKey: 'ps1_alignment', element: null, label: 'Describe a past success related to this goal', placeholder: 'A time when I succeeded at something similar was...', alignmentLabel: 'How aligned is this experience with your current goal?' },
    { key: 'ps2_feelings', alignmentKey: 'ps2_alignment', element: 'feelings', label: 'How did you feel when you achieved that success?', placeholder: 'I felt...', alignmentLabel: "How aligned is this feeling with what you're aiming for now?" },
    { key: 'ps3_influence', alignmentKey: 'ps3_alignment', element: 'influence', label: 'What was the most important action you took?', placeholder: 'The most important action I took was...', alignmentLabel: 'How aligned is this action with what you need to do now?' },
    { key: 'ps4_resilience', alignmentKey: 'ps4_alignment', element: 'resilience', label: 'What obstacles did you overcome?', placeholder: 'I overcame...', alignmentLabel: "How aligned is this experience with challenges you'll face?" },
    { key: 'ps5_ethics', alignmentKey: 'ps5_alignment', element: 'ethics', label: 'What values guided you?', placeholder: 'The values that guided me were...', alignmentLabel: 'How aligned are these values with your current goal?' },
    { key: 'ps6_strengths', alignmentKey: 'ps6_alignment', element: 'strengths', label: 'What strengths did you use?', placeholder: 'The strengths I used were...', alignmentLabel: "How aligned are these strengths with what you'll need now?" },
  ]

  const updateStory = (key: keyof PastStory, value: string | number) => {
    onChange({ past_story: { ...data.past_story, [key]: value } })
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <p className="text-sm font-medium text-purple-900 mb-1">Past Story</p>
        <p className="text-sm text-purple-800">
          Now connect your future to something you've already done. Your belief that you can succeed comes primarily from remembering similar wins. This isn't just reflection — it's building your own evidence.
        </p>
        <p className="text-xs text-purple-600 mt-2">
          After each answer, rate how aligned this past experience is with your current goal.
        </p>
      </div>

      {questions.map((q, index) => {
        const textValue = data.past_story[q.key] as string
        const alignmentValue = data.past_story[q.alignmentKey] as number
        const hasText = textValue.trim().length > 0

        return (
          <div key={q.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                {q.element && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: FIRES_COLORS[q.element] }}
                  >
                    {q.element.charAt(0).toUpperCase()}
                  </span>
                )}
                {index + 1}. {q.label}
              </span>
            </label>
            <textarea
              value={textValue}
              onChange={(e) => updateStory(q.key, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors resize-none"
            />
            {hasText && (
              <AlignmentRating
                value={alignmentValue}
                onChange={(val) => updateStory(q.alignmentKey, val)}
                label={q.alignmentLabel}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Step 5: Past Connections
function Step5PastConnections({ data, onChange }: { data: PredictionFormData; onChange: (u: Partial<PredictionFormData>) => void }) {
  const connections = data.past_connections
  const MAX_CONNECTIONS = 4

  const addConnection = () => {
    if (connections.length < MAX_CONNECTIONS) {
      onChange({ past_connections: [...connections, { name: '', how_they_supported: '' }] })
    }
  }

  const updateConnection = (index: number, updates: Partial<PastConnection>) => {
    const updated = connections.map((conn, i) => (i === index ? { ...conn, ...updates } : conn))
    onChange({ past_connections: updated })
  }

  const removeConnection = (index: number) => {
    onChange({ past_connections: connections.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <p className="text-sm font-medium text-purple-900 mb-1">Past Supporters</p>
        <p className="text-sm text-purple-800">
          Who helped you succeed before? Recognizing the people who were part of your past wins helps you see patterns in who supports you best — and reminds you that you don't do this alone.
        </p>
        <p className="text-xs text-purple-600 mt-2">You can add up to {MAX_CONNECTIONS} people from your past success.</p>
      </div>

      {connections.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">No connections added yet</p>
          <button type="button" onClick={addConnection} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Person
          </button>
        </div>
      )}

      {connections.map((conn, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Person {index + 1}</span>
            <button type="button" onClick={() => removeConnection(index)} className="text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={conn.name} onChange={(e) => updateConnection(index, { name: e.target.value })} placeholder="Their name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How were they involved?</label>
            <textarea value={conn.how_they_supported} onChange={(e) => updateConnection(index, { how_they_supported: e.target.value })} placeholder="What role did they play in your success?" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-none" />
          </div>
        </div>
      ))}

      {connections.length > 0 && connections.length < MAX_CONNECTIONS && (
        <button type="button" onClick={addConnection} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Another Person
        </button>
      )}
    </div>
  )
}

// Step 6: Review
function Step6Review({ data }: { data: PredictionFormData }) {
  const getRatingLabel = (value: number, type: 'confidence' | 'alignment'): string => {
    if (value === 0) return 'Not rated'
    if (type === 'confidence') return ['', 'Exploring', 'Considering', 'Confident', 'Certain'][value] || ''
    return ['', 'Different', 'Related', 'Similar', 'Direct'][value] || ''
  }

  const getRatingColor = (value: number): string => {
    if (value === 0) return 'bg-gray-200 text-gray-500'
    if (value <= 1) return 'bg-gray-300 text-gray-700'
    if (value === 2) return 'bg-amber-100 text-amber-700'
    if (value === 3) return 'bg-green-100 text-green-700'
    return 'bg-green-200 text-green-800'
  }

  const getZone = (confidence: number, alignment: number): string => {
    const combined = confidence + alignment
    if (combined <= 2) return 'Exploring'
    if (combined <= 4) return 'Discovering'
    if (combined <= 6) return 'Performing'
    return 'Owning'
  }

  const totalConnections = data.future_connections.length + data.past_connections.length

  const firesElements = [
    { key: 'feelings' as const, label: 'Feelings', fsKey: 'fs2', psKey: 'ps2' },
    { key: 'influence' as const, label: 'Influence', fsKey: 'fs3', psKey: 'ps3' },
    { key: 'resilience' as const, label: 'Resilience', fsKey: 'fs4', psKey: 'ps4' },
    { key: 'ethics' as const, label: 'Ethics', fsKey: 'fs5', psKey: 'ps5' },
    { key: 'strengths' as const, label: 'Strengths', fsKey: 'fs6', psKey: 'ps6' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <p className="text-sm font-medium text-amber-900 mb-1">Almost There</p>
        <p className="text-sm text-amber-800">
          You've connected your future vision to past evidence. Below is a summary of your ratings. When you complete this, you'll see your Predictability Score.
        </p>
      </div>

      <div className="bg-brand-primary/5 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Goal</p>
        <p className="font-medium text-gray-900">{data.title}</p>
        {data.description && <p className="text-sm text-gray-600 mt-1">{data.description}</p>}
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

      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Zones</p>
        <p className="text-xs text-gray-500 -mt-2 mb-2">Based on your confidence (future) + alignment (past) ratings</p>

        {firesElements.map(({ key, label, fsKey, psKey }) => {
          const confidenceKey = `${fsKey}_confidence` as keyof FutureStory
          const alignmentKey = `${psKey}_alignment` as keyof PastStory
          const confidence = data.future_story[confidenceKey] as number
          const alignment = data.past_story[alignmentKey] as number
          const zone = getZone(confidence, alignment)

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: FIRES_COLORS[key] }}>
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
                  <span className={`px-1.5 py-0.5 rounded ${getRatingColor(confidence)}`}>{confidence || '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Alignment:</span>
                  <span className={`px-1.5 py-0.5 rounded ${getRatingColor(alignment)}`}>{alignment || '—'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
        <p className="text-xs text-gray-500 mt-2">+{Math.min(totalConnections * 2, 16)} points added to your score</p>
      </div>

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

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

interface PredictPageProps {
  pageTitle?: string
  mode?: 'self' | 'send'
  // toolName reserved for future detailed label updates
}

export function PredictPage({ pageTitle = 'Predict', mode: propMode }: PredictPageProps) {
  const [searchParams] = useSearchParams()
  const { userEmail } = useAuth()
  const urlMode = searchParams.get('mode')
  const isSendMode = propMode === 'send' || urlMode === 'send'

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // List state
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PredictionFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { return JSON.parse(saved) } catch { return INITIAL_FORM_DATA }
    }
    return INITIAL_FORM_DATA
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Results/Detail state
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null)
  const [selectedConnections, setSelectedConnections] = useState<Connection[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [narrative, setNarrative] = useState<AIResponse | null>(null)
  const [generatingNarrative, setGeneratingNarrative] = useState(false)
  const [narrativeError, setNarrativeError] = useState<string | null>(null)

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Full details expanded state
  const [showFullDetails, setShowFullDetails] = useState(false)

  // Save to localStorage on change
  useEffect(() => {
    if (viewMode === 'wizard') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData, viewMode])

  // Fetch predictions
  useEffect(() => {
    async function fetchPredictions() {
      setLoading(true)
      setError(null)
      try {
        const supabase = getSupabase()
        const { data, error: fetchError } = await supabase
          .from('predictions')
          .select('*')
          .order('updated_at', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
          setPredictions([])
        } else {
          setPredictions(data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions')
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }

    if (viewMode === 'list') {
      fetchPredictions()
    }
  }, [viewMode])

  const updateFormData = (updates: Partial<PredictionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleStepClick = (step: number) => {
    if (!saving) {
      setCurrentStep(step)
      window.scrollTo(0, 0)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length > 0
      default:
        return true
    }
  }

  interface SaveResult {
    success: boolean
    predictionId?: string
    snapshotId?: string
    goal?: string
    pastSuccess?: string | null
    fsAnswers?: Record<string, string>
    psAnswers?: Record<string, string>
    zoneBreakdown?: ZoneBreakdown
    growthOpportunity?: string
    confidenceRatings?: Record<string, number>
    alignmentRatings?: Record<string, number>
    totalConnectionCount?: number
  }

  const savePrediction = useCallback(async (): Promise<SaveResult> => {
    if (!userEmail) return { success: false }

    setSaving(true)
    setSaveError(null)

    try {
      const supabase = getSupabase()

      // Ensure client exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle()

      if (!existingClient) {
        await supabase.from('clients').insert({ email: userEmail, status: 'pending' })
      }

      // Save prediction
      const { data: prediction, error: predictionError } = await supabase
        .from('predictions')
        .insert({
          client_email: userEmail,
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          status: 'active',
          what_matters_most: formData.what_matters_most || null,
        })
        .select('id')
        .single()

      if (predictionError) throw new Error(predictionError.message)

      const predictionId = prediction.id

      // Save future connections
      const validFutureConnections = formData.future_connections.filter(c => c.name.trim())
      if (validFutureConnections.length > 0) {
        await supabase.from('prediction_connections').insert(
          validFutureConnections.map(conn => ({
            prediction_id: predictionId,
            client_email: userEmail,
            name: conn.name,
            relationship: conn.relationship || null,
            involvement_type: conn.support_type || null,
            email: conn.email || null,
            working_on_similar: conn.working_on_similar,
            connection_time: 'future',
          }))
        )
      }

      // Save past connections
      const validPastConnections = formData.past_connections.filter(c => c.name.trim())
      if (validPastConnections.length > 0) {
        await supabase.from('prediction_connections').insert(
          validPastConnections.map(conn => ({
            prediction_id: predictionId,
            client_email: userEmail,
            name: conn.name,
            how_involved: conn.how_they_supported || null,
            connection_time: 'past',
          }))
        )
      }

      // Calculate scores
      const confidenceRatings: Record<string, number> = {
        fs1: formData.future_story.fs1_confidence,
        fs2: formData.future_story.fs2_confidence,
        fs3: formData.future_story.fs3_confidence,
        fs4: formData.future_story.fs4_confidence,
        fs5: formData.future_story.fs5_confidence,
        fs6: formData.future_story.fs6_confidence,
      }
      const alignmentRatings: Record<string, number> = {
        ps1: formData.past_story.ps1_alignment,
        ps2: formData.past_story.ps2_alignment,
        ps3: formData.past_story.ps3_alignment,
        ps4: formData.past_story.ps4_alignment,
        ps5: formData.past_story.ps5_alignment,
        ps6: formData.past_story.ps6_alignment,
      }

      const totalConnectionCount = validFutureConnections.length + validPastConnections.length
      const zoneBreakdown = calculateZoneBreakdownFromRatings(confidenceRatings, alignmentRatings)
      const predictabilityScore = calculatePredictabilityFromRatings(confidenceRatings, alignmentRatings, totalConnectionCount)
      const growthElement = selectGrowthOpportunity(zoneBreakdown)
      const growthZone = zoneBreakdown[growthElement]
      const growthOpportunity = generateGrowthOpportunityText(growthElement, growthZone)
      const question48hr = select48HourQuestion(growthElement, growthZone)

      const fsAnswers = {
        fs1: formData.future_story.fs1_goal,
        fs2: formData.future_story.fs2_feelings,
        fs3: formData.future_story.fs3_influence,
        fs4: formData.future_story.fs4_resilience,
        fs5: formData.future_story.fs5_ethics,
        fs6: formData.future_story.fs6_strengths,
      }
      const psAnswers = {
        ps1: formData.past_story.ps1_success,
        ps2: formData.past_story.ps2_feelings,
        ps3: formData.past_story.ps3_influence,
        ps4: formData.past_story.ps4_resilience,
        ps5: formData.past_story.ps5_ethics,
        ps6: formData.past_story.ps6_strengths,
      }

      const goal = formData.future_story.fs1_goal || formData.title
      const success = formData.past_story.ps1_success || null

      const legacyAlignmentScores = {
        q1: alignmentRatings.ps1 || 0,
        q2: alignmentRatings.ps2 || 0,
        q3: alignmentRatings.ps3 || 0,
        q4: alignmentRatings.ps4 || 0,
        q5: alignmentRatings.ps5 || 0,
        q6: alignmentRatings.ps6 || 0,
      }

      // Create snapshot
      const { data: snapshot } = await supabase
        .from('snapshots')
        .insert({
          prediction_id: predictionId,
          client_email: userEmail,
          goal,
          success,
          fs_answers: fsAnswers,
          ps_answers: psAnswers,
          alignment_scores: legacyAlignmentScores,
          zone_scores: zoneBreakdown,
          predictability_score: predictabilityScore,
          growth_opportunity: growthOpportunity,
          question_48hr: question48hr,
        })
        .select('id')
        .single()

      // Update prediction with snapshot
      if (snapshot?.id) {
        await supabase
          .from('predictions')
          .update({
            latest_snapshot_id: snapshot.id,
            current_predictability_score: predictabilityScore,
            connection_count: totalConnectionCount,
          })
          .eq('id', predictionId)
      }

      // Clear draft
      localStorage.removeItem(STORAGE_KEY)

      return {
        success: true,
        predictionId,
        snapshotId: snapshot?.id,
        goal,
        pastSuccess: success,
        fsAnswers,
        psAnswers,
        zoneBreakdown,
        growthOpportunity,
        confidenceRatings,
        alignmentRatings,
        totalConnectionCount,
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
      return { success: false }
    } finally {
      setSaving(false)
    }
  }, [userEmail, formData])

  // Call predict-analyze edge function
  const generateAINarrative = useCallback(async (
    snapshotId: string,
    goal: string,
    success: string | null,
    fsAnswers: Record<string, string>,
    psAnswers: Record<string, string>,
    zoneScores: Record<string, string>,
    growthOpportunity: string,
    confidenceRatings: Record<string, number>,
    alignmentRatings: Record<string, number>,
    connections: Connection[]
  ) => {
    setGeneratingNarrative(true)
    setNarrativeError(null)

    try {
      const supabase = getSupabase()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const functionUrl = `${supabaseUrl}/functions/v1/predict-analyze`

      const { data: { session } } = await supabase.auth.getSession()

      const futureConns = connections
        .filter(c => c.connection_time === 'future')
        .map(c => ({ name: c.name, involvement_type: c.involvement_type }))
      const pastConns = connections
        .filter(c => c.connection_time === 'past')
        .map(c => ({ name: c.name, how_involved: c.how_involved }))

      // Legacy alignment scores format
      const legacyAlignmentScores = {
        q1: alignmentRatings.ps1 || 0,
        q2: alignmentRatings.ps2 || 0,
        q3: alignmentRatings.ps3 || 0,
        q4: alignmentRatings.ps4 || 0,
        q5: alignmentRatings.ps5 || 0,
        q6: alignmentRatings.ps6 || 0,
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          goal,
          success,
          fs_answers: fsAnswers,
          ps_answers: psAnswers,
          zone_scores: zoneScores,
          growth_opportunity: growthOpportunity,
          alignment_scores: legacyAlignmentScores,
          confidence_ratings: confidenceRatings,
          alignment_ratings: alignmentRatings,
          connections: { future: futureConns, past: pastConns },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Edge function error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()

      if (!result.success || !result.narrative) {
        throw new Error(result.error || 'No narrative returned')
      }

      // Save narrative to snapshot
      await supabase
        .from('snapshots')
        .update({ narrative: JSON.stringify(result.narrative) })
        .eq('id', snapshotId)

      setNarrative(result.narrative)
    } catch (err) {
      console.error('[generateAINarrative] Error:', err)
      setNarrativeError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setGeneratingNarrative(false)
    }
  }, [])

  const fetchPredictionDetail = useCallback(async (predictionId: string) => {
    setDetailLoading(true)
    setNarrative(null)
    try {
      const supabase = getSupabase()

      // Fetch prediction
      const { data: prediction, error: predError } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', predictionId)
        .single()

      if (predError) throw predError
      setSelectedPrediction(prediction)

      // Fetch snapshot
      const { data: snapshot } = await supabase
        .from('snapshots')
        .select('*')
        .eq('prediction_id', predictionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSelectedSnapshot(snapshot || null)

      // Parse narrative if exists
      if (snapshot?.narrative) {
        try {
          const parsedNarrative = JSON.parse(snapshot.narrative) as AIResponse
          setNarrative(parsedNarrative)
        } catch {
          console.error('Failed to parse narrative')
        }
      }

      // Fetch connections
      const { data: connections } = await supabase
        .from('prediction_connections')
        .select('*')
        .eq('prediction_id', predictionId)

      setSelectedConnections(connections || [])
    } catch (err) {
      console.error('Failed to fetch prediction detail:', err)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const handleViewPrediction = async (prediction: Prediction) => {
    setSelectedPrediction(prediction)
    setViewMode('detail')
    await fetchPredictionDetail(prediction.id)
  }

  const handleSubmit = async () => {
    const result = await savePrediction()
    if (result.success && result.predictionId) {
      setFormData(INITIAL_FORM_DATA)
      setCurrentStep(1)

      // Show results view
      await fetchPredictionDetail(result.predictionId)
      setViewMode('results')

      // Trigger AI narrative generation in background (non-blocking)
      if (result.snapshotId && result.goal && result.fsAnswers && result.psAnswers && result.zoneBreakdown) {
        // Fetch connections for AI call
        const supabase = getSupabase()
        const { data: connections } = await supabase
          .from('prediction_connections')
          .select('*')
          .eq('prediction_id', result.predictionId)

        generateAINarrative(
          result.snapshotId,
          result.goal,
          result.pastSuccess || null,
          result.fsAnswers,
          result.psAnswers,
          result.zoneBreakdown as unknown as Record<string, string>,
          result.growthOpportunity || '',
          result.confidenceRatings || {},
          result.alignmentRatings || {},
          connections || []
        )
      }
    }
  }

  const handleDiscard = () => {
    if (!saving && confirm('Are you sure you want to discard this prediction?')) {
      localStorage.removeItem(STORAGE_KEY)
      setFormData(INITIAL_FORM_DATA)
      setCurrentStep(1)
      setViewMode('list')
    }
  }

  const handleDeletePrediction = async (id: string, fromDetail = false) => {
    if (!fromDetail && !showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      const supabase = getSupabase()

      console.log('[Delete] Starting delete for prediction:', id)

      // Cascade delete: connections first
      const { error: connError } = await supabase
        .from('prediction_connections')
        .delete()
        .eq('prediction_id', id)

      if (connError) {
        console.error('[Delete] Failed to delete connections:', connError)
      } else {
        console.log('[Delete] Deleted connections for prediction:', id)
      }

      // Then snapshots
      const { error: snapError } = await supabase
        .from('snapshots')
        .delete()
        .eq('prediction_id', id)

      if (snapError) {
        console.error('[Delete] Failed to delete snapshots:', snapError)
      } else {
        console.log('[Delete] Deleted snapshots for prediction:', id)
      }

      // Finally prediction
      const { error: deleteError, data: deletedData } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id)
        .select()

      console.log('[Delete] Prediction delete result:', { deleteError, deletedData })

      if (deleteError) {
        throw deleteError
      }

      if (!deletedData || deletedData.length === 0) {
        console.warn('[Delete] No rows deleted - prediction may not exist or RLS blocking')
      }

      console.log('[Delete] Successfully deleted prediction:', id)

      // Update local state
      setPredictions(predictions.filter(p => p.id !== id))
      setShowDeleteConfirm(false)
      setSelectedPrediction(null)

      if (viewMode === 'detail' || viewMode === 'results') {
        setSelectedSnapshot(null)
        setSelectedConnections([])
        setViewMode('list')
      }

      // Refetch to ensure sync with database
      const { data: freshData } = await supabase
        .from('predictions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (freshData) {
        console.log('[Delete] Refetched predictions, count:', freshData.length)
        setPredictions(freshData)
      }
    } catch (err) {
      console.error('[Delete] Failed to delete prediction:', err)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Completed</span>
      case 'archived':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Archived</span>
      default:
        return null
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1BasicInfo data={formData} onChange={updateFormData} />
      case 2: return <Step2FutureStory data={formData} onChange={updateFormData} />
      case 3: return <Step3FutureConnections data={formData} onChange={updateFormData} />
      case 4: return <Step4PastStory data={formData} onChange={updateFormData} />
      case 5: return <Step5PastConnections data={formData} onChange={updateFormData} />
      case 6: return <Step6Review data={formData} />
      default: return null
    }
  }

  // =============================================================================
  // LIST VIEW
  // =============================================================================
  if (viewMode === 'list') {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-brand-primary">
              {isSendMode ? 'Inspire Someone' : pageTitle}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setViewMode('wizard')}
              className="flex items-center justify-center gap-2 bg-brand-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <Link
              to="/predict/quick"
              className="flex items-center justify-center gap-2 bg-white text-gray-700 py-3 px-4 rounded-xl font-medium border border-gray-200 hover:border-brand-primary/30 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick
            </Link>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Predictions</h2>

            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                <p className="font-medium">Failed to load predictions</p>
                <p className="text-red-500 mt-1">{error}</p>
                <button onClick={() => setViewMode('list')} className="mt-2 text-red-700 underline hover:no-underline">
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && predictions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">No predictions yet</h3>
                <p className="text-sm text-gray-500 mb-4">Create your first prediction to get started</p>
                <button
                  onClick={() => setViewMode('wizard')}
                  className="inline-flex items-center gap-2 bg-brand-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Prediction
                </button>
              </div>
            )}

            {!loading && !error && predictions.length > 0 && (
              <div className="space-y-3">
                {predictions.map((prediction) => (
                  <Card
                    key={prediction.id}
                    padding="md"
                    className="group cursor-pointer hover:border-brand-primary/30 transition-colors"
                    onClick={() => handleViewPrediction(prediction)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{prediction.title}</h3>
                          {getStatusBadge(prediction.status)}
                        </div>
                        {prediction.current_predictability_score !== undefined && (
                          <p className="text-sm text-brand-primary font-medium mb-1">
                            Score: {prediction.current_predictability_score}%
                          </p>
                        )}
                        {prediction.what_matters_most && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{prediction.what_matters_most}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Updated {new Date(prediction.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPrediction(prediction)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedPrediction && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Prediction?</h3>
                    <p className="text-gray-600 text-sm">
                      This will permanently delete "{selectedPrediction.title}" and all its data. This cannot be undone.
                    </p>
                  </div>

                  {deleteError && (
                    <p className="text-sm text-red-600 text-center mb-4">{deleteError}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setSelectedPrediction(null)
                        setDeleteError(null)
                      }}
                      disabled={deleting}
                      className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeletePrediction(selectedPrediction.id, true)}
                      disabled={deleting}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
            <h3 className="font-medium text-brand-primary mb-2">About Predictions</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Predictions help you align with others on what's coming. Connect your future vision to past evidence and see how ready you are to succeed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // =============================================================================
  // RESULTS VIEW (shown after completing wizard)
  // =============================================================================
  if (viewMode === 'results' && selectedPrediction) {
    const futureConnections = selectedConnections.filter(c => c.connection_time === 'future')
    const pastConnections = selectedConnections.filter(c => c.connection_time === 'past')
    const totalConnections = futureConnections.length + pastConnections.length

    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setViewMode('list')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Your Results</h1>
            <div className="w-6" />
          </div>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Goal Card */}
              <Card padding="lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded capitalize">
                    {selectedPrediction.type || 'goal'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedPrediction.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPrediction.title}</h2>
                {selectedPrediction.description && (
                  <p className="text-gray-600 mt-2 text-sm">{selectedPrediction.description}</p>
                )}
              </Card>

              {/* Predictability Score with Clarity/Confidence/Alignment */}
              {selectedSnapshot?.predictability_score !== undefined && (
                <Card padding="lg">
                  <div className="text-center mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Predictability</p>
                    <div className="text-5xl font-bold text-brand-primary mb-1">
                      {selectedSnapshot.predictability_score}%
                    </div>
                    <p className="text-sm text-gray-500">How clearly you can see your path forward</p>
                    <p className="text-xs text-gray-400 mt-1">Most people start between 55-70%</p>
                  </div>

                  {/* Clarity / Confidence / Alignment breakdown */}
                  {(narrative || generatingNarrative) && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {/* Clarity */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Clarity</span>
                          <span className="text-xs text-gray-500">{narrative?.clarity_level || 'Analyzing...'}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            narrative?.clarity_level === 'strong' ? 'bg-green-500 w-[85%]' :
                            narrative?.clarity_level === 'building' ? 'bg-amber-500 w-[60%]' :
                            narrative?.clarity_level === 'emerging' ? 'bg-gray-400 w-[35%]' :
                            'bg-gray-300 w-[50%]'
                          }`} />
                        </div>
                        {narrative?.clarity_rationale && (
                          <p className="text-xs text-gray-500 mt-1">{narrative.clarity_rationale}</p>
                        )}
                      </div>

                      {/* Confidence */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Confidence</span>
                          <span className="text-xs text-gray-500">{narrative?.confidence_level || 'Analyzing...'}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            narrative?.confidence_level === 'strong' ? 'bg-green-500 w-[85%]' :
                            narrative?.confidence_level === 'building' ? 'bg-amber-500 w-[60%]' :
                            narrative?.confidence_level === 'emerging' ? 'bg-gray-400 w-[35%]' :
                            'bg-gray-300 w-[50%]'
                          }`} />
                        </div>
                        {narrative?.confidence_rationale && (
                          <p className="text-xs text-gray-500 mt-1">{narrative.confidence_rationale}</p>
                        )}
                      </div>

                      {/* Alignment */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Alignment</span>
                          <span className="text-xs text-gray-500">{narrative?.alignment_level || 'Analyzing...'}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            narrative?.alignment_level === 'strong' ? 'bg-green-500 w-[85%]' :
                            narrative?.alignment_level === 'building' ? 'bg-amber-500 w-[60%]' :
                            narrative?.alignment_level === 'emerging' ? 'bg-gray-400 w-[35%]' :
                            'bg-gray-300 w-[50%]'
                          }`} />
                        </div>
                        {narrative?.alignment_rationale && (
                          <p className="text-xs text-gray-500 mt-1">{narrative.alignment_rationale}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Support Network contribution */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Support Network</span>
                      <span className="text-sm font-medium text-brand-primary">+{Math.min(totalConnections * 2, 16)} pts</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalConnections} of 8 supporters identified
                    </p>
                  </div>
                </Card>
              )}

              {/* Generate Insights (if narrative missing) */}
              {!narrative && !generatingNarrative && selectedSnapshot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Ready to see your patterns?</p>
                        <p className="text-sm text-blue-700">Generate AI insights from your responses.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedSnapshot.id && selectedSnapshot.goal && selectedSnapshot.fs_answers && selectedSnapshot.ps_answers && selectedSnapshot.zone_scores) {
                          generateAINarrative(
                            selectedSnapshot.id,
                            selectedSnapshot.goal,
                            selectedSnapshot.success || null,
                            selectedSnapshot.fs_answers,
                            selectedSnapshot.ps_answers,
                            selectedSnapshot.zone_scores,
                            selectedSnapshot.growth_opportunity || '',
                            {}, // confidence ratings not stored
                            {}, // alignment ratings not stored
                            selectedConnections
                          )
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      See Patterns
                    </button>
                  </div>
                  {narrativeError && (
                    <p className="mt-2 text-sm text-red-600">{narrativeError}</p>
                  )}
                </div>
              )}

              {/* Generating Indicator */}
              {generatingNarrative && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Analyzing your responses...</p>
                      <p className="text-sm text-amber-700">Finding patterns in your stories.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* What Your Stories Reveal (Pattern) */}
              {narrative?.pattern_name && (
                <Card padding="lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What Your Stories Reveal</p>
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Your Pattern</p>
                    <p className="text-lg font-semibold text-gray-900">{narrative.pattern_name}</p>
                  </div>
                  {narrative.pattern_quotes && narrative.pattern_quotes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">In Your Words</p>
                      <div className="space-y-2">
                        {narrative.pattern_quotes.map((quote, i) => (
                          <p key={i} className="text-sm text-gray-700 italic border-l-2 border-brand-primary/30 pl-3">
                            "{quote}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {narrative.pattern_curiosity && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Where Curiosity Helps</p>
                      <p className="text-sm text-gray-600">{narrative.pattern_curiosity}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Zone Summary */}
              {selectedSnapshot?.zone_scores && (
                <Card padding="lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Where You Stand</p>
                  <div className="space-y-2">
                    {FIRES_ORDER.map((element) => {
                      const zone = selectedSnapshot.zone_scores?.[element]
                      if (!zone) return null
                      const isEdge = narrative?.edge_element === element
                      return (
                        <div key={element} className={`flex items-center gap-3 p-2 rounded-lg ${isEdge ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-gray-50'}`}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: FIRES_COLORS[element] }}
                          >
                            {element.charAt(0).toUpperCase()}
                          </div>
                          <span className="flex-1 font-medium text-gray-900">{FIRES_LABELS[element]}</span>
                          {isEdge && <span className="text-xs text-amber-700 font-medium">EDGE</span>}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            zone === 'Owning' ? 'bg-green-100 text-green-700' :
                            zone === 'Performing' ? 'bg-blue-100 text-blue-700' :
                            zone === 'Discovering' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {zone}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* Your Edge (detailed AI insight) */}
              {narrative?.edge_element && narrative?.edge_why && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: FIRES_COLORS[narrative.edge_element as FiresElement] || '#666' }}
                    >
                      {narrative.edge_element.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                        Your Edge: {FIRES_LABELS[narrative.edge_element as FiresElement] || narrative.edge_element}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mb-3">{narrative.edge_why}</p>

                      {(narrative.edge_gap_future || narrative.edge_gap_past) && (
                        <div className="bg-white/50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-500 mb-2">The Gap</p>
                          <div className="space-y-2 text-sm">
                            {narrative.edge_gap_future && (
                              <div>
                                <span className="text-xs text-gray-400">Future: </span>
                                <span className="text-gray-700 italic">"{narrative.edge_gap_future}"</span>
                              </div>
                            )}
                            {narrative.edge_gap_past && (
                              <div>
                                <span className="text-xs text-gray-400">Past: </span>
                                <span className="text-gray-700 italic">"{narrative.edge_gap_past}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {narrative.edge_meaning && (
                        <p className="text-sm text-gray-700 mb-4">{narrative.edge_meaning}</p>
                      )}

                      {narrative.edge_question && (
                        <div className="pt-3 border-t border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Question to Consider</p>
                          <p className="text-gray-900 font-medium">{narrative.edge_question}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback: Static Growth Opportunity (if no AI narrative) */}
              {!narrative?.edge_element && selectedSnapshot?.growth_opportunity && (
                <Card padding="lg" className="bg-amber-50 border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Your Edge</p>
                  <p className="text-gray-800">{selectedSnapshot.growth_opportunity}</p>
                </Card>
              )}

              {/* 48-Hour Question (fallback if no AI) */}
              {!narrative?.edge_question && selectedSnapshot?.question_48hr && (
                <Card padding="lg" className="bg-brand-primary/5 border-brand-primary/20">
                  <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">Question to Carry</p>
                  <p className="text-gray-900 font-medium">{selectedSnapshot.question_48hr}</p>
                </Card>
              )}

              {/* Who's In This With You (Network) */}
              {(totalConnections > 0 || narrative?.network_summary) && (
                <Card padding="lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Who's In This With You</p>

                  {/* AI-generated network summary */}
                  {narrative?.network_summary && narrative.network_summary.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid gap-2">
                        {narrative.network_summary.map((supporter, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-900">{supporter.name}</span>
                            <span className="text-gray-500 text-xs">{supporter.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {futureConnections.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Future Support ({futureConnections.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {futureConnections.map((conn) => (
                              <span key={conn.id} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                {conn.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {pastConnections.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Past Support ({pastConnections.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {pastConnections.map((conn) => (
                              <span key={conn.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {conn.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {narrative?.network_why && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Why They Matter</p>
                      <p className="text-sm text-gray-600">{narrative.network_why}</p>
                    </div>
                  )}

                  {narrative?.network_who_else && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Who Else?</p>
                      <p className="text-sm text-gray-600">{narrative.network_who_else}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* What's Next */}
              <div className="bg-gray-100 rounded-lg p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What's Next</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary mt-0.5">•</span>
                    <span><strong>Priority Builder</strong> — Sharpen clarity on what matters daily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary mt-0.5">•</span>
                    <span><strong>Prove Tool</strong> — Build evidence of how you do things weekly</span>
                  </li>
                </ul>
              </div>

              {/* View Full Details Toggle */}
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
              >
                {showFullDetails ? 'Hide' : 'View'} Full Details
                <svg
                  className={`w-4 h-4 transition-transform ${showFullDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Full Details Expanded Content */}
              {showFullDetails && (
                <div className="space-y-4">
                  {/* Regenerate button */}
                  {narrative && selectedSnapshot && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (selectedSnapshot.id && selectedSnapshot.goal && selectedSnapshot.fs_answers && selectedSnapshot.ps_answers && selectedSnapshot.zone_scores) {
                            generateAINarrative(
                              selectedSnapshot.id,
                              selectedSnapshot.goal,
                              selectedSnapshot.success || null,
                              selectedSnapshot.fs_answers,
                              selectedSnapshot.ps_answers,
                              selectedSnapshot.zone_scores,
                              selectedSnapshot.growth_opportunity || '',
                              {},
                              {},
                              selectedConnections
                            )
                          }
                        }}
                        disabled={generatingNarrative}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {generatingNarrative ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerate Insights
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Alignment Assessment */}
                  {selectedSnapshot?.alignment_scores && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Alignment Assessment
                      </p>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedSnapshot.alignment_scores).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            q1: 'Similarity to past',
                            q2: 'Confidence from past',
                            q3: 'Action clarity',
                            q4: 'Values alignment',
                            q5: 'Obstacle preparedness',
                            q6: 'Support connection',
                          }
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-600">{labels[key] || key}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((n) => (
                                  <div
                                    key={n}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                      n <= value
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {n}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Future Story */}
                  {selectedSnapshot?.fs_answers && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Your Future Story
                      </p>
                      <div className="space-y-3 text-sm">
                        {selectedSnapshot.fs_answers.fs1 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">What success looks like</p>
                            <p className="text-gray-700">{selectedSnapshot.fs_answers.fs1}</p>
                          </div>
                        )}
                        {FIRES_ORDER.map((element, index) => {
                          const key = `fs${index + 2}`
                          const answer = selectedSnapshot.fs_answers?.[key]
                          if (!answer) return null
                          return (
                            <div key={key} className="flex gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: FIRES_COLORS[element] }}
                              >
                                {element.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-gray-700">{answer}</p>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Past Story */}
                  {selectedSnapshot?.ps_answers && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Your Past Story
                      </p>
                      <div className="space-y-3 text-sm">
                        {selectedSnapshot.ps_answers.ps1 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Past similar success</p>
                            <p className="text-gray-700">{selectedSnapshot.ps_answers.ps1}</p>
                          </div>
                        )}
                        {FIRES_ORDER.map((element, index) => {
                          const key = `ps${index + 2}`
                          const answer = selectedSnapshot.ps_answers?.[key]
                          if (!answer) return null
                          return (
                            <div key={key} className="flex gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: FIRES_COLORS[element] }}
                              >
                                {element.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-gray-700">{answer}</p>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Connection Details */}
                  {(futureConnections.length > 0 || pastConnections.length > 0) && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Connection Details
                      </p>

                      {futureConnections.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">Future Support</p>
                          <div className="space-y-2">
                            {futureConnections.map((conn) => (
                              <div key={conn.id} className="text-sm">
                                <span className="font-medium text-gray-900">{conn.name}</span>
                                {conn.relationship && (
                                  <span className="text-gray-500"> — {conn.relationship}</span>
                                )}
                                {conn.involvement_type && (
                                  <p className="text-gray-600 text-xs mt-0.5">{conn.involvement_type}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {pastConnections.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Past Support</p>
                          <div className="space-y-2">
                            {pastConnections.map((conn) => (
                              <div key={conn.id} className="text-sm">
                                <span className="font-medium text-gray-900">{conn.name}</span>
                                {conn.how_involved && (
                                  <p className="text-gray-600 text-xs mt-0.5">{conn.how_involved}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => setViewMode('wizard')}
                  className="w-full py-3 px-4 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
                >
                  Create Another Prediction
                </button>
                <button
                  onClick={() => {
                    setSelectedPrediction(null)
                    setSelectedSnapshot(null)
                    setSelectedConnections([])
                    setViewMode('list')
                  }}
                  className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Predictions
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // =============================================================================
  // DETAIL VIEW (viewing existing prediction)
  // =============================================================================
  if (viewMode === 'detail' && selectedPrediction) {
    const futureConnections = selectedConnections.filter(c => c.connection_time === 'future')
    const pastConnections = selectedConnections.filter(c => c.connection_time === 'past')
    const totalConnections = futureConnections.length + pastConnections.length

    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                setSelectedPrediction(null)
                setSelectedSnapshot(null)
                setSelectedConnections([])
                setViewMode('list')
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Prediction</h1>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Goal Card */}
              <Card padding="lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded capitalize">
                    {selectedPrediction.type || 'goal'}
                  </span>
                  {getStatusBadge(selectedPrediction.status)}
                  <span className="text-xs text-gray-400">
                    {new Date(selectedPrediction.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPrediction.title}</h2>
                {selectedPrediction.description && (
                  <p className="text-gray-600 mt-2 text-sm">{selectedPrediction.description}</p>
                )}
              </Card>

              {/* Predictability Score with Clarity/Confidence/Alignment */}
              {selectedSnapshot?.predictability_score !== undefined && (
                <Card padding="lg">
                  <div className="text-center mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Predictability</p>
                    <div className="text-5xl font-bold text-brand-primary mb-1">
                      {selectedSnapshot.predictability_score}%
                    </div>
                    <p className="text-sm text-gray-500">How clearly you can see your path forward</p>
                    <p className="text-xs text-gray-400 mt-1">Most people start between 55-70%</p>
                  </div>

                  {/* Clarity / Confidence / Alignment breakdown */}
                  {(narrative || generatingNarrative) && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {/* Clarity */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Clarity</span>
                          <span className="text-xs text-gray-500">{narrative?.clarity_level || 'Analyzing...'}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            narrative?.clarity_level === 'strong' ? 'bg-green-500 w-[85%]' :
                            narrative?.clarity_level === 'building' ? 'bg-amber-500 w-[60%]' :
                            narrative?.clarity_level === 'emerging' ? 'bg-gray-400 w-[35%]' :
                            'bg-gray-300 w-[50%]'
                          }`} />
                        </div>
                        {narrative?.clarity_rationale && (
                          <p className="text-xs text-gray-500 mt-1">{narrative.clarity_rationale}</p>
                        )}
                      </div>

                      {/* Confidence */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Confidence</span>
                          <span className="text-xs text-gray-500">{narrative?.confidence_level || 'Analyzing...'}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            narrative?.confidence_level === 'strong' ? 'bg-green-500 w-[85%]' :
                            narrative?.confidence_level === 'building' ? 'bg-amber-500 w-[60%]' :
                            narrative?.confidence_level === 'emerging' ? 'bg-gray-400 w-[35%]' :
                            'bg-gray-300 w-[50%]'
                          }`} />
                        </div>
                        {narrative?.confidence_rationale && (
                          <p className="text-xs text-gray-500 mt-1">{narrative.confidence_rationale}</p>
                        )}
                      </div>

                      {/* Alignment */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Alignment</span>
                          <span className="text-xs text-gray-500">{narrative?.alignment_level || 'Analyzing...'}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            narrative?.alignment_level === 'strong' ? 'bg-green-500 w-[85%]' :
                            narrative?.alignment_level === 'building' ? 'bg-amber-500 w-[60%]' :
                            narrative?.alignment_level === 'emerging' ? 'bg-gray-400 w-[35%]' :
                            'bg-gray-300 w-[50%]'
                          }`} />
                        </div>
                        {narrative?.alignment_rationale && (
                          <p className="text-xs text-gray-500 mt-1">{narrative.alignment_rationale}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Support Network contribution */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Support Network</span>
                      <span className="text-sm font-medium text-brand-primary">+{Math.min(totalConnections * 2, 16)} pts</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalConnections} of 8 supporters identified
                    </p>
                  </div>
                </Card>
              )}

              {/* Generate Insights (if narrative missing) */}
              {!narrative && !generatingNarrative && selectedSnapshot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Ready to see your patterns?</p>
                        <p className="text-sm text-blue-700">Generate AI insights from your responses.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedSnapshot.id && selectedSnapshot.goal && selectedSnapshot.fs_answers && selectedSnapshot.ps_answers && selectedSnapshot.zone_scores) {
                          generateAINarrative(
                            selectedSnapshot.id,
                            selectedSnapshot.goal,
                            selectedSnapshot.success || null,
                            selectedSnapshot.fs_answers,
                            selectedSnapshot.ps_answers,
                            selectedSnapshot.zone_scores,
                            selectedSnapshot.growth_opportunity || '',
                            {},
                            {},
                            selectedConnections
                          )
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      See Patterns
                    </button>
                  </div>
                  {narrativeError && (
                    <p className="mt-2 text-sm text-red-600">{narrativeError}</p>
                  )}
                </div>
              )}

              {/* Generating Indicator */}
              {generatingNarrative && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Analyzing your responses...</p>
                      <p className="text-sm text-amber-700">Finding patterns in your stories.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* What Your Stories Reveal (Pattern) */}
              {narrative?.pattern_name && (
                <Card padding="lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What Your Stories Reveal</p>
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Your Pattern</p>
                    <p className="text-lg font-semibold text-gray-900">{narrative.pattern_name}</p>
                  </div>
                  {narrative.pattern_quotes && narrative.pattern_quotes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">In Your Words</p>
                      <div className="space-y-2">
                        {narrative.pattern_quotes.map((quote, i) => (
                          <p key={i} className="text-sm text-gray-700 italic border-l-2 border-brand-primary/30 pl-3">
                            "{quote}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {narrative.pattern_curiosity && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Where Curiosity Helps</p>
                      <p className="text-sm text-gray-600">{narrative.pattern_curiosity}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Zone Summary */}
              {selectedSnapshot?.zone_scores && (
                <Card padding="lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Where You Stand</p>
                  <div className="space-y-2">
                    {FIRES_ORDER.map((element) => {
                      const zone = selectedSnapshot.zone_scores?.[element]
                      if (!zone) return null
                      const isEdge = narrative?.edge_element === element
                      return (
                        <div key={element} className={`flex items-center gap-3 p-2 rounded-lg ${isEdge ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-gray-50'}`}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: FIRES_COLORS[element] }}
                          >
                            {element.charAt(0).toUpperCase()}
                          </div>
                          <span className="flex-1 font-medium text-gray-900">{FIRES_LABELS[element]}</span>
                          {isEdge && <span className="text-xs text-amber-700 font-medium">EDGE</span>}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            zone === 'Owning' ? 'bg-green-100 text-green-700' :
                            zone === 'Performing' ? 'bg-blue-100 text-blue-700' :
                            zone === 'Discovering' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {zone}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* Your Edge (detailed AI insight) */}
              {narrative?.edge_element && narrative?.edge_why && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: FIRES_COLORS[narrative.edge_element as FiresElement] || '#666' }}
                    >
                      {narrative.edge_element.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                        Your Edge: {FIRES_LABELS[narrative.edge_element as FiresElement] || narrative.edge_element}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mb-3">{narrative.edge_why}</p>

                      {(narrative.edge_gap_future || narrative.edge_gap_past) && (
                        <div className="bg-white/50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-500 mb-2">The Gap</p>
                          <div className="space-y-2 text-sm">
                            {narrative.edge_gap_future && (
                              <div>
                                <span className="text-xs text-gray-400">Future: </span>
                                <span className="text-gray-700 italic">"{narrative.edge_gap_future}"</span>
                              </div>
                            )}
                            {narrative.edge_gap_past && (
                              <div>
                                <span className="text-xs text-gray-400">Past: </span>
                                <span className="text-gray-700 italic">"{narrative.edge_gap_past}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {narrative.edge_meaning && (
                        <p className="text-sm text-gray-700 mb-4">{narrative.edge_meaning}</p>
                      )}

                      {narrative.edge_question && (
                        <div className="pt-3 border-t border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Question to Consider</p>
                          <p className="text-gray-900 font-medium">{narrative.edge_question}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback: Static Growth Opportunity (if no AI narrative) */}
              {!narrative?.edge_element && selectedSnapshot?.growth_opportunity && (
                <Card padding="lg" className="bg-amber-50 border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Your Edge</p>
                  <p className="text-gray-800">{selectedSnapshot.growth_opportunity}</p>
                </Card>
              )}

              {/* 48-Hour Question (fallback if no AI) */}
              {!narrative?.edge_question && selectedSnapshot?.question_48hr && (
                <Card padding="lg" className="bg-brand-primary/5 border-brand-primary/20">
                  <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-2">Question to Carry</p>
                  <p className="text-gray-900 font-medium">{selectedSnapshot.question_48hr}</p>
                </Card>
              )}

              {/* Who's In This With You (Network) */}
              {(totalConnections > 0 || narrative?.network_summary) && (
                <Card padding="lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Who's In This With You</p>

                  {/* AI-generated network summary */}
                  {narrative?.network_summary && narrative.network_summary.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid gap-2">
                        {narrative.network_summary.map((supporter, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-900">{supporter.name}</span>
                            <span className="text-gray-500 text-xs">{supporter.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {futureConnections.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Future Support ({futureConnections.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {futureConnections.map((conn) => (
                              <span key={conn.id} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                {conn.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {pastConnections.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Past Support ({pastConnections.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {pastConnections.map((conn) => (
                              <span key={conn.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {conn.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {narrative?.network_why && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Why They Matter</p>
                      <p className="text-sm text-gray-600">{narrative.network_why}</p>
                    </div>
                  )}

                  {narrative?.network_who_else && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Who Else?</p>
                      <p className="text-sm text-gray-600">{narrative.network_who_else}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* View Full Details Toggle */}
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
              >
                {showFullDetails ? 'Hide' : 'View'} Full Details
                <svg
                  className={`w-4 h-4 transition-transform ${showFullDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Full Details Expanded Content */}
              {showFullDetails && (
                <div className="space-y-4">
                  {/* Regenerate button */}
                  {narrative && selectedSnapshot && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (selectedSnapshot.id && selectedSnapshot.goal && selectedSnapshot.fs_answers && selectedSnapshot.ps_answers && selectedSnapshot.zone_scores) {
                            generateAINarrative(
                              selectedSnapshot.id,
                              selectedSnapshot.goal,
                              selectedSnapshot.success || null,
                              selectedSnapshot.fs_answers,
                              selectedSnapshot.ps_answers,
                              selectedSnapshot.zone_scores,
                              selectedSnapshot.growth_opportunity || '',
                              {},
                              {},
                              selectedConnections
                            )
                          }
                        }}
                        disabled={generatingNarrative}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {generatingNarrative ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerate Insights
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Alignment Assessment */}
                  {selectedSnapshot?.alignment_scores && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Alignment Assessment
                      </p>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedSnapshot.alignment_scores).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            q1: 'Similarity to past',
                            q2: 'Confidence from past',
                            q3: 'Action clarity',
                            q4: 'Values alignment',
                            q5: 'Obstacle preparedness',
                            q6: 'Support connection',
                          }
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-600">{labels[key] || key}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((n) => (
                                  <div
                                    key={n}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                      n <= value
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {n}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Future Story */}
                  {selectedSnapshot?.fs_answers && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Your Future Story
                      </p>
                      <div className="space-y-3 text-sm">
                        {selectedSnapshot.fs_answers.fs1 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">What success looks like</p>
                            <p className="text-gray-700">{selectedSnapshot.fs_answers.fs1}</p>
                          </div>
                        )}
                        {FIRES_ORDER.map((element, index) => {
                          const key = `fs${index + 2}`
                          const answer = selectedSnapshot.fs_answers?.[key]
                          if (!answer) return null
                          return (
                            <div key={key} className="flex gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: FIRES_COLORS[element] }}
                              >
                                {element.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-gray-700">{answer}</p>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Past Story */}
                  {selectedSnapshot?.ps_answers && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Your Past Story
                      </p>
                      <div className="space-y-3 text-sm">
                        {selectedSnapshot.ps_answers.ps1 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Past similar success</p>
                            <p className="text-gray-700">{selectedSnapshot.ps_answers.ps1}</p>
                          </div>
                        )}
                        {FIRES_ORDER.map((element, index) => {
                          const key = `ps${index + 2}`
                          const answer = selectedSnapshot.ps_answers?.[key]
                          if (!answer) return null
                          return (
                            <div key={key} className="flex gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: FIRES_COLORS[element] }}
                              >
                                {element.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-gray-700">{answer}</p>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Connection Details */}
                  {(futureConnections.length > 0 || pastConnections.length > 0) && (
                    <Card padding="lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Connection Details
                      </p>

                      {futureConnections.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">Future Support</p>
                          <div className="space-y-2">
                            {futureConnections.map((conn) => (
                              <div key={conn.id} className="text-sm">
                                <span className="font-medium text-gray-900">{conn.name}</span>
                                {conn.relationship && (
                                  <span className="text-gray-500"> — {conn.relationship}</span>
                                )}
                                {conn.involvement_type && (
                                  <p className="text-gray-600 text-xs mt-0.5">{conn.involvement_type}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {pastConnections.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Past Support</p>
                          <div className="space-y-2">
                            {pastConnections.map((conn) => (
                              <div key={conn.id} className="text-sm">
                                <span className="font-medium text-gray-900">{conn.name}</span>
                                {conn.how_involved && (
                                  <p className="text-gray-600 text-xs mt-0.5">{conn.how_involved}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}

              {/* Back to Predictions */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSelectedPrediction(null)
                    setSelectedSnapshot(null)
                    setSelectedConnections([])
                    setViewMode('list')
                  }}
                  className="w-full py-3 px-4 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
                >
                  Back to Predictions
                </button>
              </div>
            </>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Prediction?</h3>
                  <p className="text-gray-600 text-sm">
                    This will permanently delete "{selectedPrediction.title}" and all its data. This cannot be undone.
                  </p>
                </div>

                {deleteError && (
                  <p className="text-sm text-red-600 text-center mb-4">{deleteError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteError(null)
                    }}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePrediction(selectedPrediction.id, true)}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =============================================================================
  // WIZARD VIEW
  // =============================================================================
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setViewMode('list')}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">New Prediction</h1>
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="text-sm text-gray-500 hover:text-red-500 disabled:opacity-50"
          >
            Discard
          </button>
        </div>

        <ProgressIndicator currentStep={currentStep} onStepClick={handleStepClick} />

        <Card padding="lg" className="mb-6">
          {renderStep()}
        </Card>

        {saveError && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            <p className="font-medium">Failed to save prediction</p>
            <p className="text-red-500 mt-1">{saveError}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                'Complete'
              )}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {saving ? 'Saving your prediction...' : 'Your progress is saved automatically'}
        </p>
      </div>
    </div>
  )
}
