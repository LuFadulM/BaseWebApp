import { useEffect, useRef } from "react"
import { cn } from "~utils/cn"
import type { SelectionRect } from "~types"

interface FloatingTriggerProps {
  rect: SelectionRect
  onClick: () => void
  visible: boolean
}

const BUTTON_HEIGHT = 32
const OFFSET = 8

export function FloatingTrigger({ rect, onClick, visible }: FloatingTriggerProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const top = rect.top - BUTTON_HEIGHT - OFFSET + window.scrollY
  const left = rect.left + rect.width / 2 + window.scrollX

  useEffect(() => {
    if (visible) {
      ref.current?.focus()
    }
  }, [visible])

  if (!visible) return null

  return (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
        zIndex: 2147483646
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "bg-zinc-900 dark:bg-zinc-100",
        "text-white dark:text-zinc-900",
        "text-xs font-semibold",
        "shadow-glass border border-zinc-700 dark:border-zinc-300",
        "hover:bg-brand-600 dark:hover:bg-brand-500",
        "transition-all duration-150",
        "animate-fade-in",
        "focus:outline-none focus:ring-2 focus:ring-brand-400"
      )}
      aria-label="Open AI Writing Assistant">
      <span>✨</span>
      <span>AI Rewrite</span>
    </button>
  )
}
