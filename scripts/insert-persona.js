#!/usr/bin/env node

/**
 * Persona Insert Script
 * Inserts test persona data directly into Supabase (bypasses UI)
 * 
 * Usage:
 *   node scripts/insert-persona.js marcus
 *   node scripts/insert-persona.js --list
 *   node scripts/insert-persona.js --all
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env
config()

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('   Make sure .env contains:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/predict-analyze`

// ============================================================================
// PERSONA DEFINITIONS
// ============================================================================

const PERSONAS = {
  marcus: {
    name: 'Marcus Chen',
    email: 'info@findinggood.com',
    archetype: 'Skeptical Executive',
    prediction: {
      title: 'Get plant manager and floor supervisors aligned',
      description: "My new plant manager Mike isn't getting buy-in from the floor. Supervisors are going around him, coming straight to me. It's creating delays and I'm getting pulled into stuff I shouldn't be in.",
      type: 'challenge',
    },
    future_story: {
      fs1: 'Issues flow through Mike. Decisions come back down through Mike. I stop getting end-runs to my office about floor problems.',
      fs2: "Relieved. Like I can actually focus on my job instead of putting out fires that aren't mine to put out.",
      fs3: 'Have a direct conversation with Mike about what authority he actually has, and then back him publicly when supervisors try to go around.',
      fs4: "Mike might not be capable. If that's the case I need to know sooner than later. I'll give him 90 days with clear metrics. The other challenge is the supervisors have 10+ years here and Mike has 10 months — they don't respect him yet.",
      fs5: "Directness. Fairness. I'm not going to let tenure override competence but I'm also not going to throw Mike under the bus without giving him a real shot.",
      fs6: "I've done this before. I know how to have hard conversations. I don't avoid conflict when it matters.",
    },
    past_story: {
      ps1: '2019, we merged two shifts after an acquisition. Total chaos for about 3 months — two different cultures, people going around the new structure. Took about 4 months to sort out but we got there.',
      ps2: "Tired. But also like we'd actually built something. The team that came out of it was stronger than either of the original crews.",
      ps3: 'Weekly standups where I made people talk TO each other instead of about each other. Forced the conflicts into the room.',
      ps4: 'One supervisor was actively sabotaging the new structure. Had to let him go. That was hard but it was the right call and everyone knew it.',
      ps5: 'Same as now. Direct communication. Not letting problems fester. And honestly — protecting the people who were trying to make it work.',
      ps6: "Pattern recognition. I could see who was building and who was tearing down. And I'm not afraid to make the call when someone has to go.",
    },
    alignment: { q1: 3, q2: 3, q3: 4, q4: 4, q5: 3, q6: 3 },
    future_connections: [
      { name: 'Lisa Huang', relationship: 'Ops Director', support_type: 'She sees everything on the floor. I need her read on whether Mike can actually do this, and I need her to stop enabling the end-runs.' },
      { name: 'Mike Torres', relationship: 'Plant Manager (direct report)', support_type: "He's the one who has to step up. I need to be clear about what I expect and then get out of his way.", working_on_similar: true },
    ],
    past_connections: [
      { name: 'Dave Kowalski', how_involved: 'He was the shift lead who actually wanted it to work. He helped me see who was on board and who wasn\'t.' },
      { name: 'My old CEO, Richard', how_involved: 'He gave me air cover. Let me make the call on the termination without second-guessing it.' },
    ],
  },

  rachel: {
    name: 'Rachel Torres',
    email: 'support@findinggood.com',
    archetype: 'Over-Thinker',
    prediction: {
      title: 'Decide whether to pursue the VP promotion or start my consulting practice',
      description: "I've been offered a path to VP at my company, but I've also been dreaming about starting my own consulting practice for years. I keep analyzing both options but can't commit to either.",
      type: 'goal',
    },
    future_story: {
      fs1: "I've made a clear decision and I'm at peace with it. I'm not second-guessing myself anymore. I'm fully committed to whichever path I chose.",
      fs2: "Calm. Focused. Like a weight has been lifted because I finally stopped spinning and picked a direction.",
      fs3: "Set a decision deadline and stick to it. Talk to three people who've done each path. Stop researching and start deciding.",
      fs4: "My tendency to over-analyze. I'll catch myself going in circles and force a decision even if it's uncomfortable. Also, fear of making the 'wrong' choice — I need to accept there's no perfect answer.",
      fs5: "Authenticity. Growth. I want to do work that actually matters to me, not just what looks good on paper.",
      fs6: "I'm good at seeing all angles of a problem. I'm thorough. I care deeply about doing things right.",
    },
    past_story: {
      ps1: "Choosing to leave my first company after 7 years. It felt impossible at the time — I had built so much there. But I made the leap and it led to everything good that followed.",
      ps2: "Terrified at first, then incredibly free. Like I had proven to myself I could handle big changes.",
      ps3: "I gave myself a firm deadline and told three people about it so I couldn't back out.",
      ps4: "The guilt of leaving my team. The fear of the unknown. The voice saying 'stay where it's safe.'",
      ps5: "Trusting myself. Believing that I could figure things out even without a perfect plan.",
      ps6: "Resilience — I can handle more uncertainty than I give myself credit for. And relationships — people supported me more than I expected.",
    },
    alignment: { q1: 4, q2: 3, q3: 2, q4: 4, q5: 2, q6: 3 },
    future_connections: [
      { name: 'Sarah Chen', relationship: 'Mentor', support_type: 'She made a similar transition 5 years ago. I need her honest take on whether consulting is what I think it is.' },
      { name: 'My therapist', relationship: 'Therapist', support_type: 'Helping me separate the anxiety from the actual decision.' },
    ],
    past_connections: [
      { name: 'James Wright', how_involved: 'My old manager who encouraged me to leave. He saw I had outgrown the role before I did.' },
      { name: 'My partner Alex', how_involved: 'Listened to me agonize for months and kept believing in me anyway.' },
    ],
  },

  david: {
    name: 'David Park',
    email: 'brian@brianfretwell.com',
    archetype: 'Crisis Arrival',
    prediction: {
      title: 'Rebuild trust with my team after the layoffs I had to make',
      description: "I had to lay off 40% of my team last month. The people who stayed are scared, angry, and don't trust leadership. I need to rebuild but I'm not sure how when I'm the one who made the cuts.",
      type: 'challenge',
    },
    future_story: {
      fs1: "My team trusts that I'll be honest with them, even when the news is hard. They're engaged again, not just going through the motions waiting for the next shoe to drop.",
      fs2: "Relieved but also humble. I'll know we've rebuilt something real, not just papered over the damage.",
      fs3: "Have honest one-on-ones with every remaining team member. Acknowledge the pain directly. Be transparent about what I know and don't know about the future.",
      fs4: "Some people may never trust me again, and I have to accept that. I might lose more people who can't move past this. I'll need to keep showing up consistently even when it feels like it's not working.",
      fs5: "Honesty, even when it's uncomfortable. Loyalty to the people who stayed. Taking responsibility without making excuses.",
      fs6: "I can have hard conversations. I genuinely care about these people, and I think they know that even if they're angry right now.",
    },
    past_story: {
      ps1: "Rebuilding my relationship with my brother after a major falling out. We didn't speak for two years, and now we're closer than ever.",
      ps2: "Grateful. Aware of how fragile relationships can be and how much work it takes to repair them.",
      ps3: "I reached out first even though I felt like the wronged party. I listened more than I talked. I showed up consistently over months, not just once.",
      ps4: "My own pride. The fear that reaching out would be seen as weakness. The uncertainty of not knowing if he'd respond.",
      ps5: "Humility. The relationship mattered more than being right.",
      ps6: "Patience. I can stay committed to something even when progress is slow. And I'm willing to be the one who reaches out first.",
    },
    alignment: { q1: 2, q2: 2, q3: 3, q4: 4, q5: 2, q6: 2 },
    future_connections: [
      { name: 'Maria Santos', relationship: 'HR Partner', support_type: "She knows the team dynamics better than anyone. I need her to tell me what people are really saying." },
      { name: 'Coach Thompson', relationship: 'Executive Coach', support_type: "Helping me process my own guilt so it doesn't leak into my interactions with the team." },
    ],
    past_connections: [
      { name: 'My brother Michael', how_involved: 'He was willing to give me another chance. His openness taught me what forgiveness can look like.' },
      { name: 'My wife Jennifer', how_involved: 'She helped me see my own part in the conflict and encouraged me to make the first move.' },
    ],
  },

  simone: {
    name: 'Simone Williams',
    email: 'bfretwell7@hotmail.com',
    archetype: 'Enterprise Evaluator',
    prediction: {
      title: 'Roll out new performance management system across 3 regions',
      description: "I'm leading the implementation of a new performance management approach across our EMEA, APAC, and Americas teams. 2,000+ employees affected. High visibility, lots of skepticism from regional leaders.",
      type: 'goal',
    },
    future_story: {
      fs1: "All three regions have adopted the system with at least 80% compliance. Regional leaders are advocates, not resistors. Employees report the process is actually useful, not just bureaucratic overhead.",
      fs2: "Proud but also validated. This is the kind of large-scale change I want to be known for leading.",
      fs3: "Get regional champions on board first. Pilot in one region, learn, iterate, then roll out. Over-communicate the 'why' before the 'how.'",
      fs4: "Regional leaders protecting their autonomy. 'This won't work in our culture' pushback. Inconsistent adoption that undermines the whole system. I'll need strong exec sponsorship and local champions who can translate the approach.",
      fs5: "Excellence — if we're going to do this, do it right. Respect — every region has context I need to understand. Persistence — change this big takes longer than anyone wants.",
      fs6: "I know how to build coalitions. I can translate executive vision into operational reality. I stay calm under political pressure.",
    },
    past_story: {
      ps1: "Implementing our new HRIS across the organization two years ago. Similar scale, similar resistance, ultimately successful.",
      ps2: "Exhausted but accomplished. And honestly, a bit surprised at how many skeptics became advocates by the end.",
      ps3: "Found the influential skeptic early and made them a design partner. Their buy-in brought others along.",
      ps4: "The IT integration was a nightmare. Timeline kept slipping. I had to manage up constantly to keep exec support while managing down to keep the team motivated.",
      ps5: "Transparency about challenges without being defeatist. Celebrating small wins to maintain momentum.",
      ps6: "Stakeholder management — I can read a room and adjust my approach. And endurance — I don't give up when things get hard.",
    },
    alignment: { q1: 4, q2: 4, q3: 3, q4: 4, q5: 3, q6: 3 },
    future_connections: [
      { name: 'Carlos Mendez', relationship: 'EMEA Regional Director', support_type: "He's the most skeptical regional leader. If I can get him on board, others will follow." },
      { name: 'Janet Liu', relationship: 'APAC HR Lead', support_type: "She's rolled out similar initiatives in Asia before. I need her cultural expertise.", working_on_similar: true },
      { name: 'Tom Bradley', relationship: 'Executive Sponsor', support_type: "Air cover when regional pushback escalates. Needs to stay visible and committed." },
    ],
    past_connections: [
      { name: 'Priya Sharma', how_involved: 'She was my skeptic-turned-champion on the HRIS project. Taught me how to convert resistors.' },
      { name: 'My old boss Mark', how_involved: 'He protected me politically when the timeline slipped. Let me focus on execution instead of defense.' },
    ],
  },

  terry: {
    name: 'Terry Jackson',
    email: 'info@findinggood.com',
    archetype: 'Surface Enthusiast',
    prediction: {
      title: 'Become a more authentic leader who inspires my team',
      description: "I've read all the leadership books. I know the frameworks. But something's not clicking — my team respects me but they're not inspired. I want to lead in a way that actually moves people.",
      type: 'experience',
    },
    future_story: {
      fs1: "My team actively wants to work on my projects. They bring me their ideas, not just their problems. I can feel the energy shift in meetings.",
      fs2: "Like I'm finally being the leader I always wanted to be. Confident but not arrogant. Effective because I'm genuine, not because I'm performing.",
      fs3: "Start sharing more of my own struggles with the team. Ask for feedback and actually change based on it. Be more vulnerable about what I don't know.",
      fs4: "My ego might get in the way — it's hard to admit weakness. The team might not respond well at first if I suddenly change my style. I might overcorrect and overshare.",
      fs5: "Authenticity — no more performing what I think a leader should be. Courage — being real takes more guts than being polished.",
      fs6: "I'm a quick learner. I genuinely want to be better. People tell me I'm likable even when I'm not sure I'm being effective.",
    },
    past_story: {
      ps1: "The one time I was truly vulnerable with my team — when I admitted I had messed up a client relationship — they rallied around me instead of losing respect.",
      ps2: "Shocked, honestly. I expected judgment and got support. It changed how I thought about strength.",
      ps3: "I owned the mistake publicly before anyone else could point it out. I asked for help fixing it instead of pretending I had it handled.",
      ps4: "My own fear that admitting mistakes would undermine my authority. The discomfort of not knowing how people would react.",
      ps5: "Honesty — I couldn't pretend the problem wasn't my fault. Trust — I trusted my team to handle the truth.",
      ps6: "Courage to go first. Willingness to be uncomfortable for a good outcome.",
    },
    alignment: { q1: 3, q2: 3, q3: 2, q4: 4, q5: 2, q6: 2 },
    future_connections: [
      { name: 'Rebecca Mills', relationship: 'Team Lead', support_type: "She's the most honest person on my team. I'll ask her to tell me what people really think of my leadership." },
      { name: 'Executive Coach', relationship: 'Coach', support_type: "Working through why I default to performance mode instead of authenticity." },
    ],
    past_connections: [
      { name: 'The client team', how_involved: "They forgave the mistake faster than I expected when I was honest about it." },
      { name: 'My colleague Darnell', how_involved: "He told me afterward that my honesty made him trust me more, not less." },
    ],
  },
}

// ============================================================================
// CALCULATION FUNCTIONS (same logic as shared package)
// ============================================================================

const ZONE_MAP = { 1: 'Exploring', 2: 'Discovering', 3: 'Performing', 4: 'Owning' }

function calculateZone(score) {
  const clamped = Math.max(1, Math.min(4, Math.round(score)))
  return ZONE_MAP[clamped] || 'Exploring'
}

function calculateZoneBreakdown(alignment) {
  return {
    feelings: calculateZone(alignment.q1),
    influence: calculateZone(alignment.q2),
    resilience: calculateZone(alignment.q3),
    ethics: calculateZone(alignment.q4),
    strengths: calculateZone(alignment.q5),
  }
}

function calculatePredictabilityScore(alignment, connectionCount) {
  const scores = Object.values(alignment)
  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const baseScore = ((average - 1) / 3) * 100
  const connectionBonus = Math.min(connectionCount * 2, 16)
  return Math.min(Math.round(baseScore + connectionBonus), 100)
}

const ZONE_VALUES = { Exploring: 1, Discovering: 2, Performing: 3, Owning: 4 }

function selectGrowthOpportunity(zoneBreakdown) {
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
// AI NARRATIVE GENERATION
// ============================================================================

async function generateAINarrative(snapshotId, input) {
  console.log('  ⏳ Generating AI narrative...')
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        goal: input.goal,
        success: input.success,
        fs_answers: input.fs_answers,
        ps_answers: input.ps_answers,
        zone_scores: input.zone_scores,
        growth_opportunity: input.growth_opportunity,
        alignment_scores: input.alignment_scores,
        connections: input.connections,
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

    // Update the snapshot with the AI narrative
    const { error: updateError } = await supabase
      .from('snapshots')
      .update({
        narrative: JSON.stringify(result.narrative),
      })
      .eq('id', snapshotId)

    if (updateError) {
      throw new Error(`Failed to save narrative: ${updateError.message}`)
    }

    console.log('  ✓ AI narrative generated and saved')
    return result.narrative
  } catch (error) {
    console.error('  ⚠️ AI narrative generation failed:', error.message)
    return null
  }
}

// ============================================================================
// INSERT FUNCTIONS
// ============================================================================

async function insertPersona(personaKey, options = {}) {
  const persona = PERSONAS[personaKey]
  if (!persona) {
    console.error(`Unknown persona: ${personaKey}`)
    console.log('Available personas:', Object.keys(PERSONAS).join(', '))
    process.exit(1)
  }

  console.log(`\n📝 Inserting ${persona.name} (${persona.archetype})...`)

  // Calculate values
  const connectionCount = persona.future_connections.length + persona.past_connections.length
  const zoneBreakdown = calculateZoneBreakdown(persona.alignment)
  const predictabilityScore = calculatePredictabilityScore(persona.alignment, connectionCount)
  const growthElement = selectGrowthOpportunity(zoneBreakdown)
  const growthZone = zoneBreakdown[growthElement]
  const growthOpportunity = generateGrowthOpportunityText(growthElement, growthZone)
  const question48hr = select48HourQuestion(growthElement, growthZone)

  // Optional: backdate the record
  const createdAt = options.createdAt || new Date().toISOString()

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
      created_at: createdAt,
      updated_at: createdAt,
    })
    .select('id')
    .single()

  if (predError) {
    console.error('Failed to insert prediction:', predError)
    return null
  }
  console.log(`  ✓ Prediction created: ${prediction.id}`)

  // 2. Insert snapshot
  const { data: snapshot, error: snapError } = await supabase
    .from('snapshots')
    .insert({
      prediction_id: prediction.id,
      client_email: persona.email,
      goal: persona.future_story.fs1,
      success: persona.past_story.ps1,
      fs_answers: persona.future_story,
      ps_answers: persona.past_story,
      alignment_scores: persona.alignment,
      zone_scores: zoneBreakdown,
      predictability_score: predictabilityScore,
      growth_opportunity: growthOpportunity,
      question_48hr: question48hr,
      created_at: createdAt,
    })
    .select('id')
    .single()

  if (snapError) {
    console.error('Failed to insert snapshot:', snapError)
  } else {
    console.log(`  ✓ Snapshot created: ${snapshot.id}`)
  }

  // 3. Insert future connections
  const futureConns = []
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
        created_at: createdAt,
      })

    if (connError) {
      console.error(`Failed to insert future connection ${conn.name}:`, connError)
    } else {
      console.log(`  ✓ Future connection: ${conn.name}`)
      futureConns.push({ name: conn.name, involvement_type: conn.support_type })
    }
  }

  // 4. Insert past connections
  const pastConns = []
  for (const conn of persona.past_connections) {
    const { error: connError } = await supabase
      .from('prediction_connections')
      .insert({
        prediction_id: prediction.id,
        client_email: persona.email,
        name: conn.name,
        how_involved: conn.how_involved || null,
        connection_time: 'past',
        created_at: createdAt,
      })

    if (connError) {
      console.error(`Failed to insert past connection ${conn.name}:`, connError)
    } else {
      console.log(`  ✓ Past connection: ${conn.name}`)
      pastConns.push({ name: conn.name, how_involved: conn.how_involved })
    }
  }

  console.log(`\n✅ ${persona.name} data inserted!`)
  console.log(`   Predictability Score: ${predictabilityScore}%`)
  console.log(`   Growth Area: ${growthElement} (${growthZone})`)
  console.log(`   48hr Question: ${question48hr}`)

  // 5. Generate AI narrative (unless --skip-ai flag)
  if (!options.skipAI && snapshot?.id) {
    const narrative = await generateAINarrative(snapshot.id, {
      goal: persona.future_story.fs1,
      success: persona.past_story.ps1,
      fs_answers: persona.future_story,
      ps_answers: persona.past_story,
      zone_scores: zoneBreakdown,
      growth_opportunity: growthOpportunity,
      alignment_scores: persona.alignment,
      connections: {
        future: futureConns,
        past: pastConns,
      },
    })

    if (narrative) {
      console.log(`\n🤖 AI Insights Generated:`)
      console.log(`   Next Steps: ${narrative.next_steps?.[0] || 'N/A'}`)
    }
  }

  return { prediction, snapshot }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const skipAI = args.includes('--skip-ai')
  const filteredArgs = args.filter(a => a !== '--skip-ai')

  if (filteredArgs.length === 0 || filteredArgs[0] === '--help') {
    console.log(`
Persona Insert Script - Insert test personas into Supabase

Usage:
  node scripts/insert-persona.js <persona>           Insert a specific persona
  node scripts/insert-persona.js <persona> --skip-ai Insert without AI narrative
  node scripts/insert-persona.js --list              List available personas
  node scripts/insert-persona.js --all               Insert all personas
  node scripts/insert-persona.js --all --skip-ai     Insert all without AI

Available personas:
  ${Object.keys(PERSONAS).join(', ')}
    `)
    process.exit(0)
  }

  if (filteredArgs[0] === '--list') {
    console.log('\nAvailable personas:\n')
    for (const [key, persona] of Object.entries(PERSONAS)) {
      console.log(`  ${key.padEnd(10)} - ${persona.name} (${persona.archetype})`)
      console.log(`               Email: ${persona.email}`)
      console.log(`               Goal: ${persona.prediction.title}\n`)
    }
    process.exit(0)
  }

  if (filteredArgs[0] === '--all') {
    console.log('Inserting all personas...\n')
    for (const key of Object.keys(PERSONAS)) {
      await insertPersona(key, { skipAI })
    }
    console.log('\n🎉 All personas inserted!')
    process.exit(0)
  }

  // Insert specific persona
  const personaKey = filteredArgs[0].toLowerCase()
  await insertPersona(personaKey, { skipAI })
  process.exit(0)
}

main().catch(console.error)
