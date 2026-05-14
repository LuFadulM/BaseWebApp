import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "~utils/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-brand-600 hover:bg-brand-700 text-white shadow-sm active:scale-95",
  secondary:
    "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750",
  ghost:
    "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-95"
}

const sizeStyles: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 rounded-md h-7",
  md: "text-sm px-3.5 py-2 rounded-lg h-9",
  lg: "text-sm px-4 py-2.5 rounded-lg h-10"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}>
        {loading && (
          <span className="inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        )}
        {!loading && children}
      </button>
    )
  }
)

Button.displayName = "Button"
