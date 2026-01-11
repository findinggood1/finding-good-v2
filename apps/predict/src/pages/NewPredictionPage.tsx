import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ProgressIndicator,
  Step1BasicInfo,
  Step2FutureStory,
  Step3FutureConnections,
  Step4PastStory,
  Step5PastConnections,
  Step6Alignment,
} from '../components'
import { useSavePrediction } from '../hooks'
import { type PredictionFormData, INITIAL_FORM_DATA, TOTAL_STEPS } from '../types'

const STORAGE_KEY = 'prediction-form-draft'

export function NewPredictionPage() {
  const navigate = useNavigate()
  const { save, saving, error: saveError } = useSavePrediction()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PredictionFormData>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return INITIAL_FORM_DATA
      }
    }
    return INITIAL_FORM_DATA
  })

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

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

  const handleSubmit = async () => {
    const result = await save(formData)

    if (result.success && result.predictionId) {
      localStorage.removeItem(STORAGE_KEY)
      navigate(`/${result.predictionId}/results`)
    }
  }

  const handleDiscard = () => {
    if (!saving && confirm('Are you sure you want to discard this prediction?')) {
      localStorage.removeItem(STORAGE_KEY)
      navigate('/')
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo data={formData} onChange={updateFormData} />
      case 2:
        return <Step2FutureStory data={formData} onChange={updateFormData} />
      case 3:
        return <Step3FutureConnections data={formData} onChange={updateFormData} />
      case 4:
        return <Step4PastStory data={formData} onChange={updateFormData} />
      case 5:
        return <Step5PastConnections data={formData} onChange={updateFormData} />
      case 6:
        return <Step6Alignment data={formData} onChange={updateFormData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className={`text-gray-500 hover:text-gray-700 ${saving ? 'pointer-events-none opacity-50' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">New Prediction</h1>
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="text-sm text-gray-500 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discard
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <ProgressIndicator
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {renderStep()}
        </div>

        {/* Error message */}
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
              className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Complete'
              )}
            </button>
          )}
        </div>

        {/* Draft indicator */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {saving ? 'Saving your prediction...' : 'Your progress is saved automatically'}
        </p>
      </main>
    </div>
  )
}
