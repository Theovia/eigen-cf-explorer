import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { getGeneratedCode } from '#/lib/code-generator'
import { getTheme } from '#/lib/theme'

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.Editor }))
)

type Tab = 'toml' | 'ts'

interface CodePreviewProps {
  architectureId: string
}

export function CodePreview({ architectureId }: CodePreviewProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [tab, setTab] = useState<Tab>('toml')
  const [editable, setEditable] = useState(false)
  const [copied, setCopied] = useState(false)
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')

  // Observe theme changes via MutationObserver on html[data-theme]
  useEffect(() => {
    if (typeof window === 'undefined') return
    setThemeState(getTheme())

    const observer = new MutationObserver(() => {
      setThemeState(getTheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const generated = getGeneratedCode(architectureId)
  if (!generated) return null

  const code = tab === 'toml' ? generated.toml : generated.code
  const language = tab === 'toml' ? 'ini' : 'typescript' // Monaco uses 'ini' for TOML-like syntax
  const monacoTheme = theme === 'light' ? 'light' : 'vs-dark'
  const isLight = theme === 'light'

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [code])

  return (
    <div
      style={{
        borderTop: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
        background: isLight ? 'white' : '#0a0a0b',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full text-left px-5 py-2 flex items-center gap-2 transition-colors cursor-pointer"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#71717a',
          fontWeight: 500,
          background: 'transparent',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isLight ? 'var(--bg3)' : '#18181b'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <span>{collapsed ? '\u25B8' : '\u25BE'}</span>
        <span>{collapsed ? 'Codigo' : 'Codigo'}</span>
      </button>

      {!collapsed && (
        <div className="px-5 pb-3">
          {/* Tab bar + controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              <TabButton
                active={tab === 'toml'}
                onClick={() => setTab('toml')}
                label="wrangler.toml"
                isLight={isLight}
              />
              <TabButton
                active={tab === 'ts'}
                onClick={() => setTab('ts')}
                label="index.ts"
                isLight={isLight}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Editable toggle */}
              <button
                onClick={() => setEditable((e) => !e)}
                className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '9px',
                  color: editable ? 'var(--accent)' : '#71717a',
                  background: editable
                    ? isLight ? 'rgba(234, 88, 12, 0.08)' : 'rgba(249, 115, 22, 0.1)'
                    : 'transparent',
                  border: `1px solid ${editable ? 'var(--accent)' : isLight ? 'var(--border)' : '#27272a'}`,
                }}
              >
                {editable ? 'Editable' : 'Read-only'}
              </button>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '9px',
                  color: copied ? 'var(--green)' : '#71717a',
                  background: 'transparent',
                  border: `1px solid ${copied ? 'var(--green)' : isLight ? 'var(--border)' : '#27272a'}`,
                }}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div
            className="rounded-md overflow-hidden"
            style={{
              border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
            }}
          >
            <Suspense
              fallback={
                <div
                  style={{
                    height: 250,
                    background: isLight ? '#fafaf9' : '#1e1e1e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#71717a',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '11px',
                  }}
                >
                  Loading editor...
                </div>
              }
            >
              <MonacoEditor
                height={250}
                language={language}
                value={code}
                theme={monacoTheme}
                options={{
                  readOnly: !editable,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  lineNumbers: 'on',
                  renderLineHighlight: 'none',
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                  },
                  padding: { top: 8, bottom: 8 },
                  domReadOnly: !editable,
                }}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  isLight,
}: {
  active: boolean
  onClick: () => void
  label: string
  isLight: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        color: active ? (isLight ? 'var(--accent)' : '#f4f4f5') : '#71717a',
        background: active
          ? isLight ? 'var(--bg3)' : '#18181b'
          : 'transparent',
        border: `1px solid ${active ? (isLight ? 'var(--border)' : '#27272a') : 'transparent'}`,
      }}
    >
      {label}
    </button>
  )
}
