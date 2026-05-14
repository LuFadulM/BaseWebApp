import { useEffect } from "react"
import { useSettingsStore } from "~store/settings"

export function useTheme(root: HTMLElement | null | undefined) {
  const { preferences } = useSettingsStore()

  useEffect(() => {
    if (!root) return

    const apply = (dark: boolean) => {
      root.classList.toggle("dark", dark)
    }

    if (preferences.theme === "dark") {
      apply(true)
    } else if (preferences.theme === "light") {
      apply(false)
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mq.matches)
      const listener = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener("change", listener)
      return () => mq.removeEventListener("change", listener)
    }
  }, [preferences.theme, root])
}
