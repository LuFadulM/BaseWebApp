import { createClient } from "@supabase/supabase-js"
import type {
  DbRewrite,
  DbUserPreferences,
  DbPromptTemplate,
  DbUsageTracking
} from "~types"

const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file."
  )
}

export interface Database {
  public: {
    Tables: {
      rewrites: { Row: DbRewrite; Insert: Omit<DbRewrite, "id" | "created_at">; Update: Partial<DbRewrite> }
      user_preferences: { Row: DbUserPreferences; Insert: Omit<DbUserPreferences, "id" | "updated_at">; Update: Partial<DbUserPreferences> }
      prompt_templates: { Row: DbPromptTemplate; Insert: Omit<DbPromptTemplate, "id" | "created_at">; Update: Partial<DbPromptTemplate> }
      usage_tracking: { Row: DbUsageTracking; Insert: Omit<DbUsageTracking, "id" | "created_at">; Update: never }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "ai-assistant-auth"
  }
})
