import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { ARCHITECTURES } from '#/data/architectures'
import { DECISIONS } from '#/data/decisions'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col gap-5 mt-6 p-5 rounded-xl"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(6, 182, 212, 0.15)',
        boxShadow: '0 0 30px rgba(6, 182, 212, 0.05)',
      }}
    >
      {/* Header with badge */}
      <div className="flex items-center gap-3">
        <h3
          className="text-lg font-bold"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            color: 'var(--text)',
          }}
        >
          Recomendacion
        </h3>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: 'rgba(6, 182, 212, 0.12)',
            color: 'var(--cyan)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)',
          }}
        >
          Best Match
        </span>
      </div>

      {/* Recommended services */}
      <div>
        <h4
          className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            color: 'var(--text3)',
            fontWeight: 600,
          }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--cyan)',
              boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
            }}
          />
          Servicios recomendados
        </h4>
        <div className="flex flex-wrap gap-2">
          {recommendedServices.map((svc: Service) => (
            <span
              key={svc.id}
              className="px-2.5 py-1 rounded-lg text-xs"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text)',
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
            className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              color: 'var(--text3)',
              fontWeight: 600,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--cyan)',
                boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
              }}
            />
            Arquitectura sugerida
          </h4>
          <div
            className="p-3 rounded-lg"
            style={{
              background: 'rgba(6, 182, 212, 0.04)',
              border: '1px solid rgba(6, 182, 212, 0.12)',
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{
                color: 'var(--text)',
                fontFamily: '"Chakra Petch", sans-serif',
              }}
            >
              {bestArch.name}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
              {bestArch.desc}
            </p>
          </div>
        </div>
      )}

      {/* Estimated cost */}
      {bestArch && (
        <div>
          <h4
            className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              color: 'var(--text3)',
              fontWeight: 600,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--green)',
                boxShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
              }}
            />
            Costo estimado mensual
          </h4>
          <p
            className="text-3xl font-bold"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--accent)',
              textShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
            }}
          >
            ${estimatedCost.toFixed(2)} <span className="text-sm font-normal" style={{ color: 'var(--text3)' }}>USD</span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
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
            background: 'var(--accent)',
            color: 'white',
            border: '1px solid var(--accent)',
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.2)',
          }}
        >
          Ver esta arquitectura &rarr;
        </button>
      )}
    </motion.div>
  )
}
