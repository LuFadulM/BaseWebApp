import { create } from "zustand"
import type {
  AssistantState,
  RewriteAction,
  RewriteResult,
  SelectionRect,
  Platform
} from "~types"

const MAX_HISTORY = 20

interface AssistantStore extends AssistantState {
  open: (text: string, rect: SelectionRect, platform: Platform) => void
  close: () => void
  setLoading: (loading: boolean) => void
  setResult: (text: string) => void
  appendStreaming: (chunk: string) => void
  clearStreaming: () => void
  setError: (error: string | null) => void
  setActiveAction: (action: RewriteAction | null) => void
  setCustomPrompt: (prompt: string) => void
  addToHistory: (result: RewriteResult) => void
  clearHistory: () => void
}

export const useAssistantStore = create<AssistantStore>()((set) => ({
  isOpen: false,
  isLoading: false,
  selectedText: "",
  platform: "generic",
  selectionRect: null,
  result: "",
  error: null,
  history: [],
  activeAction: null,
  customPrompt: "",
  streamingText: "",

  open: (text, rect, platform) =>
    set({
      isOpen: true,
      selectedText: text,
      selectionRect: rect,
      platform,
      result: "",
      error: null,
      activeAction: null,
      streamingText: "",
      customPrompt: ""
    }),

  close: () =>
    set({
      isOpen: false,
      isLoading: false,
      result: "",
      error: null,
      activeAction: null,
      streamingText: ""
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setResult: (text) => set({ result: text, streamingText: "", isLoading: false }),

  appendStreaming: (chunk) =>
    set((state) => ({ streamingText: state.streamingText + chunk })),

  clearStreaming: () => set({ streamingText: "" }),

  setError: (error) => set({ error, isLoading: false }),

  setActiveAction: (action) => set({ activeAction: action }),

  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  addToHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history].slice(0, MAX_HISTORY)
    })),

  clearHistory: () => set({ history: [] })
}))
