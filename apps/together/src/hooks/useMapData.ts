import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement } from '@finding-good/shared'

interface FiresAverages {
  feelings: number
  influence: number
  resilience: number
  ethics: number
  strengths: number
}

export interface MapData {
  firesAverages: FiresAverages
  strongest: FiresElement | null
  growthArea: FiresElement | null
  totalValidations: number
}

const EMPTY_AVERAGES: FiresAverages = {
  feelings: 0,
  influence: 0,
  resilience: 0,
  ethics: 0,
  strengths: 0,
}

export function useMapData() {
  const { user } = useAuth()
  const [data, setData] = useState<MapData>({
    firesAverages: EMPTY_AVERAGES,
    strongest: null,
    growthArea: null,
    totalValidations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setData({
        firesAverages: EMPTY_AVERAGES,
        strongest: null,
        growthArea: null,
        totalValidations: 0,
      })
      setLoading(false)
      return
    }

    const fetchMapData = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()

        // Fetch all validations for this user
        const { data: validations, error: fetchError } = await supabase
          .from('validations')
          .select('fires_extracted')
          .eq('client_email', user.email)

        if (fetchError) throw fetchError

        if (!validations || validations.length === 0) {
          setData({
            firesAverages: EMPTY_AVERAGES,
            strongest: null,
            growthArea: null,
            totalValidations: 0,
          })
          setError(null)
          setLoading(false)
          return
        }

        // Aggregate FIRES counts across all validations
        const firesCounts: Record<FiresElement, number> = {
          feelings: 0,
          influence: 0,
          resilience: 0,
          ethics: 0,
          strengths: 0,
        }

        let validationsWithFires = 0

        validations.forEach((validation) => {
          const fires = validation.fires_extracted
          if (fires && Array.isArray(fires) && fires.length > 0) {
            validationsWithFires++
            fires.forEach((element: string) => {
              const normalizedElement = element.toLowerCase() as FiresElement
              if (normalizedElement in firesCounts) {
                firesCounts[normalizedElement]++
              }
            })
          }
        })

        // Calculate averages (as percentage of validations that mention each element)
        const firesAverages: FiresAverages = {
          feelings: validationsWithFires > 0 ? (firesCounts.feelings / validationsWithFires) * 100 : 0,
          influence: validationsWithFires > 0 ? (firesCounts.influence / validationsWithFires) * 100 : 0,
          resilience: validationsWithFires > 0 ? (firesCounts.resilience / validationsWithFires) * 100 : 0,
          ethics: validationsWithFires > 0 ? (firesCounts.ethics / validationsWithFires) * 100 : 0,
          strengths: validationsWithFires > 0 ? (firesCounts.strengths / validationsWithFires) * 100 : 0,
        }

        // Find strongest and growth area
        const entries = Object.entries(firesAverages) as [FiresElement, number][]
        const sorted = entries.sort((a, b) => b[1] - a[1])

        const strongest = sorted[0][1] > 0 ? sorted[0][0] : null
        const growthArea = sorted[sorted.length - 1][1] < sorted[0][1] ? sorted[sorted.length - 1][0] : null

        setData({
          firesAverages,
          strongest,
          growthArea,
          totalValidations: validations.length,
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching map data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch map data')
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [user?.email])

  return { ...data, loading, error }
}
