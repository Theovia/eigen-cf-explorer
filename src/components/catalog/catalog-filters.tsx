const categories = [
  { key: 'all', label: 'Todos' },
  { key: 'compute', label: 'Compute' },
  { key: 'storage', label: 'Storage' },
  { key: 'ai', label: 'AI' },
  { key: 'security', label: 'Security' },
  { key: 'integration', label: 'Integration' },
] as const

const catGlows: Record<string, string> = {
  all: '0 0 12px rgba(249, 115, 22, 0.2)',
  compute: '0 0 12px rgba(59, 130, 246, 0.2)',
  storage: '0 0 12px rgba(34, 197, 94, 0.2)',
  ai: '0 0 12px rgba(168, 85, 247, 0.2)',
  security: '0 0 12px rgba(239, 68, 68, 0.2)',
  integration: '0 0 12px rgba(6, 182, 212, 0.2)',
}

interface CatalogFiltersProps {
  active: string
  onChange: (cat: string) => void
}

export function CatalogFilters({ active, onChange }: CatalogFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              fontWeight: 600,
              background: isActive
                ? 'rgba(249, 115, 22, 0.1)'
                : 'var(--glass-bg)',
              border: isActive
                ? '1px solid rgba(249, 115, 22, 0.25)'
                : '1px solid var(--glass-border)',
              color: isActive
                ? 'var(--accent)'
                : 'var(--text2)',
              boxShadow: isActive
                ? catGlows[key] ?? 'none'
                : 'none',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
