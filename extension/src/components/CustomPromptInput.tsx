import { useRef, useEffect } from "react"
import { cn } from "~utils/cn"

interface CustomPromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
}

export function CustomPromptInput({
  value,
  onChange,
  onSubmit,
  loading
}: CustomPromptInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Your instruction
      </label>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            if (value.trim() && !loading) onSubmit()
          }
        }}
        placeholder='e.g. "Make this more persuasive for a CFO audience"'
        rows={3}
        className={cn(
          "w-full resize-none rounded-lg px-3 py-2",
          "text-sm text-zinc-800 dark:text-zinc-200",
          "bg-white dark:bg-zinc-900",
          "border border-zinc-200 dark:border-zinc-700",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30",
          "transition-colors"
        )}
      />
      <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
        ⌘ Enter to submit
      </p>
    </div>
  )
}
