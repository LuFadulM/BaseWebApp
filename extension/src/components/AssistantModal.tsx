import { useEffect, useRef, useCallback } from "react"
import { X, Copy, RotateCcw, Check, Clock } from "lucide-react"
import { cn } from "~utils/cn"
import { Button } from "./ui/Button"
import { Badge } from "./ui/Badge"
import { Spinner } from "./ui/Spinner"
import { ActionGrid } from "./ActionGrid"
import { StreamingText } from "./StreamingText"
import { CustomPromptInput } from "./CustomPromptInput"
import { useAssistantStore } from "~store/assistant"
import { useSettingsStore } from "~store/settings"
import { useRewrite } from "~hooks/useRewrite"
import { PLATFORM_LABELS } from "~utils/platform"
import type { RewriteResult } from "~types"
import { useState } from "react"

interface AssistantModalProps {
  onInsert: (text: string) => void
  containerRef?: React.RefObject<HTMLElement>
}

type Tab = "rewrite" | "history"

export function AssistantModal({ onInsert, containerRef }: AssistantModalProps) {
  const {
    isOpen,
    isLoading,
    selectedText,
    platform,
    result,
    error,
    history,
    activeAction,
    customPrompt,
    streamingText,
    close,
    setCustomPrompt,
    addToHistory,
    clearHistory
  } = useAssistantStore()

  const { preferences } = useSettingsStore()
  const { rewrite } = useRewrite()

  const [tab, setTab] = useState<Tab>("rewrite")
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const displayText = streamingText || result
  const isStreaming = isLoading && streamingText.length > 0

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, close])

  // Click-outside to close
  useEffect(() => {
    if (!isOpen) return

    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        close()
      }
    }
    // Slight delay so the same click that opens doesn't immediately close
    const timer = setTimeout(() => {
      window.addEventListener("mousedown", handler)
    }, 100)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("mousedown", handler)
    }
  }, [isOpen, close])

  const handleCopy = useCallback(async () => {
    if (!displayText) return
    await navigator.clipboard.writeText(displayText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [displayText])

  const handleInsert = useCallback(() => {
    if (!displayText) return
    onInsert(displayText)
    close()
  }, [displayText, onInsert, close])

  const handleReuse = useCallback(
    (item: RewriteResult) => {
      onInsert(item.rewritten)
      close()
    },
    [onInsert, close]
  )

  const handleActionSelect = useCallback(
    (action: typeof activeAction) => {
      if (!action) return
      rewrite({
        text: selectedText,
        action,
        customPrompt: action === "custom" ? customPrompt : undefined,
        platform,
        preferences
      }).then((text) => {
        if (text) {
          addToHistory({
            original: selectedText,
            rewritten: text,
            action,
            platform,
            timestamp: Date.now()
          })
        }
      })
    },
    [selectedText, customPrompt, platform, preferences, rewrite, addToHistory]
  )

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className={cn(
        "flex flex-col rounded-2xl",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-700",
        "shadow-glass-lg",
        "w-[380px] max-h-[90vh]",
        "overflow-hidden",
        "animate-slide-up"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="AI Writing Assistant">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            AI Writing Assistant
          </span>
          <Badge variant="default">{PLATFORM_LABELS[platform]}</Badge>
        </div>
        <button
          onClick={close}
          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        {(["rewrite", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-xs font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}>
            {t === "history" && (
              <Clock className="mr-1 inline h-3 w-3" />
            )}
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === "rewrite" && (
          <div className="p-4 space-y-4">
            {/* Selected text preview */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Selected text
              </p>
              <p className="line-clamp-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {selectedText || "No text selected"}
              </p>
            </div>

            {/* Action grid */}
            <ActionGrid
              activeAction={activeAction}
              onSelect={(action) => {
                useAssistantStore.getState().setActiveAction(action)
                if (action !== "custom") {
                  handleActionSelect(action)
                }
              }}
              loading={isLoading}
            />

            {/* Custom prompt */}
            {activeAction === "custom" && (
              <CustomPromptInput
                value={customPrompt}
                onChange={setCustomPrompt}
                onSubmit={() => handleActionSelect("custom")}
                loading={isLoading}
              />
            )}

            {/* Custom prompt submit */}
            {activeAction === "custom" && customPrompt.trim() && !isLoading && (
              <Button
                onClick={() => handleActionSelect("custom")}
                className="w-full"
                size="md">
                Rewrite with custom prompt
              </Button>
            )}

            {/* Loading state */}
            {isLoading && !streamingText && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Spinner size="sm" />
                <span className="text-xs text-zinc-400">Rewriting...</span>
              </div>
            )}

            {/* Streaming / result */}
            {displayText && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Result
                </p>
                <StreamingText
                  text={displayText}
                  isStreaming={isStreaming}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInsert}
                    disabled={isStreaming}
                    className="flex-1">
                    Insert
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    disabled={isStreaming}
                    className="gap-1.5">
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      activeAction && handleActionSelect(activeAction)
                    }
                    disabled={isLoading}
                    title="Try again">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Rewrite history
            </div>
            {history.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-600">
                No history yet
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <HistoryItem
                    key={`${item.timestamp}-${idx}`}
                    item={item}
                    onReuse={handleReuse}
                  />
                ))}
                <button
                  onClick={clearHistory}
                  className="mt-2 w-full text-center text-xs text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors py-1">
                  Clear history
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
          ⌘⇧G to open · Esc to close
        </p>
      </div>
    </div>
  )
}

interface HistoryItemProps {
  item: RewriteResult
  onReuse: (item: RewriteResult) => void
}

function HistoryItem({ item, onReuse }: HistoryItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.rewritten)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-2.5 space-y-1.5">
      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
        {item.rewritten}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onReuse(item)}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">
          Insert
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <button
          onClick={handleCopy}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  )
}
