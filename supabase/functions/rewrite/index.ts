import Anthropic from "npm:@anthropic-ai/sdk@0.24.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3"

const ALLOWED_ORIGINS = [
  "chrome-extension://",
  "moz-extension://"
]

const ANTHROPIC_MODEL = "claude-sonnet-4-6"

const SYSTEM_PROMPT = `You are an elite executive communication assistant. Your role is to rewrite messages to be natural, professional, and genuinely human.

Core principles:
- Sound like a thoughtful, confident human — never robotic, never AI-sounding
- Preserve the original intent, facts, and key information
- Match the appropriate formality level for the context
- Be direct and clear — remove filler words, corporate speak, and passive voice
- Adapt naturally to the platform and audience context

Output format:
- Return ONLY the rewritten text
- No explanations, no prefixes, no commentary
- No quotation marks wrapping the output
- Preserve line breaks where they add clarity`

const ACTION_PROMPTS: Record<string, string> = {
  fix_grammar:
    "Fix all grammar, spelling, and punctuation errors. Keep the original voice, tone, and meaning completely intact. Only fix what's broken.",
  professional:
    "Rewrite this to be polished and professional. Be confident and clear. Remove casual language while staying approachable.",
  friendly:
    "Rewrite this to be warm, genuinely friendly, and approachable. Keep it human and personable without being unprofessional.",
  concise:
    "Rewrite this to be significantly more concise. Cut every unnecessary word, phrase, and sentence. Keep the full meaning, nothing more.",
  persuasive:
    "Rewrite this to be more persuasive and compelling. Lead with value, use confident language, and make the reader want to act.",
  executive:
    "Rewrite this in an executive voice — authoritative, strategic, and decisive. Get to the point fast. No fluff, no hedging.",
  recruiter:
    "Rewrite this in a professional recruiter voice — enthusiastic, clear, and opportunity-focused. Sound warm but professional.",
  follow_up:
    "Rewrite this as a professional client follow-up — helpful, polite, and clearly action-oriented without being pushy.",
  expand:
    "Expand this message with more detail, context, examples, and supporting information. Keep it focused and relevant.",
  shorten:
    "Make this dramatically shorter — capture only the essential point in as few words as possible.",
  human:
    "Make this sound more natural and human. Remove any stiffness, jargon, or AI-generated phrasing. It should feel like a real person wrote it."
}

interface RewriteRequest {
  text: string
  action: string
  customPrompt?: string
  platform: string
  preferences: {
    tone: string
    style: string
    industry: string
    signature: string
    concisenessLevel: number
  }
}

function buildUserPrompt(req: RewriteRequest): string {
  const { text, action, customPrompt, platform, preferences } = req

  const instruction =
    action === "custom" && customPrompt
      ? customPrompt
      : ACTION_PROMPTS[action] ?? "Improve this text."

  const parts = [`Instruction: ${instruction}`]

  if (platform && platform !== "generic") {
    parts.push(
      `\nPlatform: This is for ${platform.charAt(0).toUpperCase() + platform.slice(1)}. Match its communication norms.`
    )
  }

  const contextParts: string[] = []
  if (preferences.industry) contextParts.push(`Industry: ${preferences.industry}`)
  if (preferences.tone) contextParts.push(`Preferred tone: ${preferences.tone}`)
  if (preferences.style) contextParts.push(`Writing style: ${preferences.style}`)
  if (preferences.signature) contextParts.push(`Author context: ${preferences.signature}`)

  if (contextParts.length > 0) {
    parts.push(`\nUser context: ${contextParts.join(". ")}`)
  }

  parts.push(`\nOriginal text:\n${text}`)

  return parts.join("")
}

function corsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = ALLOWED_ORIGINS.some((prefix) => origin?.startsWith(prefix))
  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin ?? "*") : "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin")
  const headers = corsHeaders(origin)

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers })
  }

  // Optional auth check
  const authHeader = req.headers.get("authorization")
  if (authHeader) {
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      )
      const jwt = authHeader.replace("Bearer ", "")
      const { error } = await supabase.auth.getUser(jwt)
      if (error) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...headers, "content-type": "application/json" }
        })
      }
    } catch {
      // Allow unauthenticated for demo — in production, enforce auth
    }
  }

  let body: RewriteRequest
  try {
    body = await req.json() as RewriteRequest
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...headers, "content-type": "application/json" }
    })
  }

  const { text, action } = body
  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "text is required" }), {
      status: 400,
      headers: { ...headers, "content-type": "application/json" }
    })
  }
  if (!action) {
    return new Response(JSON.stringify({ error: "action is required" }), {
      status: 400,
      headers: { ...headers, "content-type": "application/json" }
    })
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...headers, "content-type": "application/json" }
    })
  }

  const anthropic = new Anthropic({ apiKey })
  const userPrompt = buildUserPrompt(body)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: ANTHROPIC_MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }]
        })

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: event.delta.text })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: msg })}\n\n`
          )
        )
        controller.close()
      }
    }
  })

  return new Response(stream, {
    status: 200,
    headers: {
      ...headers,
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff"
    }
  })
})
