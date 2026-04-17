import { useState, useMemo } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import type { Service } from '#/data/types'
import { CatalogFilters } from './catalog-filters'

const catBorderColors: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--cyan)',
}

const catGlows: Record<string, string> = {
  compute: '0 0 20px rgba(59,130,246,0.12)',
  storage: '0 0 20px rgba(34,197,94,0.12)',
  ai: '0 0 20px rgba(168,85,247,0.12)',
  security: '0 0 20px rgba(239,68,68,0.12)',
  integration: '0 0 20px rgba(6,182,212,0.12)',
}

const catTextColors: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--cyan)',
}

const catBgColors: Record<string, string> = {
  compute: 'rgba(59,130,246,0.10)',
  storage: 'rgba(34,197,94,0.10)',
  ai: 'rgba(168,85,247,0.10)',
  security: 'rgba(239,68,68,0.10)',
  integration: 'rgba(6,182,212,0.10)',
}

const catLabels: Record<string, string> = {
  compute: 'Compute',
  storage: 'Storage',
  ai: 'AI',
  security: 'Security',
  integration: 'Integration',
}

const allServices: Service[] = Object.values(SERVICES)

export function CatalogGrid() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const selectedService = useExplorerStore((s) => s.selectedService)
  const selectService = useExplorerStore((s) => s.selectService)

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return allServices.filter((svc: Service) => {
      if (category !== 'all' && svc.cat !== category) return false
      if (query) {
        const haystack = `${svc.name} ${svc.desc} ${svc.gotcha}`.toLowerCase()
        return haystack.includes(query)
      }
      return true
    })
  }, [search, category])

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)'
            e.currentTarget.style.boxShadow = '0 0 15px rgba(249, 115, 22, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--glass-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Filters */}
      <CatalogFilters active={category} onChange={setCategory} />

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 stagger">
        {filtered.map((svc: Service) => {
          const isSelected = selectedService === svc.id
          const borderColor = catBorderColors[svc.cat] ?? 'var(--text3)'

          return (
            <button
              key={svc.id}
              onClick={() => selectService(svc.id)}
              className="text-left p-3.5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                background: isSelected
                  ? 'rgba(249, 115, 22, 0.06)'
                  : 'var(--glass-bg)',
                border: isSelected
                  ? '1px solid rgba(249, 115, 22, 0.25)'
                  : '1px solid var(--glass-border)',
                borderTop: `2px solid ${isSelected ? 'var(--accent)' : borderColor}`,
                boxShadow: isSelected
                  ? '0 0 20px rgba(249, 115, 22, 0.1)'
                  : 'none',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.background = 'var(--glass-hover)'
                  e.currentTarget.style.borderColor = `${borderColor}40`
                  e.currentTarget.style.boxShadow = catGlows[svc.cat] ?? 'none'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'var(--glass-bg)'
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  color: catTextColors[svc.cat] ?? 'var(--text3)',
                  background: catBgColors[svc.cat] ?? 'rgba(113,113,122,0.1)',
                  border: `1px solid ${catTextColors[svc.cat] ?? 'var(--text3)'}20`,
                }}
              >
                {catLabels[svc.cat] ?? svc.cat}
              </span>
              <h3
                className="text-sm font-semibold mt-2.5"
                style={{
                  color: 'var(--text)',
                  fontFamily: '"Chakra Petch", sans-serif',
                }}
              >
                {svc.name}
              </h3>
              <p
                className="text-xs mt-1 line-clamp-2 leading-relaxed"
                style={{ color: 'var(--text3)' }}
              >
                {svc.desc}
              </p>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text3)' }}>
          No se encontraron servicios.
        </p>
      )}
    </div>
  )
}
