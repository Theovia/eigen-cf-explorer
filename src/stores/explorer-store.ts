import { create } from 'zustand'
import type { Architecture, Decision, Service, TrafficParams } from '#/data/types'

interface ExplorerState {
  // --- Catalog ---
  services: Service[]
  selectedServiceId: string | null
  selectService: (id: string | null) => void

  // --- Architectures ---
  architectures: Architecture[]
  selectedArchId: string | null
  selectArch: (id: string | null) => void

  // --- Traffic simulator ---
  traffic: TrafficParams
  setTraffic: (patch: Partial<TrafficParams>) => void

  // --- Decision assistant ---
  decisions: Decision[]
  answers: Record<number, number>
  answerDecision: (questionIdx: number, optionIdx: number) => void
  resetDecisions: () => void
}

export const useExplorerStore = create<ExplorerState>()((set) => ({
  // --- Catalog ---
  services: [],
  selectedServiceId: null,
  selectService: (id) => set({ selectedServiceId: id }),

  // --- Architectures ---
  architectures: [],
  selectedArchId: null,
  selectArch: (id) => set({ selectedArchId: id }),

  // --- Traffic simulator ---
  traffic: { rps: 10000, storage: 5, aiCalls: 500, tenants: 1 },
  setTraffic: (patch) =>
    set((s) => ({ traffic: { ...s.traffic, ...patch } })),

  // --- Decision assistant ---
  decisions: [],
  answers: {},
  answerDecision: (questionIdx, optionIdx) =>
    set((s) => ({ answers: { ...s.answers, [questionIdx]: optionIdx } })),
  resetDecisions: () => set({ answers: {} }),
}))
