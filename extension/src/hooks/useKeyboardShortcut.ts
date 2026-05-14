import { useEffect } from "react"

interface ShortcutOptions {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  onTrigger: () => void
  enabled?: boolean
}

export function useKeyboardShortcut({
  key,
  metaKey = false,
  ctrlKey = false,
  shiftKey = false,
  onTrigger,
  enabled = true
}: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const matchesMeta = metaKey ? e.metaKey : !e.metaKey
      const matchesCtrl = ctrlKey ? e.ctrlKey : !e.ctrlKey
      const matchesShift = shiftKey ? e.shiftKey : !e.shiftKey
      const matchesKey = e.key.toLowerCase() === key.toLowerCase()

      // Support Cmd+Shift+G on Mac, Ctrl+Shift+G on Windows
      const isModifier = e.metaKey || e.ctrlKey
      const isShiftG =
        isModifier && shiftKey
          ? e.shiftKey && matchesKey
          : matchesMeta && matchesCtrl && matchesShift && matchesKey

      if (
        key.toLowerCase() === "g" &&
        shiftKey &&
        (metaKey || ctrlKey)
      ) {
        if (isModifier && e.shiftKey && e.key.toLowerCase() === "g") {
          e.preventDefault()
          e.stopPropagation()
          onTrigger()
        }
        return
      }

      if (matchesMeta && matchesCtrl && matchesShift && matchesKey) {
        e.preventDefault()
        e.stopPropagation()
        onTrigger()
      }
    }

    window.addEventListener("keydown", handler, { capture: true })
    return () => window.removeEventListener("keydown", handler, { capture: true })
  }, [key, metaKey, ctrlKey, shiftKey, onTrigger, enabled])
}
