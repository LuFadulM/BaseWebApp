import { useEffect, useRef } from "react"
import { cn } from "~utils/cn"

interface StreamingTextProps {
  text: string
  isStreaming: boolean
  className?: string
}

export function StreamingText({ text, isStreaming, className }: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [text, isStreaming])

  return (
    <div
      ref={containerRef}
      className={cn(
        "max-h-48 overflow-y-auto rounded-lg p-3",
        "bg-zinc-50 dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-700",
        "text-sm leading-relaxed text-zinc-800 dark:text-zinc-200",
        "scrollbar-thin",
        className
      )}>
      <p className="whitespace-pre-wrap break-words">{text}</p>
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-500 align-text-bottom" />
      )}
    </div>
  )
}
