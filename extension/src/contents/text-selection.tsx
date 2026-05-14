import cssText from "data-text:~styles/global.css"
import type { PlasmoCSConfig, PlasmoGetShadowHostId, PlasmoGetStyle } from "plasmo"
import { useState, useCallback, useRef, useEffect } from "react"

import { FloatingTrigger } from "~components/FloatingTrigger"
import { AssistantModal } from "~components/AssistantModal"
import { useAssistantStore } from "~store/assistant"
import { useTextSelection } from "~hooks/useTextSelection"
import { useKeyboardShortcut } from "~hooks/useKeyboardShortcut"
import { useTheme } from "~hooks/useTheme"
import { detectPlatform, getEditableElement, replaceSelectedText } from "~utils/platform"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

export const getShadowHostId: PlasmoGetShadowHostId = () =>
  "plasmo-ai-writing-assistant"

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function TextSelectionOverlay() {
  const hostRef = useRef<HTMLElement | null>(null)
  const { isOpen, open, close } = useAssistantStore()
  const { selectedText, selectionRect, isVisible, clear } = useTextSelection()

  // Track the editable element that owns the selection so we can inject text
  const editableRef = useRef<HTMLElement | null>(null)

  // Position for the floating modal
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 })

  // Apply theme to shadow root
  useEffect(() => {
    const host = document.getElementById("plasmo-ai-writing-assistant")
    if (host?.shadowRoot) {
      hostRef.current = host.shadowRoot as unknown as HTMLElement
    }
  }, [])

  useTheme(hostRef.current)

  const handleTriggerClick = useCallback(() => {
    if (!selectionRect || !selectedText) return

    // Capture editable element before we open (selection may clear)
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      editableRef.current = getEditableElement(range.startContainer)
    }

    const platform = detectPlatform()

    // Compute modal position — try to place below the selection button
    const top = selectionRect.bottom + window.scrollY + 40
    const left = Math.min(
      selectionRect.left + window.scrollX,
      window.innerWidth - 400
    )
    setModalPos({ top: Math.max(top, 60), left: Math.max(left, 8) })

    open(selectedText, selectionRect, platform)
    clear()
  }, [selectedText, selectionRect, open, clear])

  // Cmd/Ctrl+Shift+G shortcut
  useKeyboardShortcut({
    key: "g",
    shiftKey: true,
    metaKey: true,
    ctrlKey: false,
    onTrigger: () => {
      if (isOpen) {
        close()
        return
      }
      const selection = window.getSelection()
      const text = selection?.toString().trim() ?? ""
      if (text.length >= 3 && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        editableRef.current = getEditableElement(range.startContainer)
        open(text, {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        }, detectPlatform())
        const top = rect.bottom + window.scrollY + 40
        const left = Math.min(rect.left + window.scrollX, window.innerWidth - 400)
        setModalPos({ top: Math.max(top, 60), left: Math.max(left, 8) })
      } else {
        // No selection — open with empty state near cursor or viewport center
        const top = window.scrollY + window.innerHeight / 2 - 200
        const left = window.innerWidth / 2 - 190
        open("", {
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          right: window.innerWidth / 2,
          bottom: window.innerHeight / 2,
          width: 0,
          height: 0
        }, detectPlatform())
        setModalPos({ top: Math.max(top, 60), left: Math.max(left, 8) })
      }
    }
  })

  const handleInsert = useCallback(
    (text: string) => {
      if (editableRef.current) {
        replaceSelectedText(editableRef.current, text)
      } else {
        // Fallback: copy to clipboard
        void navigator.clipboard.writeText(text)
      }
    },
    []
  )

  return (
    <>
      {/* Floating trigger button */}
      {isVisible && selectionRect && !isOpen && (
        <div
          style={{ position: "fixed", top: 0, left: 0, zIndex: 2147483646, pointerEvents: "none" }}>
          <div style={{ pointerEvents: "all" }}>
            <FloatingTrigger
              rect={selectionRect}
              onClick={handleTriggerClick}
              visible={isVisible}
            />
          </div>
        </div>
      )}

      {/* Assistant modal */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: `${modalPos.top}px`,
            left: `${modalPos.left}px`,
            zIndex: 2147483647
          }}>
          <AssistantModal onInsert={handleInsert} />
        </div>
      )}
    </>
  )
}
