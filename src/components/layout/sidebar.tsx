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
        <h3
          className="text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
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
          Arquitecturas de referencia
        </h3>
        <div className="flex flex-col gap-2 stagger">
          {ARCHITECTURES.map((arch: Architecture) => {
            const isActive = selectedArch === arch.id
            return (
              <button
                key={arch.id}
                onClick={() => {
                  selectArch(arch.id)
                  void navigate({ to: '/architectures' })
                }}
                className="text-left px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive
                    ? 'rgba(249, 115, 22, 0.06)'
                    : 'var(--glass-bg)',
                  border: isActive
                    ? '1px solid rgba(249, 115, 22, 0.2)'
                    : '1px solid var(--glass-border)',
                  borderLeft: isActive
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',
                  boxShadow: isActive
                    ? '0 0 20px rgba(249, 115, 22, 0.08)'
                    : 'none',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--glass-hover)'
                    e.currentTarget.style.transform = 'scale(1.01)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--glass-bg)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                <span className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {arch.name}
                </span>
                <span
                  className="block text-[10px] mt-0.5"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: 'var(--text3)',
                  }}
                >
                  {arch.tag}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Traffic simulator */}
      <section>
        <h3
          className="text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2"
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
          Simulador de trafico
        </h3>
        <div className="flex flex-col gap-4">
          {sliderConfig.map(({ key, label, min, max, step }) => (
            <div key={key}>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="text-xs" style={{ color: 'var(--text2)' }}>{label}</label>
                <span
                  className="text-xs font-semibold"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: 'var(--accent)',
                    textShadow: '0 0 8px rgba(249, 115, 22, 0.3)',
                  }}
                >
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
                className="w-full cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
