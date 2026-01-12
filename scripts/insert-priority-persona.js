#!/usr/bin/env node

/**
 * Priority Builder Persona Insert Script
 * Inserts test persona data for Priority Builder (bypasses UI)
 * 
 * Usage:
 *   node scripts/insert-priority-persona.js marcus
 *   node scripts/insert-priority-persona.js --list
 *   node scripts/insert-priority-persona.js --all
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

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/priority-analyze`

// ============================================================================
// PERSONA DEFINITIONS
// ============================================================================

const PERSONAS = {
  marcus: {
    name: 'Marcus Chen',
    email: 'brian@findinggood.com',
    archetype: 'Skeptical Executive',
    priority: {
      focus: "Getting my plant manager Mike aligned with floor supervisors — they've been going around him and it's creating chaos",
      whatWentWell: "Had a direct conversation with Mike about the end-runs. Told him plainly that I would be backing his decisions publicly and that supervisors needed to go through him. He pushed back at first — said he didn't want to seem like he was hiding behind me — but I told him this wasn't about protection, it was about clarity. We walked through three specific situations from last week where the chain was broken and agreed on how we'd handle them differently going forward.",
      yourPart: "I initiated the conversation instead of waiting for another incident. I was direct without being harsh. I listened when he pushed back instead of just steamrolling him with my position. And I committed to something concrete — I told him I'd redirect any supervisor who came to me back to him, and I'd do it in front of them so there was no ambiguity.",
      impact: "Mike seemed genuinely relieved by the end of it. He said he'd been feeling undermined but didn't know how to bring it up. For me, I felt like I'd actually addressed the root issue instead of just managing symptoms. And honestly, it reminded me that I'm good at this — at having the hard conversations when they matter."
    },
  },

  rachel: {
    name: 'Rachel Torres',
    email: 'support@findinggood.com',
    archetype: 'Over-Thinker',
    priority: {
      focus: "Making a decision about whether to pursue VP or start my consulting practice — I've been stuck for months",
      whatWentWell: "I finally set a decision deadline — January 31st. I've been spinning on the VP vs consulting question for months, and today I wrote it in my calendar and told Sarah about it. I also reached out to two people: one who took the VP path and one who started their own practice. Set up calls for next week.",
      yourPart: "I stopped waiting until I felt 'ready' to decide. I recognized that more research wasn't helping — it was just another form of avoidance. I told someone about the deadline so I couldn't quietly move it. And I took actual action (scheduling the calls) instead of just thinking about taking action.",
      impact: "I felt lighter almost immediately after setting the deadline. Like the pressure of infinite deliberation was worse than the pressure of having to choose. Sarah was supportive and offered to check in with me on Feb 1st. I'm still nervous, but it's a productive nervous now — pointed at something real instead of just circling."
    },
  },

  david: {
    name: 'David Park',
    email: 'brian@brianfretwell.com',
    archetype: 'Crisis Arrival',
    priority: {
      focus: "Rebuilding trust with my team after the layoffs — starting with honest one-on-ones",
      whatWentWell: "Had my first honest one-on-one with Elena from the team. Didn't prepare talking points or try to manage her reaction. Just asked her how she was really doing and then listened. She told me she's been interviewing elsewhere. Instead of panicking or trying to convince her to stay, I just acknowledged that I understood and asked what would need to be true for her to want to stay.",
      yourPart: "I showed up without an agenda. I didn't try to fix or convince. I asked a real question and sat with the uncomfortable answer. When she said she was interviewing, I didn't react defensively — I stayed curious. That took effort because my instinct was to start selling or apologizing.",
      impact: "Elena seemed surprised that I didn't try to talk her out of it. She said it was the first honest conversation she'd had with leadership since the layoffs. She's still interviewing, but she agreed to tell me if she gets an offer before accepting — which is more than I had before. For me, it felt like the first small step toward rebuilding something real instead of just managing optics."
    },
  },

  simone: {
    name: 'Simone Williams',
    email: 'bfretwell7@hotmail.com',
    archetype: 'Enterprise Evaluator',
    priority: {
      focus: "Rolling out the new performance management system — specifically converting the skeptical regional directors",
      whatWentWell: "Got Carlos Mendez — the most skeptical regional director — to agree to a design partner role for the EMEA pilot. He's been the loudest voice saying 'this won't work in our culture,' and now he's inside the tent instead of throwing rocks from outside. We spent an hour on a call where I mostly listened to his concerns, and by the end he was suggesting modifications instead of rejecting the whole approach.",
      yourPart: "I didn't try to convince him the system was good. I asked him what would need to be true for it to work in EMEA. I treated his resistance as data, not obstruction. I gave him real influence over the design — not fake 'input' but actual decision rights on three key parameters. And I followed up same-day with a summary of what he'd proposed and a commitment to incorporate it.",
      impact: "His whole demeanor shifted by the end of the call. He went from 'this is corporate overreach' to 'if we do it this way, my team might actually use it.' Janet messaged me afterward saying she'd heard Carlos talking positively about the project for the first time. For me, it validated that my instinct to convert skeptics early is the right approach — and that influence comes from listening, not presenting."
    },
  },

  terry: {
    name: 'Terry Jackson',
    email: 'info@findinggood.com',
    archetype: 'Surface Enthusiast',
    priority: {
      focus: "Being a more authentic leader — specifically, not performing expertise I don't have",
      whatWentWell: "In our team meeting, I admitted I didn't know the answer to a technical question instead of doing my usual thing of talking around it or promising to 'circle back.' I just said, 'I don't know, but Kenji does — Kenji, can you walk us through it?' and then sat back and let him lead that part of the discussion.",
      yourPart: "I caught myself starting to perform expertise I didn't have, and I stopped. I chose honesty over looking competent. I gave credit and space to someone who actually knew the answer. And I didn't follow it up with caveats or try to re-establish my authority — I just let it be.",
      impact: "Kenji lit up. He gave a great explanation and you could tell he appreciated being put in the spotlight for his expertise. After the meeting, Rebecca said it was 'refreshing' to see me admit I didn't know something — which was a little painful to hear, but also telling. I felt uncomfortable in the moment but good afterward. Like I'd done something small but real."
    },
  },
}

// ============================================================================
// AI NARRATIVE GENERATION
// ============================================================================

async function callPriorityAnalyze(responses) {
  console.log('  ⏳ Calling priority-analyze edge function...')
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify(responses),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Edge function error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Analysis failed')
    }

    console.log('  ✓ AI analysis generated')
    return result
  } catch (error) {
    console.error('  ⚠️ AI analysis failed:', error.message)
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

  console.log(`\n📝 Inserting Priority entry for ${persona.name} (${persona.archetype})...`)
  console.log(`   Focus: ${persona.priority.focus.substring(0, 50)}...`)

  // Optional: backdate the record
  const createdAt = options.createdAt || new Date().toISOString()

  // 1. Call the edge function for AI analysis
  let aiResult = null
  if (!options.skipAI) {
    aiResult = await callPriorityAnalyze(persona.priority)
  }

  // Build FIRES extracted object for database
  const firesExtracted = {}
  if (aiResult?.firesElements) {
    for (const fe of aiResult.firesElements) {
      firesExtracted[fe.element] = {
        present: true,
        evidence: fe.evidence,
        strength: fe.strength || 3,
      }
    }
  }

  // 2. Insert validation record
  const { data: validation, error: valError } = await supabase
    .from('validations')
    .insert({
      client_email: persona.email,
      mode: 'self',
      responses: persona.priority,
      proof_line: aiResult?.priorityLine || 'I made progress on something that mattered today.',
      fires_extracted: Object.keys(firesExtracted).length > 0 ? firesExtracted : null,
      validation_signal: aiResult?.validationSignal || 'developing',
      pattern: aiResult?.yourPattern ? { 
        name: aiResult.yourPattern, 
        quotes: aiResult.patternQuotes || [] 
      } : null,
      share_to_feed: false,
      created_at: createdAt,
    })
    .select('id')
    .single()

  if (valError) {
    console.error('Failed to insert validation:', valError)
    return null
  }
  console.log(`  ✓ Validation created: ${validation.id}`)

  console.log(`\n✅ ${persona.name} Priority entry inserted!`)
  
  if (aiResult) {
    console.log(`\n🤖 AI Analysis:`)
    console.log(`   Proof Line: ${aiResult.priorityLine}`)
    console.log(`   Pattern: ${aiResult.yourPattern || 'N/A'}`)
    console.log(`   Signal: ${aiResult.validationSignal}`)
    if (aiResult.patternQuotes?.length > 0) {
      console.log(`   Quotes:`)
      for (const quote of aiResult.patternQuotes) {
        console.log(`     - "${quote}"`)
      }
    }
    if (aiResult.firesElements?.length > 0) {
      console.log(`   FIRES Elements:`)
      for (const fe of aiResult.firesElements) {
        console.log(`     - ${fe.element} (${fe.strength}/5): ${fe.evidence}`)
      }
    }
    if (aiResult.reflectionInsight) {
      console.log(`   Insight: ${aiResult.reflectionInsight}`)
    }
  }

  return { validation, validationId: validation.id }
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
Priority Builder Persona Insert Script

Usage:
  node scripts/insert-priority-persona.js <persona>           Insert a specific persona
  node scripts/insert-priority-persona.js <persona> --skip-ai Insert without AI analysis
  node scripts/insert-priority-persona.js --list              List available personas
  node scripts/insert-priority-persona.js --all               Insert all personas
  node scripts/insert-priority-persona.js --all --skip-ai     Insert all without AI

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
      console.log(`               Focus: ${persona.priority.focus.substring(0, 60)}...\n`)
    }
    process.exit(0)
  }

  if (filteredArgs[0] === '--all') {
    console.log('Inserting all Priority personas...\n')
    for (const key of Object.keys(PERSONAS)) {
      await insertPersona(key, { skipAI })
    }
    console.log('\n🎉 All Priority personas inserted!')
    process.exit(0)
  }

  // Insert specific persona
  const personaKey = filteredArgs[0].toLowerCase()
  await insertPersona(personaKey, { skipAI })
  
  process.exit(0)
}

main().catch(console.error)
