#!/usr/bin/env node

/**
 * Insert Priority (priorities) and Proof (validations) data
 * for all 4 test personas to simulate realistic usage.
 *
 * Usage:
 *   node scripts/insert-priority-proof.js
 *   node scripts/insert-priority-proof.js --clean-first
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function daysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

// ============================================================================
// PRIORITY DATA (priorities)
// ============================================================================

const PRIORITY_ENTRIES = {
  // MARCUS CHEN - Rebuilding trust after layoffs
  'info@findinggood.com': [
    {
      timeframe: 'today',
      intensity: 'balanced',
      responses: {
        what_went_well: "Had a real conversation with Miguel about his concerns. Instead of defending the layoffs, I just listened. He told me things I didn't know the team was feeling.",
        your_part: "I shut up. Didn't try to fix it or explain. Just asked follow-up questions and thanked him for being honest.",
        impact: "He said 'I appreciate you actually hearing me.' First time someone on the team has said something like that since the cuts."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Relief at authentic connection" },
        influence: { present: true, signal: "Chose to listen instead of defend" },
        resilience: { present: false },
        ethics: { present: true, signal: "Honesty over comfort" },
        strengths: { present: false }
      },
      integrity_line: "Listened without defending, and Miguel felt heard for the first time since the layoffs.",
      ownership_signal: 'developing',
      clarity_signal: 'strong',
      created_at: daysAgo(1)
    },
    {
      timeframe: 'today',
      intensity: 'light',
      responses: {
        what_went_well: "Team standup had actual energy today. People were making eye contact, a few jokes happened naturally.",
        your_part: "Started the meeting by admitting I'd been hiding in my office too much. Said I was going to be more present.",
        impact: "Small shift but real. The room felt less like a funeral."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Noticed positive shift in team energy" },
        influence: { present: true, signal: "Modeling vulnerability" },
        resilience: { present: false },
        ethics: { present: false },
        strengths: { present: false }
      },
      integrity_line: "Admitted I'd been hiding, and the team meeting came alive.",
      ownership_signal: 'emerging',
      clarity_signal: 'developing',
      created_at: daysAgo(4)
    },
    {
      timeframe: 'today',
      intensity: 'deeper',
      responses: {
        what_went_well: "Rachel came to me with a problem instead of going to HR. Said she wanted my take first.",
        your_part: "I've been doing weekly 15-minute check-ins. No agenda, just 'how are you really doing?' This was the first one where someone brought something real.",
        impact: "She trusted me with something hard. That trust didn't exist two weeks ago."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Gratitude that trust is rebuilding" },
        influence: { present: true, signal: "Consistent check-ins creating safety" },
        resilience: { present: true, signal: "Staying committed despite slow progress" },
        ethics: { present: true, signal: "Prioritizing people over efficiency" },
        strengths: { present: true, signal: "Using systems thinking to build trust" }
      },
      integrity_line: "Weeks of consistent check-ins paid off - Rachel trusted me with something real.",
      ownership_signal: 'strong',
      clarity_signal: 'strong',
      created_at: daysAgo(7)
    }
  ],

  // SARAH OKONKWO - Deciding VP vs consulting
  'support@findinggood.com': [
    {
      timeframe: 'today',
      intensity: 'balanced',
      responses: {
        what_went_well: "Call with Dr. Amara cut through my analysis paralysis. She asked 'What would you regret not trying?' and I knew instantly.",
        your_part: "I actually answered honestly instead of listing pros and cons. Said 'consulting' without thinking.",
        impact: "First time I've felt clear instead of torn. The answer was there, I was just afraid to say it."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Clarity and relief" },
        influence: { present: false },
        resilience: { present: false },
        ethics: { present: true, signal: "Authenticity over safety" },
        strengths: { present: true, signal: "Gut instinct as a strength" }
      },
      integrity_line: "When asked what I'd regret not trying, 'consulting' came out before I could overthink it.",
      ownership_signal: 'developing',
      clarity_signal: 'strong',
      created_at: daysAgo(1)
    },
    {
      timeframe: 'today',
      intensity: 'light',
      responses: {
        what_went_well: "Did a 2-hour consulting mock engagement with Michael. It felt natural, energizing.",
        your_part: "I let myself pretend the decision was already made. Acted as if I was already a consultant.",
        impact: "Realized I'm not scared of the work. I'm scared of the transition. Different problem."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Energy and excitement in consulting work" },
        influence: { present: true, signal: "Created a test environment" },
        resilience: { present: false },
        ethics: { present: false },
        strengths: { present: true, signal: "Natural consulting abilities confirmed" }
      },
      integrity_line: "Mock consulting session revealed: I'm not scared of the work, just the leap.",
      ownership_signal: 'developing',
      clarity_signal: 'developing',
      created_at: daysAgo(4)
    },
    {
      timeframe: 'today',
      intensity: 'deeper',
      responses: {
        what_went_well: "Journaled about what my 60-year-old self would say. She was pretty clear: 'You knew. You always knew.'",
        your_part: "Gave myself permission to write without editing. Let the scared part speak, then let the wise part respond.",
        impact: "I have the answer. Now I need to find the courage to act on it."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Peace with internal knowing" },
        influence: { present: true, signal: "Created space for inner wisdom" },
        resilience: { present: true, signal: "Facing fear honestly" },
        ethics: { present: true, signal: "Alignment with true values" },
        strengths: { present: true, signal: "Self-reflection as capability" }
      },
      integrity_line: "Future self was clear: I've always known. Now I need courage to act.",
      ownership_signal: 'strong',
      clarity_signal: 'strong',
      created_at: daysAgo(7)
    }
  ],

  // DAVID PARK - Aligning plant manager with supervisors
  'brian@brianfretwell.com': [
    {
      timeframe: 'today',
      intensity: 'balanced',
      responses: {
        what_went_well: "Rosa came to my office about a scheduling conflict. I said 'Have you talked to Mike?' She had. That's new.",
        your_part: "Every time someone comes to me, I ask if they've talked to Mike first. Broken record. Finally working.",
        impact: "Chain of command starting to stick. Mike looked relieved when I told him."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Satisfaction seeing change" },
        influence: { present: true, signal: "Consistent redirection to Mike" },
        resilience: { present: true, signal: "Patience with slow change" },
        ethics: { present: false },
        strengths: { present: true, signal: "Knowing how to shift behavior" }
      },
      integrity_line: "Rosa went to Mike first. The broken record approach is finally working.",
      ownership_signal: 'developing',
      clarity_signal: 'strong',
      created_at: daysAgo(1)
    },
    {
      timeframe: 'today',
      intensity: 'light',
      responses: {
        what_went_well: "Supplier issue on Line 3. Mike handled it. I didn't find out until the next day.",
        your_part: "I was in the building. Could have jumped in. Chose to stay in my office and trust Mike.",
        impact: "Nothing broke. Mike grew. I need to do this more."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Pride in Mike's growth" },
        influence: { present: true, signal: "Intentional restraint" },
        resilience: { present: false },
        ethics: { present: false },
        strengths: { present: false }
      },
      integrity_line: "Stayed in my office during Line 3 crisis. Mike handled it. Nothing broke.",
      ownership_signal: 'emerging',
      clarity_signal: 'developing',
      created_at: daysAgo(4)
    },
    {
      timeframe: 'today',
      intensity: 'deeper',
      responses: {
        what_went_well: "Floor meeting ran without me. Mike facilitated, Rosa backed him when someone pushed back. The team is forming around Mike.",
        your_part: "Told Mike to run it. Told Rosa in advance that I was counting on her to support Mike publicly. She did.",
        impact: "This is what success looks like. I need to get out of the way more."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Hope that succession can work" },
        influence: { present: true, signal: "Orchestrated support for Mike" },
        resilience: { present: true, signal: "Letting go of control" },
        ethics: { present: true, signal: "Developing people over doing it myself" },
        strengths: { present: true, signal: "Reading people and setting them up to succeed" }
      },
      integrity_line: "Set up Rosa to back Mike publicly. Floor meeting ran without me. Team forming around Mike.",
      ownership_signal: 'strong',
      clarity_signal: 'strong',
      created_at: daysAgo(7)
    }
  ],

  // ELENA VASQUEZ - Building leadership team
  'bfretwell7@hotmail.com': [
    {
      timeframe: 'today',
      intensity: 'balanced',
      responses: {
        what_went_well: "Priya made a product call I disagreed with. I said nothing. Product didn't break. Maybe she was right.",
        your_part: "Physically sat on my hands during the meeting. Let her own it completely.",
        impact: "She's growing into the role. And I learned my opinion isn't always needed."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Discomfort but growth" },
        influence: { present: true, signal: "Intentional silence" },
        resilience: { present: true, signal: "Tolerating disagreement" },
        ethics: { present: true, signal: "Developing leaders over being right" },
        strengths: { present: false }
      },
      integrity_line: "Let Priya make a call I disagreed with. Product didn't break. Maybe I'm not always right.",
      ownership_signal: 'developing',
      clarity_signal: 'strong',
      created_at: daysAgo(1)
    },
    {
      timeframe: 'today',
      intensity: 'light',
      responses: {
        what_went_well: "Took a half day. Didn't check Slack. World didn't end.",
        your_part: "Told Coach Reyes I would try. She held me accountable. Phone stayed in drawer.",
        impact: "Four hours of not being CEO. Everything was fine. I can do this."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Relief and surprise" },
        influence: { present: true, signal: "Used coach for accountability" },
        resilience: { present: false },
        ethics: { present: false },
        strengths: { present: false }
      },
      integrity_line: "Half day offline. Phone in drawer. World didn't end. I can do this.",
      ownership_signal: 'emerging',
      clarity_signal: 'developing',
      created_at: daysAgo(4)
    },
    {
      timeframe: 'today',
      intensity: 'deeper',
      responses: {
        what_went_well: "Leadership team ran Monday meeting without me. I watched the recording. They were better without me there.",
        your_part: "Gave them the agenda, then deliberately scheduled a conflict. Forced myself to not be there.",
        impact: "They don't need me in every room. That's terrifying and exactly what I wanted."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Bittersweet success" },
        influence: { present: true, signal: "Designed own absence" },
        resilience: { present: true, signal: "Facing fear of irrelevance" },
        ethics: { present: true, signal: "Company health over personal centrality" },
        strengths: { present: true, signal: "Team building capabilities" }
      },
      integrity_line: "Skipped Monday meeting on purpose. Team was better without me. Exactly what I wanted.",
      ownership_signal: 'strong',
      clarity_signal: 'strong',
      created_at: daysAgo(7)
    }
  ]
}

// ============================================================================
// PROOF DATA (validations)
// ============================================================================

const PROOF_ENTRIES = {
  // MARCUS CHEN
  'info@findinggood.com': [
    {
      goal_challenge: "Rebuild trust with my team after the layoffs",
      timeframe: 'this_week',
      intensity: 'balanced',
      responses: {
        what_happened: "Had a team retrospective where I didn't defend any decisions. Just listened and wrote everything down.",
        how_did_you_do_it: "Told myself 'you're here to learn, not to be right.' Wrote 'LISTEN' on my notepad as a reminder.",
        what_made_it_work: "Letting go of needing to explain the layoffs. The team doesn't need my reasons. They need to be heard.",
        what_did_you_feel: "Uncomfortable at first. Then relieved. Like I could finally breathe because I wasn't defending."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Relief from dropping defensiveness", quote: "Like I could finally breathe" },
        influence: { present: true, signal: "Chose listening over defending", quote: "You're here to learn, not to be right" },
        resilience: { present: true, signal: "Sitting with discomfort", quote: "Uncomfortable at first" },
        ethics: { present: true, signal: "Team needs over self-protection", quote: "They need to be heard" },
        strengths: { present: false }
      },
      proof_line: "When I stopped defending and just listened, my team finally started talking.",
      validation_signal: 'developing',
      pattern: {
        whatWorked: "Stopping defense mode and pure listening",
        whyItWorked: "Team felt safe to speak when I wasn't explaining",
        howToRepeat: "Write 'LISTEN' as reminder. No defending. Just questions and gratitude."
      },
      scores: { confidence: 4, clarity: 4, ownership: 3 },
      created_at: daysAgo(7)
    },
    {
      goal_challenge: "Rebuild trust with my team after the layoffs",
      timeframe: 'this_week',
      intensity: 'deeper',
      responses: {
        what_happened: "Admitted to the team I've been struggling too. Said I'm not sure I made the right calls. First time showing that doubt.",
        how_did_you_do_it: "Started the all-hands with 'I want to share something I haven't said out loud.' Then I just told the truth.",
        what_made_it_work: "Letting them see me as human, not just the person who made the cuts. Vulnerability created connection.",
        what_did_you_feel: "Terrified before. Like I might lose all credibility. But after - something shifted. People looked at me differently."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Terror transforming to connection", quote: "Terrified before... something shifted" },
        influence: { present: true, signal: "Modeling vulnerability at scale", quote: "I want to share something I haven't said out loud" },
        resilience: { present: true, signal: "Risking credibility for authenticity", quote: "Might lose all credibility" },
        ethics: { present: true, signal: "Truth over image", quote: "Then I just told the truth" },
        strengths: { present: true, signal: "Courage in leadership", quote: "Letting them see me as human" }
      },
      proof_line: "When I admitted my own doubt about the layoffs, the team saw me as human again.",
      validation_signal: 'grounded',
      pattern: {
        whatWorked: "Public vulnerability about my own struggles",
        whyItWorked: "Humanized me beyond 'the person who made cuts'",
        howToRepeat: "Start with 'I want to share something I haven't said.' Be specific about the doubt."
      },
      scores: { confidence: 5, clarity: 5, ownership: 5 },
      created_at: daysAgo(14)
    }
  ],

  // SARAH OKONKWO
  'support@findinggood.com': [
    {
      goal_challenge: "Decide between VP promotion and starting consulting practice",
      timeframe: 'this_week',
      intensity: 'balanced',
      responses: {
        what_happened: "Did a real consulting project for a friend's startup. 3 hours. Got paid. It was the most alive I've felt at work in months.",
        how_did_you_do_it: "Said yes before I could overthink it. Treated it like an experiment, not a commitment.",
        what_made_it_work: "No stakes. No forever decision. Just 'let me try this and see what happens.'",
        what_did_you_feel: "Energy. Real energy. The kind I used to feel before my current job became routine."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Aliveness and energy", quote: "Most alive I've felt at work in months" },
        influence: { present: true, signal: "Created low-stakes experiment", quote: "Treated it like an experiment" },
        resilience: { present: false },
        ethics: { present: true, signal: "Following what energizes", quote: "Real energy" },
        strengths: { present: true, signal: "Consulting skills confirmed", quote: "3 hours. Got paid." }
      },
      proof_line: "A 3-hour consulting experiment showed me what 'alive at work' feels like again.",
      validation_signal: 'developing',
      pattern: {
        whatWorked: "Low-stakes experiment instead of big decision",
        whyItWorked: "Removed the pressure of 'forever' and just tested reality",
        howToRepeat: "Find small ways to test consulting. Say yes before overthinking. Notice energy levels."
      },
      scores: { confidence: 4, clarity: 4, ownership: 4 },
      created_at: daysAgo(7)
    },
    {
      goal_challenge: "Decide between VP promotion and starting consulting practice",
      timeframe: 'this_week',
      intensity: 'deeper',
      responses: {
        what_happened: "Told my VP sponsor I needed more time to decide. She asked why. I told her the truth about consulting dreams.",
        how_did_you_do_it: "Prepared to lose the opportunity. Decided honesty was worth more than keeping options open.",
        what_made_it_work: "She didn't judge. Said 'I wondered if that was happening.' Turns out my ambivalence was visible.",
        what_did_you_feel: "Free. Like a secret I'd been carrying was finally out. Whatever happens next, I'm not pretending anymore."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Freedom from pretending", quote: "Like a secret I'd been carrying was finally out" },
        influence: { present: true, signal: "Chose honesty over safety", quote: "Decided honesty was worth more" },
        resilience: { present: true, signal: "Prepared to accept consequences", quote: "Prepared to lose the opportunity" },
        ethics: { present: true, signal: "Authenticity as core value", quote: "I'm not pretending anymore" },
        strengths: { present: true, signal: "Courage in difficult conversations" }
      },
      proof_line: "Telling my VP sponsor the truth about consulting freed me from pretending.",
      validation_signal: 'grounded',
      pattern: {
        whatWorked: "Telling the truth even when it might cost me",
        whyItWorked: "Freedom from pretending is worth more than keeping options open",
        howToRepeat: "Prepare to accept the worst outcome. Then tell the truth. Notice the relief."
      },
      scores: { confidence: 5, clarity: 5, ownership: 5 },
      created_at: daysAgo(14)
    }
  ],

  // DAVID PARK
  'brian@brianfretwell.com': [
    {
      goal_challenge: "Get plant manager and floor supervisors aligned",
      timeframe: 'this_week',
      intensity: 'balanced',
      responses: {
        what_happened: "Mike negotiated with the parts supplier on a rush order. Usually I'd do that. He handled it fine.",
        how_did_you_do_it: "When the call came, I walked it to Mike's office instead of picking up. Said 'This is yours.'",
        what_made_it_work: "Not giving myself a chance to step in. Making the handoff physical.",
        what_did_you_feel: "Nervous. Then proud. Kid's got more in him than I gave him credit for."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Pride in Mike's growth", quote: "Kid's got more in him than I gave him credit for" },
        influence: { present: true, signal: "Physical handoff of responsibility", quote: "Making the handoff physical" },
        resilience: { present: true, signal: "Tolerating nervousness", quote: "Nervous. Then proud." },
        ethics: { present: false },
        strengths: { present: true, signal: "Knowing how to develop people" }
      },
      proof_line: "Handed the supplier call to Mike instead of taking it myself. He handled it fine.",
      validation_signal: 'developing',
      pattern: {
        whatWorked: "Physical handoff - walking problem to Mike's office",
        whyItWorked: "Didn't give myself chance to step in",
        howToRepeat: "When something lands on my desk, physically walk it to Mike before I can solve it."
      },
      scores: { confidence: 4, clarity: 4, ownership: 4 },
      created_at: daysAgo(7)
    },
    {
      goal_challenge: "Get plant manager and floor supervisors aligned",
      timeframe: 'this_week',
      intensity: 'deeper',
      responses: {
        what_happened: "Rosa publicly backed Mike in a tense floor meeting. A supervisor challenged Mike's call. Rosa said 'Mike's right, we're doing it his way.'",
        how_did_you_do_it: "Prepped Rosa beforehand. Told her Mike needed visible support and she was the one the floor respects.",
        what_made_it_work: "Knowing that Rosa's endorsement would carry more weight than mine. Using my relationship with her to build Mike's authority.",
        what_did_you_feel: "Like watching something I built start to work without me. Good tired."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Satisfaction in succession working", quote: "Good tired" },
        influence: { present: true, signal: "Orchestrated support through relationships", quote: "Using my relationship with her" },
        resilience: { present: true, signal: "Letting go of being central", quote: "Work without me" },
        ethics: { present: true, signal: "Developing the next generation", quote: "Something I built" },
        strengths: { present: true, signal: "Reading people and politics", quote: "Rosa's endorsement would carry more weight" }
      },
      proof_line: "Prepped Rosa to back Mike publicly. She did. The floor saw Mike's authority validated by someone they respect.",
      validation_signal: 'grounded',
      pattern: {
        whatWorked: "Using existing relationships to build new leader's credibility",
        whyItWorked: "Rosa's endorsement meant more than mine to the floor",
        howToRepeat: "Identify who the team respects. Prep them to publicly support Mike. Stay out of it."
      },
      scores: { confidence: 5, clarity: 5, ownership: 5 },
      created_at: daysAgo(14)
    }
  ],

  // ELENA VASQUEZ
  'bfretwell7@hotmail.com': [
    {
      goal_challenge: "Build a leadership team that can run the company without me",
      timeframe: 'this_week',
      intensity: 'balanced',
      responses: {
        what_happened: "Board prep meeting happened without me. Priya ran it. Marcus said the deck was better than ones I'd done.",
        how_did_you_do_it: "Scheduled a conflict on purpose. Told Priya she owned it. Resisted every urge to 'just check in.'",
        what_made_it_work: "Trusting that Priya knows the business. And that struggling without me would teach her faster than my oversight.",
        what_did_you_feel: "FOMO. Then relief when Marcus said it went well. Maybe I'm not as essential as I think."
      },
      fires_extracted: {
        feelings: { present: true, signal: "FOMO transforming to relief", quote: "Maybe I'm not as essential as I think" },
        influence: { present: true, signal: "Designed own absence", quote: "Scheduled a conflict on purpose" },
        resilience: { present: true, signal: "Resisting urge to check in", quote: "Resisted every urge" },
        ethics: { present: true, signal: "Company growth over founder ego" },
        strengths: { present: true, signal: "Hiring well - Priya delivered" }
      },
      proof_line: "Skipped board prep on purpose. Priya ran it. Marcus said the deck was better than mine.",
      validation_signal: 'developing',
      pattern: {
        whatWorked: "Scheduling a conflict to force absence",
        whyItWorked: "Removed the option to hover or 'help'",
        howToRepeat: "Find meetings I think I need to be in. Schedule conflicts. Let team own it fully."
      },
      scores: { confidence: 4, clarity: 4, ownership: 4 },
      created_at: daysAgo(7)
    },
    {
      goal_challenge: "Build a leadership team that can run the company without me",
      timeframe: 'this_week',
      intensity: 'deeper',
      responses: {
        what_happened: "Took a full Saturday off. Phone in drawer. Family day. Company still existed on Sunday.",
        how_did_you_do_it: "Told Coach Reyes I would do it. Told my husband to hide my phone if I asked for it. Created accountability.",
        what_made_it_work: "External accountability. I can't trust myself yet. But I can trust people who'll hold me to it.",
        what_did_you_feel: "Anxious for the first hour. Then... peaceful? I forgot what a day without Slack feels like."
      },
      fires_extracted: {
        feelings: { present: true, signal: "Peace rediscovered", quote: "I forgot what a day without Slack feels like" },
        influence: { present: true, signal: "Created support system for change", quote: "External accountability" },
        resilience: { present: true, signal: "Pushing through anxiety", quote: "Anxious for the first hour" },
        ethics: { present: true, signal: "Family and self-care as values" },
        strengths: { present: true, signal: "Knowing how to design systems for behavior change" }
      },
      proof_line: "Full Saturday offline. Phone in drawer. Anxious, then peaceful. Company still existed.",
      validation_signal: 'grounded',
      pattern: {
        whatWorked: "External accountability - coach and spouse holding me to it",
        whyItWorked: "Can't trust myself yet, but can trust support system",
        howToRepeat: "Declare intention to coach. Give phone to someone. Push through first hour of anxiety."
      },
      scores: { confidence: 5, clarity: 4, ownership: 5 },
      created_at: daysAgo(14)
    }
  ]
}

// ============================================================================
// INSERT FUNCTIONS
// ============================================================================

async function getPredictionId(email) {
  const { data } = await supabase
    .from('predictions')
    .select('id')
    .eq('client_email', email)
    .single()
  return data?.id
}

async function cleanExistingData(email) {
  await supabase.from('priorities').delete().eq('client_email', email)
  await supabase.from('validations').delete().eq('client_email', email)
}

async function insertPriorityEntries(email, entries, predictionId) {
  let count = 0
  for (const entry of entries) {
    const { error } = await supabase
      .from('priorities')
      .insert({
        client_email: email,
        type: 'self',
        prediction_id: predictionId,
        timeframe: entry.timeframe,
        intensity: entry.intensity,
        responses: entry.responses,
        fires_extracted: entry.fires_extracted,
        integrity_line: entry.integrity_line,
        ownership_signal: entry.ownership_signal,
        clarity_signal: entry.clarity_signal,
        created_at: entry.created_at
      })

    if (error) {
      console.log(`    Error: ${error.message}`)
    } else {
      count++
    }
  }
  return count
}

async function insertProofEntries(email, entries, predictionId) {
  let count = 0
  for (const entry of entries) {
    const { error } = await supabase
      .from('validations')
      .insert({
        client_email: email,
        mode: 'self',
        prediction_id: predictionId,
        goal_challenge: entry.goal_challenge,
        timeframe: entry.timeframe,
        intensity: entry.intensity,
        responses: entry.responses,
        fires_extracted: entry.fires_extracted,
        proof_line: entry.proof_line,
        validation_signal: entry.validation_signal,
        pattern: entry.pattern,
        scores: entry.scores,
        created_at: entry.created_at
      })

    if (error) {
      console.log(`    Error: ${error.message}`)
    } else {
      count++
    }
  }
  return count
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const cleanFirst = process.argv.includes('--clean-first')

  console.log('='.repeat(60))
  console.log('Insert Priority & Proof Data for Test Personas')
  console.log('='.repeat(60))

  const emails = Object.keys(PRIORITY_ENTRIES)
  let totalPriority = 0
  let totalProof = 0

  for (const email of emails) {
    console.log(`\n[${email}]`)

    // Get prediction ID
    const predictionId = await getPredictionId(email)
    if (!predictionId) {
      console.log('  No prediction found - skipping')
      continue
    }
    console.log(`  Prediction: ${predictionId}`)

    // Clean if requested
    if (cleanFirst) {
      await cleanExistingData(email)
      console.log('  Cleaned existing data')
    }

    // Insert Priority entries
    const priorityCount = await insertPriorityEntries(
      email,
      PRIORITY_ENTRIES[email],
      predictionId
    )
    console.log(`  Priority entries: ${priorityCount}`)
    totalPriority += priorityCount

    // Insert Proof entries
    const proofCount = await insertProofEntries(
      email,
      PROOF_ENTRIES[email],
      predictionId
    )
    console.log(`  Proof entries: ${proofCount}`)
    totalProof += proofCount
  }

  console.log('\n' + '='.repeat(60))
  console.log(`TOTAL: ${totalPriority} Priority + ${totalProof} Proof = ${totalPriority + totalProof} entries`)
  console.log('='.repeat(60))
}

main().catch(console.error)
