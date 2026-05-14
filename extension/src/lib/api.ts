import { supabase } from "./supabase"
import type {
  RewriteAction,
  Platform,
  UserPreferences,
  DbRewrite,
  DbUserPreferences,
  DbPromptTemplate
} from "~types"

const FUNCTIONS_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL + "/functions/v1"

export interface RewritePayload {
  text: string
  action: RewriteAction
  customPrompt?: string
  platform: Platform
  preferences: UserPreferences
}

export async function rewriteText(
  payload: RewritePayload,
  onChunk: (chunk: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void
): Promise<void> {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`
  }

  let response: Response
  try {
    response = await fetch(`${FUNCTIONS_URL}/rewrite`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    })
  } catch {
    onError("Network error. Please check your connection.")
    return
  }

  if (!response.ok) {
    const body = await response.text()
    onError(body || `Request failed with status ${response.status}`)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    onError("Streaming not supported by this browser.")
    return
  }

  const decoder = new TextDecoder()
  let fullText = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      // Parse SSE lines
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim()
          if (data === "[DONE]") continue
          try {
            const parsed = JSON.parse(data) as { text?: string }
            if (parsed.text) {
              fullText += parsed.text
              onChunk(parsed.text)
            }
          } catch {
            // Partial chunk — skip
          }
        }
      }
    }
    onDone(fullText)
  } catch (err) {
    onError("Stream interrupted unexpectedly.")
  } finally {
    reader.releaseLock()
  }
}

export async function saveRewrite(
  data: Omit<DbRewrite, "id" | "created_at">
): Promise<void> {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("rewrites").insert({ ...data, user_id: user.id })
}

export async function trackUsage(
  action: RewriteAction,
  platform: Platform,
  characterCount: number
): Promise<void> {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("usage_tracking").insert({
    user_id: user.id,
    action,
    platform,
    character_count: characterCount
  })
}

export async function getRewriteHistory(
  limit = 20
): Promise<DbRewrite[]> {
  const { data } = await supabase
    .from("rewrites")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getUserPreferences(): Promise<DbUserPreferences | null> {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  return data
}

export async function upsertUserPreferences(
  prefs: Omit<DbUserPreferences, "id" | "updated_at">
): Promise<void> {
  await supabase.from("user_preferences").upsert(prefs, {
    onConflict: "user_id"
  })
}

export async function getPromptTemplates(): Promise<DbPromptTemplate[]> {
  const { data } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function savePromptTemplate(
  name: string,
  prompt: string
): Promise<void> {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("prompt_templates").insert({
    user_id: user.id,
    name,
    prompt,
    is_default: false
  })
}
