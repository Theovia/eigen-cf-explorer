import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { ARCHITECTURES } from '#/data/architectures'
import { DECISIONS } from '#/data/decisions'
import { getTheme } from '#/lib/theme'
import type { Architecture, Service } from '#/data/types'
import type { NormalizedTraffic } from '#/data/types'

function normalizeTraffic(rps: number, storage: number, aiCalls: number, tenants: number): NormalizedTraffic {
  return {
    r: (rps * 30) / 1e6,
    s: storage,
    ai: (aiCalls * 30) / 1e3,
    t: tenants,
  }
}

export function Synthesis() {
  const decisionAnswers = useExplorerStore((s) => s.decisionAnswers)
  const rps = useExplorerStore((s) => s.rps)
  const storage = useExplorerStore((s) => s.storage)
  const aiCalls = useExplorerStore((s) => s.aiCalls)
  const tenants = useExplorerStore((s) => s.tenants)
  const selectArch = useExplorerStore((s) => s.selectArch)
  const navigate = useNavigate()

  // Collect all recommended service IDs (deduped)
  const recommendedIds = useMemo(() => {
    const ids = new Set<string>()
    for (let qIdx = 0; qIdx < decisionAnswers.length; qIdx++) {
      const optIdx = decisionAnswers[qIdx]
      if (optIdx === undefined) continue
      const decision = DECISIONS[qIdx]
      if (!decision) continue
      const option = decision.options[optIdx]
      if (!option) continue
      const serviceIds = option.result.split(',').filter(Boolean)
      for (const id of serviceIds) {
        ids.add(id.trim())
      }
    }
    return Array.from(ids)
  }, [decisionAnswers])

  // Find best matching architecture (max overlap)
  const bestArch = useMemo((): Architecture | null => {
    if (recommendedIds.length === 0) return null
    let best: Architecture | null = null
    let bestScore = 0
    for (const arch of ARCHITECTURES) {
      const overlap = arch.services.filter((s: string) => recommendedIds.includes(s)).length
      if (overlap > bestScore) {
        bestScore = overlap
        best = arch
      }
    }
    return best
  }, [recommendedIds])

  // Estimated cost
  const estimatedCost = useMemo(() => {
    if (!bestArch) return 0
    const n = normalizeTraffic(rps, storage, aiCalls, tenants)
    return bestArch.costFormula(n.r, n.s, n.ai, n.t)
  }, [bestArch, rps, storage, aiCalls, tenants])

  const recommendedServices = useMemo(
    () => Object.values(SERVICES).filter((s: Service) => recommendedIds.includes(s.id)),
    [recommendedIds],
  )

  if (recommendedIds.length === 0) return null

  const isLight = getTheme() === 'light'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col gap-5 mt-6 p-5 rounded-xl"
      style={{
        background: isLight ? 'white' : '#111318',
        border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
        boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <h3
          className="text-lg font-bold"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            color: '#f4f4f5',
          }}
        >
          Recomendacion
        </h3>
        <span
          className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            background: 'transparent',
            color: 'var(--cyan)',
            border: `1px solid ${isLight ? 'rgba(8, 145, 178, 0.15)' : '#27272a'}`,
          }}
        >
          Best Match
        </span>
      </div>

      {/* Recommended services */}
      <div>
        <h4
          className="mb-2"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#71717a',
            fontWeight: 500,
          }}
        >
          Servicios recomendados
        </h4>
        <div className="flex flex-wrap gap-2">
          {recommendedServices.map((svc: Service) => (
            <span
              key={svc.id}
              className="px-2.5 py-1 rounded text-xs"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                background: isLight ? 'var(--bg3)' : '#18181b',
                border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
                color: '#f4f4f5',
              }}
            >
              {svc.name}
            </span>
          ))}
        </div>
      </div>

      {/* Best architecture */}
      {bestArch && (
        <div>
          <h4
            className="mb-2"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#71717a',
              fontWeight: 500,
            }}
          >
            Arquitectura sugerida
          </h4>
          <div
            className="p-3 rounded-lg"
            style={{
              background: isLight ? 'var(--bg3)' : '#18181b',
              border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{
                color: '#f4f4f5',
                fontFamily: '"Chakra Petch", sans-serif',
              }}
            >
              {bestArch.name}
            </p>
            <p className="text-xs mt-1" style={{ color: '#71717a' }}>
              {bestArch.desc}
            </p>
          </div>
        </div>
      )}

      {/* Estimated cost */}
      {bestArch && (
        <div>
          <h4
            className="mb-2"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#71717a',
              fontWeight: 500,
            }}
          >
            Costo estimado mensual
          </h4>
          <p
            className="text-3xl font-bold"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--accent)',
            }}
          >
            ${estimatedCost.toFixed(2)} <span className="text-sm font-normal" style={{ color: '#71717a' }}>USD</span>
          </p>
          <p className="text-xs mt-1" style={{ color: '#71717a' }}>
            Basado en los parametros de trafico actuales
          </p>
        </div>
      )}

      {/* Navigate to architecture */}
      {bestArch && (
        <button
          onClick={() => {
            selectArch(bestArch.id)
            void navigate({ to: '/architectures' })
          }}
          className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            background: '#ea580c',
            color: 'black',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          Ver esta arquitectura &rarr;
        </button>
      )}
    </motion.div>
  )
}
