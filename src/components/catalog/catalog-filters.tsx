import { getTheme } from '#/lib/theme'

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
  const isLight = getTheme() === 'light'

  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-colors duration-150 cursor-pointer"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 500,
              fontSize: '10px',
              letterSpacing: '0.1em',
              background: isActive
                ? (isLight ? 'var(--bg3)' : '#18181b')
                : 'transparent',
              border: isActive
                ? `1px solid ${isLight ? 'var(--border)' : '#27272a'}`
                : '1px solid transparent',
              color: isActive
                ? 'var(--accent)'
                : '#71717a',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
