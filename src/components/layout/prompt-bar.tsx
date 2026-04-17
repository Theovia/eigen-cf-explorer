import { useState, useMemo, useCallback, useRef } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { ARCHITECTURES } from '#/data/architectures'
import { buildPrompt } from '#/lib/prompt-builder'
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
      // Animate the button
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

  return (
    <div
      className="glass"
      style={{
        borderTop: '1px solid var(--glass-border)',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
      }}
    >
      {/* Expanded view */}
      {expanded && (
        <div
          className="max-h-60 overflow-y-auto p-4"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <pre
            className="text-xs whitespace-pre-wrap leading-relaxed"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--text2)',
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
            className="text-xs truncate"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--text3)',
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
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--glass-hover)'
            e.currentTarget.style.color = 'var(--text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--glass-bg)'
            e.currentTarget.style.color = 'var(--text2)'
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
            background: copied
              ? 'var(--green)'
              : 'var(--accent)',
            color: 'white',
            border: `1px solid ${copied ? 'var(--green)' : 'var(--accent)'}`,
            boxShadow: copied
              ? '0 0 15px rgba(34, 197, 94, 0.3)'
              : '0 0 15px rgba(249, 115, 22, 0.3)',
            transform: 'scale(1)',
          }}
        >
          {copied ? '\u2713 Copiado!' : 'Copiar prompt'}
        </button>
      </div>
    </div>
  )
}
