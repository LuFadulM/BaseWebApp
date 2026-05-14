import { cn } from "~utils/cn"

type BadgeVariant = "default" | "success" | "warning" | "error" | "info"

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
  success: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  warning: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  error: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  info: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}>
      {children}
    </span>
  )
}
