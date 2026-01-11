// Supabase Edge Function: predict-analyze
// Generates AI narrative insights using Claude API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SnapshotInput {
  goal: string
  success: string | null
  fs_answers: Record<string, string>
  ps_answers: Record<string, string>
  zone_scores: Record<string, string>
  growth_opportunity: string
  alignment_scores: Record<string, number>
  connections?: {
    future: Array<{ name: string; involvement_type?: string }>
    past: Array<{ name: string; how_involved?: string }>
  }
}

interface NarrativeOutput {
  clarity_level: 'strong' | 'building' | 'emerging'
  clarity_rationale: string
  confidence_level: 'strong' | 'building' | 'emerging'
  confidence_rationale: string
  alignment_level: 'strong' | 'building' | 'emerging'
  alignment_rationale: string
  
  pattern_insight: string
  
  edge_insight: string
  edge_question: string
  
  network_insight: string
}

function buildPrompt(input: SnapshotInput): string {
  const fsLabels: Record<string, string> = {
    fs1: 'What success looks like',
    fs2: 'How you will feel (Feelings)',
    fs3: 'Key action/influence (Influence)',
    fs4: 'Challenges and how to overcome (Resilience)',
    fs5: 'Values guiding you (Ethics)',
    fs6: 'Strengths you bring (Strengths)',
  }
  
  const psLabels: Record<string, string> = {
    ps1: 'Past similar success',
    ps2: 'How you felt (Feelings)',
    ps3: 'Key action that worked (Influence)',
    ps4: 'Obstacles you overcame (Resilience)',
    ps5: 'Values that guided you (Ethics)',
    ps6: 'Strengths you used (Strengths)',
  }

  const futureStory = Object.entries(input.fs_answers)
    .map(([key, value]) => `${fsLabels[key] || key}: "${value}"`)
    .join('\n')

  const pastStory = Object.entries(input.ps_answers)
    .map(([key, value]) => `${psLabels[key] || key}: "${value}"`)
    .join('\n')

  const zones = Object.entries(input.zone_scores)
    .map(([element, zone]) => `${element}: ${zone}`)
    .join('\n')

  const zoneValues: Record<string, number> = { Exploring: 1, Discovering: 2, Performing: 3, Owning: 4 }
  let growthElement = 'feelings'
  let lowestValue = 5
  for (const [element, zone] of Object.entries(input.zone_scores)) {
    const value = zoneValues[zone] || 1
    if (value < lowestValue) {
      lowestValue = value
      growthElement = element
    }
  }

  const elementToFsKey: Record<string, string> = {
    feelings: 'fs2', influence: 'fs3', resilience: 'fs4', ethics: 'fs5', strengths: 'fs6',
  }
  const elementToPsKey: Record<string, string> = {
    feelings: 'ps2', influence: 'ps3', resilience: 'ps4', ethics: 'ps5', strengths: 'ps6',
  }

  const growthFutureAnswer = input.fs_answers[elementToFsKey[growthElement]] || ''
  const growthPastAnswer = input.ps_answers[elementToPsKey[growthElement]] || ''

  const futureNames = input.connections?.future?.map(c => c.name) || []
  const pastNames = input.connections?.past?.map(c => c.name) || []
  const totalConnections = futureNames.length + pastNames.length

  const connectionDetails = input.connections
    ? `Future supporters: ${input.connections.future.map(c => `${c.name}${c.involvement_type ? ` (${c.involvement_type})` : ''}`).join(', ') || 'None'}
Past supporters: ${input.connections.past.map(c => `${c.name}${c.how_involved ? ` (${c.how_involved})` : ''}`).join(', ') || 'None'}`
    : 'No connections provided'

  return `You are helping someone see patterns in their own thinking about a goal. Your job is to MIRROR what they wrote, help them see their clarity and confidence, and show where curiosity can help them increase their INFLUENCE.

SPEAK DIRECTLY TO THEM using "you" and "your" — this is personal.

THE PREDICT TOOL FRAMEWORK:
- CLARITY: Can you articulate what matters simply and specifically?
- CONFIDENCE: Do you have evidence from past experience you can repeat?
- ALIGNMENT: Does your past approach map to your future vision?
- INFLUENCE: The outcome of clarity + confidence + alignment — the ability to predictably create outcomes with and through others

The goal is to help them see how their priorities (what matters) and proof (what they've done) create predictability — and ultimately influence.

THEIR GOAL: ${input.goal}

THEIR PAST SUCCESS: ${input.success || 'Not provided'}

FUTURE STORY:
${futureStory}

PAST STORY:
${pastStory}

FIRES ZONE ASSESSMENT (based on their alignment ratings):
${zones}

ALIGNMENT OPPORTUNITY (lowest alignment): ${growthElement}
- Future response for ${growthElement}: "${growthFutureAnswer}"
- Past response for ${growthElement}: "${growthPastAnswer}"

SUPPORT NETWORK (${totalConnections} of 8 possible):
${connectionDetails}

---

Provide analysis in this JSON format. Use "you/your" language throughout — speak directly to them:

{
  "clarity_level": "strong" | "building" | "emerging",
  "clarity_rationale": "One sentence explaining their clarity level, quoting their specific language that shows clarity (or lack of it)",
  
  "confidence_level": "strong" | "building" | "emerging", 
  "confidence_rationale": "One sentence explaining their confidence level, referencing whether they provided process/evidence they can repeat",
  
  "alignment_level": "strong" | "building" | "emerging",
  "alignment_rationale": "One sentence showing how their past approach does/doesn't map to future vision, with specific quotes",
  
  "pattern_insight": "2-4 sentences that: (1) Quote specific phrases showing where you HAVE clarity and confidence, (2) Name the pattern — what approach do you naturally take that works? (3) Show where curiosity about your own process could deepen your influence. Use their actual words in quotes. Focus on strengths first, then opportunity.",
  
  "edge_insight": "2-3 sentences about ${growthElement} as their biggest ALIGNMENT opportunity. Structure: (1) 'This is your biggest area for alignment.' (2) Quote their future and past responses to show the gap or disconnect. (3) Suggest how finding more proof here (through daily prioritize practice) can help them fully realize their influence. Be specific to what they wrote.",
  
  "edge_question": "One reflective question that helps them find more proof or clarity in ${growthElement}. Frame it as an opportunity to strengthen alignment, not fix a weakness.",
  
  "network_insight": "2-3 sentences about their ${totalConnections} supporters. (1) Name who they identified and acknowledge what these people offer. (2) Show how engaging these people helps clarity (they witness your priorities) and connection (shared understanding). (3) Note that growing to 8 supporters increases predictability — who else has seen you do this? Frame network as amplifier of influence."
}

CRITICAL:
- Use "you/your" not "they/their"
- Quote their actual words
- Frame everything as building toward INFLUENCE (the outcome of clarity + confidence + alignment)
- The edge is an ALIGNMENT OPPORTUNITY, not a weakness
- Show how daily practice (Priority Builder) and proof-gathering (Prove Tool) connect to influence
- Be warm, direct, specific — not corporate or generic

Respond ONLY with the JSON object.`
}

async function callClaudeAPI(prompt: string, apiKey: string): Promise<NarrativeOutput> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text

  if (!content) {
    throw new Error('No content in Claude response')
  }

  try {
    return JSON.parse(content) as NarrativeOutput
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as NarrativeOutput
    }
    throw new Error('Failed to parse Claude response as JSON')
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set')
    }

    const input: SnapshotInput = await req.json()

    if (!input.goal) throw new Error('Missing required field: goal')
    if (!input.fs_answers || Object.keys(input.fs_answers).length === 0) {
      throw new Error('Missing required field: fs_answers')
    }
    if (!input.zone_scores || Object.keys(input.zone_scores).length === 0) {
      throw new Error('Missing required field: zone_scores')
    }

    console.log('[predict-analyze] Processing request for goal:', input.goal.substring(0, 50))

    const prompt = buildPrompt(input)
    const narrative = await callClaudeAPI(prompt, apiKey)

    console.log('[predict-analyze] Successfully generated narrative')

    return new Response(
      JSON.stringify({ success: true, narrative }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[predict-analyze] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
