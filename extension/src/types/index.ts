export type RewriteAction =
  | "fix_grammar"
  | "professional"
  | "friendly"
  | "concise"
  | "persuasive"
  | "executive"
  | "recruiter"
  | "follow_up"
  | "expand"
  | "shorten"
  | "human"
  | "custom"

export type Platform = "slack" | "gmail" | "linkedin" | "notion" | "generic"

export type Theme = "light" | "dark" | "system"

export type TonePreference = "professional" | "friendly" | "casual" | "direct"

export type StylePreference = "concise" | "detailed" | "balanced"

export interface ActionConfig {
  id: RewriteAction
  label: string
  emoji: string
  description: string
  category: "fix" | "tone" | "length" | "custom"
}

export interface UserPreferences {
  tone: TonePreference
  style: StylePreference
  industry: string
  signature: string
  concisenessLevel: 1 | 2 | 3 | 4 | 5
  theme: Theme
}

export interface RewriteRequest {
  text: string
  action: RewriteAction
  customPrompt?: string
  platform: Platform
  preferences: UserPreferences
}

export interface RewriteResult {
  original: string
  rewritten: string
  action: RewriteAction
  platform: Platform
  timestamp: number
}

export interface SelectionRect {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface AssistantState {
  isOpen: boolean
  isLoading: boolean
  selectedText: string
  platform: Platform
  selectionRect: SelectionRect | null
  result: string
  error: string | null
  history: RewriteResult[]
  activeAction: RewriteAction | null
  customPrompt: string
  streamingText: string
}

export interface SettingsState {
  preferences: UserPreferences
  isConfigured: boolean
}

// Supabase DB row types
export interface DbUser {
  id: string
  email: string
  created_at: string
}

export interface DbRewrite {
  id: string
  user_id: string
  original_text: string
  rewritten_text: string
  action: RewriteAction
  platform: Platform
  created_at: string
}

export interface DbPromptTemplate {
  id: string
  user_id: string
  name: string
  prompt: string
  is_default: boolean
  created_at: string
}

export interface DbUserPreferences {
  id: string
  user_id: string
  tone: TonePreference
  style: StylePreference
  industry: string
  signature: string
  conciseness_level: number
  theme: Theme
  updated_at: string
}

export interface DbUsageTracking {
  id: string
  user_id: string
  action: RewriteAction
  platform: Platform
  character_count: number
  created_at: string
}
