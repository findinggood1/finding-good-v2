export { createClient, getSupabase } from './supabase'
export type { SupabaseClient } from './supabase'

export {
  calculateZone,
  calculateZoneBreakdown,
  calculatePredictabilityScore,
  selectGrowthOpportunity,
  select48HourQuestion,
  generateGrowthOpportunityText,
} from './calculations'
export type { AlignmentScores } from './calculations'
