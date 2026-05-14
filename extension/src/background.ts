import { type PlasmoMessaging } from "@plasmohq/messaging"

// Background service worker

// Handle extension installation
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({ url: "options.html" })
  }
})

// Context menu for right-click rewrite
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ai-rewrite",
    title: "✨ AI Rewrite",
    contexts: ["selection"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ai-rewrite" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_ASSISTANT",
      text: info.selectionText ?? ""
    })
  }
})

// Keyboard shortcut from commands API (backup trigger)
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-assistant") {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_ASSISTANT" })
      }
    })
  }
})

export {}
