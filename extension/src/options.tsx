import { useState } from "react"
import { Save, RotateCcw, Sparkles, Moon, Sun, Monitor } from "lucide-react"
import { useSettingsStore } from "~store/settings"
import { Button } from "~components/ui/Button"
import { cn } from "~utils/cn"
import type { TonePreference, StylePreference, Theme } from "~types"

import "~styles/global.css"

const TONES: { value: TonePreference; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Polished & confident" },
  { value: "friendly", label: "Friendly", desc: "Warm & approachable" },
  { value: "casual", label: "Casual", desc: "Relaxed & conversational" },
  { value: "direct", label: "Direct", desc: "Straight to the point" }
]

const STYLES: { value: StylePreference; label: string; desc: string }[] = [
  { value: "concise", label: "Concise", desc: "Short & punchy" },
  { value: "balanced", label: "Balanced", desc: "Clear & complete" },
  { value: "detailed", label: "Detailed", desc: "Thorough & comprehensive" }
]

const CONCISENESS_LABELS = [
  "Very concise",
  "Concise",
  "Balanced",
  "Detailed",
  "Very detailed"
]

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> }
]

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Sales & Marketing",
  "Legal",
  "Recruiting & HR",
  "Consulting",
  "Real Estate",
  "Education",
  "Other"
]

function Options() {
  const { preferences, setPreferences, resetPreferences } = useSettingsStore()
  const [saved, setSaved] = useState(false)
  const [localPrefs, setLocalPrefs] = useState({ ...preferences })

  const update = <K extends keyof typeof localPrefs>(
    key: K,
    value: (typeof localPrefs)[K]
  ) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    setPreferences(localPrefs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    resetPreferences()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10">
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              AI Writing Assistant
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure your preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <Section title="Appearance" description="Choose your preferred color scheme">
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => update("theme", t.value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all",
                    localPrefs.theme === t.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                  )}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Default tone */}
          <Section title="Default Tone" description="The tone applied to rewrites by default">
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => update("tone", t.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    localPrefs.tone === t.value
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                  )}>
                  <p className={cn(
                    "text-sm font-medium",
                    localPrefs.tone === t.value
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}>
                    {t.label}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Writing style */}
          <Section title="Writing Style" description="How thorough your rewrites should be">
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => update("style", s.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    localPrefs.style === s.value
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                  )}>
                  <p className={cn(
                    "text-sm font-medium",
                    localPrefs.style === s.value
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}>
                    {s.label}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Conciseness slider */}
          <Section
            title="Conciseness Level"
            description={`${CONCISENESS_LABELS[(localPrefs.concisenessLevel ?? 3) - 1]} — affects how tightly AI trims your text`}>
            <input
              type="range"
              min={1}
              max={5}
              value={localPrefs.concisenessLevel}
              onChange={(e) =>
                update("concisenessLevel", parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)
              }
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>Very concise</span>
              <span>Very detailed</span>
            </div>
          </Section>

          {/* Industry */}
          <Section title="Industry" description="Helps tailor language to your field">
            <select
              value={localPrefs.industry}
              onChange={(e) => update("industry", e.target.value)}
              className={cn(
                "w-full rounded-lg border border-zinc-200 dark:border-zinc-700",
                "bg-white dark:bg-zinc-800",
                "px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300",
                "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              )}>
              <option value="">Select industry (optional)</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind.toLowerCase()}>
                  {ind}
                </option>
              ))}
            </select>
          </Section>

          {/* Signature */}
          <Section
            title="Signature Context"
            description="Optionally describe your role for better context (e.g. 'VP of Sales at a B2B SaaS startup')">
            <textarea
              value={localPrefs.signature}
              onChange={(e) => update("signature", e.target.value)}
              placeholder="VP of Sales, early-stage SaaS startup, B2B enterprise focus"
              rows={2}
              className={cn(
                "w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700",
                "bg-white dark:bg-zinc-800",
                "px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
              )}
            />
          </Section>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to defaults
          </button>
          <Button onClick={handleSave} size="lg">
            {saved ? "Saved!" : (
              <>
                <Save className="h-4 w-4" />
                Save preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  description: string
  children: React.ReactNode
}

function Section({ title, description, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default Options
