import { useNavigate } from '@tanstack/react-router'
import { useExplorerStore } from '#/stores/explorer-store'
import { ARCHITECTURES } from '#/data/architectures'
import type { Architecture } from '#/data/types'

const sliderConfig = [
  { key: 'rps' as const, label: 'Requests/dia', min: 100, max: 10_000_000, step: 1000 },
  { key: 'storage' as const, label: 'Storage GB', min: 0, max: 500, step: 1 },
  { key: 'aiCalls' as const, label: 'AI calls/dia', min: 0, max: 100_000, step: 100 },
  { key: 'tenants' as const, label: 'Tenants', min: 1, max: 1000, step: 1 },
] as const

type TrafficKey = (typeof sliderConfig)[number]['key']

function formatSliderValue(key: string, value: number): string {
  if (key === 'rps' || key === 'aiCalls') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return String(value)
  }
  if (key === 'storage') return `${value} GB`
  return String(value)
}

export function Sidebar() {
  const selectedArch = useExplorerStore((s) => s.selectedArch)
  const selectArch = useExplorerStore((s) => s.selectArch)
  const rps = useExplorerStore((s) => s.rps)
  const storage = useExplorerStore((s) => s.storage)
  const aiCalls = useExplorerStore((s) => s.aiCalls)
  const tenants = useExplorerStore((s) => s.tenants)
  const updateTraffic = useExplorerStore((s) => s.updateTraffic)
  const navigate = useNavigate()

  const trafficValues: Record<TrafficKey, number> = { rps, storage, aiCalls, tenants }

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto h-full">
      {/* Architecture presets */}
      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-3">
          Arquitecturas de referencia
        </h3>
        <div className="flex flex-col gap-2">
          {ARCHITECTURES.map((arch: Architecture) => (
            <button
              key={arch.id}
              onClick={() => {
                selectArch(arch.id)
                void navigate({ to: '/architectures' })
              }}
              className={`
                text-left px-3 py-2.5 rounded-lg border transition-all duration-150
                hover:bg-[var(--bg3)] cursor-pointer
                ${
                  selectedArch === arch.id
                    ? 'border-[var(--accent)] bg-[var(--bg3)]'
                    : 'border-[var(--border)] bg-transparent'
                }
              `}
            >
              <span className="block text-sm font-medium text-[var(--text)]">
                {arch.name}
              </span>
              <span className="block text-xs font-mono text-[var(--text3)] mt-0.5">
                {arch.tag}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Traffic simulator */}
      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-3">
          Simulador de trafico
        </h3>
        <div className="flex flex-col gap-4">
          {sliderConfig.map(({ key, label, min, max, step }) => (
            <div key={key}>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs text-[var(--text2)]">{label}</label>
                <span className="font-mono text-xs text-[var(--accent)]">
                  {formatSliderValue(key, trafficValues[key])}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={trafficValues[key]}
                onChange={(e) => updateTraffic(key, Number(e.target.value))}
                className="w-full accent-[var(--accent)] h-1.5 bg-[var(--bg3)] rounded-full cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
