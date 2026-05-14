import { useState, useEffect } from "react"
import { ExternalLink, Settings, Clock, Sparkles, LogIn, LogOut } from "lucide-react"
import { supabase } from "~lib/supabase"
import { getRewriteHistory } from "~lib/api"
import { useSettingsStore } from "~store/settings"
import { Button } from "~components/ui/Button"
import { Badge } from "~components/ui/Badge"
import { ACTION_CONFIGS } from "~utils/prompts"
import type { DbRewrite } from "~types"
import type { User } from "@supabase/supabase-js"

import "~styles/global.css"

function Popup() {
  const [user, setUser] = useState<User | null>(null)
  const [history, setHistory] = useState<DbRewrite[]>([])
  const [loading, setLoading] = useState(true)
  const { preferences } = useSettingsStore()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const h = await getRewriteHistory(5)
          setHistory(h)
        }
        setLoading(false)
      }
    )
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: chrome.identity.getRedirectURL()
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setHistory([])
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="w-72 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-semibold">AI Writing Assistant</span>
        </div>
        <button
          onClick={openOptions}
          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950 dark:to-blue-950 p-3 border border-brand-100 dark:border-brand-900">
          <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-0.5">
            Active on this page
          </p>
          <p className="text-[11px] text-brand-500 dark:text-brand-400">
            Select text to rewrite · <kbd className="font-mono">⌘⇧G</kbd> to open
          </p>
        </div>

        {/* Auth */}
        {loading ? (
          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        ) : user ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2">
            <div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                {user.email}
              </p>
              <p className="text-[10px] text-zinc-400">Signed in</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button onClick={handleSignIn} className="w-full" variant="secondary" size="sm">
            <LogIn className="h-3.5 w-3.5" />
            Sign in to sync history
          </Button>
        )}

        {/* Quick actions */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Quick actions
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {ACTION_CONFIGS.slice(0, 6).map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                    if (tab?.id) {
                      chrome.tabs.sendMessage(tab.id, {
                        type: "QUICK_ACTION",
                        action: action.id
                      })
                    }
                  })
                  window.close()
                }}
                className="flex flex-col items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 text-center hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950 transition-colors">
                <span className="text-lg leading-none">{action.emoji}</span>
                <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="h-3 w-3 text-zinc-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Recent
              </p>
            </div>
            <div className="space-y-1.5">
              {history.map((item) => {
                const config = ACTION_CONFIGS.find((a) => a.id === item.action)
                return (
                  <div
                    key={item.id}
                    className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <Badge variant="default">
                        {config?.emoji} {config?.label}
                      </Badge>
                      <span className="text-[9px] text-zinc-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {item.rewritten_text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Settings summary */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-2.5 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Your settings
          </p>
          {[
            { label: "Tone", value: preferences.tone },
            { label: "Style", value: preferences.style },
            preferences.industry && { label: "Industry", value: preferences.industry }
          ]
            .filter(Boolean)
            .map((item) => (
              <div key={item!.label} className="flex justify-between">
                <span className="text-[11px] text-zinc-400">{item!.label}</span>
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                  {item!.value}
                </span>
              </div>
            ))}
          <button
            onClick={openOptions}
            className="mt-1 flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-600 transition-colors">
            <ExternalLink className="h-3 w-3" />
            Edit settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default Popup
