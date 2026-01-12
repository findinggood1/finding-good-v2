// Supabase Edge Function: priority-analyze
// Generates Priority Line, FIRES extraction, and reflection insight for Priority responses

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriorityInput {
  focus: string
  whatWentWell: string
  yourPart: string
  impact: string
}

interface FiresExtraction {
  element: 'feelings' | 'influence' | 'resilience' | 'ethics' | 'strengths'
  evidence: string
  strength: number
}

interface PriorityOutput {
  priorityLine: string
  firesElements: FiresExtraction[]
  reflectionInsight: string
  yourPattern: string
  patternQuotes: string[]
  validationSignal: 'emerging' | 'developing' | 'grounded'
}

function buildPrompt(input: PriorityInput): string {
  return `You are helping someone see the value in what they just shared. Your job is to MIRROR their experience back to them in a way that feels true and meaningful.

THE PRIORITY BUILDER CONTEXT:
Priority Builder is a daily 2-minute practice that builds evidence of how someone shows up. Users answer four questions:
1. What were you working on that mattered most today? (the focus)
2. What went well? (the situation)
3. What was your part? (their contribution/agency)
4. What impact did it have? (the meaning/effect)

Over time, these daily entries reveal patterns — the natural ways people create positive outcomes.

FIRES FRAMEWORK (extract these from their responses):
- Feelings: Emotional awareness, managing emotions, staying grounded
- Influence: Taking action, making an impact, leading or contributing
- Resilience: Overcoming challenges, persistence, adaptability
- Ethics: Acting with integrity, staying true to values, doing what's right
- Strengths: Using talents, skills, or natural abilities

THEIR RESPONSES:

What they were working on that mattered most:
"${input.focus}"

What went well:
"${input.whatWentWell}"

Their part in making it happen:
"${input.yourPart}"

The impact it had:
"${input.impact}"

---

Analyze their responses and provide output in this exact JSON format:

{
  "priorityLine": "A 1-sentence proof statement that captures the essence of what they did and why it mattered. Use their own words where possible. Start with 'I'. Example: 'I showed up fully for what mattered, even when it was hard, and it made a real difference.'",

  "yourPattern": "A short phrase (3-7 words) naming what they naturally did well. Example: 'Staying calm under pressure' or 'Turning friction into progress' or 'Showing up before you felt ready'",

  "patternQuotes": ["An exact short quote from their response that shows this pattern", "Another exact quote if relevant"],

  "firesElements": [
    {
      "element": "one of: feelings, influence, resilience, ethics, strengths",
      "evidence": "A brief phrase explaining how this element showed up, using their words",
      "strength": 1-5 rating of how strongly this element appeared
    }
  ],

  "reflectionInsight": "2-3 sentences that help them see the deeper meaning. Quote their actual words. Help them notice something they might not have seen about themselves. Don't give advice.",

  "validationSignal": "emerging | developing | grounded — based on how specific and clear their responses are. 'grounded' = rich detail with clear agency and impact. 'developing' = good content but could be more specific. 'emerging' = general or vague."
}

CRITICAL RULES:
- The priorityLine should feel like THEIR voice, not generic coaching speak
- yourPattern should be a memorable phrase they could repeat to themselves
- patternQuotes must be EXACT phrases from their responses (short, 3-10 words each)
- Only include 2-4 FIRES elements that are clearly present (don't force all 5)
- In reflectionInsight, quote their actual words with quotation marks
- Be warm but not sappy — authentic, not performative
- Help them SEE what they did, don't tell them what to do
- Ground everything in their specific focus area

Respond ONLY with the JSON object, no additional text.`
}

async function callClaudeAPI(prompt: string, apiKey: string): Promise<PriorityOutput> {
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
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
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

  // Parse the JSON response
  try {
    const parsed = JSON.parse(content)
    return parsed as PriorityOutput
  } catch {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PriorityOutput
    }
    throw new Error('Failed to parse Claude response as JSON')
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set')
    }

    const input: PriorityInput = await req.json()

    // Validate required fields
    if (!input.focus || input.focus.trim().length === 0) {
      throw new Error('Missing required field: focus')
    }
    if (!input.whatWentWell || input.whatWentWell.trim().length === 0) {
      throw new Error('Missing required field: whatWentWell')
    }
    if (!input.yourPart || input.yourPart.trim().length === 0) {
      throw new Error('Missing required field: yourPart')
    }
    if (!input.impact || input.impact.trim().length === 0) {
      throw new Error('Missing required field: impact')
    }

    console.log('[priority-analyze] Processing request')

    const prompt = buildPrompt(input)
    const result = await callClaudeAPI(prompt, apiKey)

    console.log('[priority-analyze] Successfully generated analysis')

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('[priority-analyze] Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
