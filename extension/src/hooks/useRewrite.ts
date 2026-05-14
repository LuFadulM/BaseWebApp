import { useCallback } from "react"
import { rewriteText, saveRewrite, trackUsage } from "~lib/api"
import { useAssistantStore } from "~store/assistant"
import type { RewriteRequest } from "~types"

export function useRewrite() {
  const { setLoading, setResult, appendStreaming, clearStreaming, setError, setActiveAction } =
    useAssistantStore()

  const rewrite = useCallback(
    async (request: RewriteRequest): Promise<string | null> => {
      const { text, action, customPrompt, platform, preferences } = request

      if (!text.trim()) {
        setError("No text to rewrite.")
        return null
      }

      setLoading(true)
      setActiveAction(action)
      clearStreaming()
      setError(null)

      let fullText = ""

      await rewriteText(
        { text, action, customPrompt, platform, preferences },
        (chunk) => {
          appendStreaming(chunk)
        },
        (done) => {
          fullText = done
          setResult(done)
          // Fire-and-forget persistence
          void saveRewrite({
            user_id: "",
            original_text: text,
            rewritten_text: done,
            action,
            platform
          })
          void trackUsage(action, platform, text.length)
        },
        (err) => {
          setError(err)
        }
      )

      return fullText || null
    },
    [setLoading, setResult, appendStreaming, clearStreaming, setError, setActiveAction]
  )

  return { rewrite }
}
