import { useState, useEffect } from 'react'
import { getSupabase, useAuth } from '@finding-good/shared'
import type { FiresElement, Zone, ZoneBreakdown } from '@finding-good/shared'

// Zone order for comparison (lowest to highest)
const ZONE_ORDER: Zone[] = ['Exploring', 'Discovering', 'Performing', 'Owning']

function getZoneLevel(zone: Zone): number {
  return ZONE_ORDER.indexOf(zone)
}

function calculateOverallZone(zoneBreakdown: ZoneBreakdown): Zone {
  const zones = Object.values(zoneBreakdown) as Zone[]
  if (zones.length === 0) return 'Exploring'

  // Overall zone is the most common, or lowest if tied
  const counts: Record<Zone, number> = {
    Exploring: 0,
    Discovering: 0,
    Performing: 0,
    Owning: 0,
  }

  zones.forEach(zone => {
    counts[zone] = (counts[zone] || 0) + 1
  })

  // Find the zone with the most count, preferring lower zones on tie
  let maxCount = 0
  let resultZone: Zone = 'Exploring'

  for (const zone of ZONE_ORDER) {
    if (counts[zone] > maxCount) {
      maxCount = counts[zone]
      resultZone = zone
    }
  }

  return resultZone
}

function findLowestElement(zoneBreakdown: ZoneBreakdown): { element: FiresElement; zone: Zone } | null {
  const entries = Object.entries(zoneBreakdown) as [FiresElement, Zone][]
  if (entries.length === 0) return null

  let lowest = entries[0]
  for (const entry of entries) {
    if (getZoneLevel(entry[1]) < getZoneLevel(lowest[1])) {
      lowest = entry
    }
  }

  return { element: lowest[0], zone: lowest[1] }
}

function findHighestElement(zoneBreakdown: ZoneBreakdown): { element: FiresElement; zone: Zone } | null {
  const entries = Object.entries(zoneBreakdown) as [FiresElement, Zone][]
  if (entries.length === 0) return null

  let highest = entries[0]
  for (const entry of entries) {
    if (getZoneLevel(entry[1]) > getZoneLevel(highest[1])) {
      highest = entry
    }
  }

  return { element: highest[0], zone: highest[1] }
}

export interface ZoneData {
  overallZone: Zone | null
  growthOpportunity: { element: FiresElement; zone: Zone } | null
  owningHighlight: { element: FiresElement; zone: Zone } | null
  lastActivityDate: string | null
  zoneBreakdown: ZoneBreakdown | null
}

export function useZoneData() {
  const { user } = useAuth()
  const [data, setData] = useState<ZoneData>({
    overallZone: null,
    growthOpportunity: null,
    owningHighlight: null,
    lastActivityDate: null,
    zoneBreakdown: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setData({
        overallZone: null,
        growthOpportunity: null,
        owningHighlight: null,
        lastActivityDate: null,
        zoneBreakdown: null,
      })
      setLoading(false)
      return
    }

    const fetchZoneData = async () => {
      try {
        setLoading(true)
        const supabase = getSupabase()

        // Get latest snapshot with zone_scores
        const { data: snapshots, error: snapshotError } = await supabase
          .from('snapshots')
          .select('zone_scores, created_at')
          .eq('client_email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)

        if (snapshotError) throw snapshotError

        // Get last validation activity
        const { data: validations, error: validationError } = await supabase
          .from('validations')
          .select('created_at')
          .eq('client_email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)

        if (validationError) throw validationError

        const latestSnapshot = snapshots?.[0]
        const latestValidation = validations?.[0]

        if (latestSnapshot?.zone_scores) {
          const zoneBreakdown = latestSnapshot.zone_scores as ZoneBreakdown

          setData({
            overallZone: calculateOverallZone(zoneBreakdown),
            growthOpportunity: findLowestElement(zoneBreakdown),
            owningHighlight: findHighestElement(zoneBreakdown),
            lastActivityDate: latestValidation?.created_at || latestSnapshot?.created_at || null,
            zoneBreakdown,
          })
        } else {
          setData({
            overallZone: null,
            growthOpportunity: null,
            owningHighlight: null,
            lastActivityDate: latestValidation?.created_at || null,
            zoneBreakdown: null,
          })
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching zone data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch zone data')
      } finally {
        setLoading(false)
      }
    }

    fetchZoneData()
  }, [user?.email])

  return { ...data, loading, error }
}
