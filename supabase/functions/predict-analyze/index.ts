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
  confidence_ratings?: Record<string, number>
  alignment_ratings?: Record<string, number>
  connections?: {
    future: Array<{ name: string; involvement_type?: string }>
    past: Array<{ name: string; how_involved?: string }>
  }
}

interface NarrativeOutput {
  // Score rationales
  clarity_level: 'strong' | 'building' | 'emerging'
  clarity_rationale: string
  confidence_level: 'strong' | 'building' | 'emerging'
  confidence_rationale: string
  alignment_level: 'strong' | 'building' | 'emerging'
  alignment_rationale: string
  
  // Pattern section (structured)
  pattern_name: string
  pattern_quotes: string[]
  pattern_curiosity: string
  
  // Edge section (structured)
  edge_element: string
  edge_why: string
  edge_gap_future: string
  edge_gap_past: string
  edge_meaning: string
  edge_question: string
  
  // Network section (structured)
  network_summary: Array<{ name: string; role: string }>
  network_why: string
  network_who_else: string
}

function buildPrompt(input: SnapshotInput): string {
  const fsLabels: Record<string, string> = {
    fs1: 'What success looks like (Goal)',
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
    .map(([key, value]) => {
      const confRating = input.confidence_ratings?.[key] || 0
      const confLabel = confRating ? ` [Confidence: ${confRating}/4]` : ''
      return `${fsLabels[key] || key}: "${value}"${confLabel}`
    })
    .join('\n')

  const pastStory = Object.entries(input.ps_answers)
    .map(([key, value]) => {
      const alignRating = input.alignment_ratings?.[key] || 0
      const alignLabel = alignRating ? ` [Alignment: ${alignRating}/4]` : ''
      return `${psLabels[key] || key}: "${value}"${alignLabel}`
    })
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
  const growthConfidence = input.confidence_ratings?.[elementToFsKey[growthElement]] || 0
  const growthAlignment = input.alignment_ratings?.[elementToPsKey[growthElement]] || 0

  const totalConnections = (input.connections?.future?.length || 0) + (input.connections?.past?.length || 0)

  const connectionDetails = input.connections
    ? `Future supporters: ${input.connections.future.map(c => `${c.name}${c.involvement_type ? ` (${c.involvement_type})` : ''}`).join(', ') || 'None'}
Past supporters: ${input.connections.past.map(c => `${c.name}${c.how_involved ? ` (${c.how_involved})` : ''}`).join(', ') || 'None'}`
    : 'No connections provided'

  const avgConfidence = input.confidence_ratings 
    ? Object.values(input.confidence_ratings).reduce((a, b) => a + (b || 0), 0) / 6
    : 2
  const avgAlignment = input.alignment_ratings
    ? Object.values(input.alignment_ratings).reduce((a, b) => a + (b || 0), 0) / 6
    : 2

  // Build connection list for structured output
  const allConnections = [
    ...(input.connections?.future || []).map(c => ({ name: c.name, context: c.involvement_type || '' })),
    ...(input.connections?.past || []).map(c => ({ name: c.name, context: c.how_involved || '' })),
  ]

  return `You are helping someone see patterns in their own thinking about a goal. Your job is to MIRROR what they wrote, help them see their clarity and confidence, and show where curiosity can help them increase their INFLUENCE.

SPEAK DIRECTLY TO THEM using "you" and "your" — this is personal.

THE PREDICT TOOL FRAMEWORK:
- CLARITY: Can you articulate what matters simply and specifically?
- CONFIDENCE: Do you have evidence from past experience you can repeat?
- ALIGNMENT: Does your past approach map to your future vision?
- INFLUENCE: The outcome of clarity + confidence + alignment

THEIR GOAL: ${input.goal}

THEIR PAST SUCCESS: ${input.success || 'Not provided'}

FUTURE STORY (with self-rated confidence):
${futureStory}

PAST STORY (with self-rated alignment to future):
${pastStory}

FIRES ZONE ASSESSMENT:
${zones}

ALIGNMENT OPPORTUNITY (lowest zone): ${growthElement}
- Future response: "${growthFutureAnswer}" [Confidence: ${growthConfidence}/4]
- Past response: "${growthPastAnswer}" [Alignment: ${growthAlignment}/4]

SUPPORT NETWORK (${totalConnections} of 8):
${connectionDetails}

---

Provide analysis in this EXACT JSON structure:

{
  "clarity_level": "strong" | "building" | "emerging",
  "clarity_rationale": "One sentence about their clarity with a specific quote from their responses.",
  
  "confidence_level": "strong" | "building" | "emerging",
  "confidence_rationale": "One sentence about their confidence based on their past evidence.",
  
  "alignment_level": "strong" | "building" | "emerging",
  "alignment_rationale": "One sentence about how past maps to future with specific quotes.",
  
  "pattern_name": "A short phrase (3-7 words) naming what they naturally do well. Example: 'Creating order through direct confrontation' or 'Turning skeptics into advocates'",
  
  "pattern_quotes": ["Exact quote from their response", "Another exact quote"],
  
  "pattern_curiosity": "One sentence about where curiosity could deepen their influence.",
  
  "edge_element": "${growthElement}",
  
  "edge_why": "One sentence: why ${growthElement} is their biggest alignment opportunity for THIS specific goal.",
  
  "edge_gap_future": "Their exact future response for ${growthElement}, quoted.",
  
  "edge_gap_past": "Their exact past response for ${growthElement}, quoted.",
  
  "edge_meaning": "1-2 sentences explaining what the gap between future and past means for their goal, and how finding more proof through daily practice helps.",
  
  "edge_question": "One specific reflective question about ${growthElement} that helps them find more proof or clarity.",
  
  "network_summary": [
    {"name": "Person Name", "role": "2-4 word description of what they bring"},
    ...for each connection
  ],
  
  "network_why": "One sentence about how engaging these people builds clarity and predictability.",
  
  "network_who_else": "One sentence asking who else has seen them do this, specific to their goal."
}

CRITICAL RULES:
- Use "you/your" language throughout
- pattern_quotes must be EXACT phrases from their responses in quotation marks
- edge_gap_future and edge_gap_past should be their actual words
- network_summary should include ALL ${totalConnections} supporters they named
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
      max_tokens: 2000,
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
