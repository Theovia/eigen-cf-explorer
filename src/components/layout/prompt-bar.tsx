import { useState, useMemo, useCallback, useRef } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { ARCHITECTURES } from '#/data/architectures'
import { buildPrompt } from '#/lib/prompt-builder'
import { getTheme } from '#/lib/theme'
import type { Architecture } from '#/data/types'

export function PromptBar() {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const selectedArch = useExplorerStore((s) => s.selectedArch)
  const selectedService = useExplorerStore((s) => s.selectedService)
  const rps = useExplorerStore((s) => s.rps)
  const storage = useExplorerStore((s) => s.storage)
  const aiCalls = useExplorerStore((s) => s.aiCalls)
  const tenants = useExplorerStore((s) => s.tenants)

  const arch = useMemo(
    () => ARCHITECTURES.find((a: Architecture) => a.id === selectedArch) ?? null,
    [selectedArch],
  )

  const prompt = useMemo(() => {
    if (!arch) return '# Selecciona una arquitectura para generar el prompt'
    return buildPrompt(arch, SERVICES, { rps, storage, aiCalls, tenants }, selectedService)
  }, [arch, rps, storage, aiCalls, tenants, selectedService])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      if (btnRef.current) {
        btnRef.current.style.transform = 'scale(0.95)'
        setTimeout(() => {
          if (btnRef.current) btnRef.current.style.transform = 'scale(1)'
        }, 150)
      }
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [prompt])

  const isLight = getTheme() === 'light'

  return (
    <div
      style={{
        background: isLight ? 'white' : '#0a0a0b',
        borderTop: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
        boxShadow: isLight ? '0 -1px 3px rgba(0,0,0,0.03)' : 'none',
      }}
    >
      {/* Expanded view */}
      {expanded && (
        <div
          className="max-h-60 overflow-y-auto p-4"
          style={{ borderBottom: `1px solid ${isLight ? 'var(--border)' : '#27272a'}` }}
        >
          <pre
            className="text-xs whitespace-pre-wrap leading-relaxed"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: '#a1a1aa',
            }}
          >
            {prompt}
          </pre>
        </div>
      )}

      {/* Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
              color: '#71717a',
            }}
          >
            {prompt.split('\n')[0]}
          </p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            fontWeight: 500,
            background: isLight ? 'var(--bg3)' : 'transparent',
            border: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
            color: '#a1a1aa',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isLight ? 'var(--bg3)' : '#18181b'
            e.currentTarget.style.color = '#f4f4f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isLight ? 'var(--bg3)' : 'transparent'
            e.currentTarget.style.color = '#a1a1aa'
          }}
        >
          {expanded ? 'Cerrar' : 'Ver completo'}
        </button>

        <button
          ref={btnRef}
          onClick={() => void handleCopy()}
          className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            background: copied ? 'var(--green)' : '#ea580c',
            color: copied ? 'white' : 'black',
            border: 'none',
            boxShadow: 'none',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.background = '#f97316'
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.background = '#ea580c'
            }
          }}
        >
          {copied ? '\u2713 Copiado!' : 'Copiar prompt'}
        </button>
      </div>
    </div>
  )
}
