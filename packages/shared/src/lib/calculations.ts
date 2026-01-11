import type { FiresElement, Zone, ZoneBreakdown } from '../types'

// Alignment scores from the 6 questions (q1-q6), each 1-4
export interface AlignmentScores {
  q1: number
  q2: number
  q3: number
  q4: number
  q5: number
  q6: number
}

// Zone mapping for each alignment score
const ZONE_MAP: Record<number, Zone> = {
  1: 'Exploring',
  2: 'Discovering',
  3: 'Performing',
  4: 'Owning',
}

// Question bank for 48-hour questions
const QUESTION_BANK: Record<FiresElement, Record<Zone, string>> = {
  feelings: {
    Exploring: "What's one small emotion you've been avoiding about this goal?",
    Discovering: 'How did you feel the last time you made progress on something similar?',
    Performing: 'What emotional pattern do you notice when you hit obstacles?',
    Owning: 'How can you share your emotional journey with someone who might benefit?',
  },
  influence: {
    Exploring: 'Who is one person you could tell about this goal today?',
    Discovering: "What's one way you could help someone else while working on this?",
    Performing: 'How could you involve a mentor or advisor in your next step?',
    Owning: 'Who could you coach or guide based on what you\'ve learned?',
  },
  resilience: {
    Exploring: "What's the smallest possible step you could take in the next 48 hours?",
    Discovering: "When things got hard before, what kept you going?",
    Performing: "What backup plan could you create for your biggest obstacle?",
    Owning: "How can you build systems that make progress automatic?",
  },
  ethics: {
    Exploring: "Does this goal align with what matters most to you? Why or why not?",
    Discovering: "What value does achieving this goal serve in your life?",
    Performing: "Where might you be tempted to compromise your values?",
    Owning: "How does this goal serve something bigger than yourself?",
  },
  strengths: {
    Exploring: "What's one skill you already have that could help with this goal?",
    Discovering: "What strength helped you succeed in a similar situation before?",
    Performing: "How could you leverage your top strength more intentionally?",
    Owning: "What unique combination of strengths makes you ideal for this goal?",
  },
}

/**
 * Calculate zone from a single alignment score (1-4)
 */
export function calculateZone(alignmentScore: number): Zone {
  const score = Math.max(1, Math.min(4, Math.round(alignmentScore)))
  return ZONE_MAP[score] || 'Exploring'
}

/**
 * Calculate zone breakdown from alignment scores
 * Maps each FIRES element to its corresponding zone based on alignment questions
 */
export function calculateZoneBreakdown(alignmentScores: AlignmentScores): ZoneBreakdown {
  return {
    feelings: calculateZone(alignmentScores.q1),
    influence: calculateZone(alignmentScores.q2),
    resilience: calculateZone(alignmentScores.q3),
    ethics: calculateZone(alignmentScores.q4),
    strengths: calculateZone(alignmentScores.q5),
  }
}

/**
 * Calculate predictability score from alignment scores and connection count
 * - Base: average of alignment scores (1-4) mapped to 0-100
 * - Bonus: +2 points per connection (max +16)
 * - Cap at 100
 */
export function calculatePredictabilityScore(
  alignmentScores: AlignmentScores,
  connectionCount: number
): number {
  // Calculate average alignment score (1-4)
  const scores = Object.values(alignmentScores)
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length

  // Map 1-4 to base score of 0-100
  // Score of 1 = 0%, Score of 4 = 100%
  const baseScore = ((average - 1) / 3) * 100

  // Bonus: +2 per connection, max +16 (8 connections)
  const connectionBonus = Math.min(connectionCount * 2, 16)

  // Total score capped at 100
  const totalScore = Math.min(Math.round(baseScore + connectionBonus), 100)

  return totalScore
}

/**
 * Select the growth opportunity - the FIRES element with the lowest zone
 */
export function selectGrowthOpportunity(zoneBreakdown: ZoneBreakdown): FiresElement {
  const ZONE_VALUES: Record<Zone, number> = {
    Exploring: 1,
    Discovering: 2,
    Performing: 3,
    Owning: 4,
  }

  const elements: FiresElement[] = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']

  let lowestElement: FiresElement = 'feelings'
  let lowestValue = 5

  for (const element of elements) {
    const zone = zoneBreakdown[element]
    const value = ZONE_VALUES[zone]
    if (value < lowestValue) {
      lowestValue = value
      lowestElement = element
    }
  }

  return lowestElement
}

/**
 * Select a 48-hour question based on growth element and its zone
 */
export function select48HourQuestion(growthElement: FiresElement, zone: Zone): string {
  return QUESTION_BANK[growthElement]?.[zone] ||
    "What's one small step you could take in the next 48 hours?"
}

/**
 * Generate growth opportunity text based on the element and zone
 */
export function generateGrowthOpportunityText(element: FiresElement, zone: Zone): string {
  const elementLabels: Record<FiresElement, string> = {
    feelings: 'emotional awareness',
    influence: 'connection and influence',
    resilience: 'resilience and persistence',
    ethics: 'values alignment',
    strengths: 'leveraging your strengths',
  }

  const zoneActions: Record<Zone, string> = {
    Exploring: 'Start by exploring',
    Discovering: 'Focus on discovering more about',
    Performing: 'Continue building',
    Owning: 'Deepen your mastery of',
  }

  return `${zoneActions[zone]} ${elementLabels[element]} to increase your chances of success.`
}
