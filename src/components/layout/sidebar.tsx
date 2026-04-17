import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useExplorerStore } from '#/stores/explorer-store'
import { ARCHITECTURES } from '#/data/architectures'
import { getTheme } from '#/lib/theme'
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
  const [filter, setFilter] = useState('')

  const isLight = getTheme() === 'light'
  const trafficValues: Record<TrafficKey, number> = { rps, storage, aiCalls, tenants }

  const filteredArchitectures = useMemo(() => {
    if (!filter.trim()) return ARCHITECTURES
    const q = filter.toLowerCase()
    return ARCHITECTURES.filter(
      (arch: Architecture) =>
        arch.name.toLowerCase().includes(q) ||
        arch.tag.toLowerCase().includes(q) ||
        arch.id.toLowerCase().includes(q)
    )
  }, [filter])

  return (
    <div
      className="flex flex-col gap-6 p-4 overflow-y-auto h-full"
      style={{ background: isLight ? 'var(--bg)' : undefined }}
    >
      {/* Architecture presets */}
      <section>
        <h3
          className="mb-3"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#71717a',
            fontWeight: 500,
          }}
        >
          Arquitecturas de referencia
        </h3>

        {/* Search filter */}
        <div className="mb-2">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar..."
            className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-colors"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              color: isLight ? 'var(--text)' : '#e4e4e7',
              background: isLight ? 'white' : '#111318',
              border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isLight ? 'var(--border)' : '#27272a'
            }}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          {filteredArchitectures.map((arch: Architecture, i: number) => {
            const isActive = selectedArch === arch.id
            return (
              <button
                key={arch.id}
                onClick={() => {
                  selectArch(arch.id)
                  void navigate({ to: '/architectures' })
                }}
                className="text-left px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive
                    ? (isLight ? 'white' : 'transparent')
                    : 'transparent',
                  border: 'none',
                  borderLeft: isActive
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  boxShadow: isLight
                    ? (isActive
                      ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                      : 'none')
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isLight ? 'white' : '#18181b'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div className="flex items-baseline gap-1.5">
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '8px',
                      color: '#52525b',
                      minWidth: '14px',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="block text-sm leading-tight"
                    style={{
                      color: isActive ? '#e4e4e7' : '#a1a1aa',
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {arch.name}
                  </span>
                </div>
                <span
                  className="block mt-0.5"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '8px',
                    color: '#52525b',
                    paddingLeft: '20px',
                  }}
                >
                  {arch.tag}
                </span>
              </button>
            )
          })}
          {filteredArchitectures.length === 0 && (
            <span
              className="text-xs px-3 py-2"
              style={{ color: '#52525b', fontStyle: 'italic' }}
            >
              Sin resultados
            </span>
          )}
        </div>
      </section>

      {/* Traffic simulator */}
      <section>
        <h3
          className="mb-3"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#71717a',
            fontWeight: 500,
          }}
        >
          Simulador de trafico
        </h3>
        <div className="flex flex-col gap-4">
          {sliderConfig.map(({ key, label, min, max, step }) => (
            <div key={key}>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="text-xs" style={{ color: 'var(--text2)' }}>{label}</label>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--accent)',
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
