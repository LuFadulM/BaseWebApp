import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserPreferences, Theme, SettingsState } from "~types"

const DEFAULT_PREFERENCES: UserPreferences = {
  tone: "professional",
  style: "balanced",
  industry: "",
  signature: "",
  concisenessLevel: 3,
  theme: "system"
}

interface SettingsStore extends SettingsState {
  setPreferences: (prefs: Partial<UserPreferences>) => void
  setTheme: (theme: Theme) => void
  resetPreferences: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      isConfigured: false,

      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
          isConfigured: true
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme }
        })),

      resetPreferences: () =>
        set({ preferences: DEFAULT_PREFERENCES, isConfigured: false })
    }),
    {
      name: "ai-assistant-settings"
    }
  )
)
