import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useExplorerStore } from '#/stores/explorer-store'
import { services } from '#/data/services'
import { architectures } from '#/data/architectures'
import { decisions } from '#/data/decisions'
import type { Architecture, NormalizedTraffic } from '#/data/types'

function normalizeTraffic(rps: number, storage: number, aiCalls: number, tenants: number): NormalizedTraffic {
  return {
    r: (rps * 30) / 1e6,
    s: storage,
    ai: (aiCalls * 30) / 1e3,
    t: tenants,
  }
}

export function Synthesis() {
  const answers = useExplorerStore((s) => s.answers)
  const traffic = useExplorerStore((s) => s.traffic)
  const selectArch = useExplorerStore((s) => s.selectArch)
  const navigate = useNavigate()

  // Collect all recommended service IDs (deduped)
  const recommendedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [qIdx, optIdx] of Object.entries(answers)) {
      const decision = decisions[Number(qIdx)]
      if (!decision) continue
      const option = decision.options[optIdx]
      if (!option) continue
      const serviceIds = option.result.split(',').filter(Boolean)
      for (const id of serviceIds) {
        ids.add(id.trim())
      }
    }
    return Array.from(ids)
  }, [answers])

  // Find best matching architecture (max overlap)
  const bestArch = useMemo((): Architecture | null => {
    if (recommendedIds.length === 0) return null
    let best: Architecture | null = null
    let bestScore = 0
    for (const arch of architectures) {
      const overlap = arch.services.filter((s) => recommendedIds.includes(s)).length
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
    const n = normalizeTraffic(traffic.rps, traffic.storage, traffic.aiCalls, traffic.tenants)
    return bestArch.costFormula(n.r, n.s, n.ai, n.t)
  }, [bestArch, traffic])

  const recommendedServices = useMemo(
    () => services.filter((s) => recommendedIds.includes(s.id)),
    [recommendedIds],
  )

  if (recommendedIds.length === 0) return null

  return (
    <div className="flex flex-col gap-5 mt-6 p-5 rounded-xl border border-[var(--accent)]/30 bg-[var(--bg2)]">
      <h3 className="text-lg font-semibold text-[var(--text)]">
        Recomendación
      </h3>

      {/* Recommended services */}
      <div>
        <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-2">
          Servicios recomendados
        </h4>
        <div className="flex flex-wrap gap-2">
          {recommendedServices.map((svc) => (
            <span
              key={svc.id}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--bg3)] border border-[var(--border)] text-[var(--text)]"
            >
              {svc.name}
            </span>
          ))}
        </div>
      </div>

      {/* Best architecture */}
      {bestArch && (
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-2">
            Arquitectura sugerida
          </h4>
          <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <p className="text-sm font-medium text-[var(--text)]">
              {bestArch.name}
            </p>
            <p className="text-xs text-[var(--text3)] mt-1">{bestArch.desc}</p>
          </div>
        </div>
      )}

      {/* Estimated cost */}
      {bestArch && (
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-2">
            Costo estimado mensual
          </h4>
          <p className="text-2xl font-mono font-semibold text-[var(--accent)]">
            ${estimatedCost.toFixed(2)} USD
          </p>
          <p className="text-xs text-[var(--text3)] mt-1">
            Basado en los parámetros de tráfico actuales
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
          className="
            self-start px-4 py-2 rounded-lg text-sm font-mono
            bg-[var(--accent)] text-white
            hover:brightness-110 transition-all cursor-pointer
          "
        >
          Ver esta arquitectura &rarr;
        </button>
      )}
    </div>
  )
}
