// Eigen CF Explorer — Type definitions

export interface ServiceLimit {
  label: string
  value: string
}

export interface VsComparison {
  title: string
  body: string
}

export interface Service {
  id: string
  name: string
  cat: "compute" | "storage" | "ai" | "security" | "integration"
  desc: string
  limits: ServiceLimit[]
  pricing: string
  gotcha: string
  use: string
  notUse: string
  link: string
  vs: VsComparison[]
}

export interface CostBreakdownRow {
  service: string
  role: string
  estimated: number
  pricingNote: string
}

export interface TrafficParams {
  rps: number
  storage: number
  aiCalls: number
  tenants: number
}

/** Normalized traffic params for cost formulas (monthly scale) */
export interface NormalizedTraffic {
  /** rps * 30 / 1e6 — millions of requests per month */
  r: number
  /** storage in GB */
  s: number
  /** aiCalls * 30 / 1e3 — thousands of AI calls per month */
  ai: number
  /** number of tenants */
  t: number
}

export interface ArchitectureEdge {
  source: string
  target: string
  label: string
}

export interface Architecture {
  id: string
  name: string
  tag: string
  desc: string
  services: string[]
  flow: string
  steps: string[]
  edges: ArchitectureEdge[]
  costFormula: (r: number, s: number, ai: number, t: number) => number
  costBreakdown: (r: number, s: number, ai: number, t: number) => CostBreakdownRow[]
}

export interface DecisionOption {
  label: string
  desc: string
  result: string
  explanation: string
}

export interface Decision {
  question: string
  options: DecisionOption[]
}
