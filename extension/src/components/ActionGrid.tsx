import { cn } from "~utils/cn"
import type { RewriteAction, ActionConfig } from "~types"
import { ACTION_CONFIGS } from "~utils/prompts"

interface ActionGridProps {
  activeAction: RewriteAction | null
  onSelect: (action: RewriteAction) => void
  loading: boolean
}

type Category = "fix" | "tone" | "length" | "custom"

const CATEGORY_LABELS: Record<Category, string> = {
  fix: "Fix",
  tone: "Tone",
  length: "Length",
  custom: "Custom"
}

export function ActionGrid({ activeAction, onSelect, loading }: ActionGridProps) {
  const categories: Category[] = ["fix", "tone", "length", "custom"]

  const grouped = categories.reduce(
    (acc, cat) => {
      acc[cat] = ACTION_CONFIGS.filter((a) => a.category === cat)
      return acc
    },
    {} as Record<Category, ActionConfig[]>
  )

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {CATEGORY_LABELS[cat]}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {grouped[cat]?.map((action) => (
              <ActionButton
                key={action.id}
                config={action}
                isActive={activeAction === action.id}
                onClick={() => onSelect(action.id)}
                disabled={loading}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface ActionButtonProps {
  config: ActionConfig
  isActive: boolean
  onClick: () => void
  disabled: boolean
}

function ActionButton({ config, isActive, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-100",
        "text-sm font-medium",
        "border",
        "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-40",
        isActive
          ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-300"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800"
      )}>
      <span className="text-base leading-none">{config.emoji}</span>
      <span className="leading-tight">
        <span className="block text-[13px] font-semibold">{config.label}</span>
        <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
          {config.description}
        </span>
      </span>
    </button>
  )
}
