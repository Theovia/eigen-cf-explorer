const categories = [
  { key: 'all', label: 'Todos' },
  { key: 'compute', label: 'Compute' },
  { key: 'storage', label: 'Storage' },
  { key: 'ai', label: 'AI' },
  { key: 'security', label: 'Security' },
  { key: 'integration', label: 'Integration' },
] as const

interface CatalogFiltersProps {
  active: string
  onChange: (cat: string) => void
}

export function CatalogFilters({ active, onChange }: CatalogFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider
            transition-colors cursor-pointer border
            ${
              active === key
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-transparent text-[var(--text2)] border-[var(--border)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
