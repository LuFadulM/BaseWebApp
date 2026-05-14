import type { Platform } from "~types"

export function detectPlatform(): Platform {
  const host = window.location.hostname

  if (host.includes("slack.com")) return "slack"
  if (host.includes("mail.google.com")) return "gmail"
  if (host.includes("linkedin.com")) return "linkedin"
  if (host.includes("notion.so") || host.includes("notion.site")) return "notion"
  return "generic"
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  slack: "Slack",
  gmail: "Gmail",
  linkedin: "LinkedIn",
  notion: "Notion",
  generic: "Web"
}

export const PLATFORM_HINTS: Record<Platform, string> = {
  slack: "Use concise, direct Slack-friendly formatting",
  gmail: "Professional email tone with clear subject/body structure",
  linkedin: "Professional networking tone, achievement-focused",
  notion: "Clear, structured documentation style",
  generic: "General writing improvement"
}

export function getEditableElement(
  node: Node | null
): HTMLElement | null {
  if (!node) return null

  let current: Node | null = node
  while (current) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase()
      if (
        tag === "textarea" ||
        tag === "input" ||
        current.isContentEditable
      ) {
        return current
      }
    }
    current = current.parentNode
  }
  return null
}

export function replaceSelectedText(
  element: HTMLElement,
  newText: string
): void {
  if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLInputElement
  ) {
    const start = element.selectionStart ?? 0
    const end = element.selectionEnd ?? 0
    const value = element.value
    element.value = value.slice(0, start) + newText + value.slice(end)
    element.selectionStart = start
    element.selectionEnd = start + newText.length
    element.dispatchEvent(new Event("input", { bubbles: true }))
    element.dispatchEvent(new Event("change", { bubbles: true }))
  } else if (element.isContentEditable) {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(newText))
      selection.collapseToEnd()
      element.dispatchEvent(new Event("input", { bubbles: true }))
    }
  }
}
