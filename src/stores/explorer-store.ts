import { create } from "zustand"

interface ExplorerState {
  // Selection
  selectedArch: string | null
  selectedService: string | null

  // Traffic params
  rps: number
  storage: number
  aiCalls: number
  tenants: number

  // Decision wizard
  decisionStep: number
  decisionAnswers: (number | undefined)[]

  // UI
  promptExpanded: boolean

  // Actions
  selectArch: (id: string) => void
  selectService: (id: string | null) => void
  updateTraffic: (field: string, value: number) => void
  answerDecision: (optionIdx: number) => void
  nextDecision: () => void
  resetDecision: () => void
  togglePrompt: () => void
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  // Default state
  selectedArch: null,
  selectedService: null,
  rps: 10000,
  storage: 5,
  aiCalls: 1000,
  tenants: 5,
  decisionStep: 0,
  decisionAnswers: [],
  promptExpanded: false,

  // Actions
  selectArch: (id) =>
    set({
      selectedArch: id,
      selectedService: null,
    }),

  selectService: (id) =>
    set({
      selectedService: id,
    }),

  updateTraffic: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  answerDecision: (optionIdx) =>
    set((state) => {
      const answers = [...state.decisionAnswers]
      answers[state.decisionStep] = optionIdx
      return { decisionAnswers: answers }
    }),

  nextDecision: () =>
    set((state) => ({
      decisionStep: state.decisionStep + 1,
    })),

  resetDecision: () =>
    set({
      decisionStep: 0,
      decisionAnswers: [],
    }),

  togglePrompt: () =>
    set((state) => ({
      promptExpanded: !state.promptExpanded,
    })),
}))
