import type { RewriteAction, Platform, UserPreferences, ActionConfig } from "~types"

export const SYSTEM_PROMPT = `You are an elite executive communication assistant. Your role is to rewrite messages to be natural, professional, and genuinely human.

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

export const ACTION_PROMPTS: Record<RewriteAction, string> = {
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
    "Make this sound more natural and human. Remove any stiffness, jargon, or AI-generated phrasing. It should feel like a real person wrote it.",
  custom: ""
}

export const ACTION_CONFIGS: ActionConfig[] = [
  {
    id: "fix_grammar",
    label: "Fix Grammar",
    emoji: "✏️",
    description: "Fix spelling & grammar",
    category: "fix"
  },
  {
    id: "human",
    label: "More Human",
    emoji: "🧑",
    description: "Remove AI-sounding language",
    category: "fix"
  },
  {
    id: "professional",
    label: "Professional",
    emoji: "💼",
    description: "Polished & confident",
    category: "tone"
  },
  {
    id: "friendly",
    label: "Friendly",
    emoji: "😊",
    description: "Warm & approachable",
    category: "tone"
  },
  {
    id: "executive",
    label: "Executive",
    emoji: "🎯",
    description: "Authoritative & direct",
    category: "tone"
  },
  {
    id: "recruiter",
    label: "Recruiter",
    emoji: "🤝",
    description: "Enthusiastic & clear",
    category: "tone"
  },
  {
    id: "persuasive",
    label: "Persuasive",
    emoji: "⚡",
    description: "Compelling & action-driving",
    category: "tone"
  },
  {
    id: "follow_up",
    label: "Follow-Up",
    emoji: "📨",
    description: "Client follow-up tone",
    category: "tone"
  },
  {
    id: "concise",
    label: "Concise",
    emoji: "✂️",
    description: "Cut the fluff",
    category: "length"
  },
  {
    id: "shorten",
    label: "Shorten",
    emoji: "📉",
    description: "Much shorter",
    category: "length"
  },
  {
    id: "expand",
    label: "Expand",
    emoji: "📈",
    description: "Add more detail",
    category: "length"
  },
  {
    id: "custom",
    label: "Custom",
    emoji: "✨",
    description: "Your own instruction",
    category: "custom"
  }
]

export function buildUserPrompt(
  text: string,
  action: RewriteAction,
  customPrompt: string | undefined,
  platform: Platform,
  preferences: UserPreferences
): string {
  const actionInstruction =
    action === "custom" && customPrompt
      ? customPrompt
      : ACTION_PROMPTS[action]

  const platformContext =
    platform !== "generic"
      ? `\nPlatform context: This message is for ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`
      : ""

  const prefContext = [
    preferences.industry && `Industry: ${preferences.industry}`,
    preferences.tone && `Preferred communication tone: ${preferences.tone}`,
    preferences.style && `Writing style: ${preferences.style}`
  ]
    .filter(Boolean)
    .join(". ")

  return [
    `Instruction: ${actionInstruction}`,
    platformContext,
    prefContext && `\nUser preferences: ${prefContext}`,
    `\nOriginal text:\n${text}`
  ]
    .filter(Boolean)
    .join("")
}
