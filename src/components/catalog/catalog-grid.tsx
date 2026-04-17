import { useState, useMemo } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { getTheme } from '#/lib/theme'
import type { Service } from '#/data/types'
import { CatalogFilters } from './catalog-filters'

const catDotColors: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--cyan)',
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
      {/* Search — terminal style input */}
      <div>
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm transition-colors duration-150"
          style={{
            background: getTheme() === 'light' ? 'var(--bg3)' : '#0a0a0b',
            border: `1px solid ${getTheme() === 'light' ? 'var(--border)' : '#27272a'}`,
            color: 'var(--text)',
            outline: 'none',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '13px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = getTheme() === 'light' ? 'var(--border)' : '#52525b'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = getTheme() === 'light' ? 'var(--border)' : '#27272a'
          }}
        />
      </div>

      {/* Filters */}
      <CatalogFilters active={category} onChange={setCategory} />

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 stagger">
        {filtered.map((svc: Service) => {
          const isSelected = selectedService === svc.id
          const dotColor = catDotColors[svc.cat] ?? 'var(--text3)'
          const isLt = getTheme() === 'light'

          return (
            <button
              key={svc.id}
              onClick={() => selectService(svc.id)}
              className="text-left p-4 rounded-lg transition-all duration-150 cursor-pointer relative"
              style={{
                background: isSelected
                  ? (isLt ? 'white' : '#1a1510')
                  : (isLt ? 'white' : '#111318'),
                border: `1px solid ${isLt ? 'var(--border)' : '#27272a'}`,
                borderLeft: isSelected
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                boxShadow: isLt
                  ? (isSelected
                    ? '0 2px 8px rgba(0,0,0,0.06)'
                    : '0 1px 3px rgba(0,0,0,0.04)')
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = isLt ? '#d6d3d1' : '#52525b'
                  e.currentTarget.style.background = isLt ? 'white' : '#18181b'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = isLt ? 'var(--border)' : '#27272a'
                  e.currentTarget.style.background = isLt ? 'white' : '#111318'
                }
              }}
            >
              {/* Category dot — 3px, top-right corner */}
              <span
                className="absolute top-3 right-3 rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: dotColor,
                }}
              />
              <h3
                className="font-semibold mt-0"
                style={{
                  color: '#f4f4f5',
                  fontFamily: '"Chakra Petch", sans-serif',
                  fontSize: '14px',
                }}
              >
                {svc.name}
              </h3>
              <p
                className="mt-1.5 line-clamp-2"
                style={{
                  color: '#a1a1aa',
                  lineHeight: '1.4',
                  fontSize: '11px',
                }}
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
