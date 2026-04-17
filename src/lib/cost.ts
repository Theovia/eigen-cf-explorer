import type { Architecture, CostBreakdownRow, TrafficParams, NormalizedTraffic } from "#/data/types.ts"

/**
 * Normalize raw traffic params into monthly-scale values used by cost formulas.
 *
 * - r: requests per month in millions (rps * 30 / 1e6)
 * - s: storage in GB (unchanged)
 * - ai: AI calls per month in thousands (aiCalls * 30 / 1e3)
 * - t: number of tenants (unchanged)
 */
export function normalizeTraffic(params: TrafficParams): NormalizedTraffic {
  return {
    r: (params.rps * 30) / 1e6,
    s: params.storage,
    ai: (params.aiCalls * 30) / 1e3,
    t: params.tenants,
  }
}

/**
 * Calculate total monthly cost for an architecture given traffic params.
 * Returns the cost in USD.
 */
export function calculateCost(arch: Architecture, traffic: TrafficParams): number {
  const { r, s, ai, t } = normalizeTraffic(traffic)
  return arch.costFormula(r, s, ai, t)
}

/**
 * Get per-service cost breakdown rows for an architecture.
 */
export function getCostBreakdown(
  arch: Architecture,
  traffic: TrafficParams,
): CostBreakdownRow[] {
  const { r, s, ai, t } = normalizeTraffic(traffic)
  return arch.costBreakdown(r, s, ai, t)
}
