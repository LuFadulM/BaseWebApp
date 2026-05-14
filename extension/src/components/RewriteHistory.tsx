import { useState } from "react"
import { cn } from "~utils/cn"
import { Badge } from "./ui/Badge"
import type { RewriteResult } from "~types"
import { ACTION_CONFIGS } from "~utils/prompts"

interface RewriteHistoryProps {
  history: RewriteResult[]
  onReuse: (result: RewriteResult) => void
  onClear: () => void
}

export function RewriteHistory({ history, onReuse, onClear }: RewriteHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-600">
        No rewrites yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Recent
        </span>
        <button
          onClick={onClear}
          className="text-xs text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors">
          Clear all
        </button>
      </div>

      {history.map((item, idx) => {
        const key = `${item.timestamp}-${idx}`
        const isExpanded = expanded === key
        const actionConfig = ACTION_CONFIGS.find((a) => a.id === item.action)

        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border p-2.5 transition-all duration-150",
              "border-zinc-200 dark:border-zinc-700",
              "bg-white dark:bg-zinc-800/50"
            )}>
            <div className="flex items-start justify-between gap-2">
              <button
                className="flex-1 text-left"
                onClick={() => setExpanded(isExpanded ? null : key)}>
                <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {item.rewritten}
                </p>
              </button>
              <Badge variant="default">
                {actionConfig?.emoji} {actionConfig?.label}
              </Badge>
            </div>

            {isExpanded && (
              <div className="mt-2 space-y-2 border-t border-zinc-100 dark:border-zinc-700 pt-2">
                <div>
                  <p className="mb-0.5 text-[10px] text-zinc-400">Original</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {item.original}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] text-zinc-400">Rewritten</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    {item.rewritten}
                  </p>
                </div>
                <button
                  onClick={() => onReuse(item)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                  Use this →
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
