import { useMemo, useEffect, useRef, useState } from 'react'
import { ARCHITECTURES } from '#/data/architectures'
import { useExplorerStore } from '#/stores/explorer-store'
import type { Architecture, CostBreakdownRow, NormalizedTraffic } from '#/data/types'

// -- Normalize traffic to monthly scale ----
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

// -- Format currency ----
function fmt(n: number): string {
  if (n === 0) return '$0.00'
  if (n < 0.01) return '< $0.01'
  return `$${n.toFixed(2)}`
}

// -- Animated counter ----
function AnimatedCost({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const from = prev.current
    const to = value
    prev.current = value

    if (from === to) return

    const duration = 400
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return <>{fmt(display)}</>
}

// -- Category color dots ----
const catDotColors: Record<string, string> = {
  Workers: 'var(--blue)',
  KV: 'var(--green)',
  D1: 'var(--green)',
  R2: 'var(--green)',
  'Workers AI': 'var(--purple)',
  'AI Gateway': 'var(--purple)',
  Vectorize: 'var(--purple)',
  Queues: 'var(--cyan)',
  'Durable Objects': 'var(--blue)',
  Pages: 'var(--blue)',
}

// -- Component ----
interface CostBreakdownProps {
  architectureId: string
}

export function CostBreakdown({ architectureId }: CostBreakdownProps) {
  const rps = useExplorerStore((s) => s.rps)
  const storage = useExplorerStore((s) => s.storage)
  const aiCalls = useExplorerStore((s) => s.aiCalls)
  const tenants = useExplorerStore((s) => s.tenants)

  const arch = useMemo(
    () => ARCHITECTURES.find((a: Architecture) => a.id === architectureId),
    [architectureId],
  )

  const { rows, total } = useMemo(() => {
    if (!arch) return { rows: [] as CostBreakdownRow[], total: 0 }

    const n = normalizeTraffic({ rps, storage, aiCalls, tenants })
    const rows = arch.costBreakdown(n.r, n.s, n.ai, n.t)
    const total = rows.reduce((sum: number, row: CostBreakdownRow) => sum + row.estimated, 0)

    return { rows, total }
  }, [arch, rps, storage, aiCalls, tenants])

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
    <div
      className="w-full overflow-x-auto"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr
            className="text-left"
            style={{
              borderBottom: '1px solid var(--glass-border)',
              color: 'var(--text3)',
            }}
          >
            <th
              className="py-2.5 px-3 font-semibold"
              style={{ fontFamily: '"Chakra Petch", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Service
            </th>
            <th
              className="py-2.5 px-3 font-semibold"
              style={{ fontFamily: '"Chakra Petch", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Role
            </th>
            <th
              className="py-2.5 px-3 font-semibold"
              style={{ fontFamily: '"Chakra Petch", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Pricing ref
            </th>
            <th
              className="py-2.5 px-3 font-semibold text-right"
              style={{ fontFamily: '"Chakra Petch", sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Est. cost/mo
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: CostBreakdownRow, i: number) => (
            <tr
              key={`${row.service}-${i}`}
              className="transition-colors duration-150"
              style={{
                borderBottom: '1px solid var(--glass-border)',
                color: 'var(--text)',
                background: i % 2 === 0 ? 'transparent' : 'var(--glass-bg)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--glass-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--glass-bg)'
              }}
            >
              <td className="py-2 px-3 font-medium flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: catDotColors[row.service] ?? 'var(--text3)',
                    boxShadow: `0 0 4px ${catDotColors[row.service] ?? 'var(--text3)'}60`,
                  }}
                />
                {row.service}
              </td>
              <td className="py-2 px-3" style={{ color: 'var(--text2)' }}>
                {row.role}
              </td>
              <td
                className="py-2 px-3 text-[10px]"
                style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--text3)' }}
              >
                {row.pricingNote}
              </td>
              <td
                className="py-2 px-3 text-right"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {fmt(row.estimated)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr
            style={{
              borderTop: '1px solid rgba(34, 197, 94, 0.2)',
            }}
          >
            <td
              colSpan={3}
              className="py-3 px-3 font-bold text-sm"
              style={{
                color: 'var(--green)',
                fontFamily: '"Chakra Petch", sans-serif',
                textShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
              }}
            >
              Total estimated monthly cost
            </td>
            <td
              className="py-3 px-3 text-right font-bold text-sm"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                color: 'var(--green)',
                textShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
              }}
            >
              <AnimatedCost value={total} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
