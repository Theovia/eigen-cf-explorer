import { useMemo, useEffect, useRef, useState } from 'react'
import { ARCHITECTURES } from '#/data/architectures'
import { useExplorerStore } from '#/stores/explorer-store'
import { getTheme } from '#/lib/theme'
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

  const isLight = getTheme() === 'light'

  return (
    <div
      className="w-full overflow-x-auto"
      style={{
        background: isLight ? 'white' : '#0a0a0b',
        border: isLight ? 'none' : '1px solid #27272a',
      }}
    >
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr
            className="text-left"
            style={{
              borderBottom: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
              color: '#52525b',
            }}
          >
            <th
              className="py-2.5 px-3 font-medium"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em' }}
            >
              Service
            </th>
            <th
              className="py-2.5 px-3 font-medium"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em' }}
            >
              Role
            </th>
            <th
              className="py-2.5 px-3 font-medium"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em' }}
            >
              Pricing ref
            </th>
            <th
              className="py-2.5 px-3 font-medium text-right"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em' }}
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
                height: 36,
                borderBottom: `1px solid ${isLight ? 'var(--border)' : 'rgba(39, 39, 42, 0.6)'}`,
                color: 'var(--text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLight
                  ? 'var(--bg3)'
                  : '#18181b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <td
                className="py-2 px-3"
                style={{
                  fontWeight: 500,
                  color: isLight ? 'var(--text)' : '#e4e4e7',
                }}
              >
                {row.service}
              </td>
              <td
                className="py-2 px-3"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  color: '#71717a',
                  fontSize: '11px',
                }}
              >
                {row.role}
              </td>
              <td
                className="py-2 px-3"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  color: '#a1a1aa',
                  fontSize: '10px',
                }}
              >
                {row.pricingNote}
              </td>
              <td
                className="py-2 px-3 text-right"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontVariantNumeric: 'tabular-nums',
                  color: '#f4f4f5',
                }}
              >
                {fmt(row.estimated)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr
            style={{
              borderTop: `1px solid ${isLight ? 'rgba(22, 163, 74, 0.15)' : '#3f3f46'}`,
            }}
          >
            <td
              colSpan={3}
              className="py-3 px-3 font-bold text-sm"
              style={{
                color: 'var(--green)',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              Total estimated monthly cost
            </td>
            <td
              className="py-3 px-3 text-right font-bold text-sm"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontVariantNumeric: 'tabular-nums',
                color: '#4ade80',
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
