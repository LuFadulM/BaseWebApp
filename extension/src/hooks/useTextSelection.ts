import { useState, useCallback, useEffect, useRef } from "react"
import type { SelectionRect } from "~types"

interface TextSelectionState {
  selectedText: string
  selectionRect: SelectionRect | null
  isVisible: boolean
}

const MIN_SELECTION_LENGTH = 3

export function useTextSelection() {
  const [state, setState] = useState<TextSelectionState>({
    selectedText: "",
    selectionRect: null,
    isVisible: false
  })

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    setState({ selectedText: "", selectionRect: null, isVisible: false })
  }, [])

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(clear, 200)
      return
    }

    const text = selection.toString().trim()
    if (text.length < MIN_SELECTION_LENGTH) {
      clear()
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (rect.width === 0 && rect.height === 0) {
      clear()
      return
    }

    if (hideTimer.current) clearTimeout(hideTimer.current)

    setState({
      selectedText: text,
      selectionRect: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      },
      isVisible: true
    })
  }, [clear])

  useEffect(() => {
    document.addEventListener("mouseup", handleSelectionChange)
    document.addEventListener("keyup", handleSelectionChange)

    return () => {
      document.removeEventListener("mouseup", handleSelectionChange)
      document.removeEventListener("keyup", handleSelectionChange)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [handleSelectionChange])

  return { ...state, clear }
}
