import { useMemo } from 'react'
import { architectures } from '#/data/architectures'
import { useExplorerStore } from '#/stores/explorer-store'
import type { CostBreakdownRow, NormalizedTraffic } from '#/data/types'

// ─── Normalize traffic to monthly scale ───────────────────────
function normalizeTraffic(traffic: {
  rps: number
  storage: number
  aiCalls: number
  tenants: number
}): NormalizedTraffic {
  return {
    r: (traffic.rps * 86400 * 30) / 1e6,
    s: traffic.storage,
    ai: (traffic.aiCalls * 30) / 1e3,
    t: traffic.tenants,
  }
}

// ─── Format currency ──────────────────────────────────────────
function fmt(n: number): string {
  if (n === 0) return '$0.00'
  if (n < 0.01) return '< $0.01'
  return `$${n.toFixed(2)}`
}

// ─── Component ────────────────────────────────────────────────
interface CostBreakdownProps {
  architectureId: string
}

export function CostBreakdown({ architectureId }: CostBreakdownProps) {
  const traffic = useExplorerStore((s) => s.traffic)

  const arch = useMemo(
    () => architectures.find((a) => a.id === architectureId),
    [architectureId],
  )

  const { rows, total } = useMemo(() => {
    if (!arch) return { rows: [] as CostBreakdownRow[], total: 0 }

    const n = normalizeTraffic(traffic)
    const rows = arch.costBreakdown(n.r, n.s, n.ai, n.t)
    const total = rows.reduce((sum, row) => sum + row.estimated, 0)

    return { rows, total }
  }, [arch, traffic])

  if (!arch) {
    return (
      <div
        className="text-sm p-4"
        style={{ color: 'var(--text3)' }}
      >
        Select an architecture to see cost breakdown.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr
            className="text-left"
            style={{
              borderBottom: '1px solid var(--border)',
              color: 'var(--text2)',
            }}
          >
            <th className="py-2 px-3 font-medium">Service</th>
            <th className="py-2 px-3 font-medium">Role</th>
            <th className="py-2 px-3 font-medium">Pricing ref</th>
            <th className="py-2 px-3 font-medium text-right">Est. cost/mo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.service}-${i}`}
              className="transition-colors duration-100 hover:brightness-110"
              style={{
                borderBottom: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              <td className="py-2 px-3 font-medium">{row.service}</td>
              <td className="py-2 px-3" style={{ color: 'var(--text2)' }}>
                {row.role}
              </td>
              <td
                className="py-2 px-3 font-mono text-[10px]"
                style={{ color: 'var(--text3)' }}
              >
                {row.pricingNote}
              </td>
              <td className="py-2 px-3 text-right font-mono">
                {fmt(row.estimated)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr
            style={{
              borderTop: '2px solid var(--border)',
            }}
          >
            <td
              colSpan={3}
              className="py-2.5 px-3 font-semibold text-sm"
              style={{ color: 'var(--green)' }}
            >
              Total estimated monthly cost
            </td>
            <td
              className="py-2.5 px-3 text-right font-mono font-semibold text-sm"
              style={{ color: 'var(--green)' }}
            >
              {fmt(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
