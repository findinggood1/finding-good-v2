#!/usr/bin/env node

/**
 * Finding Good V2 - Test Persona Insert Script
 *
 * Inserts all 4 test personas directly into Supabase:
 * - Marcus Chen (info@findinggood.com)
 * - Sarah Okonkwo (support@findinggood.com)
 * - David Park (brian@brianfretwell.com)
 * - Elena Vasquez (bfretwell7@hotmail.com)
 *
 * Usage:
 *   node scripts/insert-test-personas.js
 *   node scripts/insert-test-personas.js --skip-ai
 *   node scripts/insert-test-personas.js --clean-first
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Check .env file.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ============================================================================
// PERSONA DEFINITIONS (from Testing Framework)
// ============================================================================

const PERSONAS = {
  marcus: {
    name: 'Marcus Chen',
    email: 'info@findinggood.com',
    role: 'VP of Engineering, Tech Company',
    archetype: 'Burned out leader rebuilding trust',
    prediction: {
      title: 'Rebuild trust with my team after the layoffs I had to make',
      description: 'Three months ago I had to let go of 40% of my team. The remaining team is scared, disengaged, and sees me as the one who made the cuts.',
      type: 'challenge',
    },
    // FIRES Profile: Feelings LOW, Influence MEDIUM, Resilience HIGH, Ethics HIGH, Strengths MEDIUM
    future_story: {
      fs1: 'My team trusts me again. They bring me problems early instead of hiding them. Meetings have energy instead of dread.',
      fs2: "Honestly? I need to feel like I'm not a fraud. Right now I keep saying 'we'll get through this together' but I'm the reason we're in this position. I need to feel authentic again.",
      fs3: "I can control how I show up. I can be more present, more transparent about decisions. I can't undo the layoffs but I can control whether I hide in my office or face my team.",
      fs4: "I've rebuilt before. When things get hard I get analytical - break it down into pieces, figure out what I can move. I don't quit, but I tend to isolate when struggling.",
      fs5: 'Honesty matters most. And protecting my people - even though I just failed at that. I took this job because I believed we could build something meaningful.',
      fs6: "I'm good at seeing systems - how pieces connect, where bottlenecks are. I can translate between technical and business. Good at hard conversations when I'm not avoiding them.",
      fs1_confidence: 2,
      fs2_confidence: 2,
      fs3_confidence: 3,
      fs4_confidence: 4,
      fs5_confidence: 4,
      fs6_confidence: 3,
    },
    past_story: {
      ps1: 'Five years ago I turned around a failing engineering team. Inherited a mess - no processes, constant firefighting. Within 18 months we were the highest-performing team in the org.',
      ps2: 'I felt alive. The harder it got, the more clear I became. There was this weird calm when everything was chaos. I trusted myself completely back then.',
      ps3: 'Reorganized the team structure. Cut processes everyone hated. Made sure the right people were talking to each other instead of silos. In the weeds but also steering.',
      ps4: 'When we missed a major deadline in month two, instead of blaming people, I took ownership publicly. That reset everything.',
      ps5: 'I cared about those people. Not just hitting numbers - I wanted them to be proud of what we built.',
      ps6: 'Pattern recognition. I could see what was actually breaking vs what people thought was breaking. And I could translate - engineers to business, business to engineers.',
      ps1_alignment: 3,
      ps2_alignment: 2,
      ps3_alignment: 3,
      ps4_alignment: 4,
      ps5_alignment: 4,
      ps6_alignment: 3,
    },
    future_connections: [
      { name: 'Sarah', relationship: 'My executive coach', support_type: 'Emotional support' },
      { name: 'James', relationship: 'CTO, my boss', support_type: 'Direct help' },
      { name: 'Miguel', relationship: 'Senior engineer who stayed', support_type: 'Working on similar', working_on_similar: true },
    ],
    past_connections: [
      { name: 'Rachel', how_involved: 'My skip-level who believed in me before I believed in myself. Gave me air cover to make changes.' },
      { name: 'Tom', how_involved: 'Senior engineer who stayed when others left. Showed the team change was possible.' },
    ],
  },

  sarah: {
    name: 'Sarah Okonkwo',
    email: 'support@findinggood.com',
    role: 'Director of Operations, Healthcare',
    archetype: 'Stuck in the middle, facing crossroads',
    prediction: {
      title: 'Decide whether to pursue the VP promotion or start my consulting practice',
      description: "I've been offered a path to VP - it's the obvious next step. But I've been dreaming about starting my own consulting practice for years. I keep analyzing both options but can't commit to either.",
      type: 'goal',
    },
    // FIRES Profile: Feelings MEDIUM, Influence LOW, Resilience MEDIUM, Ethics HIGH, Strengths HIGH
    future_story: {
      fs1: "I've made a clear decision and I'm at peace with it. No more second-guessing. Fully committed to whichever path I chose.",
      fs2: "I feel pulled in two directions. Excited when I think about consulting, but then the fear kicks in. The VP path feels safe but suffocating.",
      fs3: "Honestly, I feel trapped. Golden handcuffs, others' expectations. I know I have choices but they don't feel like real choices.",
      fs4: "I handle challenges by analyzing them to death. I make lists, weigh pros and cons, gather more data. Sometimes that helps. Sometimes it's just avoidance in disguise.",
      fs5: "Growth and authenticity. I want to do work that actually matters to me, not just what looks good on paper or makes other people comfortable.",
      fs6: "I'm extremely capable - I know that. I can lead complex projects, manage difficult stakeholders, hit any deadline. I just don't know if capability equals fulfillment.",
      fs1_confidence: 2,
      fs2_confidence: 3,
      fs3_confidence: 2,
      fs4_confidence: 3,
      fs5_confidence: 4,
      fs6_confidence: 4,
    },
    past_story: {
      ps1: 'I led our department through a major system migration last year. Everyone said it couldn\'t be done in 6 months. We did it in 4.',
      ps2: 'Exhausted but proud. Like I had proven something - mostly to myself. That I could do hard things even when everyone doubted it was possible.',
      ps3: 'I broke it into phases, got buy-in from skeptics early, and protected my team from the political noise. Stayed focused on what we could control.',
      ps4: 'When the vendor missed a critical delivery, I had to escalate to their CEO. Terrifying, but I did it. And it worked.',
      ps5: 'Excellence and follow-through. If I say I\'ll do something, I do it. My word matters to me.',
      ps6: 'Seeing the full picture while managing the details. I can zoom in and zoom out. And I\'m good at getting skeptics on board.',
      ps1_alignment: 4,
      ps2_alignment: 4,
      ps3_alignment: 4,
      ps4_alignment: 3,
      ps5_alignment: 4,
      ps6_alignment: 4,
    },
    future_connections: [
      { name: 'Dr. Amara', relationship: 'Former professor, now mentor', support_type: 'Perspective and wisdom' },
      { name: 'Michael', relationship: 'Friend who started his own practice', support_type: 'Reality check on consulting', working_on_similar: true },
    ],
    past_connections: [
      { name: 'Christine', how_involved: 'My first manager who saw leadership potential in me before I did. Still checks in.' },
      { name: 'The migration team', how_involved: 'We went through hell together. They showed me what I\'m capable of leading.' },
    ],
  },

  david: {
    name: 'David Park',
    email: 'brian@brianfretwell.com',
    role: 'Plant Manager, Manufacturing',
    archetype: 'Old-school leader learning new ways',
    prediction: {
      title: 'Get my plant manager and floor supervisors aligned so I can step back',
      description: "I promoted Mike to run day-to-day operations. But supervisors keep going around him, coming straight to me. I'm getting pulled back into stuff I shouldn't be in, and Mike is frustrated.",
      type: 'challenge',
    },
    // FIRES Profile: Feelings LOW, Influence HIGH, Resilience HIGH, Ethics MEDIUM, Strengths HIGH
    future_story: {
      fs1: 'Issues flow through Mike. Decisions come back through Mike. I stop getting end-runs to my office about floor problems.',
      fs2: "Frustrated, I guess. I brought Mike up because he earned it, but the team won't give him a chance. And honestly, a little guilty that I keep stepping in.",
      fs3: 'I have 30 years of relationships here. I know how to get things done. But I need to stop using that and let Mike build his own.',
      fs4: "I've weathered recessions, strikes, supply chain disasters. When things get hard, I get practical. Figure out what needs to happen today, then tomorrow.",
      fs5: "Loyalty. Taking care of my people. Sometimes I compromise on the 'right' way to do things if it protects jobs.",
      fs6: 'I know this plant better than anyone alive. Operations, people, history. I can solve almost any problem here. That might be part of the problem.',
      fs1_confidence: 4,
      fs2_confidence: 2,
      fs3_confidence: 4,
      fs4_confidence: 4,
      fs5_confidence: 3,
      fs6_confidence: 4,
    },
    past_story: {
      ps1: 'When I took over this plant 15 years ago, it was bottom of the company. Three years later - best safety record, best productivity. We did that together.',
      ps2: 'Proud. Tired but satisfied. Like we had built something real, something that would last.',
      ps3: 'I walked the floor every day. Knew everyone\'s name. Fixed the small stuff fast so people knew I was paying attention. Built trust one conversation at a time.',
      ps4: 'Union wanted to strike over scheduling changes. I sat with the steward for six hours until we found something that worked. Neither of us got everything.',
      ps5: 'Fairness. Everyone gets heard, but once we decide, we commit. I don\'t play favorites even when it would be easier.',
      ps6: 'Reading people. I can tell in five minutes if someone\'s going to work out. And I know how to match people to jobs where they\'ll succeed.',
      ps1_alignment: 4,
      ps2_alignment: 4,
      ps3_alignment: 4,
      ps4_alignment: 4,
      ps5_alignment: 3,
      ps6_alignment: 4,
    },
    future_connections: [
      { name: 'Mike Torres', relationship: 'Plant Manager (my successor)', support_type: 'Direct partner - he has to step up', working_on_similar: true },
      { name: 'Rosa', relationship: 'Senior floor supervisor', support_type: 'Influence with the crew' },
    ],
    past_connections: [
      { name: 'Bill Henderson', how_involved: 'My predecessor. Taught me that you manage plants by managing people, not spreadsheets.' },
      { name: 'The union steward, Joe', how_involved: 'We fought like hell but respected each other. Showed me that conflict can build trust.' },
    ],
  },

  elena: {
    name: 'Elena Vasquez',
    email: 'bfretwell7@hotmail.com',
    role: 'Founder/CEO, Growth-Stage Startup',
    archetype: 'Founder scaling beyond herself',
    prediction: {
      title: 'Build a leadership team that can run the company without me in every room',
      description: "We just closed Series B. Went from 12 to 60 people in 8 months. The scrappy startup culture is breaking. I'm in every meeting, making every decision. My team is either waiting for my input or going rogue.",
      type: 'goal',
    },
    // FIRES Profile: Feelings HIGH, Influence MEDIUM, Resilience HIGH, Ethics HIGH, Strengths MEDIUM
    future_story: {
      fs1: "I want to take a two-week vacation and not have the company fall apart. Actually - take a vacation and not even check my phone.",
      fs2: "I feel like I'm holding my breath all the time. Like if I stop running, everything will collapse. But also excited - we're doing something real.",
      fs3: "I have influence but I spread it too thin. I'm in every room because I don't trust anyone else to carry the vision. That's on me.",
      fs4: "When things get hard, I get creative. Find another way. I've never given up on anything important. Maybe stubborn to a fault.",
      fs5: "Impact. Building something that matters beyond just making money. When I started this, I promised myself it wouldn't become another soulless company.",
      fs6: "I'm great at starting things, rallying people around a vision. I'm realizing I might not be great at scaling things. Different skill set.",
      fs1_confidence: 3,
      fs2_confidence: 4,
      fs3_confidence: 2,
      fs4_confidence: 4,
      fs5_confidence: 4,
      fs6_confidence: 3,
    },
    past_story: {
      ps1: 'We almost ran out of money twice. Both times I found a way. The second time, I had to let go of my co-founder. Hardest thing I\'ve ever done.',
      ps2: 'The first near-death - terrified then relieved. The co-founder situation - devastated but also clear. Sometimes the hard thing is the right thing.',
      ps3: 'For the money, I just kept knocking on doors until one opened. For my co-founder, I had to look honestly at what was and wasn\'t working.',
      ps4: 'The co-founder situation nearly broke me. She was my best friend. But the company needed something she couldn\'t give.',
      ps5: 'Honesty, even when it hurts. I\'d rather have a hard conversation than let something fester. Not everyone appreciates that.',
      ps6: 'Vision and persistence. I can see what something could become and I don\'t stop until it gets there. Also good at finding great people.',
      ps1_alignment: 4,
      ps2_alignment: 4,
      ps3_alignment: 3,
      ps4_alignment: 4,
      ps5_alignment: 4,
      ps6_alignment: 3,
    },
    future_connections: [
      { name: 'Marcus (board member)', relationship: 'Lead investor', support_type: 'Strategic guidance and accountability' },
      { name: 'Priya', relationship: 'VP of Product', support_type: 'Building her into my successor for product decisions', working_on_similar: true },
      { name: 'Coach Reyes', relationship: 'Executive coach', support_type: 'Helping me see my blind spots' },
    ],
    past_connections: [
      { name: 'My co-founder Jen', how_involved: 'Even though it ended, she taught me what partnership could look like. And what happens when it doesn\'t work.' },
      { name: 'First angel investor, Derek', how_involved: 'Believed in us when no one else did. Showed me what real support looks like.' },
    ],
  },
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function calculateZone(confidence, alignment) {
  const combined = (confidence || 0) + (alignment || 0)
  if (combined <= 2) return 'Exploring'
  if (combined <= 4) return 'Discovering'
  if (combined <= 6) return 'Performing'
  return 'Owning'
}

function calculateZoneBreakdown(futureStory, pastStory) {
  return {
    feelings: calculateZone(futureStory.fs2_confidence, pastStory.ps2_alignment),
    influence: calculateZone(futureStory.fs3_confidence, pastStory.ps3_alignment),
    resilience: calculateZone(futureStory.fs4_confidence, pastStory.ps4_alignment),
    ethics: calculateZone(futureStory.fs5_confidence, pastStory.ps5_alignment),
    strengths: calculateZone(futureStory.fs6_confidence, pastStory.ps6_alignment),
  }
}

function calculatePredictabilityScore(futureStory, pastStory, connectionCount) {
  const confidenceRatings = [
    futureStory.fs1_confidence,
    futureStory.fs2_confidence,
    futureStory.fs3_confidence,
    futureStory.fs4_confidence,
    futureStory.fs5_confidence,
    futureStory.fs6_confidence,
  ]
  const alignmentRatings = [
    pastStory.ps1_alignment,
    pastStory.ps2_alignment,
    pastStory.ps3_alignment,
    pastStory.ps4_alignment,
    pastStory.ps5_alignment,
    pastStory.ps6_alignment,
  ]

  const confidenceSum = confidenceRatings.reduce((sum, val) => sum + (val || 0), 0)
  const alignmentSum = alignmentRatings.reduce((sum, val) => sum + (val || 0), 0)
  const baseScore = confidenceSum + alignmentSum
  const normalizedBase = Math.round((baseScore / 48) * 84)
  const connectionBonus = Math.min(connectionCount * 2, 16)

  return Math.min(normalizedBase + connectionBonus, 100)
}

function selectGrowthOpportunity(zoneBreakdown) {
  const ZONE_VALUES = { Exploring: 1, Discovering: 2, Performing: 3, Owning: 4 }
  const elements = ['feelings', 'influence', 'resilience', 'ethics', 'strengths']
  let lowest = 'feelings'
  let lowestVal = 5
  for (const el of elements) {
    const val = ZONE_VALUES[zoneBreakdown[el]]
    if (val < lowestVal) {
      lowestVal = val
      lowest = el
    }
  }
  return lowest
}

function generateGrowthOpportunityText(element, zone) {
  const labels = {
    feelings: 'emotional awareness',
    influence: 'connection and influence',
    resilience: 'resilience and persistence',
    ethics: 'values alignment',
    strengths: 'leveraging your strengths',
  }
  const actions = {
    Exploring: 'Start by exploring',
    Discovering: 'Focus on discovering more about',
    Performing: 'Continue building',
    Owning: 'Deepen your mastery of',
  }
  return `${actions[zone]} ${labels[element]} to increase your chances of success.`
}

const QUESTION_BANK = {
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
    Owning: "Who could you coach or guide based on what you've learned?",
  },
  resilience: {
    Exploring: "What's the smallest possible step you could take in the next 48 hours?",
    Discovering: 'When things got hard before, what kept you going?',
    Performing: 'What backup plan could you create for your biggest obstacle?',
    Owning: 'How can you build systems that make progress automatic?',
  },
  ethics: {
    Exploring: 'Does this goal align with what matters most to you? Why or why not?',
    Discovering: 'What value does achieving this goal serve in your life?',
    Performing: 'Where might you be tempted to compromise your values?',
    Owning: 'How does this goal serve something bigger than yourself?',
  },
  strengths: {
    Exploring: "What's one skill you already have that could help with this goal?",
    Discovering: 'What strength helped you succeed in a similar situation before?',
    Performing: 'How could you leverage your top strength more intentionally?',
    Owning: 'What unique combination of strengths makes you ideal for this goal?',
  },
}

function select48HourQuestion(element, zone) {
  return QUESTION_BANK[element]?.[zone] || "What's one small step you could take in the next 48 hours?"
}

// ============================================================================
// INSERT FUNCTIONS
// ============================================================================

async function cleanPersonaData(email) {
  console.log(`  Cleaning existing data for ${email}...`)

  // Delete in order due to foreign keys
  await supabase.from('prediction_connections').delete().eq('client_email', email)
  await supabase.from('snapshots').delete().eq('client_email', email)
  await supabase.from('predictions').delete().eq('client_email', email)

  console.log(`  Cleaned.`)
}

async function checkPersonaExists(email) {
  const { data, error } = await supabase
    .from('predictions')
    .select('id')
    .eq('client_email', email)
    .limit(1)

  return data && data.length > 0
}

async function insertPersona(personaKey) {
  const persona = PERSONAS[personaKey]
  if (!persona) {
    console.error(`Unknown persona: ${personaKey}`)
    return null
  }

  console.log(`\nInserting ${persona.name} (${persona.archetype})...`)

  // Calculate values
  const connectionCount = persona.future_connections.length + persona.past_connections.length
  const zoneBreakdown = calculateZoneBreakdown(persona.future_story, persona.past_story)
  const predictabilityScore = calculatePredictabilityScore(persona.future_story, persona.past_story, connectionCount)
  const growthElement = selectGrowthOpportunity(zoneBreakdown)
  const growthZone = zoneBreakdown[growthElement]
  const growthOpportunity = generateGrowthOpportunityText(growthElement, growthZone)
  const question48hr = select48HourQuestion(growthElement, growthZone)

  // Extract text-only answers
  const fsAnswers = {
    fs1: persona.future_story.fs1,
    fs2: persona.future_story.fs2,
    fs3: persona.future_story.fs3,
    fs4: persona.future_story.fs4,
    fs5: persona.future_story.fs5,
    fs6: persona.future_story.fs6,
  }
  const psAnswers = {
    ps1: persona.past_story.ps1,
    ps2: persona.past_story.ps2,
    ps3: persona.past_story.ps3,
    ps4: persona.past_story.ps4,
    ps5: persona.past_story.ps5,
    ps6: persona.past_story.ps6,
  }

  // Legacy alignment scores
  const alignmentScores = {
    q1: persona.past_story.ps1_alignment,
    q2: persona.past_story.ps2_alignment,
    q3: persona.past_story.ps3_alignment,
    q4: persona.past_story.ps4_alignment,
    q5: persona.past_story.ps5_alignment,
    q6: persona.past_story.ps6_alignment,
  }

  // 1. Insert prediction
  const { data: prediction, error: predError } = await supabase
    .from('predictions')
    .insert({
      client_email: persona.email,
      title: persona.prediction.title,
      description: persona.prediction.description,
      type: persona.prediction.type,
      status: 'active',
      connection_count: connectionCount,
    })
    .select('id')
    .single()

  if (predError) {
    console.error(`  Failed to insert prediction: ${predError.message}`)
    console.error(`  Error details:`, JSON.stringify(predError, null, 2))
    return null
  }
  console.log(`  Prediction: ${prediction.id}`)

  // Verify the prediction exists
  const { data: verify, error: verifyError } = await supabase
    .from('predictions')
    .select('id, title')
    .eq('id', prediction.id)
    .single()

  if (verifyError || !verify) {
    console.error(`  WARNING: Prediction ${prediction.id} was inserted but cannot be read back!`)
    console.error(`  Verify error:`, verifyError?.message)
  } else {
    console.log(`  Verified: ${verify.title.substring(0, 40)}...`)
  }

  // 2. Insert snapshot
  const { data: snapshot, error: snapError } = await supabase
    .from('snapshots')
    .insert({
      prediction_id: prediction.id,
      client_email: persona.email,
      goal: fsAnswers.fs1,
      success: psAnswers.ps1,
      fs_answers: fsAnswers,
      ps_answers: psAnswers,
      alignment_scores: alignmentScores,
      zone_scores: zoneBreakdown,
      predictability_score: predictabilityScore,
      growth_opportunity: growthOpportunity,
      question_48hr: question48hr,
    })
    .select('id')
    .single()

  if (snapError) {
    console.error(`  Failed to insert snapshot: ${snapError.message}`)
  } else {
    console.log(`  Snapshot: ${snapshot.id}`)
  }

  // 3. Insert future connections
  for (const conn of persona.future_connections) {
    const { error: connError } = await supabase
      .from('prediction_connections')
      .insert({
        prediction_id: prediction.id,
        client_email: persona.email,
        name: conn.name,
        relationship: conn.relationship || null,
        involvement_type: conn.support_type || null,
        working_on_similar: conn.working_on_similar || false,
        connection_time: 'future',
      })

    if (connError) {
      console.error(`  Failed: ${conn.name} - ${connError.message}`)
    } else {
      console.log(`  Connection (future): ${conn.name}`)
    }
  }

  // 4. Insert past connections
  for (const conn of persona.past_connections) {
    const { error: connError } = await supabase
      .from('prediction_connections')
      .insert({
        prediction_id: prediction.id,
        client_email: persona.email,
        name: conn.name,
        how_involved: conn.how_involved || null,
        connection_time: 'past',
      })

    if (connError) {
      console.error(`  Failed: ${conn.name} - ${connError.message}`)
    } else {
      console.log(`  Connection (past): ${conn.name}`)
    }
  }

  console.log(`  Score: ${predictabilityScore}%`)
  console.log(`  Zones: F=${zoneBreakdown.feelings}, I=${zoneBreakdown.influence}, R=${zoneBreakdown.resilience}, E=${zoneBreakdown.ethics}, S=${zoneBreakdown.strengths}`)
  console.log(`  Growth: ${growthElement} (${growthZone})`)

  return { prediction, snapshot, predictabilityScore, zoneBreakdown }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const cleanFirst = args.includes('--clean-first')

  console.log('='.repeat(60))
  console.log('Finding Good V2 - Test Persona Insert')
  console.log('='.repeat(60))

  const results = {}

  for (const [key, persona] of Object.entries(PERSONAS)) {
    // Clean existing data if flag set
    if (cleanFirst) {
      await cleanPersonaData(persona.email)
    } else {
      // Check if exists
      const exists = await checkPersonaExists(persona.email)
      if (exists) {
        console.log(`\nSkipping ${persona.name} - already exists (use --clean-first to replace)`)
        continue
      }
    }

    const result = await insertPersona(key)
    if (result) {
      results[key] = result
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))

  for (const [key, persona] of Object.entries(PERSONAS)) {
    const result = results[key]
    if (result) {
      console.log(`${persona.name.padEnd(20)} | ${result.predictabilityScore}% | F:${result.zoneBreakdown.feelings.charAt(0)} I:${result.zoneBreakdown.influence.charAt(0)} R:${result.zoneBreakdown.resilience.charAt(0)} E:${result.zoneBreakdown.ethics.charAt(0)} S:${result.zoneBreakdown.strengths.charAt(0)}`)
    } else {
      console.log(`${persona.name.padEnd(20)} | skipped or failed`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
