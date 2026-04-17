import { useState, useMemo } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { services } from '#/data/services'
import { CatalogFilters } from './catalog-filters'

const catColors: Record<string, string> = {
  compute: 'bg-[var(--blue)]',
  storage: 'bg-[var(--green)]',
  ai: 'bg-[var(--purple)]',
  security: 'bg-[var(--red)]',
  integration: 'bg-[var(--cyan)]',
}

const catLabels: Record<string, string> = {
  compute: 'Compute',
  storage: 'Storage',
  ai: 'AI',
  security: 'Security',
  integration: 'Integration',
}

export function CatalogGrid() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const selectedServiceId = useExplorerStore((s) => s.selectedServiceId)
  const selectService = useExplorerStore((s) => s.selectService)

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return services.filter((svc) => {
      // Category filter
      if (category !== 'all' && svc.cat !== category) return false
      // Text search
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
          className="
            w-full px-3 py-2 rounded-lg text-sm
            bg-[var(--bg)] border border-[var(--border)]
            text-[var(--text)] placeholder:text-[var(--text3)]
            focus:outline-none focus:border-[var(--accent)]
            transition-colors
          "
        />
      </div>

      {/* Filters */}
      <CatalogFilters active={category} onChange={setCategory} />

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {filtered.map((svc) => (
          <button
            key={svc.id}
            onClick={() => selectService(svc.id)}
            className={`
              text-left p-3 rounded-lg border transition-all duration-150
              hover:bg-[var(--bg3)] cursor-pointer
              ${
                selectedServiceId === svc.id
                  ? 'border-[var(--accent)] bg-[var(--bg3)]'
                  : 'border-[var(--border)] bg-[var(--bg2)]'
              }
            `}
          >
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-white/90 ${catColors[svc.cat] ?? 'bg-[var(--text3)]'}`}
            >
              {catLabels[svc.cat] ?? svc.cat}
            </span>
            <h3 className="text-sm font-medium text-[var(--text)] mt-2">
              {svc.name}
            </h3>
            <p className="text-xs text-[var(--text3)] mt-1 line-clamp-2 leading-relaxed">
              {svc.desc}
            </p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--text3)] text-center py-8">
          No se encontraron servicios.
        </p>
      )}
    </div>
  )
}
